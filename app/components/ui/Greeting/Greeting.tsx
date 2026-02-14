import { useMemo } from "react";
import type { ReactNode } from "react";
import styles from "./Greeting.module.css";

interface GreetingProps {
  /** Optional: override the time (useful for tests) */
  date?: Date;
  children?: ReactNode; // e.g., a name
}

function getGreeting(d: Date): string {
  const minutes = d.getHours() * 60 + d.getMinutes();

  // 06:00–12:00 => Good Morning
  if (minutes >= 6 * 60 && minutes <= 12 * 60) return "Good morning";

  // 12:01–18:00 => Good Afternoon
  if (minutes >= 12 * 60 + 1 && minutes <= 18 * 60) return "Good afternoon";

  // 18:01–24:00 (i.e., 23:59 + the exact 00:00) => Good Evening
  if (minutes >= 18 * 60 + 1 || minutes === 0) return "Good evening";

  // 00:01–05:59 => Good Night
  return "Good night";
}

export default function Greeting({ date, children }: GreetingProps) {
  const greeting = useMemo(() => getGreeting(date ?? new Date()), [date]);

  return (
    <h1 className={styles.greeting}>
      {children ? `${greeting}, ${children}` : `${greeting}`}
    </h1>
  );
}
