export type Station = {
  orbId: string;
  serverName: string;
  radioName: string;
  domain: string;
  controlPort: number;
  audioPort: number;
  transport: "v0.7" | "v0.9";
  listenPolicy: string;
  canTransmit: boolean;
  online: boolean;
  version: string;
  country: string;
  city: string;
  grid: string;
  blurb: string;
};

export type RadioSnapshot = {
  ready: boolean;
  radioName: string | null;
  driver: string | null;
  version: string | null;
  band: string | null;
  frequencyText: string | null;
  frequencyBText: string | null;
  sMeter: string;
  mode: string;
  filter: string;
  dropdowns: { key: string; value: string }[];
  messages: { key: string; value: string }[];
  roster: { user: string; uid: string }[];
};

export type ChatLine = {
  sender: string;
  timestamp: string;
  text: string;
};

export type NoticeLine = {
  kind: string;
  text: string;
};

export type ListenStats = {
  packets: number;
  decodedSeconds: number;
  frames: number;
  decodeErrors: number;
  controlLines: number;
};

export type ListenEvent =
  | { type: "status"; status: "connecting" | "live" | "unverified"; detail?: string }
  | { type: "state"; snapshot: RadioSnapshot }
  | { type: "chat"; chat: ChatLine }
  | { type: "notice"; notice: NoticeLine }
  | { type: "stats"; stats: ListenStats }
  | { type: "hello"; sessionId: string }
  | { type: "auth"; state: "authenticating" | "authorised" | "refused"; message?: string }
  | { type: "end"; reason: "stop" | "link" | "time-limit"; failure?: string };

export function stationKey(station: Pick<Station, "orbId" | "domain" | "controlPort" | "audioPort">): string {
  return `${station.orbId}|${station.domain}:${station.controlPort}/${station.audioPort}`;
}
