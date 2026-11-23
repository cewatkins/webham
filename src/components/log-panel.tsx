import { useEffect, useState, type RefObject } from "react";
import type { ChatLine, RadioSnapshot } from "@/lib/rcforb/types";

type LogPanelProps = {
  chat: ChatLine[];
  notices: { kind: string; text: string; at: number }[];
  snapshot: RadioSnapshot | null;
  chatEndRef: RefObject<HTMLDivElement | null>;
};

export function LogPanel({ chat, notices, snapshot, chatEndRef }: LogPanelProps) {
  const [tab, setTab] = useState<"chat" | "notices">("chat");
  const roster = snapshot?.roster ?? [];

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ block: "end" });
  }, [chat, notices, tab, chatEndRef]);

  return (
    <section className="flex h-80 min-h-0 flex-col overflow-hidden rounded-lg border border-line bg-surface lg:h-full">
      <div className="border-b border-line px-3 py-3">
        <h2 className="text-sm font-semibold tracking-wide">Station log</h2>
        <p className="text-xs text-muted">Read only. Nothing here is sent back.</p>
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

      <div className="flex gap-2 px-3 pt-3">
        <TabButton active={tab === "chat"} onClick={() => setTab("chat")}>
          Chat
        </TabButton>
        <TabButton active={tab === "notices"} onClick={() => setTab("notices")}>
          Notices
        </TabButton>
      </div>

      <div className="panel-scroll min-h-0 flex-1 space-y-3 overflow-y-auto px-3 py-3">
        {tab === "chat" ? (
          chat.length === 0 ? (
            <p className="text-sm text-muted">Chat from the station shows up here. You cannot answer it.</p>
          ) : (
            chat.map((line, index) => (
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
        <div ref={chatEndRef} />
      </div>

      {snapshot && snapshot.dropdowns.length > 0 ? (
        <dl className="panel-scroll max-h-36 space-y-1 overflow-y-auto border-t border-line px-3 py-3 text-xs">
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

