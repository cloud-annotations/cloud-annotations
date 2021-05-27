/*
 * Copyright (c) 2020 International Business Machines
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

import { useEffect, useRef } from "react";

function useClickOutside<T extends HTMLElement>(
  handler: EventListener,
  options?: { hideOnBlur?: boolean }
) {
  const ref = useRef<T>(null);

  const savedHandler = useRef<EventListener>();
  useEffect(() => {
    savedHandler.current = handler;
  }, [handler]);

  useEffect(() => {
    const current = ref.current;

    function handeMouseDown(e: Event) {
      if (current === null) {
        return;
      }

      if (current.contains(e.target as Node)) {
        return;
      }

      savedHandler.current?.(e);
    }

    function handleLoseFocus(e: Event) {
      if (!document.hasFocus()) {
        savedHandler.current?.(e);
      }
    }

    if (options?.hideOnBlur) {
      document.addEventListener("msvisibilitychange", handleLoseFocus);
      document.addEventListener("webkitvisibilitychange", handleLoseFocus);
      document.addEventListener("visibilitychange", handleLoseFocus);
      window.addEventListener("blur", handleLoseFocus);
    }

    document.addEventListener("mousedown", handeMouseDown);
    document.addEventListener("touchstart", handeMouseDown);

    return () => {
      if (options?.hideOnBlur) {
        document.removeEventListener("msvisibilitychange", handleLoseFocus);
        document.removeEventListener("webkitvisibilitychange", handleLoseFocus);
        document.removeEventListener("visibilitychange", handleLoseFocus);
        window.removeEventListener("blur", handleLoseFocus);
      }

      document.removeEventListener("mousedown", handeMouseDown);
      document.removeEventListener("touchstart", handeMouseDown);
    };
  }, [options]);

  return { ref };
}

export default useClickOutside;
