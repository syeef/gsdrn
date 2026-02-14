import { NavLink, useLocation, useMatches } from "react-router";
import Avatar from "~/components/ui/Avatar/Avatar";
import styles from "./Header.module.css";
import Popover from "../Popover/Popover";
import UserMenu from "./UserMenu";
import Greeting from "../Greeting/Greeting";
import DateNavigator from "../DateNavigator/DateNavigator";
import SavingIndicator from "../SavingIndicator/SavingIndicator";

type HeaderBarProps = {
  user?: any;
  dateKey?: any;
  isSaving?: boolean;
};

export default function HeaderBar({ user, dateKey, isSaving }: HeaderBarProps) {
  return (
    <header className={styles.header}>
      <div className={styles.horizontal}>
        {/* <Greeting>{user.firstName}</Greeting> */}
        <DateNavigator
          dateKey={dateKey}
          status={isSaving ? <SavingIndicator /> : null}
        />
      </div>

      <Popover simple={true} align="end" trigger={<Avatar size={32} />}>
        <UserMenu />
      </Popover>
    </header>
  );
}
