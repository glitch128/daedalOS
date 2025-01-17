import FileManager from "components/system/Files/FileManager";
import Sidebar from "components/system/StartMenu/Sidebar";
import StyledStartMenu from "components/system/StartMenu/StyledStartMenu";
import { updateInputValueOnReactElement } from "components/system/Taskbar/Search/functions";
import StyledBackground from "components/system/Taskbar/StyledBackground";
import {
  SEARCH_BUTTON_LABEL,
  START_BUTTON_LABEL,
  maybeCloseTaskbarMenu,
} from "components/system/Taskbar/functions";
import useTaskbarItemTransition from "components/system/Taskbar/useTaskbarItemTransition";
import type { Variant } from "framer-motion";
import { useCallback, useRef, useState } from "react";
import { useTheme } from "styled-components";
import {
  FOCUSABLE_ELEMENT,
  HOME,
  PREVENT_SCROLL,
  THIN_SCROLLBAR_WIDTH,
} from "utils/constants";

type StartMenuProps = {
  toggleStartMenu: (showMenu?: boolean) => void;
};

type StyleVariant = Variant & {
  height?: string;
};

const StartMenu: FC<StartMenuProps> = ({ toggleStartMenu }) => {
  const menuRef = useRef<HTMLElement | null>(null);
  const {
    sizes: { startMenu },
  } = useTheme();
  const [showScrolling, setShowScrolling] = useState(false);
  const revealScrolling: React.MouseEventHandler = ({ clientX = 0 }) =>
    setShowScrolling(clientX > startMenu.size - THIN_SCROLLBAR_WIDTH);
  const focusOnRenderCallback = useCallback((element: HTMLElement | null) => {
    element?.focus(PREVENT_SCROLL);
    menuRef.current = element;
  }, []);
  const startMenuTransition = useTaskbarItemTransition(startMenu.maxHeight);
  const { height } =
    (startMenuTransition.variants?.active as StyleVariant) ?? {};

  return (
    <StyledStartMenu
      ref={focusOnRenderCallback}
      $showScrolling={showScrolling}
      onBlurCapture={(event) =>
        maybeCloseTaskbarMenu(
          event,
          menuRef.current,
          toggleStartMenu,
          undefined,
          START_BUTTON_LABEL
        )
      }
      onKeyDown={({ key }) => {
        if (key === "Escape") toggleStartMenu(false);
        else if (key.length === 1) {
          toggleStartMenu(false);

          const searchButton = document.querySelector<HTMLDivElement>(
            `main > nav > div[aria-label='${SEARCH_BUTTON_LABEL}']`
          );

          if (searchButton) {
            searchButton.click();

            let tries = 0;
            const openSearchTimerRef = window.setInterval(() => {
              const searchInput = document.querySelector<HTMLInputElement>(
                "main > nav .search > input"
              );

              if (searchInput) {
                updateInputValueOnReactElement(searchInput, key);
              }

              if (searchInput || ++tries > 10) {
                window.clearInterval(openSearchTimerRef);
              }
            }, 50);
          }
        }
      }}
      onMouseMove={revealScrolling}
      {...startMenuTransition}
      {...FOCUSABLE_ELEMENT}
    >
      <StyledBackground $height={height} />
      <Sidebar height={height} />
      <FileManager
        url={`${HOME}/Start Menu`}
        view="list"
        hideLoading
        hideShortcutIcons
        isStartMenu
        loadIconsImmediately
        preloadShortcuts
        readOnly
        skipFsWatcher
        skipSorting
      />
    </StyledStartMenu>
  );
};

export default StartMenu;
