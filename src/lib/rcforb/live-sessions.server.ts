export type LiveSession = {
  id: string;
  authorised: boolean;
  user: string;
  login: (user: string, passwordMd5: string) => Promise<void>;
  sendChat: (text: string) => Promise<void>;
};

const sessions = new Map<string, LiveSession>();

export function registerSession(session: LiveSession): void {
  sessions.set(session.id, session);
}

export function dropSession(id: string): void {
  sessions.delete(id);
}

export function getSession(id: string): LiveSession | undefined {
  return sessions.get(id);
}

export function validateUser(user: string): string | null {
  if (user.length < 1 || user.length > 21) return "That name is empty or too long.";
  if (!/^[\x21-\x7e]+$/.test(user) || user.includes(",") || user.includes(":") || /\s/.test(user)) {
    return "Use the RemoteHams name as a single word, with no spaces or commas.";
  }
  return null;
}

export function validateMd5(value: string): boolean {
  return /^[a-f0-9]{32}$/.test(value);
}

export function validateChatText(text: string): string | null {
  if (!text) return "Message is empty.";
  if (text.length > 400) return "Message is too long.";
  if (text.includes("::")) return "Message cannot contain ::.";
  if (text.includes("%")) return "Message cannot contain %.";
  if (text.startsWith("/")) return "Lines starting with / are not chat.";
  if (/[\r\n\0]/.test(text)) return "Message cannot contain a line break.";
  return null;
}
