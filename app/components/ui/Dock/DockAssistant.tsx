// DockAssistant.tsx
import React, { useEffect, useMemo, useRef } from "react";
import { AnimatePresence, motion } from "motion/react";
import styles from "./Dock.module.css";
import { Hr } from "../Hr/Hr";
import Button from "../Button/Button";
import { TextGenerateEffect } from "../TextGenerateEffect/TextGenerateEffect";

export type AssistantMessage = {
  id: string;
  role: "user" | "assistant";
  content?: string;
  committed?: string; // text already shown "normally"
  pending?: string; // latest chunk to animate
  pendingId?: number; // 👈 add
};

type Props = {
  isAssistantVisible: boolean;
  isBusy: boolean;

  messages: AssistantMessage[];

  prompt: string;
  setPrompt: (v: string) => void;
  onSend: () => void;

  // ✅ add these
  quickPrompts?: string[];
  onQuickPrompt?: (text: string) => void;

  promptRef: React.RefObject<HTMLTextAreaElement | null>;
};

export function DockAssistant({
  isAssistantVisible,
  isBusy,
  messages,
  prompt,
  setPrompt,
  onSend,
  quickPrompts = [
    "Tell me a bit about Syeef.",
    "What are some of things Syeef has worked on?",
    "Where has he worked in the past?",
  ],
  onQuickPrompt,
  promptRef,
}: Props) {
  const scrollerRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const el = scrollerRef.current;
    if (!el) return;
    el.scrollTop = el.scrollHeight;
  }, [messages, isAssistantVisible]);

  const canSend = useMemo(
    () => prompt.trim().length > 0 && !isBusy,
    [prompt, isBusy]
  );

  // ✅ show prompts only before the first message
  const showQuickPrompts = !!onQuickPrompt && messages.length === 0 && !isBusy;

  return (
    <AnimatePresence initial={false}>
      {isAssistantVisible && (
        <motion.div
          className={styles.contactInputArea}
          initial={{ opacity: 0, y: 8, filter: "blur(10px)" }}
          animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
          exit={{ opacity: 0, y: 8, filter: "blur(10px)" }}
          transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
          style={{ transformOrigin: "bottom", overflow: "hidden" }}
          onClick={(e) => e.stopPropagation()}
        >
          {/* ✅ Quick prompts (fade + collapse on exit) */}
          <AnimatePresence initial={false}>
            {showQuickPrompts && (
              <motion.div
                className={styles.buttonContainer}
                initial={{ opacity: 0, height: 0, marginBottom: 0 }}
                animate={{ opacity: 1, height: "auto", marginBottom: 12 }}
                exit={{ opacity: 0, height: 0, marginBottom: 0 }}
                transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
                style={{ overflow: "scroll" }}
              >
                {quickPrompts.map((text) => (
                  <Button
                    key={text}
                    variant="shine"
                    onClick={() => onQuickPrompt?.(text)}
                  >
                    {text}
                  </Button>
                ))}
              </motion.div>
            )}
          </AnimatePresence>

          {/* Transcript */}
          <div ref={scrollerRef} className={styles.assistantTranscript}>
            {messages.map((m) => {
              const isUser = m.role === "user";
              return (
                <div
                  key={m.id}
                  className={`${styles.assistantRow} ${
                    isUser
                      ? styles.assistantRowUser
                      : styles.assistantRowAssistant
                  }`}
                >
                  <div
                    className={`${styles.assistantMessage} ${
                      isUser
                        ? styles.assistantMessageUser
                        : styles.assistantMessageAssistant
                    }`}
                  >
                    {m.role === "assistant" ? (
                      <>
                        {m.committed ?? ""}
                        {m.pending ? (
                          <TextGenerateEffect
                            key={m.pendingId ?? 0}
                            text={m.pending}
                            mode="word"
                            blur
                            // duration={0.75}
                            // itemStagger={0.08}
                            // duration={0.8}
                            // itemStagger={0.1}
                            duration={0.8}
                            itemStagger={0.18}
                          />
                        ) : null}
                      </>
                    ) : (
                      m.content
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Composer */}
          <textarea
            ref={promptRef}
            className={styles.contactTextarea}
            placeholder=""
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            rows={2}
            disabled={isBusy}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                if (canSend) onSend();
              }
            }}
          />

          <Hr marginSize="small" />

          <div className={styles.assistantAdvisoryContainer}>
            <span className={styles.contactHint}>
              <span>
                <kbd className={styles.contactKbd}>Shift</kbd> +{" "}
                <kbd className={styles.contactKbd}>Return</kbd> for a New Line
              </span>

              <span>
                <kbd className={styles.contactKbd}>Return</kbd> to Send
              </span>
            </span>
            <span className={styles.assistantAdvisoryText}>
              AI features may provide inaccurate responses. Review results
              before taking any action.
            </span>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
