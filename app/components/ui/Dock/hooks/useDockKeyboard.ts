import { useEffect } from "react";

type NavItem = {
  id?: string;
  label?: string;
  href?: string;
  exact?: boolean;
  shortcut?: string;
};

type Args = {
  isDockVisible: boolean;
  isContactVisible: boolean;
  isBusy: boolean;

  navItems: NavItem[];

  keySequence: string;
  setKeySequence: (v: string | ((prev: string) => string)) => void;

  showShortcuts: boolean;
  setShowShortcuts: (fn: (v: boolean) => boolean) => void;

  setShowHighlights: (v: boolean) => void;

  onNavigate: (href: string) => void;
  onOpenContact: () => void;
  onOpenAssistant: () => void; // ✅ NEW
  onCloseContact: () => void;
  onSendContact: () => void;
};

export function useDockKeyboard({
  isDockVisible,
  isContactVisible,
  isBusy,
  navItems,
  keySequence,
  setKeySequence,
  showShortcuts,
  setShowShortcuts,
  setShowHighlights,
  onNavigate,
  onOpenContact,
  onOpenAssistant, // ✅ NEW
  onCloseContact,
  onSendContact,
}: Args) {
  useEffect(() => {
    if (!isDockVisible) return;

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.metaKey || event.ctrlKey || event.altKey) return;

      // Ignore when typing in inputs/textareas/contenteditable
      if (event.target instanceof HTMLElement) {
        const tag = event.target.tagName;
        const isEditable =
          tag === "INPUT" ||
          tag === "TEXTAREA" ||
          event.target.isContentEditable;

        if (isEditable) return;
      }

      // Contact compose owns keyboard
      if (isContactVisible) {
        if (event.key === "Escape") {
          event.preventDefault();
          onCloseContact();
          return;
        }

        if (event.key === "Enter" && !event.shiftKey) {
          event.preventDefault();
          if (!isBusy) onSendContact();
          return;
        }

        return;
      }

      // Ignore when typing in inputs/textareas elsewhere
      // if (
      //   event.target instanceof HTMLElement &&
      //   (event.target.tagName === "INPUT" ||
      //     event.target.tagName === "TEXTAREA")
      // ) {
      //   return;
      // }

      if (event.target instanceof HTMLElement) {
        const tag = event.target.tagName;
        const isEditable =
          tag === "INPUT" ||
          tag === "TEXTAREA" ||
          event.target.isContentEditable;

        // ✅ allow Escape globally if you ever want it here too (optional)
        if (isEditable) return;
      }

      const key = event.key.toLowerCase();

      if (key === "?") {
        event.preventDefault();
        setShowShortcuts((v) => !v);
        return;
      }

      if (key === "escape") {
        event.preventDefault();
        setShowShortcuts(() => false);
        setKeySequence("");
        setShowHighlights(false);
        return;
      }

      if (key.match(/^[a-z]$/)) {
        const newSequence = keySequence + key;

        if (newSequence === "gg") {
          event.preventDefault();
          setKeySequence("g");
          setShowHighlights(true);

          setTimeout(() => {
            setKeySequence("");
            setShowHighlights(false);
          }, 5000);
          return;
        }

        const matchingItem = navItems.find(
          (item) => item.shortcut === newSequence
        );

        if (matchingItem) {
          event.preventDefault();
          setShowHighlights(false);
          setKeySequence("");

          const label = matchingItem?.label?.toLowerCase();
          const id = matchingItem?.id?.toLowerCase();

          const isContact = label === "contact" || id === "contact";
          const isAssistant = label === "assistant" || id === "assistant"; // ✅ NEW

          if (isContact) {
            setShowShortcuts(() => false);
            onOpenContact();
            return;
          }

          if (isAssistant) {
            setShowShortcuts(() => false);
            onOpenAssistant();
            return;
          }

          if (matchingItem.href) {
            onNavigate(matchingItem.href);
          }

          return;
        }

        const hasPartialMatch = navItems.some(
          (item) => item.shortcut && item.shortcut.startsWith(newSequence)
        );

        if (hasPartialMatch) {
          event.preventDefault();
          setKeySequence(newSequence);
          setTimeout(() => {
            setKeySequence((prev) => (prev === newSequence ? "" : prev));
          }, 3000);
        } else {
          setKeySequence("");
          setShowHighlights(false);
        }
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [
    isDockVisible,
    isContactVisible,
    isBusy,
    navItems,
    keySequence,
    showShortcuts,
    setKeySequence,
    setShowShortcuts,
    setShowHighlights,
    onNavigate,
    onOpenContact,
    onOpenAssistant, // ✅ NEW
    onCloseContact,
    onSendContact,
  ]);
}
