import { NavLink, useNavigate } from "react-router";
import { Hr } from "../Hr/Hr";
import Button from "../Button/Button";

import styles from "./NavBar.module.css";
import { LogoMark } from "../Icons/Icons";

type NavBarProps = {
  user?: any;
  dateKey?: any;
  isSaving?: boolean;
};

export default function NavBar({ user, dateKey, isSaving }: NavBarProps) {
  const navigate = useNavigate();

  function handleGetStartedClick() {
    navigate("/login");
  }

  return (
    <nav className={styles.navBarContainer}>
      <div className={styles.navBarContents}>
        <LogoMark height={24} width={24} />
        <Button variant="primary" onClick={handleGetStartedClick}>
          Get Started
        </Button>
      </div>

      <Hr marginSize="small" />
    </nav>
  );
}
