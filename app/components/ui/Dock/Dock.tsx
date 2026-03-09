import React, { useEffect, useMemo, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { motion } from "motion/react";
import { useNavigate, useLocation } from "react-router";
import { useFetcher } from "react-router";

import { useDock } from "~/utils/DockContext";
import { useNavigationItems } from "~/hooks/useNavigationItems";
import { useDockNavMeasure } from "./hooks/useDockMeasure";
import { useDockKeyboard } from "./hooks/useDockKeyboard";

import styles from "./Dock.module.css";

import { DockNav } from "./DockNav";
import {
  DockContactCompose,
  DockContactActions,
  type SendState,
} from "./DockContact";
import { DockAssistant, type AssistantMessage } from "./DockAssistant";
import { MediaPlayer } from "./MediaPlayer/MediaPlayer";
import { DockMediaPlayerPanel } from "./DockMediaPlayerPanel";
import { DockShortcutsOverlay } from "./DockShortcutsOverlay";

// ============================================================================
// TYPES & CONSTANTS
// ============================================================================

type DockUIState = "nav" | "contact" | "assistant";
type DockShellState = "nav" | "contact" | "assistant";

const CONTACT_W = 600;
const FEEDBACK_W = 360;
const SENDING_MS = 800;
const SENT_MS = 1600;

const layerVariants = {
  hidden: { opacity: 0, filter: "blur(8px)" },
  visible: { opacity: 1, filter: "blur(0px)" },
};

// ============================================================================
// UTILITY FUNCTIONS
// ============================================================================

function parseSseLines(buffer: string) {
  // Returns: [events, remainder]
  // Events are the raw `data: ...` payloads (string)
  const events: string[] = [];
  const parts = buffer.split("\n");
  let currentData: string[] = [];

  // SSE events are separated by a blank line
  // We'll treat a blank line as event boundary.
  // We keep any trailing partial line in `remainder`.
  let remainder = "";

  for (let i = 0; i < parts.length; i++) {
    const line = parts[i];

    // If this is the last line and original buffer didn't end with \n,
    // treat it as remainder (partial line).
    const isLast = i === parts.length - 1;
    if (isLast && !buffer.endsWith("\n")) {
      remainder = line;
      break;
    }

    if (line.startsWith("data:")) {
      currentData.push(line.slice(5).trimStart());
    } else if (line.trim() === "") {
      if (currentData.length) {
        // Join multi-line data fields
        events.push(currentData.join("\n"));
        currentData = [];
      }
    }
  }

  // If buffer ended cleanly, no remainder.
  return { events, remainder };
}

// ============================================================================
// MAIN COMPONENT
// ============================================================================

export default function DockNavigation() {
  // --------------------------------------------------------------------------
  // ROUTING & NAVIGATION
  // --------------------------------------------------------------------------
  const navItems = useNavigationItems();
  const navigate = useNavigate();
  const location = useLocation();
  const fetcher = useFetcher<{ text?: string; error?: string }>();

  // --------------------------------------------------------------------------
  // DOCK CONTEXT & STATE
  // --------------------------------------------------------------------------
  const {
    isDockVisible,
    isContactVisible,
    isAssistantVisible,
    isMediaPlayerVisible,
    showContact,
    hideContact,
    showAssistant,
    hideAssistant,
    nowPlaying,
    hideMediaPlayer,
    isPlaying,
    setIsPlaying,
  } = useDock();

  const dockState: DockUIState = isContactVisible
    ? "contact"
    : isAssistantVisible
      ? "assistant"
      : "nav";

  const dockShellState: DockShellState = isContactVisible ? "contact" : "nav";

  // --------------------------------------------------------------------------
  // NAVIGATION SHORTCUTS STATE
  // --------------------------------------------------------------------------
  const [keySequence, setKeySequence] = useState("");
  const [showShortcuts, setShowShortcuts] = useState(false);
  const [showHighlights, setShowHighlights] = useState(false);

  // --------------------------------------------------------------------------
  // ASSISTANT STATE & REFS
  // --------------------------------------------------------------------------
  const [assistantPrompt, setAssistantPrompt] = useState("");
  const [assistantMessages, setAssistantMessages] = useState<
    AssistantMessage[]
  >([]);
  const [assistantBusy, setAssistantBusy] = useState(false);
  const assistantPromptRef = useRef<HTMLTextAreaElement | null>(null);
  const assistantAbortRef = useRef<AbortController | null>(null);

  // --------------------------------------------------------------------------
  // CONTACT STATE & REFS
  // --------------------------------------------------------------------------
  const [contactEmail, setContactEmail] = useState("");
  const [contactMessage, setContactMessage] = useState("");
  const [turnstileToken, setTurnstileToken] = useState("");
  const [sendState, setSendState] = useState<SendState>("idle");
  const contactTextareaRef = useRef<HTMLTextAreaElement | null>(null);
  const contactEmailRef = useRef<HTMLInputElement | null>(null);

  const isBusy = sendState !== "idle";

  // --------------------------------------------------------------------------
  // MEDIA PLAYER STATE & REFS
  // --------------------------------------------------------------------------
  const audioRef = React.useRef<HTMLAudioElement | null>(null);
  const [currentTimeSec, setCurrentTimeSec] = useState(0);
  const [durationSec, setDurationSec] = useState(0);

  // --------------------------------------------------------------------------
  // DOCK MEASUREMENTS
  // --------------------------------------------------------------------------
  const { navMeasureGhostRef, navWidth, isMeasured } = useDockNavMeasure();
  const shouldShowShell = isContactVisible || isMeasured;

  // --------------------------------------------------------------------------
  // COMPUTED VALUES
  // --------------------------------------------------------------------------
  const assistantItemLabelLower = useMemo(() => {
    const item = navItems.find(
      (i: any) => i?.label?.toLowerCase() === "assistant"
    );
    return item?.label?.toLowerCase() ?? null;
  }, [navItems]);

  const contactItemLabelLower = useMemo(() => {
    const item = navItems.find(
      (i: any) => i?.label?.toLowerCase() === "contact"
    );
    return item?.label?.toLowerCase() ?? null;
  }, [navItems]);

  const progress = useMemo(() => {
    if (!durationSec || durationSec <= 0) return 0;
    return currentTimeSec / durationSec;
  }, [currentTimeSec, durationSec]);

  const dockWidth = useMemo(() => {
    if (dockShellState === "nav") return CONTACT_W;
    // contact mode
    if (sendState === "sending" || sendState === "sent") return FEEDBACK_W;
    return CONTACT_W;
  }, [dockShellState, sendState]);

  const dockHeight = dockShellState === "contact" ? 64 : 56;

  const bgScaleX = navWidth ? Math.min(1, navWidth / CONTACT_W) : 1;
  const bgScale =
    dockState === "nav" || dockState === "assistant" ? bgScaleX : 1;

  const isNavLayerActive = dockState === "nav" || dockState === "assistant";

  // --------------------------------------------------------------------------
  // MEDIA PLAYER EFFECTS
  // --------------------------------------------------------------------------
  React.useEffect(() => {
    if (!nowPlaying?.src) return;

    const el = audioRef.current;
    if (!el) return;

    // load & play the new source
    el.src = nowPlaying.src;
    el.currentTime = 0;
    void el.play().catch(() => {
      // autoplay might be blocked; user can hit play in UI
    });
  }, [nowPlaying?.src]);

  useEffect(() => {
    const el = audioRef.current;
    if (!el) return;

    const onPlay = () => setIsPlaying(true);
    const onPause = () => setIsPlaying(false);
    const onTimeUpdate = () => setCurrentTimeSec(el.currentTime || 0);
    const onLoadedMeta = () => setDurationSec(el.duration || 0);
    const onDurationChange = () => setDurationSec(el.duration || 0);
    const onEnded = () => setIsPlaying(false);

    el.addEventListener("play", onPlay);
    el.addEventListener("pause", onPause);
    el.addEventListener("timeupdate", onTimeUpdate);
    el.addEventListener("loadedmetadata", onLoadedMeta);
    el.addEventListener("durationchange", onDurationChange);
    el.addEventListener("ended", onEnded);

    // set initial values if metadata already present
    setIsPlaying(!el.paused);
    setCurrentTimeSec(el.currentTime || 0);
    setDurationSec(el.duration || 0);

    return () => {
      el.removeEventListener("play", onPlay);
      el.removeEventListener("pause", onPause);
      el.removeEventListener("timeupdate", onTimeUpdate);
      el.removeEventListener("loadedmetadata", onLoadedMeta);
      el.removeEventListener("durationchange", onDurationChange);
      el.removeEventListener("ended", onEnded);
    };
  }, []);

  useEffect(() => {
    if (!isMediaPlayerVisible) return;

    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key !== "Escape") return;

      // Pause audio
      const el = audioRef.current;
      if (el && !el.paused) el.pause();

      // Hide panel
      hideMediaPlayer();
    };

    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [isMediaPlayerVisible, hideMediaPlayer]);

  // --------------------------------------------------------------------------
  // ASSISTANT EFFECTS
  // --------------------------------------------------------------------------
  useEffect(() => {
    if (isAssistantVisible && assistantPromptRef.current) {
      assistantPromptRef.current.focus();
    }
  }, [isAssistantVisible]);

  // --------------------------------------------------------------------------
  // CONTACT EFFECTS
  // --------------------------------------------------------------------------
  useEffect(() => {
    if (isContactVisible && contactEmailRef.current) {
      contactEmailRef.current.focus();
    }
  }, [isContactVisible]);

  // --------------------------------------------------------------------------
  // KEYBOARD HANDLING
  // --------------------------------------------------------------------------
  useDockKeyboard({
    isDockVisible,
    isContactVisible,
    isBusy,
    navItems,
    keySequence,
    setKeySequence,
    showShortcuts,
    setShowShortcuts,
    setShowHighlights,
    onNavigate: (href) => navigate(href),
    onOpenContact: () => showContact(),
    onOpenAssistant: () => showAssistant(),
    onCloseContact: () => closeContact(),
    onSendContact: () => void handleSendContact(),
  });

  // --------------------------------------------------------------------------
  // ASSISTANT HANDLERS
  // --------------------------------------------------------------------------
  const focusAssistantPrompt = () => {
    // rAF avoids fighting layout/animation updates
    requestAnimationFrame(() => {
      assistantPromptRef.current?.focus();
    });
  };

  const closeAssistant = () => {
    assistantAbortRef.current?.abort();
    assistantAbortRef.current = null;
    hideAssistant();
  };

  // const sendAssistant = async (raw: string) => {
  //   const content = raw.trim();
  //   if (!content || assistantBusy) return;

  //   assistantAbortRef.current?.abort();
  //   const controller = new AbortController();
  //   assistantAbortRef.current = controller;

  //   const userMsg: AssistantMessage = {
  //     id: crypto.randomUUID(),
  //     role: "user",
  //     content,
  //   };
  //   setAssistantMessages((prev) => [...prev, userMsg]);

  //   // If this was triggered from textarea, clear it.
  //   setAssistantPrompt("");
  //   focusAssistantPrompt();

  //   const assistantId = crypto.randomUUID();
  //   setAssistantMessages((prev) => [
  //     ...prev,
  //     {
  //       id: assistantId,
  //       role: "assistant",
  //       content: "",
  //       committed: "",
  //       pending: "",
  //     },
  //   ]);

  //   setAssistantBusy(true);

  //   const apiMessages = [
  //     {
  //       role: "system" as const,
  //       content:
  //         "You are a helpful assistant. Keep replies concise unless asked otherwise.",
  //     },
  //     ...assistantMessages.map((m) => ({ role: m.role, content: m.content })),
  //     { role: "user" as const, content },
  //   ];

  //   try {
  //     const res = await fetch("/api/assistant", {
  //       method: "POST",
  //       headers: { "Content-Type": "application/json" },
  //       body: JSON.stringify({ messages: apiMessages }),
  //       signal: controller.signal,
  //     });

  //     if (!res.ok || !res.body) throw new Error("Bad response");

  //     const reader = res.body.getReader();
  //     const decoder = new TextDecoder();
  //     let buffer = "";

  //     let pendingBuffer = "";
  //     let lastFlush = performance.now();
  //     const FLUSH_MS = 650;
  //     const MIN_CHARS_PER_FLUSH = 24;

  //     const flush = () => {
  //       if (!pendingBuffer) return;

  //       const chunk = pendingBuffer.length < 12 ? pendingBuffer : pendingBuffer;
  //       pendingBuffer = "";

  //       setAssistantMessages((prev) =>
  //         prev.map((m) => {
  //           if (m.id !== assistantId) return m;

  //           const committed = m.committed ?? m.content ?? "";
  //           const nextCommitted = committed + (m.pending ?? "");

  //           return {
  //             ...m,
  //             committed: nextCommitted,
  //             pending: chunk,
  //             content: nextCommitted + chunk, // keep content in sync for transcript/api usage
  //             pendingId: (m.pendingId ?? 0) + 1,
  //           };
  //         })
  //       );

  //       lastFlush = performance.now();
  //     };

  //     while (true) {
  //       const { value, done } = await reader.read();
  //       if (done) break;

  //       buffer += decoder.decode(value, { stream: true });
  //       const parsed = parseSseLines(buffer);
  //       buffer = parsed.remainder;

  //       for (const data of parsed.events) {
  //         if (data === "[DONE]") {
  //           flush();

  //           // final commit: move pending into committed and clear pending
  //           setAssistantMessages((prev) =>
  //             prev.map((m) => {
  //               if (m.id !== assistantId) return m;
  //               const final = (m.committed ?? "") + (m.pending ?? "");
  //               return { ...m, committed: final, pending: "", content: final };
  //             })
  //           );

  //           assistantAbortRef.current = null;
  //           setAssistantBusy(false);
  //           focusAssistantPrompt();
  //           return;
  //         }

  //         let token = "";
  //         try {
  //           token = JSON.parse(data)?.response ?? "";
  //         } catch {
  //           // ignore malformed chunk
  //         }

  //         if (token) {
  //           pendingBuffer += token;

  //           const now = performance.now();

  //           // flush either on time OR once we have enough text to animate nicely
  //           if (
  //             now - lastFlush > FLUSH_MS ||
  //             pendingBuffer.length >= MIN_CHARS_PER_FLUSH
  //           ) {
  //             flush();
  //           }
  //         }
  //       }
  //     }

  //     assistantAbortRef.current = null;
  //     setAssistantBusy(false);
  //     focusAssistantPrompt();
  //   } catch (e) {
  //     if ((e as any)?.name === "AbortError") return;

  //     setAssistantMessages((prev) =>
  //       prev.map((m) =>
  //         m.id === assistantId
  //           ? { ...m, content: "Something went wrong. Try again." }
  //           : m
  //       )
  //     );
  //     assistantAbortRef.current = null;
  //     setAssistantBusy(false);
  //     focusAssistantPrompt();
  //   }
  // };

  const sendAssistant = async (raw: string) => {
    const content = raw.trim();
    if (!content || assistantBusy) return;

    assistantAbortRef.current?.abort();
    const controller = new AbortController();
    assistantAbortRef.current = controller;

    const userMsg: AssistantMessage = {
      id: crypto.randomUUID(),
      role: "user",
      content,
    };
    setAssistantMessages((prev) => [...prev, userMsg]);

    // If this was triggered from textarea, clear it.
    setAssistantPrompt("");
    focusAssistantPrompt();

    const assistantId = crypto.randomUUID();
    setAssistantMessages((prev) => [
      ...prev,
      {
        id: assistantId,
        role: "assistant",
        content: "",
        committed: "",
        pending: "",
      },
    ]);

    setAssistantBusy(true);

    const apiMessages = [
      {
        role: "system" as const,
        content:
          "You are a helpful assistant. Keep replies concise unless asked otherwise.",
      },
      ...assistantMessages.map((m) => ({ role: m.role, content: m.content })),
      { role: "user" as const, content },
    ];

    // ============================================================================
    // BUFFERED STREAMING APPROACH
    // ============================================================================
    // We buffer incoming tokens, then drain them at a controlled rate
    // to ensure smooth TextGenerateEffect animations

    const tokenBuffer: string[] = []; // Tokens waiting to be displayed
    let streamComplete = false;
    let displayStarted = false;
    const DISPLAY_DELAY_MS = 500; // Start displaying after 1s or when done
    // const DRAIN_INTERVAL_MS = 150; // Display a chunk every 150ms
    const DRAIN_INTERVAL_MS = 1500; // Display a chunk every 150ms
    const TOKENS_PER_CHUNK = 9; // How many tokens to show per chunk e.g. 3

    let drainIntervalId: number | null = null;

    // Start the drain process
    const startDraining = () => {
      if (displayStarted) return;
      displayStarted = true;

      drainIntervalId = window.setInterval(() => {
        // Take tokens from buffer and display them
        const chunk = tokenBuffer.splice(0, TOKENS_PER_CHUNK).join("");

        if (chunk) {
          setAssistantMessages((prev) =>
            prev.map((m) => {
              if (m.id !== assistantId) return m;

              const committed = m.committed ?? "";
              const nextCommitted = committed + (m.pending ?? "");

              return {
                ...m,
                committed: nextCommitted,
                pending: chunk,
                content: nextCommitted + chunk,
                pendingId: (m.pendingId ?? 0) + 1,
              };
            })
          );
        }

        // Stop draining when buffer is empty AND stream is complete
        if (tokenBuffer.length === 0 && streamComplete) {
          if (drainIntervalId !== null) {
            clearInterval(drainIntervalId);
            drainIntervalId = null;
          }

          // Final commit
          setAssistantMessages((prev) =>
            prev.map((m) => {
              if (m.id !== assistantId) return m;
              const final = (m.committed ?? "") + (m.pending ?? "");
              return { ...m, committed: final, pending: "", content: final };
            })
          );

          assistantAbortRef.current = null;
          setAssistantBusy(false);
          focusAssistantPrompt();
        }
      }, DRAIN_INTERVAL_MS);
    };

    // Start drain timer (fallback if stream takes too long)
    const drainTimerId = window.setTimeout(() => {
      if (tokenBuffer.length > 0) {
        startDraining();
      }
    }, DISPLAY_DELAY_MS);

    try {
      const res = await fetch("/api/assistant", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: apiMessages }),
        signal: controller.signal,
      });

      if (!res.ok || !res.body) throw new Error("Bad response");

      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let buffer = "";

      while (true) {
        const { value, done } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const parsed = parseSseLines(buffer);
        buffer = parsed.remainder;

        for (const data of parsed.events) {
          if (data === "[DONE]") {
            streamComplete = true;
            clearTimeout(drainTimerId);

            // Start draining immediately if we haven't started yet
            if (!displayStarted) {
              startDraining();
            }
            return;
          }

          let token = "";
          try {
            token = JSON.parse(data)?.response ?? "";
          } catch {
            // ignore malformed chunk
          }

          if (token) {
            // Add to buffer instead of immediately displaying
            tokenBuffer.push(token);
          }
        }
      }

      // Stream ended without [DONE]
      streamComplete = true;
      clearTimeout(drainTimerId);
      if (!displayStarted) {
        startDraining();
      }
    } catch (e) {
      clearTimeout(drainTimerId);
      if (drainIntervalId !== null) {
        clearInterval(drainIntervalId);
      }

      if ((e as any)?.name === "AbortError") return;

      setAssistantMessages((prev) =>
        prev.map((m) =>
          m.id === assistantId
            ? { ...m, content: "Something went wrong. Try again." }
            : m
        )
      );
      assistantAbortRef.current = null;
      setAssistantBusy(false);
      focusAssistantPrompt();
    }
  };

  const handleSendAssistant = async () => {
    await sendAssistant(assistantPrompt);
  };

  const handleAssistantClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setShowHighlights(false);
    setKeySequence("");
    setShowShortcuts(() => false);
    showAssistant();
  };

  // --------------------------------------------------------------------------
  // CONTACT HANDLERS
  // --------------------------------------------------------------------------
  const closeContact = () => {
    hideContact();
    setContactEmail("");
    setContactMessage("");
    setSendState("idle");
  };

  const handleSendContact = async () => {
    const email = contactEmail.trim();
    const message = contactMessage.trim();
    if (!email || !message) return;
    if (sendState !== "idle") return;

    const startedAt = Date.now();
    setSendState("sending");

    try {
      const res = await fetch(
        "https://portfoliocontactform.syeef.dev/contact",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "CF-Turnstile-Token": turnstileToken,
          },
          body: JSON.stringify({
            email,
            message,
            path: location.pathname,
            search: location.search,
            hash: location.hash,
            href: window.location.href,
          }),
        }
      );

      const elapsed = Date.now() - startedAt;
      const remainingSending = Math.max(0, SENDING_MS - elapsed);

      if (!res.ok) {
        setTimeout(() => setSendState("idle"), remainingSending);
        return;
      }

      setTimeout(() => setSendState("sent"), remainingSending);
      setTimeout(() => closeContact(), remainingSending + SENT_MS);
    } catch {
      const elapsed = Date.now() - startedAt;
      const remainingSending = Math.max(0, SENDING_MS - elapsed);
      setTimeout(() => setSendState("idle"), remainingSending);
    }
  };

  const handleContactClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setShowHighlights(false);
    setKeySequence("");
    setShowShortcuts(() => false);
    showContact();
  };

  // --------------------------------------------------------------------------
  // SOCIAL/CV HANDLERS
  // --------------------------------------------------------------------------
  function handleTwitterClick() {
    window.open("https://twitter.com/syeefk", "_blank", "noopener,noreferrer");
  }

  function handleLinkedInClick() {
    window.open(
      "https://uk.linkedin.com/in/syeefkarim/",
      "_blank",
      "noopener,noreferrer"
    );
  }

  function handleCVClick() {
    window.open(
      "/documents/Syeef-Karim-CV-2026.pdf",
      "_blank",
      "noopener,noreferrer"
    );
  }

  // --------------------------------------------------------------------------
  // NAVIGATION ITEM STYLING
  // --------------------------------------------------------------------------
  const getItemClassName = (item: any) => {
    let className = item.isDivider ? "" : styles.dockLink;

    if (
      showHighlights &&
      keySequence &&
      item.shortcut?.startsWith(keySequence)
    ) {
      className += ` ${styles.dockLinkHighlighted}`;
    }

    return className;
  };

  // --------------------------------------------------------------------------
  // RENDER
  // --------------------------------------------------------------------------
  if (!isDockVisible) return null;

  return (
    <>
      {/* Assistant Backdrop */}
      {isAssistantVisible
        ? createPortal(
            <div
              className={styles.contactBackdrop}
              onPointerDown={() => closeAssistant()}
              aria-hidden
            />,
            document.body
          )
        : null}

      {/* Contact Backdrop */}
      {isContactVisible
        ? createPortal(
            <div
              className={styles.contactBackdrop}
              onPointerDown={() => closeContact()}
              aria-hidden
            />,
            document.body
          )
        : null}

      <div className={styles.dockContainer}>
        {/* Hidden Audio Element */}
        <audio ref={audioRef} preload="metadata" />

        {/* Ghost Measurer (hidden, used for width calculation) */}
        <div
          className={styles.navMeasureGhost}
          ref={navMeasureGhostRef}
          aria-hidden
          style={{ pointerEvents: "none" }}
        >
          <div className={styles.navRow}>
            {navItems.map((item: any, index: number) => (
              <div key={index} className={styles.dockItem}>
                <div className={styles.dockLink}>
                  <div className={styles.dockIcon}>{item.icon}</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Assistant Panel (above dock) */}
        <div onClick={(e) => e.stopPropagation()}>
          <DockAssistant
            isAssistantVisible={isAssistantVisible}
            isBusy={assistantBusy || fetcher.state !== "idle"}
            messages={assistantMessages}
            prompt={assistantPrompt}
            setPrompt={setAssistantPrompt}
            onSend={handleSendAssistant}
            onQuickPrompt={(text) => void sendAssistant(text)}
            promptRef={assistantPromptRef}
          />
        </div>

        {/* Contact Compose Panel (above dock) */}
        <div onClick={(e) => e.stopPropagation()}>
          <DockContactCompose
            isContactVisible={isContactVisible}
            isBusy={isBusy}
            contactEmail={contactEmail}
            setContactEmail={setContactEmail}
            contactMessage={contactMessage}
            setContactMessage={setContactMessage}
            contactEmailRef={contactEmailRef}
            contactTextareaRef={contactTextareaRef}
            setTurnstileToken={setTurnstileToken}
          />
        </div>

        {/* Media Player Panel (above dock) */}
        <DockMediaPlayerPanel
          isVisible={isMediaPlayerVisible && !isContactVisible}
          title={nowPlaying?.title ?? ""}
          subtitle={nowPlaying?.subtitle ?? ""}
          isPlaying={isPlaying}
          currentTimeSec={currentTimeSec}
          durationSec={durationSec}
          progress={progress}
          onClose={hideMediaPlayer}
          onTogglePlay={() => {
            const el = audioRef.current;
            if (!el) return;

            if (el.paused) {
              void el.play();
            } else {
              el.pause();
            }
          }}
          onBack10={() => {
            const el = audioRef.current;
            if (!el) return;
            el.currentTime = Math.max(0, el.currentTime - 10);
          }}
          onForward10={() => {
            const el = audioRef.current;
            if (!el) return;
            el.currentTime = Math.min(
              el.duration || Infinity,
              el.currentTime + 10
            );
          }}
        />

        {/* Main Dock Shell */}
        <div className={styles.dockFrame}>
          <motion.div
            className={styles.dockShell}
            initial={false}
            animate={{
              width:
                dockState === "contact" &&
                (sendState === "sending" || sendState === "sent")
                  ? "160px"
                  : dockWidth,
              height: dockHeight,
              opacity: shouldShowShell ? 1 : 0,
            }}
            transition={{
              width: { duration: 0.38, ease: [0.16, 1, 0.3, 1] },
              height: { duration: 0.38, ease: [0.16, 1, 0.3, 1] },
              opacity: { duration: 0.12 },
            }}
          >
            {/* Background Pill */}
            <motion.div
              className={styles.dockShellBg}
              aria-hidden="true"
              initial={false}
              animate={{
                scaleX: bgScale,
                backgroundColor:
                  sendState === "sent" ? "var(--green-1)" : "var(--gray-1)",
                borderColor:
                  sendState === "sent" ? "var(--green-4)" : "transparent",
                opacity: shouldShowShell ? 1 : 0,
              }}
              transition={{
                scaleX: { duration: 0.38, ease: [0.16, 1, 0.3, 1] },
                backgroundColor: { duration: 0.25 },
                borderColor: { duration: 0.25 },
                opacity: { duration: 0.12 },
              }}
              style={{ transformOrigin: "50% 50%" }}
            />

            {/* Navigation Layer */}
            <motion.nav
              className={styles.dockNavLayer}
              initial={false}
              animate={!isNavLayerActive || !isMeasured ? "hidden" : "visible"}
              variants={layerVariants}
              transition={{ duration: 0.2 }}
              style={{
                pointerEvents: isNavLayerActive ? "auto" : "none",
              }}
            >
              <DockNav
                navItems={navItems as any}
                contactItemLabelLower={contactItemLabelLower}
                assistantItemLabelLower={assistantItemLabelLower}
                getItemClassName={getItemClassName}
                onContactClick={handleContactClick}
                onAssistantClick={handleAssistantClick}
                isAssistantActive={isAssistantVisible}
              />
            </motion.nav>

            {/* Contact Actions Layer */}
            <motion.div
              className={styles.contactLayer}
              initial={false}
              animate={dockState === "contact" ? "visible" : "hidden"}
              variants={layerVariants}
              transition={{
                duration: 0.2,
                delay: dockState === "contact" ? 0.05 : 0,
              }}
              style={{
                pointerEvents: dockState === "contact" ? "auto" : "none",
              }}
            >
              <DockContactActions
                sendState={sendState}
                onSend={() => void handleSendContact()}
                onTwitter={handleTwitterClick}
                onLinkedIn={handleLinkedInClick}
                onCV={handleCVClick}
                canSend={!!contactEmail.trim() && !!contactMessage.trim()}
              />
            </motion.div>
          </motion.div>
        </div>
      </div>

      {/* Shortcuts Overlay */}
      <DockShortcutsOverlay
        show={showShortcuts}
        isContactVisible={isContactVisible}
        navItems={navItems as any}
      />
    </>
  );
}
