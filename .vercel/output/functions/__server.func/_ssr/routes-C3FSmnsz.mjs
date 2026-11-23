import { i as __toESM } from "../_runtime.mjs";
import { K as require_react, b as require_jsx_runtime } from "../_libs/@tanstack/react-router+[...].mjs";
import { a as Square, c as RefreshCw, d as Copy, i as Star, l as Headphones, n as Volume2, o as Send, s as Search, t as VolumeX, u as Download } from "../_libs/lucide-react.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/routes-C3FSmnsz.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
function stationKey(station) {
	return `${station.orbId}|${station.domain}:${station.controlPort}/${station.audioPort}`;
}
function DirectoryRail({ stations, loading, error, query, onQuery, onRefresh, selectedKey, onSelect, onManual, favoriteKeys, onToggleFavorite, recent }) {
	const [host, setHost] = (0, import_react.useState)("");
	const [controlPort, setControlPort] = (0, import_react.useState)("4525");
	const [audioPort, setAudioPort] = (0, import_react.useState)("4524");
	const [manualError, setManualError] = (0, import_react.useState)(null);
	const [country, setCountry] = (0, import_react.useState)("");
	const [savedOnly, setSavedOnly] = (0, import_react.useState)(false);
	const countries = (0, import_react.useMemo)(() => {
		const names = /* @__PURE__ */ new Set();
		for (const station of stations) if (station.country) names.add(station.country);
		return [...names].sort((a, b) => a.localeCompare(b));
	}, [stations]);
	const needle = query.trim().toLowerCase();
	const favoriteSet = new Set(favoriteKeys);
	const visible = stations.filter((station) => {
		if (country && station.country !== country) return false;
		if (savedOnly && !favoriteSet.has(stationKey(station))) return false;
		if (!needle) return true;
		return [
			station.serverName,
			station.radioName,
			station.country,
			station.city,
			station.grid,
			station.domain,
			station.blurb
		].join(" ").toLowerCase().includes(needle);
	}).sort((a, b) => {
		const fav = Number(favoriteSet.has(stationKey(b))) - Number(favoriteSet.has(stationKey(a)));
		if (fav !== 0) return fav;
		return a.serverName.localeCompare(b.serverName);
	});
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
		className: "flex h-full min-h-0 flex-1 flex-col overflow-hidden rounded-lg border border-line bg-surface",
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
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "space-y-2 px-3 pt-3",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", {
						className: "relative block",
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
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "flex gap-2",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", {
							className: "min-w-0 flex-1",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
								className: "sr-only",
								children: "Country"
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("select", {
								value: country,
								onChange: (event) => setCountry(event.target.value),
								className: "h-11 w-full rounded-lg border border-line bg-bg px-2 text-sm text-fg outline-none focus-visible:border-amber",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
									value: "",
									children: "All countries"
								}), countries.map((name) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
									value: name,
									children: name
								}, name))]
							})]
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
							type: "button",
							onClick: () => setSavedOnly((value) => !value),
							className: `h-11 shrink-0 rounded-lg border px-3 text-sm ${savedOnly ? "border-amber bg-amber text-ink" : "border-line text-muted"}`,
							children: "Saved"
						})]
					}),
					recent.length > 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "panel-scroll flex gap-2 overflow-x-auto pb-1",
						children: recent.map((station) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
							type: "button",
							onClick: () => onSelect(station),
							className: "h-9 shrink-0 rounded-full border border-line px-3 text-xs text-fg hover:border-amber",
							children: station.serverName
						}, stationKey(station)))
					}) : null
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
					const saved = favoriteSet.has(key);
					const place = [station.city, station.country].filter(Boolean).join(", ");
					return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", {
						className: "flex items-stretch gap-1",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
							type: "button",
							onClick: () => onToggleFavorite(station),
							"aria-label": saved ? `Remove ${station.serverName} from saved` : `Save ${station.serverName}`,
							"aria-pressed": saved,
							className: `inline-flex w-11 shrink-0 items-center justify-center rounded-lg ${saved ? "text-amber" : "text-muted hover:text-amber"}`,
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Star, {
								className: "size-4",
								fill: saved ? "currentColor" : "none"
							})
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
							type: "button",
							onClick: () => onSelect(station),
							className: `min-w-0 flex-1 rounded-lg px-2 py-2 text-left ${selected ? "bg-surface-2 ring-1 ring-amber" : "hover:bg-surface-2"}`,
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
						})]
					}, key);
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("details", {
				className: "border-t border-line",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("summary", {
					className: "flex h-11 cursor-pointer items-center px-3 text-xs font-medium tracking-wide text-muted",
					children: "Manual endpoint"
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("form", {
					className: "space-y-2 px-3 pb-3",
					onSubmit: (event) => {
						event.preventDefault();
						submitManual();
					},
					children: [
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
				})]
			})
		]
	});
}
function LogPanel({ chat, notices, snapshot, chatEndRef, authState, authMessage, accountUser, password, onAccountUser, onPassword, onSignIn, onSendChat, chatError, listening }) {
	const [tab, setTab] = (0, import_react.useState)("chat");
	const [filter, setFilter] = (0, import_react.useState)("");
	const [draft, setDraft] = (0, import_react.useState)("");
	const [copied, setCopied] = (0, import_react.useState)(false);
	const [follow, setFollow] = (0, import_react.useState)(true);
	const roster = snapshot?.roster ?? [];
	const needle = filter.trim().toLowerCase();
	const shown = (0, import_react.useMemo)(() => needle ? chat.filter((line) => `${line.sender} ${line.text}`.toLowerCase().includes(needle)) : chat, [chat, needle]);
	(0, import_react.useEffect)(() => {
		if (follow) chatEndRef.current?.scrollIntoView({ block: "end" });
	}, [
		shown,
		notices,
		tab,
		follow,
		chatEndRef
	]);
	const authLabel = authState === "authorised" ? `Signed in${accountUser ? ` as ${accountUser}` : ""}` : authState === "authenticating" ? "Signing in" : authState === "refused" ? "Sign-in refused" : "Guest";
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
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
		className: "flex h-full min-h-0 flex-1 flex-col overflow-hidden rounded-lg border border-line bg-surface",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "flex items-start justify-between gap-2 border-b border-line px-3 py-3",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
					className: "text-sm font-semibold tracking-wide",
					children: "Station log"
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
					className: "text-xs text-muted",
					children: [authLabel, ". Text only — the radio is never keyed."]
				})] }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
					type: "button",
					onClick: () => void copyLog(),
					className: "inline-flex h-10 items-center gap-1 rounded-lg border border-line px-2 text-xs text-muted hover:text-fg",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Copy, { className: "size-3.5" }), copied ? "Copied" : "Copy"]
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
				className: "flex flex-wrap items-center gap-2 px-3 pt-3",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TabButton, {
						active: tab === "chat",
						onClick: () => setTab("chat"),
						children: "Chat"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TabButton, {
						active: tab === "notices",
						onClick: () => setTab("notices"),
						children: "Notices"
					}),
					tab === "chat" ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
						value: filter,
						onChange: (event) => setFilter(event.target.value),
						placeholder: "Search chat",
						className: "h-10 min-w-0 flex-1 rounded-lg border border-line bg-bg px-3 text-sm outline-none focus-visible:border-amber"
					}) : null
				]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "panel-scroll min-h-0 flex-1 space-y-3 overflow-y-auto px-3 py-3",
				onScroll: (event) => {
					const node = event.currentTarget;
					const distance = node.scrollHeight - node.scrollTop - node.clientHeight;
					setFollow(distance < 48);
				},
				children: [
					tab === "chat" ? shown.length === 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "text-sm text-muted",
						children: "Chat from the station shows up here."
					}) : shown.map((line, index) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("article", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
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
					})] }, `${notice.at}-${index}`)),
					follow ? null : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "text-xs text-muted",
						children: "Scroll paused."
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { ref: chatEndRef })
				]
			}),
			snapshot && (snapshot.dropdowns.length > 0 || snapshot.messages.length > 0) ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("dl", {
				className: "panel-scroll max-h-28 space-y-1 overflow-y-auto border-t border-line px-3 py-2 text-xs",
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
			}) : null,
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("form", {
				className: "space-y-2 border-t border-line p-3",
				onSubmit: (event) => {
					event.preventDefault();
					if (authState === "authorised") {
						const text = draft.trim();
						if (!text) return;
						onSendChat(text);
						setDraft("");
						return;
					}
					onSignIn();
				},
				children: [
					authState === "authorised" ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "flex gap-2",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", {
							className: "min-w-0 flex-1",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
								className: "sr-only",
								children: "Chat message"
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
								value: draft,
								onChange: (event) => setDraft(event.target.value),
								placeholder: "Say something. It is not a transmission.",
								maxLength: 400,
								className: "h-11 w-full rounded-lg border border-line bg-bg px-3 text-sm outline-none focus-visible:border-amber"
							})]
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
							type: "submit",
							disabled: !listening || !draft.trim(),
							className: "inline-flex h-11 items-center gap-1 rounded-lg bg-amber px-3 text-sm font-semibold text-ink disabled:opacity-40",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Send, { className: "size-4" }), "Send"]
						})]
					}) : /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "text-xs text-muted",
							children: "A RemoteHams account lets you type in chat. A ham license is not required, and this app still cannot tune or transmit."
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "grid gap-2 sm:grid-cols-2",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
								value: accountUser,
								onChange: (event) => onAccountUser(event.target.value),
								placeholder: "RemoteHams name",
								autoComplete: "username",
								className: "h-11 rounded-lg border border-line bg-bg px-3 text-sm outline-none focus-visible:border-amber"
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
								value: password,
								onChange: (event) => onPassword(event.target.value),
								placeholder: "Password",
								type: "password",
								autoComplete: "current-password",
								className: "h-11 rounded-lg border border-line bg-bg px-3 text-sm outline-none focus-visible:border-amber"
							})]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
							type: "submit",
							disabled: !accountUser.trim() || !password,
							className: "h-11 w-full rounded-lg border border-line text-sm font-medium hover:border-amber hover:text-amber disabled:opacity-40",
							children: listening ? "Sign in on this link" : "Use this account when you listen"
						})
					] }),
					authMessage ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "text-xs text-muted",
						children: authMessage
					}) : null,
					chatError ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "text-xs text-amber",
						children: chatError
					}) : null
				]
			})
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
	const [peak, setPeak] = (0, import_react.useState)(0);
	const [copied, setCopied] = (0, import_react.useState)(false);
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
	(0, import_react.useEffect)(() => {
		const parsed = parseMeter(snapshot?.sMeter ?? "");
		if (!parsed) return;
		const next = Math.max(0, Math.min(100, parsed.value / parsed.max * 100));
		setPeak((current) => Math.max(current, next));
	}, [snapshot?.sMeter]);
	(0, import_react.useEffect)(() => {
		const timer = setInterval(() => {
			setPeak((current) => current <= 0 ? current : Math.max(0, current - .8));
		}, 80);
		return () => clearInterval(timer);
	}, []);
	async function copyFrequency() {
		const text = frequency.unit ? `${frequency.digits} ${frequency.unit}` : frequency.digits;
		try {
			await navigator.clipboard.writeText(text);
			setCopied(true);
			setTimeout(() => setCopied(false), 1200);
		} catch {
			setCopied(false);
		}
	}
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
		className: "rounded-lg border border-line bg-surface p-4",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "flex flex-wrap items-center justify-between gap-2",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "rounded-full border border-amber px-2.5 py-1 text-xs font-semibold tracking-widest text-amber",
					children: "NO TRANSMIT"
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
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "flex items-start justify-between gap-3",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "font-mono text-4xl tracking-tight text-amber tabular-nums sm:text-5xl",
							children: frequency.digits
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
							type: "button",
							onClick: () => void copyFrequency(),
							className: "inline-flex h-11 items-center gap-1 rounded-lg border border-line px-2 text-xs text-muted hover:text-fg",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Copy, { className: "size-3.5" }), copied ? "Copied" : "Copy"]
						})]
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
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "relative mt-2 h-3 overflow-hidden rounded-full bg-bg",
						"aria-hidden": "true",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							className: "h-full bg-amber",
							style: { width: `${meterPct}%` }
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
							className: "absolute top-0 h-full w-0.5 bg-fg",
							style: { left: `${peak}%` }
						})]
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
var MOBILE_KEY = "rcforb-split-mobile";
var DESKTOP_KEY = "rcforb-split-desktop";
var MOBILE_DEFAULT = [
	.7,
	.18,
	.12
];
var DESKTOP_DEFAULT = [
	.3,
	.42,
	.28
];
function loadFractions(key, fallback) {
	try {
		const raw = localStorage.getItem(key);
		if (!raw) return fallback;
		const parsed = JSON.parse(raw);
		if (!Array.isArray(parsed) || parsed.length !== fallback.length) return fallback;
		if (parsed.some((value) => typeof value !== "number" || !Number.isFinite(value) || value <= 0)) return fallback;
		const sum = parsed.reduce((total, value) => total + value, 0);
		return parsed.map((value) => value / sum);
	} catch {
		return fallback;
	}
}
function SplitPanes({ panes, layout }) {
	const boxRef = (0, import_react.useRef)(null);
	const drag = (0, import_react.useRef)(null);
	const [wide, setWide] = (0, import_react.useState)(false);
	const [fractions, setFractions] = (0, import_react.useState)(MOBILE_DEFAULT);
	const wideRef = (0, import_react.useRef)(false);
	const fractionsRef = (0, import_react.useRef)(fractions);
	fractionsRef.current = fractions;
	function persist(nextWide, next) {
		localStorage.setItem(nextWide ? DESKTOP_KEY : MOBILE_KEY, JSON.stringify(next));
	}
	(0, import_react.useEffect)(() => {
		const media = window.matchMedia("(min-width: 1024px)");
		const apply = () => {
			const nextWide = media.matches;
			wideRef.current = nextWide;
			setWide(nextWide);
			setFractions(loadFractions(nextWide ? DESKTOP_KEY : MOBILE_KEY, nextWide ? DESKTOP_DEFAULT : MOBILE_DEFAULT));
		};
		apply();
		media.addEventListener("change", apply);
		return () => media.removeEventListener("change", apply);
	}, []);
	(0, import_react.useEffect)(() => {
		if (!layout) return;
		const next = fractionsRef.current.map((_, index) => index === layout.index ? .76 : .12);
		setFractions(next);
		persist(wideRef.current, next);
	}, [layout]);
	function onPointerDown(event, index) {
		if (!boxRef.current) return;
		event.currentTarget.setPointerCapture(event.pointerId);
		drag.current = {
			index,
			start: wide ? event.clientX : event.clientY,
			sizes: fractions.slice()
		};
	}
	function onPointerMove(event) {
		const state = drag.current;
		const box = boxRef.current;
		if (!state || !box) return;
		const span = wide ? box.clientWidth : box.clientHeight;
		if (span <= 0) return;
		const delta = ((wide ? event.clientX : event.clientY) - state.start) / span;
		const next = state.sizes.slice();
		const min = .12;
		let left = (state.sizes[state.index] ?? 0) + delta;
		let right = (state.sizes[state.index + 1] ?? 0) - delta;
		if (left < min) {
			right -= min - left;
			left = min;
		}
		if (right < min) {
			left -= min - right;
			right = min;
		}
		if (left < min || right < min) return;
		next[state.index] = left;
		next[state.index + 1] = right;
		const sum = next.reduce((total, value) => total + value, 0);
		setFractions(next.map((value) => value / sum));
	}
	function onPointerUp() {
		if (!drag.current) return;
		drag.current = null;
		persist(wide, fractionsRef.current);
	}
	function nudge(index, key) {
		const grow = wide ? key === "ArrowRight" : key === "ArrowDown";
		if (!grow && !(wide ? key === "ArrowLeft" : key === "ArrowUp")) return;
		const next = fractions.slice();
		const step = grow ? .03 : -.03;
		const min = .12;
		const left = (next[index] ?? 0) + step;
		const right = (next[index + 1] ?? 0) - step;
		if (left < min || right < min) return;
		next[index] = left;
		next[index + 1] = right;
		const sum = next.reduce((total, value) => total + value, 0);
		const normalized = next.map((value) => value / sum);
		setFractions(normalized);
		persist(wide, normalized);
	}
	function reset() {
		const next = wide ? DESKTOP_DEFAULT : MOBILE_DEFAULT;
		setFractions(next);
		persist(wide, next);
	}
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "flex min-h-0 flex-1 flex-col gap-2",
		children: [wide ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "flex flex-wrap items-center gap-2",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "text-xs text-muted",
				children: "Drag a bar to resize the panels."
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
				type: "button",
				onClick: reset,
				className: "h-9 rounded-lg border border-line px-3 text-xs text-muted hover:border-amber hover:text-fg",
				children: "Reset panes"
			})]
		}) : null, wide ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
			ref: boxRef,
			className: "flex min-h-0 flex-1 flex-row",
			children: panes.flatMap((pane, index) => {
				const items = [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					style: { flex: `${fractions[index] ?? 1} 1 0px` },
					className: "min-h-0 min-w-0 overflow-hidden",
					children: pane.content
				}, pane.id)];
				if (index < panes.length - 1) items.push(/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					role: "separator",
					"aria-orientation": "vertical",
					"aria-label": "Drag sideways to resize panels",
					tabIndex: 0,
					onPointerDown: (event) => onPointerDown(event, index),
					onPointerMove,
					onPointerUp,
					onPointerCancel: onPointerUp,
					onKeyDown: (event) => nudge(index, event.key),
					className: "flex w-4 shrink-0 touch-none cursor-col-resize items-center justify-center bg-bg",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { className: "h-16 w-1.5 rounded-full bg-amber/70" })
				}, `${pane.id}-bar`));
				return items;
			})
		}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
			className: "flex h-0 min-h-0 flex-1 flex-col overflow-hidden",
			children: panes[layout?.index ?? 0]?.content
		})]
	});
}
var SHIFT = [
	7,
	12,
	17,
	22,
	7,
	12,
	17,
	22,
	7,
	12,
	17,
	22,
	7,
	12,
	17,
	22,
	5,
	9,
	14,
	20,
	5,
	9,
	14,
	20,
	5,
	9,
	14,
	20,
	5,
	9,
	14,
	20,
	4,
	11,
	16,
	23,
	4,
	11,
	16,
	23,
	4,
	11,
	16,
	23,
	4,
	11,
	16,
	23,
	6,
	10,
	15,
	21,
	6,
	10,
	15,
	21,
	6,
	10,
	15,
	21,
	6,
	10,
	15,
	21
];
/** MD5 as lowercase hex. RemoteHams login uses this digest; the password itself is not stored. */
function md5Hex(input) {
	const data = new TextEncoder().encode(input);
	const bitLen = data.length * 8;
	let paddedLen = data.length + 1;
	while (paddedLen % 64 !== 56) paddedLen += 1;
	paddedLen += 8;
	const bytes = new Uint8Array(paddedLen);
	bytes.set(data);
	bytes[data.length] = 128;
	const view = new DataView(bytes.buffer);
	view.setUint32(paddedLen - 8, bitLen >>> 0, true);
	view.setUint32(paddedLen - 4, Math.floor(bitLen / 4294967296), true);
	let a0 = 1732584193;
	let b0 = 4023233417;
	let c0 = 2562383102;
	let d0 = 271733878;
	const words = /* @__PURE__ */ new Uint32Array(16);
	for (let offset = 0; offset < paddedLen; offset += 64) {
		for (let i = 0; i < 16; i += 1) words[i] = view.getUint32(offset + i * 4, true);
		let a = a0;
		let b = b0;
		let c = c0;
		let d = d0;
		for (let i = 0; i < 64; i += 1) {
			let mixed = 0;
			let index = 0;
			if (i < 16) {
				mixed = b & c | ~b & d;
				index = i;
			} else if (i < 32) {
				mixed = b & d | ~d & c;
				index = (5 * i + 1) % 16;
			} else if (i < 48) {
				mixed = b ^ c ^ d;
				index = (3 * i + 5) % 16;
			} else {
				mixed = c ^ (b | ~d);
				index = 7 * i % 16;
			}
			const sum = mixed + a + Math.floor(Math.abs(Math.sin(i + 1)) * 4294967296) + (words[index] ?? 0) >>> 0;
			const shifted = (sum << SHIFT[i] | sum >>> 32 - SHIFT[i]) >>> 0;
			a = d;
			d = c;
			c = b;
			b = b + shifted >>> 0;
		}
		a0 = a0 + a >>> 0;
		b0 = b0 + b >>> 0;
		c0 = c0 + c >>> 0;
		d0 = d0 + d >>> 0;
	}
	const digest = /* @__PURE__ */ new Uint8Array(16);
	const out = new DataView(digest.buffer);
	out.setUint32(0, a0, true);
	out.setUint32(4, b0, true);
	out.setUint32(8, c0, true);
	out.setUint32(12, d0, true);
	return [...digest].map((byte) => byte.toString(16).padStart(2, "0")).join("");
}
var THEMES = [
	{
		id: "amber",
		label: "Amber night",
		swatch: "#f0a202"
	},
	{
		id: "phosphor",
		label: "Phosphor",
		swatch: "#3dff8a"
	},
	{
		id: "arctic",
		label: "Arctic",
		swatch: "#7ec8ff"
	},
	{
		id: "ember",
		label: "Ember",
		swatch: "#ff6b3d"
	},
	{
		id: "violet",
		label: "Violet",
		swatch: "#c9a6ff"
	},
	{
		id: "paper",
		label: "Day paper",
		swatch: "#9a6200"
	}
];
function isThemeId(value) {
	return THEMES.some((theme) => theme.id === value);
}
/** 8 kHz mono 16-bit WAV of what this browser already decoded. Nothing is uploaded. */
function encodeWav(chunks, sampleRate = 8e3) {
	let total = 0;
	for (const chunk of chunks) total += chunk.length;
	const buffer = /* @__PURE__ */ new ArrayBuffer(44 + total * 2);
	const view = new DataView(buffer);
	const write = (offset, text) => {
		for (let i = 0; i < text.length; i += 1) view.setUint8(offset + i, text.charCodeAt(i));
	};
	write(0, "RIFF");
	view.setUint32(4, 36 + total * 2, true);
	write(8, "WAVE");
	write(12, "fmt ");
	view.setUint32(16, 16, true);
	view.setUint16(20, 1, true);
	view.setUint16(22, 1, true);
	view.setUint32(24, sampleRate, true);
	view.setUint32(28, sampleRate * 2, true);
	view.setUint16(32, 2, true);
	view.setUint16(34, 16, true);
	write(36, "data");
	view.setUint32(40, total * 2, true);
	let offset = 44;
	for (const chunk of chunks) for (let i = 0; i < chunk.length; i += 1) {
		view.setInt16(offset, chunk[i] ?? 0, true);
		offset += 2;
	}
	return new Blob([buffer], { type: "audio/wav" });
}
var EMPTY_STATS = {
	packets: 0,
	decodedSeconds: 0,
	frames: 0,
	decodeErrors: 0,
	controlLines: 0
};
var PREFS_KEY = "rcforb-listen-prefs";
var RECORD_CAP = 144e5;
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
	const [theme, setTheme] = (0, import_react.useState)("amber");
	const [favoriteKeys, setFavoriteKeys] = (0, import_react.useState)([]);
	const [recentKeys, setRecentKeys] = (0, import_react.useState)([]);
	const [muted, setMuted] = (0, import_react.useState)(false);
	const [recording, setRecording] = (0, import_react.useState)(false);
	const [recordedSamples, setRecordedSamples] = (0, import_react.useState)(0);
	const [accountUser, setAccountUser] = (0, import_react.useState)("");
	const [password, setPassword] = (0, import_react.useState)("");
	const [authState, setAuthState] = (0, import_react.useState)("guest");
	const [authMessage, setAuthMessage] = (0, import_react.useState)("");
	const [chatError, setChatError] = (0, import_react.useState)("");
	const [utc, setUtc] = (0, import_react.useState)("");
	const [layout, setLayout] = (0, import_react.useState)(null);
	const waveRef = (0, import_react.useRef)(/* @__PURE__ */ new Float32Array(240));
	const playerRef = (0, import_react.useRef)(null);
	const abortRef = (0, import_react.useRef)(null);
	const genRef = (0, import_react.useRef)(0);
	const chatEndRef = (0, import_react.useRef)(null);
	const startedAt = (0, import_react.useRef)(0);
	const volumeRef = (0, import_react.useRef)(volume);
	const bufferRef = (0, import_react.useRef)(bufferMs);
	const reconnectRef = (0, import_react.useRef)(reconnect);
	const recordRef = (0, import_react.useRef)(false);
	const chunksRef = (0, import_react.useRef)([]);
	const recordedCount = (0, import_react.useRef)(0);
	const sessionIdRef = (0, import_react.useRef)(null);
	const accountUserRef = (0, import_react.useRef)(accountUser);
	const passwordRef = (0, import_react.useRef)(password);
	volumeRef.current = volume;
	bufferRef.current = bufferMs;
	reconnectRef.current = reconnect;
	accountUserRef.current = accountUser;
	passwordRef.current = password;
	const recent = (0, import_react.useMemo)(() => {
		const byKey = new Map(stations.map((station) => [stationKey(station), station]));
		return recentKeys.map((key) => byKey.get(key)).filter((station) => Boolean(station));
	}, [recentKeys, stations]);
	(0, import_react.useLayoutEffect)(() => {
		document.documentElement.dataset.theme = theme === "amber" ? "" : theme;
	}, [theme]);
	(0, import_react.useEffect)(() => {
		const tick = () => setUtc(`${(/* @__PURE__ */ new Date()).toISOString().slice(11, 19)} UTC`);
		tick();
		const timer = setInterval(tick, 1e3);
		return () => clearInterval(timer);
	}, []);
	(0, import_react.useEffect)(() => {
		try {
			const raw = localStorage.getItem(PREFS_KEY);
			if (raw) {
				const prefs = JSON.parse(raw);
				if (typeof prefs.volume === "number") setVolume(prefs.volume);
				if (typeof prefs.bufferMs === "number") setBufferMs(prefs.bufferMs);
				if (typeof prefs.reconnect === "boolean") setReconnect(prefs.reconnect);
				if (typeof prefs.theme === "string" && isThemeId(prefs.theme)) setTheme(prefs.theme);
				if (Array.isArray(prefs.favoriteKeys)) setFavoriteKeys(prefs.favoriteKeys.filter((key) => typeof key === "string"));
				if (Array.isArray(prefs.recentKeys)) setRecentKeys(prefs.recentKeys.filter((key) => typeof key === "string").slice(0, 8));
				if (typeof prefs.accountUser === "string") setAccountUser(prefs.accountUser);
				if (typeof prefs.muted === "boolean") setMuted(prefs.muted);
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
			reconnect,
			theme,
			favoriteKeys,
			recentKeys,
			accountUser,
			muted
		}));
	}, [
		prefsReady,
		volume,
		bufferMs,
		reconnect,
		theme,
		favoriteKeys,
		recentKeys,
		accountUser,
		muted
	]);
	(0, import_react.useEffect)(() => {
		playerRef.current?.setVolume(muted ? 0 : volume);
	}, [volume, muted]);
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
			setRecordedSamples(recordedCount.current);
			const player = playerRef.current;
			if (!player) return;
			setBufferSeconds(player.depth());
			setUnderruns(player.underruns);
		}, 250);
		return () => clearInterval(timer);
	}, [link]);
	function choose(station) {
		setTarget(station);
		const key = stationKey(station);
		setRecentKeys((current) => [key, ...current.filter((item) => item !== key)].slice(0, 8));
		if (window.matchMedia("(max-width: 1023px)").matches) setLayout({
			index: 1,
			nonce: Date.now()
		});
	}
	function toggleFavorite(station) {
		const key = stationKey(station);
		setFavoriteKeys((current) => current.includes(key) ? current.filter((item) => item !== key) : [key, ...current]);
	}
	function toggleRecord() {
		if (recordRef.current) {
			recordRef.current = false;
			setRecording(false);
			setRecordedSamples(recordedCount.current);
			return;
		}
		chunksRef.current = [];
		recordedCount.current = 0;
		setRecordedSamples(0);
		recordRef.current = true;
		setRecording(true);
	}
	function saveRecording() {
		if (chunksRef.current.length === 0) return;
		const url = URL.createObjectURL(encodeWav(chunksRef.current));
		const anchor = document.createElement("a");
		anchor.href = url;
		anchor.download = `rcforb-listen-${Date.now()}.wav`;
		anchor.click();
		URL.revokeObjectURL(url);
	}
	function stop() {
		genRef.current += 1;
		abortRef.current?.abort();
		abortRef.current = null;
		playerRef.current?.stop();
		playerRef.current = null;
		sessionIdRef.current = null;
		setLink("idle");
		setDetail("");
		setAuthState("guest");
	}
	async function signIn() {
		setChatError("");
		const user = accountUserRef.current.trim();
		const secret = passwordRef.current;
		if (!user || !secret) {
			setChatError("Enter the RemoteHams name and password.");
			return;
		}
		const sessionId = sessionIdRef.current;
		if (!sessionId) {
			setAuthMessage("Saved for the next Listen. The password stays in this tab only.");
			return;
		}
		setAuthState("authenticating");
		const response = await fetch("/api/listen-command", {
			method: "POST",
			headers: { "content-type": "application/json" },
			body: JSON.stringify({
				kind: "login",
				sessionId,
				user,
				passwordMd5: md5Hex(secret)
			})
		});
		const body = await response.json().catch(() => null);
		if (!response.ok) {
			setAuthState("refused");
			setChatError(body?.error ?? "Sign-in did not go out.");
		}
	}
	async function sendChat(text) {
		setChatError("");
		const sessionId = sessionIdRef.current;
		if (!sessionId) {
			setChatError("Listen first.");
			return;
		}
		const response = await fetch("/api/listen-command", {
			method: "POST",
			headers: { "content-type": "application/json" },
			body: JSON.stringify({
				kind: "chat",
				sessionId,
				text
			})
		});
		const body = await response.json().catch(() => null);
		if (!response.ok) setChatError(body?.error ?? "The station did not take that line.");
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
		setChatError("");
		setAuthMessage("");
		setAuthState(accountUserRef.current.trim() && passwordRef.current ? "authenticating" : "guest");
		startedAt.current = Date.now();
		setElapsed(0);
		const context = new AudioContext();
		const player = new PcmPlayer(context, waveRef.current);
		player.setVolume(muted ? 0 : volumeRef.current);
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
					user: accountUserRef.current.trim(),
					password: passwordRef.current
				}, {
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
					failure: (message) => alive() && setDetail(message),
					hello: (sessionId) => {
						if (alive()) sessionIdRef.current = sessionId;
					},
					auth: (state, message) => {
						if (!alive()) return;
						setAuthState(state);
						if (message) setAuthMessage(message);
					},
					pcm: (samples) => {
						if (!recordRef.current || recordedCount.current >= RECORD_CAP) return;
						chunksRef.current.push(new Int16Array(samples));
						recordedCount.current += samples.length;
					}
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
			setAuthState(accountUserRef.current.trim() && passwordRef.current ? "authenticating" : "guest");
			await delay(1e3, generation, genRef);
		}
		if (playerRef.current === player) {
			player.stop();
			playerRef.current = null;
		}
		if (!alive()) return;
		sessionIdRef.current = null;
		if (reason === "link") {
			setLink("linklost");
			setDetail((current) => current || "The station closed the link.");
		} else setLink("idle");
		if (reason === "time-limit") setDetail("Paused after 20 minutes. Press Listen if you want to continue.");
	}
	const listening = link === "connecting" || link === "live" || link === "unverified";
	const selectedKey = target ? stationKey(target) : null;
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("main", {
		className: "mx-auto flex h-dvh max-w-7xl flex-col gap-2 px-3 py-3",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("header", {
				className: "flex flex-wrap items-start justify-between gap-3",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "text-xs font-medium tracking-widest text-amber",
						children: "RCFORB"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
						className: "text-2xl font-semibold tracking-tight",
						children: "Listen"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "font-mono text-xs text-muted",
						children: utc
					})
				] }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "flex flex-wrap gap-1.5",
					role: "group",
					"aria-label": "Color theme",
					children: THEMES.map((item) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
						type: "button",
						title: item.label,
						"aria-label": item.label,
						"aria-pressed": theme === item.id,
						onClick: () => setTheme(item.id),
						className: `size-9 rounded-full border-2 ${theme === item.id ? "border-fg" : "border-line"}`,
						style: { background: item.swatch }
					}, item.id))
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "line-clamp-2 max-w-3xl text-sm text-muted lg:line-clamp-none",
				children: "Hear the radio, the meter, and the chat. On a phone, switch Stations, Radio, and Log. On a wide screen, drag the bars. A RemoteHams account can type in chat. Tuning and transmit stay off."
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "grid grid-cols-3 gap-2 lg:hidden",
				children: [
					"Stations",
					"Radio",
					"Log"
				].map((label, index) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
					type: "button",
					onClick: () => setLayout({
						index,
						nonce: Date.now()
					}),
					className: `h-11 rounded-lg border text-sm font-medium ${(layout?.index ?? 0) === index ? "border-amber bg-amber text-ink" : "border-line bg-surface"}`,
					children: label
				}, label))
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SplitPanes, {
				layout,
				panes: [
					{
						id: "stations",
						content: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(DirectoryRail, {
							stations,
							loading,
							error: directoryError,
							query,
							onQuery: setQuery,
							onRefresh: () => void refreshDirectory(),
							selectedKey,
							onSelect: choose,
							favoriteKeys,
							onToggleFavorite: toggleFavorite,
							recent,
							onManual: (host, controlPort, audioPort) => choose({
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
					},
					{
						id: "radio",
						content: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "panel-scroll flex h-full min-h-0 flex-1 flex-col gap-3 overflow-y-auto",
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
									className: "sticky bottom-0 z-20 rounded-lg border border-line bg-surface p-3",
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
											className: "mt-3 flex flex-wrap gap-2",
											children: [
												/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
													type: "button",
													onClick: () => setMuted((value) => !value),
													className: "inline-flex h-11 items-center gap-2 rounded-lg border border-line px-3 text-sm",
													children: [muted ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(VolumeX, { className: "size-4" }) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Volume2, { className: "size-4" }), muted ? "Muted" : "Mute"]
												}),
												/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
													type: "button",
													onClick: toggleRecord,
													className: `inline-flex h-11 items-center rounded-lg border px-3 text-sm ${recording ? "border-amber text-amber" : "border-line"}`,
													children: recording ? "Stop recording" : "Record"
												}),
												/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
													type: "button",
													onClick: saveRecording,
													disabled: recordedSamples === 0,
													className: "inline-flex h-11 items-center gap-2 rounded-lg border border-line px-3 text-sm disabled:opacity-40",
													children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Download, { className: "size-4" }), "Save WAV"]
												}),
												/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
													className: "self-center font-mono text-xs text-muted",
													children: [(recordedSamples / 8e3).toFixed(1), "s"]
												})
											]
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
													Math.round((muted ? 0 : volume) * 100),
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
						})
					},
					{
						id: "log",
						content: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(LogPanel, {
							chat,
							notices,
							snapshot,
							chatEndRef,
							authState,
							authMessage,
							accountUser,
							password,
							onAccountUser: setAccountUser,
							onPassword: setPassword,
							onSignIn: () => void signIn(),
							onSendChat: (text) => void sendChat(text),
							chatError,
							listening
						})
					}
				]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("footer", {
				className: "flex flex-wrap items-center justify-between gap-2 text-xs text-muted",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", { children: "A session pauses itself after 20 minutes. Password is not saved." }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
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
async function pullStation(target, signal, player, alive, account, handlers) {
	const body = {
		host: target.domain,
		controlPort: target.controlPort,
		audioPort: target.audioPort
	};
	if (account.user && account.password) {
		body.user = account.user;
		body.passwordMd5 = md5Hex(account.password);
	}
	const response = await fetch("/api/listen", {
		method: "POST",
		headers: { "content-type": "application/json" },
		body: JSON.stringify(body),
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
			else if (event.type === "hello") handlers.hello(event.sessionId);
			else if (event.type === "auth") handlers.auth(event.state, event.message ?? "");
			else if (event.type === "end") {
				reason = event.reason;
				if (event.failure) handlers.failure(event.failure);
			}
		},
		pcm: (samples) => {
			if (!alive()) return;
			player.push(samples);
			handlers.pcm(samples);
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
