import {
  IconAiText,
  IconHome,
  IconMail,
  IconOrderedList,
  IconPreferences,
  IconWriteNote,
} from "~/components/ui/Icons/Icons";

type NavItemBase = {
  href?: string;
  label: string;
  shortcut: string;
  shortcutDescription?: string;
  showInSidebar: boolean;
  icon: React.ReactNode;
  disabled?: boolean;
  exact?: boolean;
};

export type NavItem =
  | (NavItemBase & { href?: string; isSearch?: false; isDivider?: false })
  | (NavItemBase & { isSearch: true; isDivider?: false })
  | (NavItemBase & { isDivider: true; isSearch?: false });

export const useNavigationItems = (): NavItem[] => {
  return [
    {
      href: "/today",
      label: "Today",
      shortcut: "gh",
      shortcutDescription: "g then h",
      showInSidebar: true,
      disabled: false,
      icon: <IconHome height={16} width={16} />,
    },
    {
      label: "Assistant",
      shortcut: "/",
      shortcutDescription: "/",
      showInSidebar: false,
      icon: <IconAiText height={16} width={16} />,
    },
    {
      label: "",
      shortcut: "",
      isDivider: true,
      showInSidebar: false,
      icon: (
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="24"
          height="24"
          viewBox="0 0 24 24"
          fill="none"
        >
          <rect
            width="3"
            height="16"
            x="10.5"
            y="4"
            fill="currentColor"
            rx="1.5"
          />
        </svg>
      ),
    },

    {
      href: "/preferences",
      label: "Preferences",
      shortcut: "gp",
      shortcutDescription: "g then p",
      showInSidebar: true,
      icon: <IconPreferences height={16} width={16} />,
    },
    {
      href: "/tasks",
      label: "Tasks",
      shortcut: "gt",
      shortcutDescription: "g then t",
      showInSidebar: true,
      icon: <IconOrderedList height={16} width={16} />,
    },
    {
      href: "/notes",
      label: "Notes",
      shortcut: "gn",
      shortcutDescription: "g then n",
      showInSidebar: true,
      icon: <IconWriteNote height={16} width={16} />,
    },
    {
      label: "",
      shortcut: "",
      isDivider: true,
      showInSidebar: false,
      icon: (
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="24"
          height="24"
          viewBox="0 0 24 24"
          fill="none"
        >
          <rect
            width="3"
            height="16"
            x="10.5"
            y="4"
            fill="currentColor"
            rx="1.5"
          />
        </svg>
      ),
    },
    {
      label: "Contact",
      shortcut: "c",
      shortcutDescription: "c",
      showInSidebar: false,
      icon: <IconMail height={16} width={16} />,
    },
  ];
};
