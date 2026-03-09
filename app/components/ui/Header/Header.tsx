import Avatar from "~/components/ui/Avatar/Avatar";
import styles from "./Header.module.css";
import Popover from "../Popover/Popover";
import UserMenu from "./UserMenu";
import DateNavigator from "../DateNavigator/DateNavigator";
import SavingIndicator from "../SavingIndicator/SavingIndicator";
import Title from "../Title/Title";

type HeaderBarProps = {
  user?: {
    firstName?: string | null;
    lastName?: string | null;
    email?: string | null;
    image?: string | null;
  } | null;
  dateKey?: string;
  isSaving?: boolean;
  syncIssue?: boolean;
  title?: string;
};

export default function HeaderBar({
  user,
  dateKey,
  isSaving,
  syncIssue,
  title,
}: HeaderBarProps) {
  const hasTitle = Boolean(title);
  const statusNode = isSaving ? (
    <SavingIndicator />
  ) : syncIssue ? (
    <span className={styles.syncIssue} role="status" aria-live="polite">
      Sync delayed
    </span>
  ) : null;

  return (
    <header className={styles.header}>
      <div className={styles.horizontal}>
        {hasTitle ? (
          <div className={styles.titleGroup}>
            <Title variant="Inter" as="h2" className={styles.pageTitle}>
              {title}
            </Title>
            {statusNode}
          </div>
        ) : dateKey ? (
          <DateNavigator dateKey={dateKey} status={statusNode} />
        ) : null}
      </div>

      <Popover
        simple={true}
        align="end"
        trigger={<Avatar size={32} user={user} />}
      >
        <UserMenu />
      </Popover>
    </header>
  );
}
