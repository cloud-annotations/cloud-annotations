/*
 * Copyright (c) 2020 International Business Machines
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

import React, { useRef, useEffect, useCallback } from "react";

import { createStyles, makeStyles } from "@material-ui/core";

import Horizontal from "./Horizontal";
import Pointer from "./Pointer";
import Vertical from "./Vertical";

interface Props {
  active?: boolean;
  children?: React.ReactNode;
  color?: string;
}

const useStyles = makeStyles(() =>
  createStyles({
    root: {
      position: "absolute",
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      userSelect: "none",
      cursor: (props: Props) => (props.active ? "none" : "default"),
      overflow: "hidden",
    },
  })
);

function setStyle(el: HTMLElement | SVGElement | null, style: any) {
  if (el) {
    for (const [key, val] of Object.entries(style)) {
      (el.style as any)[key] = val;
    }
  }
}

function CrossHair({ active, children, color }: Props) {
  const classes = useStyles({ active });

  const wrapperRef = useRef<HTMLDivElement>(null);

  const pointerRef = useRef<SVGSVGElement>(null);
  const leftRef = useRef<SVGSVGElement>(null);
  const rightRef = useRef<SVGSVGElement>(null);
  const topRef = useRef<SVGSVGElement>(null);
  const bottomRef = useRef<SVGSVGElement>(null);

  const setVisibility = useCallback((visibility: "visible" | "hidden") => {
    setStyle(pointerRef.current, { visibility });
    setStyle(leftRef.current, { visibility });
    setStyle(rightRef.current, { visibility });
    setStyle(topRef.current, { visibility });
    setStyle(bottomRef.current, { visibility });
  }, []);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (
        !wrapperRef.current ||
        !wrapperRef.current.contains(e.target as Node)
      ) {
        return;
      }

      const rect = wrapperRef.current.getBoundingClientRect();
      const mX = e.clientX - rect.left;
      const mY = e.clientY - rect.top;

      setStyle(pointerRef.current, {
        top: mY - 9.5,
        left: mX - 9.5,
        width: 19,
        height: 19,
      });

      setStyle(leftRef.current, {
        top: mY,
        left: 0,
        width: mX - 11,
        height: 2,
      });

      setStyle(rightRef.current, {
        top: mY,
        left: mX + 12,
        width: rect.width - (mX + 12),
        height: 2,
      });

      setStyle(topRef.current, {
        left: mX,
        width: 2,
        height: mY - 11,
      });

      setStyle(bottomRef.current, {
        top: mY + 12,
        left: mX,
        width: 2,
        height: rect.height - (mY + 12),
      });

      setVisibility("visible");
    };

    document.addEventListener("mousemove", handleMouseMove);
    return () => {
      document.removeEventListener("mousemove", handleMouseMove);
    };
  }, [setVisibility]);

  const handleMouseLeave = useCallback(() => {
    setVisibility("hidden");
  }, [setVisibility]);

  if (!active) {
    return (
      <div draggable={false} className={classes.root}>
        {children}
      </div>
    );
  }

  return (
    <div
      draggable={false}
      ref={wrapperRef}
      onMouseLeave={handleMouseLeave}
      className={classes.root}
    >
      {children}
      <Pointer color={color} ref={pointerRef} />
      <Horizontal color={color} ref={leftRef} />
      <Horizontal color={color} ref={rightRef} />
      <Vertical color={color} ref={topRef} />
      <Vertical color={color} ref={bottomRef} />
    </div>
  );
}

export default CrossHair;
