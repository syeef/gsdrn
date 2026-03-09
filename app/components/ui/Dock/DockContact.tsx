import React from "react";
import { motion, AnimatePresence } from "motion/react";
import { Turnstile } from "@marsidev/react-turnstile";
import { Hr } from "../Hr/Hr";
import Button from "../Button/Button";
import Input from "~/components/ui/Input/Input";
import {
  IconCheck,
  IconLinkedIn,
  IconReadCV,
  IconSend,
  IconTwitter,
} from "../Icons/Icons";
import styles from "./Dock.module.css";
import { SpinnerLoader } from "../SpinnerLoader/SpinnerLoader";

export type SendState = "idle" | "sending" | "sent";

type ComposeProps = {
  isContactVisible: boolean;
  isBusy: boolean;
  contactEmail: string;
  setContactEmail: (v: string) => void;
  contactMessage: string;
  setContactMessage: (v: string) => void;
  contactEmailRef: React.RefObject<HTMLInputElement | null>;
  contactTextareaRef: React.RefObject<HTMLTextAreaElement | null>;
  setTurnstileToken: (v: string) => void;
};

export function DockContactCompose({
  isContactVisible,
  isBusy,
  contactEmail,
  setContactEmail,
  contactMessage,
  setContactMessage,
  contactEmailRef,
  contactTextareaRef,
  setTurnstileToken,
}: ComposeProps) {
  return (
    <AnimatePresence initial={false}>
      {isContactVisible && (
        <motion.div
          className={styles.contactInputArea}
          initial={{ opacity: 0, y: 8, filter: "blur(10px)" }}
          animate={{
            opacity: isBusy ? 0 : 1,
            y: 0,
            filter: "blur(0px)",
            scaleY: isBusy ? 0.86 : 1,
          }}
          exit={{ opacity: 0, y: 8, filter: "blur(10px)" }}
          transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
          style={{ transformOrigin: "bottom", overflow: "hidden" }}
        >
          <Input
            variant="transparent"
            ref={contactEmailRef}
            value={contactEmail}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
              setContactEmail(e.target.value)
            }
            placeholder="Your email address"
            disabled={isBusy}
          />

          <Hr marginSize="small" />

          <textarea
            ref={contactTextareaRef}
            className={styles.contactTextarea}
            placeholder="I'm excited to hear from you \o/"
            value={contactMessage}
            onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) =>
              setContactMessage(e.target.value)
            }
            rows={8}
            disabled={isBusy}
          />

          <span className={styles.contactHint}>
            <span>
              <kbd className={styles.contactKbd}>Return + Shift</kbd> for a New
              Line
            </span>
            {/* <span>
              <kbd className={styles.contactKbd}>Esc</kbd> to Close
            </span> */}
          </span>

          <Turnstile
            siteKey="0x4AAAAAACKNRd1QRQOx4y56"
            onSuccess={(token: string) => setTurnstileToken(token)}
            onExpire={() => setTurnstileToken("")}
            onError={() => setTurnstileToken("")}
          />
        </motion.div>
      )}
    </AnimatePresence>
  );
}

type ActionsProps = {
  sendState: SendState;
  onSend: () => void;
  onTwitter: () => void;
  onLinkedIn: () => void;
  onCV: () => void;
  canSend: boolean;
};

export function DockContactActions({
  sendState,
  onSend,
  onTwitter,
  onLinkedIn,
  onCV,
  canSend,
}: ActionsProps) {
  return (
    <div className={styles.contactActionsInner}>
      {/* LEFT */}
      <div className={styles.contactLeft}>
        {sendState === "idle" && (
          <div className={styles.contactButtonsRow}>
            <Button variant="secondary" size="medium" onClick={onTwitter}>
              <IconTwitter />
              Twitter
            </Button>

            <Button variant="secondary" size="medium" onClick={onLinkedIn}>
              <IconLinkedIn />
              LinkedIn
            </Button>

            <Button variant="secondary" size="medium" onClick={onCV}>
              <IconReadCV />
              CV
            </Button>
          </div>
        )}
      </div>

      {/* CENTER */}
      <div className={styles.contactCenter}>
        <AnimatePresence mode="wait" initial={false}>
          {sendState === "sending" && (
            <motion.div
              key="sending"
              className={`${styles.statusLabel} ${styles.sendingLabel}`}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.18 }}
            >
              <SpinnerLoader label="Sending message…" color="var(--gray-8)" />
            </motion.div>
          )}

          {sendState === "sent" && (
            <motion.div
              key="sent"
              className={`${styles.statusLabel} ${styles.sentLabel}`}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.18 }}
            >
              <span className={styles.sentIcon}>
                <IconCheck width={16} height={16} />
              </span>
              Message sent
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* RIGHT */}
      <div className={styles.contactRight}>
        {sendState === "idle" && (
          <Button
            variant="primary"
            size="medium"
            onClick={onSend}
            disabled={!canSend}
          >
            Send
            <IconSend width={16} height={16} />
          </Button>
        )}
      </div>
    </div>
  );
}
