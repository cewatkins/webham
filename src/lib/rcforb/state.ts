import { decodeProtocolText } from "./text";
import type { ChatLine, NoticeLine, RadioSnapshot } from "./types";

type RosterEntry = { user: string; uid: string };

/**
 * Display mirror of the lines a v0.7 station pushes. There is no setter a
 * caller can use to transmit a change — Apply only records what arrived.
 */
export class RadioStateStore {
  ready = false;
  radioName: string | null = null;
  driver: string | null = null;
  version: string | null = null;
  band: string | null = null;
  frequencyText: string | null = null;
  frequencyBText: string | null = null;
  private meters = new Map<string, string>();
  private dropdowns = new Map<string, string>();
  private messages = new Map<string, string>();
  private roster: RosterEntry[] = [];
  private chat: ChatLine[] = [];
  lastChat: ChatLine | null = null;

  apply(line: string): void {
    if (!line) return;

    if (!this.ready && (line.startsWith("chat::") || isStatePosted(line))) {
      this.ready = true;
    }

    if (line.startsWith("chat::")) {
      this.applyChat(line);
      return;
    }

    if (line.startsWith("server::")) {
      this.applyServer(line.slice("server::".length));
      return;
    }

    let rest = line;
    if (rest.startsWith("post::")) rest = `radio::${rest.slice("post::".length)}`;
    else if (rest.startsWith("k3remote::")) rest = `radio::raw::${rest.slice("k3remote::".length)}`;

    if (!rest.startsWith("radio::")) return;
    rest = rest.slice("radio::".length);

    if (rest.startsWith("radio::")) this.radioName = rest.slice("radio::".length);
    else if (rest.startsWith("driver::")) this.driver = rest.slice("driver::".length);
    else if (rest.startsWith("version::")) this.version = rest.slice("version::".length);
    else if (rest.startsWith("band::")) this.band = rest.slice("band::".length);
    else if (rest.startsWith("frequencyB::")) this.frequencyBText = rest.slice("frequencyB::".length);
    else if (rest.startsWith("frequency::")) this.frequencyText = rest.slice("frequency::".length);
    else if (rest.startsWith("smeter::")) this.meters.set("smeter", rest.slice("smeter::".length));
    else if (rest.startsWith("smeterB::")) this.meters.set("smeterb", rest.slice("smeterB::".length));
    else if (takeBag(rest, "dropdown::", this.dropdowns)) return;
    else if (takeBag(rest, "message::", this.messages)) return;
    else if (rest.startsWith("user_in::")) {
      const user = rest.slice("user_in::".length);
      this.addRoster(user, user);
    } else if (rest.startsWith("user_out::")) {
      this.removeRoster(rest.slice("user_out::".length));
    }
  }

  snapshot(): RadioSnapshot {
    const dropdowns = mapEntries(this.dropdowns);
    const messages = mapEntries(this.messages)
      .map((entry) => ({ ...entry, value: entry.value.slice(0, 180) }))
      .slice(0, 8);
    return {
      ready: this.ready,
      radioName: this.radioName,
      driver: this.driver,
      version: this.version,
      band: this.band,
      frequencyText: this.frequencyText,
      frequencyBText: this.frequencyBText,
      sMeter: this.meters.get("smeter") ?? "",
      mode: this.dropdowns.get("Mode") ?? "",
      filter: this.dropdowns.get("Filter") ?? "",
      dropdowns,
      messages,
      roster: this.roster.map((entry) => ({ ...entry })),
    };
  }

  noticeFor(line: string): NoticeLine | null {
    const closed = "post::radio-closed";
    if (line.startsWith(closed)) {
      const reason = line.length > closed.length + 2 ? decodeProtocolText(line.slice(closed.length + 2)) : "";
      return { kind: "warning", text: reason ? `The remote closed: ${reason}` : "The remote closed." };
    }
    const prefixes: [string, string][] = [
      ["post::info::", "info"],
      ["post::auth::", "auth"],
      ["post::error::", "error"],
      ["post::warning::", "warning"],
      ["server::auth::", "auth"],
    ];
    for (const [prefix, kind] of prefixes) {
      if (line.startsWith(prefix)) {
        return { kind, text: decodeProtocolText(line.slice(prefix.length)) };
      }
    }
    return null;
  }

  private applyServer(rest: string): void {
    if (rest.startsWith("user_in::")) {
      const fields = rest.slice("user_in::".length).split("::");
      const user = fields[0] ?? "";
      const uid = fields[1] || user;
      this.addRoster(user, uid);
    } else if (rest.startsWith("user_out::")) {
      const fields = rest.slice("user_out::".length).split("::");
      const uid = fields[1] || fields[0] || "";
      this.removeRoster(uid);
    } else if (rest.startsWith("user_login::")) {
      const fields = rest.slice("user_login::".length).split("::");
      const user = fields[0] ?? "";
      const uid = fields[1] || user;
      this.removeRoster(uid);
      this.addRoster(user, uid);
    }
  }

  private applyChat(line: string): void {
    const parts = line.slice("chat::".length).split("::");
    const chat: ChatLine = {
      sender: parts[0] ?? "",
      timestamp: parts[1] ?? "",
      text: decodeProtocolText(parts.slice(2).join("::")),
    };
    this.chat.push(chat);
    if (this.chat.length > 200) this.chat.shift();
    this.lastChat = chat;
  }

  private addRoster(user: string, uid: string): void {
    if (!user) return;
    this.roster.push({ user, uid: uid || user });
    if (this.roster.length > 80) this.roster.shift();
  }

  private removeRoster(uid: string): void {
    if (!uid) return;
    this.roster = this.roster.filter((entry) => entry.uid !== uid);
  }
}

function isStatePosted(line: string): boolean {
  const text = line.startsWith("post::") ? line.slice("post::".length) : line;
  return text === "state-posted" || text === "radio::state-posted";
}

function takeBag(rest: string, prefix: string, bag: Map<string, string>): boolean {
  if (!rest.startsWith(prefix)) return false;
  const payload = rest.slice(prefix.length);
  const separator = payload.indexOf("::");
  const key = separator < 0 ? payload : payload.slice(0, separator);
  const value = separator < 0 ? "" : payload.slice(separator + 2);
  if (key) bag.set(key, value);
  return true;
}

function mapEntries(bag: Map<string, string>): { key: string; value: string }[] {
  return [...bag.entries()]
    .sort((a, b) => a[0].localeCompare(b[0]))
    .map(([key, value]) => ({ key, value }));
}
