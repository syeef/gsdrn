// DockContext.tsx

import React, { createContext, useContext, useState, useEffect } from "react";

type NowPlaying = {
  title: string;
  subtitle: string;
  src: string;
};

interface DockContextType {
  isDockVisible: boolean;

  isCommandBarVisible: boolean;
  isSearchBarVisible: boolean;
  isContactVisible: boolean;

  // ✅ existing
  isMediaPlayerVisible: boolean;

  // ✅ NEW
  isAssistantVisible: boolean;

  showSearchBar: () => void;
  hideSearchBar: () => void;

  showCommandBar: () => void;
  hideCommandBar: () => void;

  showContact: () => void;
  hideContact: () => void;

  // ✅ NEW
  showAssistant: () => void;
  hideAssistant: () => void;

  nowPlaying: NowPlaying | null;
  playMedia: (payload: NowPlaying) => void;
  stopMedia: () => void;

  showMediaPlayer: () => void;
  hideMediaPlayer: () => void;

  isPlaying: boolean;
  setIsPlaying: (next: boolean) => void;
}

const DockContext = createContext<DockContextType | undefined>(undefined);

export const DockProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [isDockVisible, setIsDockVisible] = useState(true);
  const [isCommandBarVisible, setIsCommandBarVisible] = useState(false);
  const [isSearchBarVisible, setIsSearchBarVisible] = useState(false);
  const [isContactVisible, setIsContactVisible] = useState(false);
  const [isMediaPlayerVisible, setIsMediaPlayerVisible] = useState(false);

  // ✅ NEW
  const [isAssistantVisible, setIsAssistantVisible] = useState(false);

  const [nowPlaying, setNowPlaying] = useState<NowPlaying | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);

  const showCommandBar = () => {
    setIsCommandBarVisible(true);
    setIsSearchBarVisible(false);
    setIsContactVisible(false);
    setIsAssistantVisible(false); // ✅
    setIsMediaPlayerVisible(false);
    setIsDockVisible(false);
  };

  const hideCommandBar = () => {
    setIsCommandBarVisible(false);
    setIsSearchBarVisible(false);
    setIsContactVisible(false);
    setIsAssistantVisible(false); // ✅
    setIsMediaPlayerVisible(false);
    setIsDockVisible(true);
  };

  const showSearchBar = () => {
    setIsSearchBarVisible(true);
    setIsDockVisible(false);
    setIsCommandBarVisible(false);
    setIsContactVisible(false);
    setIsAssistantVisible(false); // ✅
    setIsMediaPlayerVisible(false);
  };

  const hideSearchBar = () => {
    setIsSearchBarVisible(false);
    setIsCommandBarVisible(false);
    setIsContactVisible(false);
    setIsAssistantVisible(false); // ✅
    setIsMediaPlayerVisible(false);
    setIsDockVisible(true);
  };

  const showContact = () => {
    setIsContactVisible(true);
    setIsCommandBarVisible(false);
    setIsSearchBarVisible(false);
    setIsAssistantVisible(false); // ✅
    setIsMediaPlayerVisible(false);
    setIsDockVisible(true);
  };

  const hideContact = () => {
    setIsContactVisible(false);
    setIsDockVisible(true);
  };

  // ✅ NEW — Assistant keeps dock visible (dock becomes the assistant UI)
  const showAssistant = () => {
    setIsAssistantVisible(true);
    setIsCommandBarVisible(false);
    setIsSearchBarVisible(false);
    setIsContactVisible(false);
    setIsMediaPlayerVisible(false);
    setIsDockVisible(true);
  };

  const hideAssistant = () => {
    setIsAssistantVisible(false);
    setIsDockVisible(true);
  };

  const showMediaPlayer = () => {
    setIsMediaPlayerVisible(true);
    setIsCommandBarVisible(false);
    setIsSearchBarVisible(false);
    setIsContactVisible(false);
    setIsAssistantVisible(false); // ✅
    setIsDockVisible(true);
  };

  const hideMediaPlayer = () => {
    setIsMediaPlayerVisible(false);
    setIsDockVisible(true);
  };

  const playMedia = (payload: NowPlaying) => {
    setNowPlaying(payload);
    showMediaPlayer();
  };

  const stopMedia = () => {
    setNowPlaying(null);
    setIsPlaying(false);
    hideMediaPlayer();
  };

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.target instanceof HTMLElement) {
        const tag = event.target.tagName;
        const isEditable =
          tag === "INPUT" ||
          tag === "TEXTAREA" ||
          event.target.isContentEditable;

        if (isEditable && event.key !== "Escape") return;
      }

      if ((event.metaKey || event.ctrlKey) && event.key === "k") {
        event.preventDefault();

        if (isContactVisible) hideContact();
        if (isAssistantVisible) hideAssistant(); // ✅
        if (isMediaPlayerVisible) hideMediaPlayer();

        if (isSearchBarVisible) {
          hideSearchBar();
          showCommandBar();
        } else if (isCommandBarVisible) {
          hideCommandBar();
        } else {
          showCommandBar();
        }
      }

      if (
        event.key === "Escape" &&
        (isCommandBarVisible ||
          isSearchBarVisible ||
          isContactVisible ||
          isAssistantVisible || // ✅
          isMediaPlayerVisible)
      ) {
        hideSearchBar();
        hideCommandBar();
        hideContact();
        hideAssistant(); // ✅
        hideMediaPlayer();
      }

      if (event.key === "/") {
        event.preventDefault();

        if (isContactVisible) hideContact();
        // if (isAssistantVisible) hideAssistant(); // ✅
        if (isMediaPlayerVisible) hideMediaPlayer();
        // if (isSearchBarVisible) hideSearchBar();
        else showAssistant();
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [
    isCommandBarVisible,
    isSearchBarVisible,
    isContactVisible,
    isAssistantVisible, // ✅
    isMediaPlayerVisible,
  ]);

  return (
    <DockContext.Provider
      value={{
        isDockVisible,
        isCommandBarVisible,
        isSearchBarVisible,
        isContactVisible,
        isMediaPlayerVisible,

        // ✅ NEW
        isAssistantVisible,

        showCommandBar,
        hideCommandBar,
        showSearchBar,
        hideSearchBar,
        showContact,
        hideContact,

        // ✅ NEW
        showAssistant,
        hideAssistant,

        showMediaPlayer,
        hideMediaPlayer,

        nowPlaying,
        playMedia,
        stopMedia,

        isPlaying,
        setIsPlaying,
      }}
    >
      {children}
    </DockContext.Provider>
  );
};

export const useDock = () => {
  const context = useContext(DockContext);
  if (context === undefined) {
    throw new Error("useDock must be used within a DockProvider");
  }
  return context;
};
