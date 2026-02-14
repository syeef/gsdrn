import * as React from "react";
import styles from "~/styles/app.module.css";
import Header from "~/components/ui/Header/Header";
import Calendar from "~/components/ui/Calendar/Calendar";
import Editor from "~/components/ui/Editor/Editor";
import { Hr } from "~/components/ui/Hr/Hr";
import Title from "~/components/ui/Title/Title";
import DateNavigator from "~/components/ui/DateNavigator/DateNavigator";

export type AppUserData = {
  firstName: string | null;
  lastName: string | null;
  email: string;
  image: string | null;
};

type AppPageProps = {
  user: AppUserData;
  dateKey: string;
};

export default function AppPage({ user, dateKey }: AppPageProps) {
  const [saveSignal, setSaveSignal] = React.useState(0);
  const [activeSaves, setActiveSaves] = React.useState(0);
  const [isSavingVisible, setIsSavingVisible] = React.useState(false);
  const minVisibleUntilRef = React.useRef<number | null>(null);
  const hideTimeoutRef = React.useRef<number | null>(null);

  const clearHideTimeout = React.useCallback(() => {
    if (hideTimeoutRef.current !== null) {
      window.clearTimeout(hideTimeoutRef.current);
      hideTimeoutRef.current = null;
    }
  }, []);

  const handleSaveStart = React.useCallback(() => {
    clearHideTimeout();
    const now = Date.now();
    const minUntil = now + 3000;
    minVisibleUntilRef.current = Math.max(
      minVisibleUntilRef.current ?? 0,
      minUntil,
    );
    setIsSavingVisible(true);
    setActiveSaves((count) => count + 1);
  }, [clearHideTimeout]);

  const handleSaveEnd = React.useCallback(() => {
    setActiveSaves((count) => {
      const next = count > 0 ? count - 1 : 0;
      if (next === 0) {
        const now = Date.now();
        const minUntil = minVisibleUntilRef.current ?? now;
        const delay = Math.max(minUntil - now, 0);
        clearHideTimeout();
        hideTimeoutRef.current = window.setTimeout(() => {
          setIsSavingVisible(false);
          minVisibleUntilRef.current = null;
        }, delay);
      }
      return next;
    });
  }, [clearHideTimeout]);

  React.useEffect(
    () => () => {
      clearHideTimeout();
    },
    [clearHideTimeout],
  );

  const requestSaveAll = React.useCallback(() => {
    setSaveSignal((value) => value + 1);
  }, []);

  React.useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.defaultPrevented) return;
      if (!(event.metaKey || event.ctrlKey)) return;
      if (event.key.toLowerCase() !== "s") return;

      event.preventDefault();
      requestSaveAll();
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [requestSaveAll]);

  return (
    <div className={styles.page}>
      <Header user={user} dateKey={dateKey} isSaving={isSavingVisible} />
      <main className={styles.content}>
        <div className={styles.leading}>
          {/* <DateNavigator dateKey={dateKey} /> */}
          <Calendar dateKey={dateKey} />
        </div>

        <div className={styles.trailing}>
          {/* <section className={styles.todoNotesContainer}>
            <Title variant="Lora" as="h2">
              <Title.Em headingColor="orange">Tasks</Title.Em>
            </Title>
            <Editor mode="todos" dateKey={dateKey} />
          </section> */}

          {/* <Hr marginSize="small" /> */}

          <section className={styles.todoNotesContainer}>
            <div className={styles.titleContainer}>
              <Title variant="Lora" as="h2">
                <Title.Em headingColor="gray">Tasks</Title.Em>
              </Title>
            </div>
            <div className={styles.contentContainer}>
              <Editor
                mode="todos"
                dateKey={dateKey}
                saveSignal={saveSignal}
                onSaveStart={handleSaveStart}
                onSaveEnd={handleSaveEnd}
              />
            </div>
          </section>

          <section className={styles.todoNotesContainer}>
            <div className={styles.titleContainer}>
              <Title variant="Lora" as="h2">
                <Title.Em headingColor="gray">Notes</Title.Em>
              </Title>
            </div>
            <div className={styles.contentContainer}>
              <Editor
                mode="notes"
                dateKey={dateKey}
                saveSignal={saveSignal}
                onSaveStart={handleSaveStart}
                onSaveEnd={handleSaveEnd}
              />
            </div>
          </section>
        </div>
      </main>
    </div>
  );
}
