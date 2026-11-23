import assert from "node:assert/strict";
import { describe, it } from "node:test";

import { parseDirectory } from "./directory.ts";
import { ControlLineReader, V07FrameReader, dotnetTicks, imaPacket } from "./framing.ts";
import { splitSpeexFrames, SpeexStreamDecoder } from "./speex.server.ts";
import { RadioStateStore } from "./state.ts";
import { decodeProtocolText } from "./text.ts";

describe("guest protocol", () => {
  it("decodes chat text and flattens line breaks", () => {
    assert.equal(decodeProtocolText("Line%20one%0D%0ALine%20two"), "Line one Line two");
  });

  it("latches radio state from post:: lines", () => {
    const state = new RadioStateStore();
    state.apply("post::radio::K3");
    state.apply("post::frequency::28074000");
    state.apply("post::dropdown::Mode::USB");
    state.apply("post::smeter::S6,6,21");
    state.apply("chat::System::now::Hello%20there");
    const snapshot = state.snapshot();
    assert.equal(snapshot.ready, true);
    assert.equal(snapshot.radioName, "K3");
    assert.equal(snapshot.frequencyText, "28074000");
    assert.equal(snapshot.mode, "USB");
    assert.equal(snapshot.sMeter, "S6,6,21");
    assert.equal(state.lastChat?.text, "Hello there");
  });

  it("parses a directory row and keeps v0.7 ports", () => {
    const stations = parseDirectory(`
      <Radio>
        <ServerName>Remote SP</ServerName>
        <RadioName>K3</RadioName>
        <Domain>83.150.196.251</Domain>
        <Port>4525</Port>
        <VoipPort>4524</VoipPort>
        <CanListen>public</CanListen>
        <CanTransmit>1</CanTransmit>
        <Online>true</Online>
        <Country>---------- POLAND -----------</Country>
        <Grid>KO00FT</Grid>
        <Message>Members only</Message>
      </Radio>
    `);
    assert.equal(stations.length, 1);
    assert.equal(stations[0]?.transport, "v0.7");
    assert.equal(stations[0]?.country, "POLAND");
    assert.equal(stations[0]?.audioPort, 4524);
  });

  it("reads control lines and an audio frame header", () => {
    const lines = new ControlLineReader();
    lines.append(Buffer.from("get id reply\r\npost::state-posted\n"));
    assert.equal(lines.tryReadLine(), "get id reply");
    assert.equal(lines.tryReadLine(), "post::state-posted");

    const frames = new V07FrameReader();
    const packet = new Uint8Array(30);
    packet[0] = 20;
    packet.set(Buffer.from("abcdefghijabcdefghij"), 10);
    frames.append(packet);
    const frame = frames.tryRead();
    assert.equal(frame?.kind, "audio");
    assert.equal(frame?.payload.length, 20);

    const alive = imaPacket();
    assert.equal(alive.length, 13);
    assert.equal(alive[4], 1);
    assert.equal(Buffer.from(alive.subarray(10)).toString("ascii"), "IMA");
    assert.match(dotnetTicks(0), /^621355968000000000$/);
  });

  it("decodes five packed narrowband frames to 100 ms", async () => {
    const imported = (await import("./vendor/speex-wasm.js")) as {
      default: (options: { wasmBinary?: Uint8Array }) => Promise<{
        HEAPU8: Uint8Array;
        HEAP16: Int16Array;
        _malloc(size: number): number;
        _speex_js_encoder_create(rate: number, quality: number, complexity: number, vbr: number): number;
        _speex_js_encoder_frame_size(handle: number): number;
        _speex_js_encode(handle: number, pcm: number, out: number, max: number): number;
      }>;
    };
    const { SPEEX_WASM_BASE64 } = await import("./vendor/speex-wasm-b64.ts");
    const module = await imported.default({
      wasmBinary: Uint8Array.from(Buffer.from(SPEEX_WASM_BASE64, "base64")),
    });
    const encoder = module._speex_js_encoder_create(8000, 8, 3, 0);
    const frameSize = module._speex_js_encoder_frame_size(encoder);
    const pcmPtr = module._malloc(frameSize * 2);
    const outPtr = module._malloc(512);
    const frames: Uint8Array[] = [];
    for (let frame = 0; frame < 5; frame++) {
      const pcm = new Int16Array(frameSize);
      for (let i = 0; i < frameSize; i++) {
        pcm[i] = Math.round(8000 * Math.sin((2 * Math.PI * 700 * (frame * frameSize + i)) / 8000));
      }
      module.HEAP16.set(pcm, pcmPtr >> 1);
      const length = module._speex_js_encode(encoder, pcmPtr, outPtr, 512);
      frames.push(module.HEAPU8.slice(outPtr, outPtr + length));
    }
    const packed = packFrames(frames, 300);
    assert.equal(packed.length, 188);
    assert.equal(splitSpeexFrames(packed).length, 5);

    const decoder = new SpeexStreamDecoder();
    await decoder.open();
    const samples = decoder.decode(packed);
    decoder.close();
    assert.equal(samples.length, 800);
    assert.equal(decoder.decodeErrors, 0);
    let energy = 0;
    for (const sample of samples) energy += sample * sample;
    assert.ok(energy > 0);
  });
});

function packFrames(parts: Uint8Array[], bitsEach: number): Uint8Array {
  const out = new Uint8Array(Math.ceil((bitsEach * parts.length) / 8));
  let pos = 0;
  for (const frame of parts) {
    for (let bit = 0; bit < bitsEach; bit++) {
      const value = (frame[bit >> 3]! >> (7 - (bit & 7))) & 1;
      if (value) out[pos >> 3] |= 1 << (7 - (pos & 7));
      pos += 1;
    }
  }
  return out;
}
