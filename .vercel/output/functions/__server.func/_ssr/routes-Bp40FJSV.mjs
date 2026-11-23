import { i as __toESM } from "../_runtime.mjs";
import { K as require_react, b as require_jsx_runtime } from "../_libs/@tanstack/react-router+[...].mjs";
import { a as Headphones, i as RefreshCw, n as Square, r as Search } from "../_libs/lucide-react.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/routes-Bp40FJSV.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
function stationKey(station) {
	return `${station.orbId}|${station.domain}:${station.controlPort}/${station.audioPort}`;
}
function DirectoryRail({ stations, loading, error, query, onQuery, onRefresh, selectedKey, onSelect, onManual }) {
	const [host, setHost] = (0, import_react.useState)("");
	const [controlPort, setControlPort] = (0, import_react.useState)("4525");
	const [audioPort, setAudioPort] = (0, import_react.useState)("4524");
	const [manualError, setManualError] = (0, import_react.useState)(null);
	const needle = query.trim().toLowerCase();
	const visible = needle ? stations.filter((station) => [
		station.serverName,
		station.radioName,
		station.country,
		station.city,
		station.grid,
		station.domain,
		station.blurb
	].join(" ").toLowerCase().includes(needle)) : stations;
	function submitManual() {
		const nextHost = host.trim();
		const control = Number(controlPort);
		const audio = Number(audioPort);
		if (!nextHost) {
			setManualError("Enter a host or address.");
			return;
		}
		if (!Number.isInteger(control) || control < 1 || control > 65535) {
			setManualError("Control port looks wrong.");
			return;
		}
		if (!Number.isInteger(audio) || audio < 1 || audio > 65535) {
			setManualError("Audio port looks wrong.");
			return;
		}
		setManualError(null);
		onManual(nextHost, control, audio);
	}
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
		className: "flex h-96 min-h-0 flex-col overflow-hidden rounded-lg border border-line bg-surface lg:h-full",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "flex items-center gap-2 border-b border-line px-3 py-3",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "min-w-0 flex-1",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
						className: "text-sm font-semibold tracking-wide",
						children: "Stations"
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "text-xs text-muted",
						children: loading ? "Loading the public list" : `${visible.length} shown`
					})]
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
					type: "button",
					onClick: onRefresh,
					className: "inline-flex h-11 w-11 items-center justify-center rounded-lg border border-line text-fg hover:border-amber hover:text-amber",
					"aria-label": "Refresh station list",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(RefreshCw, { className: `size-4 ${loading ? "animate-spin" : ""}` })
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", {
				className: "relative mx-3 mt-3 block",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
						className: "sr-only",
						children: "Filter stations"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Search, { className: "pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted" }),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
						value: query,
						onChange: (event) => onQuery(event.target.value),
						placeholder: "Call, radio, country, grid",
						className: "h-11 w-full rounded-lg border border-line bg-bg pr-3 pl-10 text-sm text-fg outline-none placeholder:text-muted focus-visible:border-amber"
					})
				]
			}),
			error ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "mx-3 mt-3 text-sm text-amber",
				children: error
			}) : null,
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("ul", {
				className: "panel-scroll mt-3 min-h-0 flex-1 space-y-1 overflow-y-auto px-2 pb-2",
				children: [visible.length === 0 && !loading ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("li", {
					className: "px-2 py-6 text-sm text-muted",
					children: "No station matches that filter."
				}) : null, visible.map((station) => {
					const key = stationKey(station);
					const selected = key === selectedKey;
					const place = [station.city, station.country].filter(Boolean).join(", ");
					return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("li", { children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
						type: "button",
						onClick: () => onSelect(station),
						className: `w-full rounded-lg px-3 py-2 text-left ${selected ? "bg-surface-2 ring-1 ring-amber" : "hover:bg-surface-2"}`,
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
								className: "flex items-baseline justify-between gap-2",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
									className: "truncate font-medium",
									children: station.serverName
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
									className: "shrink-0 font-mono text-xs text-amber",
									children: station.radioName || "radio"
								})]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
								className: "mt-0.5 block truncate text-xs text-muted",
								children: [place || station.domain, station.grid ? ` · ${station.grid}` : ""]
							}),
							station.transport !== "v0.7" ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
								className: "mt-1 block text-xs text-amber",
								children: "v0.9 — not supported"
							}) : null
						]
					}) }, key);
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("form", {
				className: "space-y-2 border-t border-line p-3",
				onSubmit: (event) => {
					event.preventDefault();
					submitManual();
				},
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "text-xs font-medium tracking-wide text-muted",
						children: "Manual endpoint"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
						value: host,
						onChange: (event) => setHost(event.target.value),
						placeholder: "host or address",
						autoComplete: "off",
						className: "h-11 w-full rounded-lg border border-line bg-bg px-3 text-sm outline-none focus-visible:border-amber"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "grid grid-cols-2 gap-2",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", {
							className: "block text-xs text-muted",
							children: ["Control", /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
								value: controlPort,
								onChange: (event) => setControlPort(event.target.value),
								inputMode: "numeric",
								className: "mt-1 h-11 w-full rounded-lg border border-line bg-bg px-3 font-mono text-sm text-fg outline-none focus-visible:border-amber"
							})]
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", {
							className: "block text-xs text-muted",
							children: ["Audio", /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
								value: audioPort,
								onChange: (event) => setAudioPort(event.target.value),
								inputMode: "numeric",
								className: "mt-1 h-11 w-full rounded-lg border border-line bg-bg px-3 font-mono text-sm text-fg outline-none focus-visible:border-amber"
							})]
						})]
					}),
					manualError ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "text-xs text-amber",
						children: manualError
					}) : null,
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
						type: "submit",
						className: "h-11 w-full rounded-lg border border-line text-sm font-medium hover:border-amber hover:text-amber",
						children: "Use this endpoint"
					})
				]
			})
		]
	});
}
function LogPanel({ chat, notices, snapshot, chatEndRef }) {
	const [tab, setTab] = (0, import_react.useState)("chat");
	const roster = snapshot?.roster ?? [];
	(0, import_react.useEffect)(() => {
		chatEndRef.current?.scrollIntoView({ block: "end" });
	}, [
		chat,
		notices,
		tab,
		chatEndRef
	]);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
		className: "flex h-80 min-h-0 flex-col overflow-hidden rounded-lg border border-line bg-surface lg:h-full",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "border-b border-line px-3 py-3",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
					className: "text-sm font-semibold tracking-wide",
					children: "Station log"
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "text-xs text-muted",
					children: "Read only. Nothing here is sent back."
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "border-b border-line px-3 py-3",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "text-xs font-medium tracking-widest text-muted",
					children: "ON THE RADIO"
				}), roster.length === 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "mt-2 text-sm text-muted",
					children: "No roster yet."
				}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("ul", {
					className: "mt-2 flex flex-wrap gap-1.5",
					children: roster.map((entry) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("li", {
						className: "rounded-md border border-line px-2 py-1 text-xs",
						children: entry.user
					}, `${entry.uid}-${entry.user}`))
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "flex gap-2 px-3 pt-3",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TabButton, {
					active: tab === "chat",
					onClick: () => setTab("chat"),
					children: "Chat"
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(TabButton, {
					active: tab === "notices",
					onClick: () => setTab("notices"),
					children: "Notices"
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "panel-scroll min-h-0 flex-1 space-y-3 overflow-y-auto px-3 py-3",
				children: [tab === "chat" ? chat.length === 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "text-sm text-muted",
					children: "Chat from the station shows up here. You cannot answer it."
				}) : chat.map((line, index) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("article", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
					className: "text-xs text-muted",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
						className: "text-fg",
						children: line.sender || "Station"
					}), line.timestamp ? ` · ${line.timestamp}` : ""]
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "mt-0.5 text-sm",
					children: line.text
				})] }, `${line.timestamp}-${index}`)) : notices.length === 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "text-sm text-muted",
					children: "Warnings and station messages land here."
				}) : notices.map((notice, index) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("article", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "text-xs tracking-wide text-amber",
					children: notice.kind
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "mt-0.5 text-sm",
					children: notice.text
				})] }, `${notice.at}-${index}`)), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { ref: chatEndRef })]
			}),
			snapshot && snapshot.dropdowns.length > 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("dl", {
				className: "panel-scroll max-h-36 space-y-1 overflow-y-auto border-t border-line px-3 py-3 text-xs",
				children: [snapshot.dropdowns.filter((item) => item.key !== "Mode" && item.key !== "Filter").map((item) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "flex justify-between gap-3",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("dt", {
						className: "text-muted",
						children: item.key
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("dd", {
						className: "truncate text-right font-mono",
						children: item.value || "—"
					})]
				}, item.key)), snapshot.messages.map((item) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "flex justify-between gap-3",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("dt", {
						className: "text-muted",
						children: item.key
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("dd", {
						className: "truncate text-right",
						children: item.value || "—"
					})]
				}, item.key))]
			}) : null
		]
	});
}
function TabButton({ active, onClick, children }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
		type: "button",
		onClick,
		className: `h-10 rounded-lg px-3 text-sm ${active ? "bg-amber text-ink" : "text-muted hover:text-fg"}`,
		children
	});
}
function formatFrequency(text) {
	if (!text) return {
		digits: "—.——————",
		unit: ""
	};
	if (!/^\d+$/.test(text)) return {
		digits: text,
		unit: ""
	};
	const hz = Number(text);
	if (!Number.isFinite(hz)) return {
		digits: text,
		unit: ""
	};
	return {
		digits: (hz / 1e6).toFixed(6),
		unit: "MHz"
	};
}
function parseMeter(raw) {
	const parts = raw.split(",");
	if (parts.length < 3) return null;
	const value = Number(parts[1]);
	const max = Number(parts[2]);
	if (!Number.isFinite(value) || !Number.isFinite(max) || max <= 0) return null;
	return {
		label: parts[0] || "S",
		value: Math.max(0, value),
		max
	};
}
var SAMPLE_RATE = 8e3;
/** Schedules 8 kHz mono PCM with a short jitter buffer. Local gain only. */
var PcmPlayer = class {
	context;
	gain;
	wave;
	wavePos = 0;
	nextTime = 0;
	started = false;
	target = .3;
	pending = [];
	pendingSamples = 0;
	level = 0;
	underruns = 0;
	skippedSamples = 0;
	cursor = 0;
	constructor(context, wave) {
		this.context = context;
		this.wave = wave;
		this.gain = context.createGain();
		this.gain.gain.value = .9;
		this.gain.connect(context.destination);
	}
	setTarget(seconds) {
		this.target = Math.min(1, Math.max(.1, seconds));
	}
	setVolume(value) {
		const next = Math.min(1, Math.max(0, value));
		this.gain.gain.setTargetAtTime(next, this.context.currentTime, .01);
	}
	push(samples) {
		this.note(samples);
		this.pending.push(samples);
		this.pendingSamples += samples.length;
		const targetSamples = Math.floor(this.target * SAMPLE_RATE);
		if (!this.started) {
			if (this.pendingSamples < targetSamples) return;
			this.started = true;
			this.nextTime = this.context.currentTime + .04;
		}
		this.flush();
	}
	depth() {
		if (!this.started) return this.pendingSamples / SAMPLE_RATE;
		return Math.max(0, this.nextTime - this.context.currentTime);
	}
	stop() {
		this.pending = [];
		this.pendingSamples = 0;
		this.started = false;
		this.context.close().catch(() => void 0);
	}
	flush() {
		const depth = this.nextTime - this.context.currentTime;
		const cap = Math.max(this.target * 2, this.target + .6);
		if (this.started && depth > cap) {
			this.skippedSamples += this.pendingSamples;
			this.pending = [];
			this.pendingSamples = 0;
			return;
		}
		if (this.nextTime < this.context.currentTime - .02) {
			this.underruns += 1;
			this.nextTime = this.context.currentTime + .02;
		}
		for (const samples of this.pending) this.schedule(samples);
		this.pending = [];
		this.pendingSamples = 0;
	}
	schedule(samples) {
		const buffer = this.context.createBuffer(1, samples.length, SAMPLE_RATE);
		const channel = buffer.getChannelData(0);
		for (let i = 0; i < samples.length; i++) channel[i] = samples[i] / 32768;
		const source = this.context.createBufferSource();
		source.buffer = buffer;
		source.connect(this.gain);
		source.start(this.nextTime);
		this.nextTime += buffer.duration;
	}
	note(samples) {
		let sum = 0;
		const step = Math.max(1, Math.floor(samples.length / 48));
		for (let i = 0; i < samples.length; i++) {
			const value = samples[i] / 32768;
			sum += value * value;
			if (i % step === 0) {
				this.wave[this.wavePos] = value;
				this.wavePos = (this.wavePos + 1) % this.wave.length;
				this.cursor = this.wavePos;
			}
		}
		this.level = Math.sqrt(sum / Math.max(1, samples.length));
	}
};
function scopePoints(wave, cursor = 0, count = 96) {
	const parts = [];
	for (let i = 0; i < count; i++) {
		const index = (cursor + Math.floor(i / count * wave.length)) % wave.length;
		const x = i / (count - 1) * 100;
		const y = 50 - (wave[index] ?? 0) * 42;
		parts.push(`${x.toFixed(2)},${y.toFixed(2)}`);
	}
	return parts.join(" ");
}
async function readListenStream(response, handlers) {
	if (!response.body) throw new Error("The station stream did not open.");
	const reader = response.body.getReader();
	let buffer = /* @__PURE__ */ new Uint8Array(0);
	while (true) {
		const { done, value } = await reader.read();
		if (done) break;
		if (!value || value.length === 0) continue;
		const incoming = new Uint8Array(value.byteLength);
		incoming.set(value);
		buffer = concat(buffer, incoming);
		while (buffer.length >= 5) {
			const type = buffer[0];
			const length = new DataView(buffer.buffer, buffer.byteOffset, buffer.byteLength).getUint32(1);
			if (length > 1e6) throw new Error("The station sent a frame that was too large.");
			if (buffer.length < 5 + length) break;
			const payload = buffer.slice(5, 5 + length);
			buffer = buffer.slice(5 + length);
			if (type === 1) handlers.event(JSON.parse(new TextDecoder().decode(payload)));
			else if (type === 2 && payload.length >= 2) {
				const view = new DataView(payload.buffer, payload.byteOffset, payload.byteLength);
				const samples = new Int16Array(Math.floor(payload.length / 2));
				for (let i = 0; i < samples.length; i++) samples[i] = view.getInt16(i * 2, true);
				handlers.pcm(samples);
			}
		}
	}
}
function concat(left, right) {
	const next = new Uint8Array(left.length + right.length);
	next.set(left);
	next.set(right, left.length);
	return next;
}
var LINK_LABEL = {
	idle: "Idle",
	connecting: "Connecting",
	live: "Live",
	unverified: "Unverified",
	linklost: "Link lost"
};
function RadioFace({ station, snapshot, link, detail, elapsed, waveRef, playerRef }) {
	const scopeRef = (0, import_react.useRef)(null);
	const [level, setLevel] = (0, import_react.useState)(0);
	const frequency = formatFrequency(snapshot?.frequencyText);
	const vfoB = snapshot?.frequencyBText ? formatFrequency(snapshot.frequencyBText) : null;
	const meter = parseMeter(snapshot?.sMeter ?? "");
	const meterPct = meter ? Math.max(0, Math.min(100, meter.value / meter.max * 100)) : 0;
	const radioName = snapshot?.radioName || station?.radioName || "No radio";
	const place = [station?.city, station?.country].filter(Boolean).join(", ");
	(0, import_react.useEffect)(() => {
		let frame = 0;
		let tickCount = 0;
		const tick = () => {
			const scope = scopeRef.current;
			const wave = waveRef.current;
			if (scope && wave) scope.setAttribute("points", scopePoints(wave, playerRef.current?.cursor ?? 0));
			tickCount += 1;
			if (tickCount % 4 === 0) {
				const next = playerRef.current?.level ?? 0;
				setLevel((prev) => Math.abs(prev - next) > .015 ? next : prev);
			}
			frame = requestAnimationFrame(tick);
		};
		frame = requestAnimationFrame(tick);
		return () => cancelAnimationFrame(frame);
	}, [playerRef, waveRef]);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
		className: "rounded-lg border border-line bg-surface p-4",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "flex flex-wrap items-center justify-between gap-2",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "rounded-full border border-amber px-2.5 py-1 text-xs font-semibold tracking-widest text-amber",
					children: "LISTEN ONLY"
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
					className: "font-mono text-sm text-muted",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
						className: link === "live" ? "text-amber" : "text-fg",
						children: LINK_LABEL[link]
					}), link !== "idle" ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", { children: [" · ", formatElapsed(elapsed)] }) : null]
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "mt-4",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
						className: "truncate text-xl font-semibold",
						children: station?.serverName ?? "Choose a station"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
						className: "mt-1 truncate text-sm text-muted",
						children: [
							radioName,
							snapshot?.driver ? ` · ${snapshot.driver}` : "",
							place ? ` · ${place}` : "",
							station?.grid ? ` · ${station.grid}` : ""
						]
					}),
					station?.blurb ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "mt-2 line-clamp-3 text-sm text-muted",
						children: station.blurb
					}) : null
				]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "mt-4 rounded-lg border border-line bg-bg px-4 py-4",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "font-mono text-4xl tracking-tight text-amber tabular-nums sm:text-5xl",
						children: frequency.digits
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "mt-2 flex flex-wrap items-center gap-2 text-sm",
						children: [
							frequency.unit ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
								className: "text-muted",
								children: frequency.unit
							}) : null,
							snapshot?.mode ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Readout, { label: snapshot.mode }) : null,
							snapshot?.filter ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Readout, { label: snapshot.filter }) : null,
							snapshot?.band ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Readout, { label: `${snapshot.band} m` }) : null
						]
					}),
					vfoB ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
						className: "mt-3 font-mono text-sm text-muted",
						children: [
							"VFO B ",
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
								className: "text-fg",
								children: vfoB.digits
							}),
							" ",
							vfoB.unit
						]
					}) : null
				]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "mt-4",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "flex items-baseline justify-between",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "text-xs font-medium tracking-widest text-muted",
							children: "S-METER"
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "font-mono text-lg text-amber",
							children: meter?.label || snapshot?.sMeter || "—"
						})]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "mt-2 h-3 overflow-hidden rounded-full bg-bg",
						"aria-hidden": "true",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							className: "h-full bg-amber",
							style: { width: `${meterPct}%` }
						})
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "mt-1 flex justify-between font-mono text-xs text-muted",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: "S0" }),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: "S3" }),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: "S5" }),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: "S7" }),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: "S9" }),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: "+20" }),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: "+40" })
						]
					})
				]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "mt-4",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "flex items-baseline justify-between",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "text-xs font-medium tracking-widest text-muted",
							children: "AUDIO"
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
							className: "font-mono text-xs text-muted",
							children: [Math.round(level * 100), "%"]
						})]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("svg", {
						viewBox: "0 0 100 100",
						preserveAspectRatio: "none",
						className: "mt-2 h-16 w-full rounded-lg bg-bg text-amber",
						"aria-hidden": "true",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("polyline", {
							ref: scopeRef,
							fill: "none",
							stroke: "currentColor",
							strokeWidth: "1.5",
							vectorEffect: "non-scaling-stroke"
						})
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "mt-2 h-2 overflow-hidden rounded-full bg-bg",
						"aria-hidden": "true",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							className: "h-full bg-amber",
							style: { width: `${Math.min(100, level * 140)}%` }
						})
					})
				]
			}),
			detail ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "mt-3 text-sm text-amber",
				children: detail
			}) : null
		]
	});
}
function Readout({ label }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
		className: "rounded-md border border-line px-2 py-0.5 font-mono text-fg",
		children: label
	});
}
function formatElapsed(totalSeconds) {
	const seconds = Math.max(0, Math.floor(totalSeconds));
	return `${Math.floor(seconds / 60)}:${(seconds % 60).toString().padStart(2, "0")}`;
}
var EMPTY_STATS = {
	packets: 0,
	decodedSeconds: 0,
	frames: 0,
	decodeErrors: 0,
	controlLines: 0
};
var PREFS_KEY = "rcforb-listen-prefs";
function ListenApp() {
	const [stations, setStations] = (0, import_react.useState)([]);
	const [loading, setLoading] = (0, import_react.useState)(true);
	const [directoryError, setDirectoryError] = (0, import_react.useState)(null);
	const [query, setQuery] = (0, import_react.useState)("");
	const [target, setTarget] = (0, import_react.useState)(null);
	const [link, setLink] = (0, import_react.useState)("idle");
	const [detail, setDetail] = (0, import_react.useState)("");
	const [snapshot, setSnapshot] = (0, import_react.useState)(null);
	const [chat, setChat] = (0, import_react.useState)([]);
	const [notices, setNotices] = (0, import_react.useState)([]);
	const [stats, setStats] = (0, import_react.useState)(EMPTY_STATS);
	const [bufferSeconds, setBufferSeconds] = (0, import_react.useState)(0);
	const [underruns, setUnderruns] = (0, import_react.useState)(0);
	const [elapsed, setElapsed] = (0, import_react.useState)(0);
	const [prefsReady, setPrefsReady] = (0, import_react.useState)(false);
	const [volume, setVolume] = (0, import_react.useState)(.9);
	const [bufferMs, setBufferMs] = (0, import_react.useState)(300);
	const [reconnect, setReconnect] = (0, import_react.useState)(false);
	const waveRef = (0, import_react.useRef)(/* @__PURE__ */ new Float32Array(240));
	const playerRef = (0, import_react.useRef)(null);
	const abortRef = (0, import_react.useRef)(null);
	const genRef = (0, import_react.useRef)(0);
	const chatEndRef = (0, import_react.useRef)(null);
	const startedAt = (0, import_react.useRef)(0);
	const volumeRef = (0, import_react.useRef)(volume);
	const bufferRef = (0, import_react.useRef)(bufferMs);
	const reconnectRef = (0, import_react.useRef)(reconnect);
	volumeRef.current = volume;
	bufferRef.current = bufferMs;
	reconnectRef.current = reconnect;
	(0, import_react.useEffect)(() => {
		try {
			const raw = localStorage.getItem(PREFS_KEY);
			if (raw) {
				const prefs = JSON.parse(raw);
				if (typeof prefs.volume === "number") setVolume(prefs.volume);
				if (typeof prefs.bufferMs === "number") setBufferMs(prefs.bufferMs);
				if (typeof prefs.reconnect === "boolean") setReconnect(prefs.reconnect);
			}
			setPrefsReady(true);
		} catch {
			setPrefsReady(true);
		}
	}, []);
	(0, import_react.useEffect)(() => {
		if (!prefsReady) return;
		localStorage.setItem(PREFS_KEY, JSON.stringify({
			volume,
			bufferMs,
			reconnect
		}));
	}, [
		prefsReady,
		volume,
		bufferMs,
		reconnect
	]);
	(0, import_react.useEffect)(() => {
		playerRef.current?.setVolume(volume);
	}, [volume]);
	(0, import_react.useEffect)(() => {
		playerRef.current?.setTarget(bufferMs / 1e3);
	}, [bufferMs]);
	async function refreshDirectory() {
		setLoading(true);
		setDirectoryError(null);
		try {
			const response = await fetch("/api/directory");
			const body = await response.json();
			if (!response.ok || !body.entries) {
				setDirectoryError(body.error ?? "The station list did not load. You can still enter a host.");
				return;
			}
			setStations(body.entries);
		} catch {
			setDirectoryError("The station list did not load. You can still enter a host.");
		} finally {
			setLoading(false);
		}
	}
	(0, import_react.useEffect)(() => {
		refreshDirectory();
	}, []);
	(0, import_react.useEffect)(() => {
		if (link === "idle") return;
		const timer = setInterval(() => {
			if (startedAt.current) setElapsed(Math.floor((Date.now() - startedAt.current) / 1e3));
			const player = playerRef.current;
			if (!player) return;
			setBufferSeconds(player.depth());
			setUnderruns(player.underruns);
		}, 250);
		return () => clearInterval(timer);
	}, [link]);
	function stop() {
		genRef.current += 1;
		abortRef.current?.abort();
		abortRef.current = null;
		playerRef.current?.stop();
		playerRef.current = null;
		setLink("idle");
		setDetail("");
	}
	async function listen() {
		if (!target) return;
		if (target.transport !== "v0.7" || target.audioPort < 1) {
			setDetail("This station uses the single-socket path, which this listener does not speak.");
			return;
		}
		stop();
		const generation = ++genRef.current;
		const alive = () => genRef.current === generation;
		setSnapshot(null);
		setChat([]);
		setNotices([]);
		setStats(EMPTY_STATS);
		setBufferSeconds(0);
		setUnderruns(0);
		setDetail("");
		startedAt.current = Date.now();
		setElapsed(0);
		const context = new AudioContext();
		const player = new PcmPlayer(context, waveRef.current);
		player.setVolume(volumeRef.current);
		player.setTarget(bufferRef.current / 1e3);
		playerRef.current = player;
		context.resume();
		let reason = "link";
		while (alive()) {
			const abort = new AbortController();
			abortRef.current = abort;
			if (alive()) setLink("connecting");
			try {
				reason = await pullStation(target, abort.signal, player, alive, {
					status: (status, nextDetail) => {
						if (!alive()) return;
						setLink(status);
						if (nextDetail) setDetail(nextDetail);
					},
					state: (next) => alive() && setSnapshot(next),
					chat: (line) => alive() && setChat((current) => [...current.slice(-199), line]),
					notice: (notice) => alive() && setNotices((current) => [...current.slice(-79), {
						...notice,
						at: Date.now()
					}]),
					stats: (next) => alive() && setStats(next),
					failure: (message) => alive() && setDetail(message)
				});
			} catch (error) {
				if (!alive()) break;
				reason = "link";
				setDetail(error instanceof Error ? error.message : "The link failed.");
			}
			if (!alive()) break;
			if (reason === "stop" || reason === "time-limit" || !reconnectRef.current) break;
			setLink("connecting");
			setDetail("The station dropped the guest link. Reconnecting.");
			await delay(1e3, generation, genRef);
		}
		if (playerRef.current === player) {
			player.stop();
			playerRef.current = null;
		}
		if (!alive()) return;
		if (reason === "link") {
			setLink("linklost");
			setDetail((current) => current || "The station closed the link.");
		} else setLink("idle");
		if (reason === "time-limit") setDetail("Paused after 20 minutes. Press Listen if you want to continue.");
	}
	const listening = link === "connecting" || link === "live" || link === "unverified";
	const selectedKey = target ? stationKey(target) : null;
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("main", {
		className: "mx-auto flex min-h-dvh max-w-7xl flex-col gap-3 px-3 py-3 lg:h-dvh",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("header", {
				className: "flex flex-wrap items-end justify-between gap-3",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "text-xs font-medium tracking-widest text-amber",
					children: "RCFORB"
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
					className: "text-2xl font-semibold tracking-tight",
					children: "Listen"
				})] }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "max-w-xl text-sm text-muted",
					children: "A guest receiver for public RemoteHams stations. You hear the radio, the meter, and the chat. Tuning, typing, and transmit are not in this app."
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "grid min-h-0 flex-1 grid-cols-1 gap-3 lg:grid-cols-12",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "order-1 min-h-0 lg:col-span-3",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(DirectoryRail, {
							stations,
							loading,
							error: directoryError,
							query,
							onQuery: setQuery,
							onRefresh: () => void refreshDirectory(),
							selectedKey,
							onSelect: setTarget,
							onManual: (host, controlPort, audioPort) => setTarget({
								orbId: "manual",
								serverName: host,
								radioName: "Manual",
								domain: host,
								controlPort,
								audioPort,
								transport: "v0.7",
								listenPolicy: "manual",
								canTransmit: false,
								online: true,
								version: "",
								country: "",
								city: "",
								grid: "",
								blurb: "Entered by hand. Listen only if you have the owner’s OK."
							})
						})
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "order-2 flex min-h-0 flex-col gap-3 lg:col-span-6",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(RadioFace, {
								station: target,
								snapshot,
								link,
								detail,
								elapsed,
								waveRef,
								playerRef
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
								className: "sticky bottom-2 z-20 rounded-lg border border-line bg-surface p-3 lg:static",
								children: [
									/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
										className: "flex flex-col gap-2 sm:flex-row",
										children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
											type: "button",
											onClick: () => void listen(),
											disabled: !target || listening,
											className: "inline-flex h-12 flex-1 items-center justify-center gap-2 rounded-lg bg-amber px-4 font-semibold text-ink disabled:opacity-40",
											children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Headphones, { className: "size-4" }), "Listen"]
										}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
											type: "button",
											onClick: stop,
											disabled: !listening,
											className: "inline-flex h-12 items-center justify-center gap-2 rounded-lg border border-line px-4 font-medium disabled:opacity-40",
											children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Square, { className: "size-4" }), "Stop"]
										})]
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
										className: "mt-3 grid gap-3 sm:grid-cols-2",
										children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", {
											className: "block text-xs text-muted",
											children: [
												"Buffer ",
												bufferMs,
												" ms",
												/* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
													type: "range",
													min: 100,
													max: 1e3,
													step: 50,
													value: bufferMs,
													onChange: (event) => setBufferMs(Number(event.target.value)),
													className: "mt-2 h-11 w-full accent-amber"
												})
											]
										}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", {
											className: "block text-xs text-muted",
											children: [
												"Volume ",
												Math.round(volume * 100),
												/* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
													type: "range",
													min: 0,
													max: 1,
													step: .01,
													value: volume,
													onChange: (event) => setVolume(Number(event.target.value)),
													className: "mt-2 h-11 w-full accent-amber"
												})
											]
										})]
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", {
										className: "mt-1 flex min-h-11 items-center gap-3 text-sm",
										children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
											type: "checkbox",
											checked: reconnect,
											onChange: (event) => setReconnect(event.target.checked),
											className: "size-4 accent-amber"
										}), "Reconnect if the station drops the guest link"]
									})
								]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("dl", {
								className: "grid grid-cols-3 gap-2 rounded-lg border border-line bg-surface p-3 text-center sm:grid-cols-6",
								children: [
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Stat, {
										label: "Packets",
										value: String(stats.packets)
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Stat, {
										label: "Audio",
										value: `${stats.decodedSeconds.toFixed(1)}s`
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Stat, {
										label: "Frames",
										value: stats.frames ? stats.frames.toFixed(1) : "0"
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Stat, {
										label: "Buffer",
										value: `${bufferSeconds.toFixed(2)}s`
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Stat, {
										label: "Gaps",
										value: String(underruns)
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Stat, {
										label: "Errors",
										value: String(stats.decodeErrors)
									})
								]
							})
						]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "order-3 min-h-0 lg:col-span-3",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(LogPanel, {
							chat,
							notices,
							snapshot,
							chatEndRef
						})
					})
				]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("footer", {
				className: "flex flex-wrap items-center justify-between gap-2 pb-1 text-xs text-muted",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", { children: "Guest path only. A session pauses itself after 20 minutes." }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "font-mono",
					children: target ? `${target.domain}:${target.controlPort} / ${target.audioPort}` : "no endpoint"
				})]
			})
		]
	});
}
function Stat({ label, value }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("dt", {
		className: "text-xs tracking-wide text-muted",
		children: label
	}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("dd", {
		className: "font-mono text-sm text-fg",
		children: value
	})] });
}
async function pullStation(target, signal, player, alive, handlers) {
	const response = await fetch("/api/listen", {
		method: "POST",
		headers: { "content-type": "application/json" },
		body: JSON.stringify({
			host: target.domain,
			controlPort: target.controlPort,
			audioPort: target.audioPort
		}),
		signal
	});
	const contentType = response.headers.get("content-type") ?? "";
	if (!response.ok || contentType.includes("application/json")) {
		const body = await response.json().catch(() => null);
		throw new Error(body?.error ?? `The station link was refused (${response.status}).`);
	}
	let reason = "link";
	await readListenStream(response, {
		event: (event) => {
			if (!alive()) return;
			if (event.type === "status") handlers.status(event.status, event.detail);
			else if (event.type === "state") handlers.state(event.snapshot);
			else if (event.type === "chat") handlers.chat(event.chat);
			else if (event.type === "notice") handlers.notice(event.notice);
			else if (event.type === "stats") handlers.stats(event.stats);
			else if (event.type === "end") {
				reason = event.reason;
				if (event.failure) handlers.failure(event.failure);
			}
		},
		pcm: (samples) => {
			if (alive()) player.push(samples);
		}
	});
	return reason;
}
function delay(ms, generation, genRef) {
	return new Promise((resolve) => {
		const timer = setTimeout(resolve, ms);
		const watch = setInterval(() => {
			if (genRef.current !== generation) {
				clearTimeout(timer);
				clearInterval(watch);
				resolve();
			}
		}, 100);
		setTimeout(() => clearInterval(watch), ms + 50);
	});
}
function Home() {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ListenApp, {});
}
//#endregion
export { Home as component };
