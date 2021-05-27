/*
 * Copyright (c) 2020 International Business Machines
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

import { useEffect, useRef } from "react";

function useBlockSwipeBack<T extends HTMLElement>() {
  const ref = useRef<T>(null);

  useEffect(() => {
    const current = ref.current;

    function handleMouseWheel(e: WheelEvent) {
      e.stopPropagation();
      if (current === null) {
        return;
      }

      if (!current.contains(e.target as Node)) {
        return;
      }

      e.preventDefault();
      const max = current.scrollWidth - current.offsetWidth;
      const scrollPosition =
        Math.abs(e.deltaX) > Math.abs(e.deltaY)
          ? current.scrollLeft + e.deltaX
          : current.scrollLeft + e.deltaY;
      current.scrollLeft = Math.max(0, Math.min(max, scrollPosition));
    }

    document.addEventListener("wheel", handleMouseWheel, {
      passive: false,
    });

    return () => {
      document.removeEventListener("wheel", handleMouseWheel);
    };
  }, []);

  return { ref };
}

export default useBlockSwipeBack;
