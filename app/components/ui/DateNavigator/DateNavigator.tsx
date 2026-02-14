import * as React from "react";
import { useNavigate } from "react-router";
import styles from "./DateNavigator.module.css";
import { IconChevronLeft, IconChevronRight } from "~/components/ui/Icons/Icons";
import Title from "~/components/ui/Title/Title";
import { formatDateKey, parseDateKey } from "~/utils/date";

type DateNavigatorProps = {
  dateKey: string;
  status?: React.ReactNode;
};

const displayDateFormatter = new Intl.DateTimeFormat("en-GB", {
  weekday: "short",
  day: "numeric",
  month: "long",
  year: "numeric",
});

export default function DateNavigator({ dateKey, status }: DateNavigatorProps) {
  const navigate = useNavigate();
  const currentDate = React.useMemo(
    () => parseDateKey(dateKey) ?? new Date(),
    [dateKey],
  );

  const displayDate = React.useMemo(
    () => displayDateFormatter.format(currentDate),
    [currentDate],
  );

  const navigateByDays = React.useCallback(
    (offset: number) => {
      const nextDate = new Date(currentDate);
      nextDate.setDate(nextDate.getDate() + offset);
      navigate(`/${formatDateKey(nextDate)}`);
    },
    [currentDate, navigate],
  );

  const navigateToToday = React.useCallback(() => {
    navigate(`/${formatDateKey(new Date())}`);
  }, [navigate]);

  const handleKeyDown = React.useCallback(
    (event: KeyboardEvent) => {
      if (event.defaultPrevented) return;
      if (event.metaKey || event.ctrlKey || event.altKey) return;

      const target = event.target as HTMLElement | null;
      if (target) {
        const tagName = target.tagName;
        const isFormField =
          tagName === "INPUT" || tagName === "TEXTAREA" || tagName === "SELECT";
        const isEditable =
          target.isContentEditable ||
          Boolean(target.closest("[contenteditable='true']"));

        if (isFormField || isEditable) return;
      }

      const key = event.key.toLowerCase();
      if (key === "p") {
        event.preventDefault();
        navigateByDays(-1);
      } else if (key === "n") {
        event.preventDefault();
        navigateByDays(1);
      } else if (key === "t") {
        event.preventDefault();
        navigateToToday();
      }
    },
    [navigateByDays, navigateToToday],
  );

  React.useEffect(() => {
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [handleKeyDown]);

  return (
    <div className={styles.container}>
      <div className={styles.dateGroup}>
        <Title variant="Lora" as="h2" className={styles.dateText}>
          {displayDate}
        </Title>
        {status ? <div className={styles.status}>{status}</div> : null}
      </div>

      <div className={styles.controls}>
        <button
          type="button"
          className={styles.iconButton}
          aria-label="Previous day"
          onClick={() => navigateByDays(-1)}
        >
          <IconChevronLeft />
        </button>
        <button
          type="button"
          className={styles.iconButton}
          aria-label="Next day"
          onClick={() => navigateByDays(1)}
        >
          <IconChevronRight />
        </button>
      </div>
    </div>
  );
}
