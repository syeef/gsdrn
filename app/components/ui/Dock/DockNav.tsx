import React from "react";
import { NavLink } from "react-router";
import type { NavItem } from "~/hooks/useNavigationItems";
import { Tooltip } from "../Tooltip/Tooltip";
import styles from "./Dock.module.css";

// DockNav.tsx
type Props = {
  navItems: NavItem[];
  contactItemLabelLower?: string | null;
  assistantItemLabelLower?: string | null;
  getItemClassName: (item: NavItem) => string;
  onContactClick: (e: React.MouseEvent) => void;
  onAssistantClick: (e: React.MouseEvent) => void;
  isAssistantActive?: boolean;
};

export function DockNav({
  navItems,
  contactItemLabelLower,
  assistantItemLabelLower,
  getItemClassName,
  onContactClick,
  onAssistantClick,
  isAssistantActive,
}: Props) {
  return (
    <div className={styles.navRow}>
      {navItems.map((item, index) => (
        <div key={index} className={styles.dockItem}>
          {item.isDivider || item.isSearch ? (
            <div className={getItemClassName(item)}>
              <div
                className={
                  item.isDivider ? styles.dockDivider : styles.dockSearch
                }
              >
                <div className={styles.dockIcon}>{item.icon}</div>
                {item.isSearch && (
                  <span className={styles.dockLabel}>{item.label}</span>
                )}
              </div>
            </div>
          ) : (
            <>
              {/* CONTACT special-case */}
              {contactItemLabelLower &&
              item?.label?.toLowerCase() === contactItemLabelLower ? (
                <Tooltip label={item.label ?? ""} interactive>
                  <button
                    type="button"
                    className={`${styles.dockLinkButton} ${styles.dockLinkButtonContact}`}
                    onClick={onContactClick}
                  >
                    <div className={styles.dockIcon}>{item.icon}</div>
                  </button>
                </Tooltip>
              ) : /* ASSISTANT special-case */
              assistantItemLabelLower &&
                item?.label?.toLowerCase() === assistantItemLabelLower ? (
                <Tooltip label={item.label ?? ""} interactive>
                  {/* <button
                    type="button"
                    className={`${styles.dockLinkButton} ${styles.dockLinkButtonContact}`}
                    onClick={onAssistantClick}
                  > */}
                  <button
                    type="button"
                    className={[
                      styles.dockLinkButton,
                      styles.dockLinkButtonContact,
                      isAssistantActive ? styles.dockLinkActive : "",
                    ].join(" ")}
                    onClick={onAssistantClick}
                  >
                    <div className={styles.dockIcon}>{item.icon}</div>
                  </button>
                </Tooltip>
              ) : (
                <Tooltip label={item.label ?? ""}>
                  <NavLink
                    prefetch="render"
                    to={item.href ?? ""}
                    end={item.exact === true}
                    className={getItemClassName(item)}
                    viewTransition
                  >
                    <div className={styles.dockIcon}>{item.icon}</div>
                  </NavLink>
                </Tooltip>
              )}
            </>
          )}
        </div>
      ))}
    </div>
  );
}
