import { useEffect, useMemo, useState, type RefObject } from "react";
import { Copy, Send } from "lucide-react";
import type { ChatLine, RadioSnapshot } from "@/lib/rcforb/types";

type AuthState = "guest" | "authenticating" | "authorised" | "refused";

type LogPanelProps = {
  chat: ChatLine[];
  notices: { kind: string; text: string; at: number }[];
  snapshot: RadioSnapshot | null;
  chatEndRef: RefObject<HTMLDivElement | null>;
  authState: AuthState;
  authMessage: string;
  accountUser: string;
  password: string;
  onAccountUser: (value: string) => void;
  onPassword: (value: string) => void;
  onSignIn: () => void;
  onSendChat: (text: string) => void;
  chatError: string;
  listening: boolean;
};

export function LogPanel({
  chat,
  notices,
  snapshot,
  chatEndRef,
  authState,
  authMessage,
  accountUser,
  password,
  onAccountUser,
  onPassword,
  onSignIn,
  onSendChat,
  chatError,
  listening,
}: LogPanelProps) {
  const [tab, setTab] = useState<"chat" | "notices">("chat");
  const [filter, setFilter] = useState("");
  const [draft, setDraft] = useState("");
  const [copied, setCopied] = useState(false);
  const [follow, setFollow] = useState(true);
  const roster = snapshot?.roster ?? [];
  const needle = filter.trim().toLowerCase();
  const shown = useMemo(
    () =>
      needle
        ? chat.filter((line) => `${line.sender} ${line.text}`.toLowerCase().includes(needle))
        : chat,
    [chat, needle],
  );

  useEffect(() => {
    if (follow) chatEndRef.current?.scrollIntoView({ block: "end" });
  }, [shown, notices, tab, follow, chatEndRef]);

  const authLabel =
    authState === "authorised"
      ? `Signed in${accountUser ? ` as ${accountUser}` : ""}`
      : authState === "authenticating"
        ? "Signing in"
        : authState === "refused"
          ? "Sign-in refused"
          : "Guest";

  async function copyLog() {
    const text = chat.map((line) => `${line.sender} ${line.timestamp}\n${line.text}`).join("\n\n");
    try {
      await navigator.clipboard.writeText(text || "No chat yet.");
      setCopied(true);
      setTimeout(() => setCopied(false), 1200);
    } catch {
      setCopied(false);
    }
  }

  return (
    <section className="flex h-full min-h-0 flex-1 flex-col overflow-hidden rounded-lg border border-line bg-surface">
      <div className="flex items-start justify-between gap-2 border-b border-line px-3 py-3">
        <div>
          <h2 className="text-sm font-semibold tracking-wide">Station log</h2>
          <p className="text-xs text-muted">{authLabel}. Text only — the radio is never keyed.</p>
        </div>
        <button
          type="button"
          onClick={() => void copyLog()}
          className="inline-flex h-10 items-center gap-1 rounded-lg border border-line px-2 text-xs text-muted hover:text-fg"
        >
          <Copy className="size-3.5" />
          {copied ? "Copied" : "Copy"}
        </button>
      </div>

      <div className="border-b border-line px-3 py-3">
        <p className="text-xs font-medium tracking-widest text-muted">ON THE RADIO</p>
        {roster.length === 0 ? (
          <p className="mt-2 text-sm text-muted">No roster yet.</p>
        ) : (
          <ul className="mt-2 flex flex-wrap gap-1.5">
            {roster.map((entry) => (
              <li key={`${entry.uid}-${entry.user}`} className="rounded-md border border-line px-2 py-1 text-xs">
                {entry.user}
              </li>
            ))}
          </ul>
        )}
      </div>

      <div className="flex flex-wrap items-center gap-2 px-3 pt-3">
        <TabButton active={tab === "chat"} onClick={() => setTab("chat")}>
          Chat
        </TabButton>
        <TabButton active={tab === "notices"} onClick={() => setTab("notices")}>
          Notices
        </TabButton>
        {tab === "chat" ? (
          <input
            value={filter}
            onChange={(event) => setFilter(event.target.value)}
            placeholder="Search chat"
            className="h-10 min-w-0 flex-1 rounded-lg border border-line bg-bg px-3 text-sm outline-none focus-visible:border-amber"
          />
        ) : null}
      </div>

      <div
        className="panel-scroll min-h-0 flex-1 space-y-3 overflow-y-auto px-3 py-3"
        onScroll={(event) => {
          const node = event.currentTarget;
          const distance = node.scrollHeight - node.scrollTop - node.clientHeight;
          setFollow(distance < 48);
        }}
      >
        {tab === "chat" ? (
          shown.length === 0 ? (
            <p className="text-sm text-muted">Chat from the station shows up here.</p>
          ) : (
            shown.map((line, index) => (
              <article key={`${line.timestamp}-${index}`}>
                <p className="text-xs text-muted">
                  <span className="text-fg">{line.sender || "Station"}</span>
                  {line.timestamp ? ` · ${line.timestamp}` : ""}
                </p>
                <p className="mt-0.5 text-sm">{line.text}</p>
              </article>
            ))
          )
        ) : notices.length === 0 ? (
          <p className="text-sm text-muted">Warnings and station messages land here.</p>
        ) : (
          notices.map((notice, index) => (
            <article key={`${notice.at}-${index}`}>
              <p className="text-xs tracking-wide text-amber">{notice.kind}</p>
              <p className="mt-0.5 text-sm">{notice.text}</p>
            </article>
          ))
        )}
        {follow ? null : <p className="text-xs text-muted">Scroll paused.</p>}
        <div ref={chatEndRef} />
      </div>

      {snapshot && (snapshot.dropdowns.length > 0 || snapshot.messages.length > 0) ? (
        <dl className="panel-scroll max-h-28 space-y-1 overflow-y-auto border-t border-line px-3 py-2 text-xs">
          {snapshot.dropdowns
            .filter((item) => item.key !== "Mode" && item.key !== "Filter")
            .map((item) => (
              <div key={item.key} className="flex justify-between gap-3">
                <dt className="text-muted">{item.key}</dt>
                <dd className="truncate text-right font-mono">{item.value || "—"}</dd>
              </div>
            ))}
          {snapshot.messages.map((item) => (
            <div key={item.key} className="flex justify-between gap-3">
              <dt className="text-muted">{item.key}</dt>
              <dd className="truncate text-right">{item.value || "—"}</dd>
            </div>
          ))}
        </dl>
      ) : null}

      <form
        className="space-y-2 border-t border-line p-3"
        onSubmit={(event) => {
          event.preventDefault();
          if (authState === "authorised") {
            const text = draft.trim();
            if (!text) return;
            onSendChat(text);
            setDraft("");
            return;
          }
          onSignIn();
        }}
      >
        {authState === "authorised" ? (
          <div className="flex gap-2">
            <label className="min-w-0 flex-1">
              <span className="sr-only">Chat message</span>
              <input
                value={draft}
                onChange={(event) => setDraft(event.target.value)}
                placeholder="Say something. It is not a transmission."
                maxLength={400}
                className="h-11 w-full rounded-lg border border-line bg-bg px-3 text-sm outline-none focus-visible:border-amber"
              />
            </label>
            <button
              type="submit"
              disabled={!listening || !draft.trim()}
              className="inline-flex h-11 items-center gap-1 rounded-lg bg-amber px-3 text-sm font-semibold text-ink disabled:opacity-40"
            >
              <Send className="size-4" />
              Send
            </button>
          </div>
        ) : (
          <>
            <p className="text-xs text-muted">
              A RemoteHams account lets you type in chat. A ham license is not required, and this app still cannot tune or transmit.
            </p>
            <div className="grid gap-2 sm:grid-cols-2">
              <input
                value={accountUser}
                onChange={(event) => onAccountUser(event.target.value)}
                placeholder="RemoteHams name"
                autoComplete="username"
                className="h-11 rounded-lg border border-line bg-bg px-3 text-sm outline-none focus-visible:border-amber"
              />
              <input
                value={password}
                onChange={(event) => onPassword(event.target.value)}
                placeholder="Password"
                type="password"
                autoComplete="current-password"
                className="h-11 rounded-lg border border-line bg-bg px-3 text-sm outline-none focus-visible:border-amber"
              />
            </div>
            <button
              type="submit"
              disabled={!accountUser.trim() || !password}
              className="h-11 w-full rounded-lg border border-line text-sm font-medium hover:border-amber hover:text-amber disabled:opacity-40"
            >
              {listening ? "Sign in on this link" : "Use this account when you listen"}
            </button>
          </>
        )}
        {authMessage ? <p className="text-xs text-muted">{authMessage}</p> : null}
        {chatError ? <p className="text-xs text-amber">{chatError}</p> : null}
      </form>
    </section>
  );
}

function TabButton({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`h-10 rounded-lg px-3 text-sm ${active ? "bg-amber text-ink" : "text-muted hover:text-fg"}`}
    >
      {children}
    </button>
  );
}
