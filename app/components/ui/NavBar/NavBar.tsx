import { NavLink } from "react-router";
import { Hr } from "../Hr/Hr";
import Button from "../Button/Button";

import styles from "./NavBar.module.css";

type HeaderBarProps = {
  user?: any;
  dateKey?: any;
  isSaving?: boolean;
};

export default function HeaderBar({ user, dateKey, isSaving }: HeaderBarProps) {
  return (
    <nav className={styles.navBarContainer}>
      <div className={styles.navBarContents}>
        Get It Done
        <Button variant="primary">Get Started</Button>
      </div>

      <Hr marginSize="small" />
    </nav>
  );
}
