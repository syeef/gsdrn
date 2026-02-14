import * as React from "react";
import { NavLink, Form, useRouteLoaderData } from "react-router";
import { IconPreferences, IconProjects, IconSignOut } from "../Icons/Icons";

import styles from "./UserMenu.module.css";

function AuthAwareSignOut() {
  const data = useRouteLoaderData<typeof rootLoader>("root");
  const user = (data as any)?.user ?? null;

  if (!user) return null;
  return (
    <Form method="post" action="/signout">
      <button type="submit" className={styles.signOut}>
        <IconSignOut height={16} width={16} />
        Log Out
      </button>
    </Form>
  );
}

const NavigationItems = () => {
  return [
    {
      href: "/preferences",
      label: "Preferences",
      icon: <IconPreferences height={16} width={16} />,
    },
  ];
};

function NavigationList({ onNavigate }: { onNavigate?: () => void }) {
  const items = NavigationItems();

  return (
    <ul className={styles.navList}>
      {items.map((item, i) => (
        <li key={item.href ?? i}>
          <NavLink
            to={item.href!}
            className={({ isActive }) =>
              [styles.link, isActive ? styles.active : null]
                .filter(Boolean)
                .join(" ")
            }
            onClick={onNavigate}
            prefetch="render"
          >
            <span className={styles.iconWrap}>{item.icon}</span>
            <span className={styles.label}>{item.label}</span>
          </NavLink>
        </li>
      ))}
      <AuthAwareSignOut />
    </ul>
  );
}

export default function UserMenu() {
  const data = useRouteLoaderData<typeof rootLoader>("root");

  return (
    <div className={styles.userMenu}>
      <div className={styles.metaDetails}>
        <p>
          {data.user.firstName} {data.user.lastName}
        </p>
        <p>{data.user.email}</p>
      </div>

      <NavigationList />
    </div>
  );
}
