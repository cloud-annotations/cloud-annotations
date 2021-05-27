import React, { useRef, useEffect, useState, useCallback } from "react";

import { createStyles, makeStyles } from "@material-ui/core";

import { Canvas } from "@iris/core";

const useStyles = makeStyles(() =>
  createStyles({
    root: {
      position: "absolute",
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
    },
  })
);

interface Props {
  mode: "draw" | "move";
  tool: string;
  image: string;
  shapes: any[];
  render: { [key: string]: (c: Canvas.Context, v: any) => void };
  actions: {
    [key: string]: {
      onTargetMove: (coords: { x: number; y: number }, target: any) => void;
      // onTargetClick: (coords: { x: number; y: number }, target: any) => void;
      // onClick: (coords: { x: number; y: number }) => void;
      onMouseDown: (coords: { x: number; y: number }) => void;
      onMouseMove: (coords: { x: number; y: number }) => void;
      onMouseUp: (
        coords: { x: number; y: number },
        xScale: number,
        yScale: number
      ) => void;
    };
  };
}

function getClientCoordinates(e: MouseEvent | TouchEvent) {
  function guard(e: MouseEvent | TouchEvent): e is MouseEvent {
    if ((e as MouseEvent).clientX && (e as MouseEvent).clientY) {
      return true;
    }
    return false;
  }
  if (guard(e)) {
    return { clientX: e.clientX, clientY: e.clientY };
  }
  if (e.touches) {
    return { clientX: e.touches[0].clientX, clientY: e.touches[0].clientY };
  }

  // TODO: how did we get here...?
  return { clientX: 0, clientY: 0 };
}

function useWatchSize(ref: React.RefObject<HTMLDivElement>) {
  const [width, setWidth] = useState(0);
  const [height, setHeight] = useState(0);

  useEffect(() => {
    if (ref.current) {
      setWidth(ref.current.clientWidth);
      setHeight(ref.current.clientHeight);
    }

    const handleWindowResize = () => {
      if (ref.current) {
        setWidth(ref.current.clientWidth);
        setHeight(ref.current.clientHeight);
      }
    };

    window.addEventListener("resize", handleWindowResize);
    return () => {
      window.removeEventListener("resize", handleWindowResize);
    };
  }, [ref]);

  return [width, height];
}

function useImage(src: string) {
  const [image, setImage] = useState<HTMLImageElement>();

  useEffect(() => {
    const im = new Image();
    im.src = src;

    im.onload = () => {
      setImage(im);
    };
  }, [src]);

  return image;
}

function CanvasView({ mode, tool, image, shapes, render, actions }: Props) {
  const classes = useStyles();

  const viewportRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const [width, height] = useWatchSize(viewportRef);
  const imageData = useImage(image);

  const cRef = useRef<Canvas.Context | null>(null);
  const stateRef = useRef<{ dragging: boolean; target: any }>({
    dragging: false,
    target: undefined,
  });

  useEffect(() => {
    if (imageData && canvasRef.current) {
      const c = new Canvas.Context(canvasRef.current, { width, height, mode });
      cRef.current = c;

      c.drawImage(imageData);

      for (const shape of shapes) {
        c.setTargets(shape.tool, shape);
        const renderFunc = render[shape.tool];
        renderFunc?.(c, shape);
      }
    }
  }, [height, imageData, mode, render, shapes, width]);

  const handleMouseDown = useCallback(
    (e: React.SyntheticEvent) => {
      if ((e as any).button && (e as any).button !== 0) {
        return;
      }

      const { clientX, clientY } = getClientCoordinates(e as any);

      if (cRef.current && canvasRef.current) {
        const rect = canvasRef.current.getBoundingClientRect();

        const x = clientX - rect.left;
        const y = clientY - rect.top;

        const coords = cRef.current.getCoords({ x, y });

        switch (mode) {
          case "move": {
            const target = cRef.current.toolForClick({ x, y });
            if (target) {
              stateRef.current.dragging = true;
              stateRef.current.target = target;
            }
            return;
          }
          case "draw": {
            actions[tool].onMouseDown(coords);
            return;
          }
        }
      }
    },
    [actions, mode, tool]
  );

  const handleMouseMove = useCallback(
    (e: MouseEvent | TouchEvent) => {
      const { clientX, clientY } = getClientCoordinates(e as any);

      if (cRef.current && canvasRef.current) {
        const rect = canvasRef.current.getBoundingClientRect();

        const x = clientX - rect.left;
        const y = clientY - rect.top;

        const coords = cRef.current.getCoords({ x, y });

        switch (mode) {
          case "move": {
            if (stateRef.current.dragging) {
              actions[stateRef.current.target.tool].onTargetMove(
                coords,
                stateRef.current.target
              );
            }
            return;
          }
          case "draw": {
            actions[tool].onMouseMove(coords);
            return;
          }
        }
      }
    },
    [actions, mode, tool]
  );

  const handleMouseUp = useCallback(
    (e: MouseEvent | TouchEvent) => {
      stateRef.current.dragging = false;

      const { clientX, clientY } = getClientCoordinates(e as any);

      if (cRef.current && canvasRef.current) {
        const rect = canvasRef.current.getBoundingClientRect();

        const x = clientX - rect.left;
        const y = clientY - rect.top;

        const coords = cRef.current.getCoords({ x, y });

        if (mode === "draw") {
          actions[tool].onMouseUp(
            coords,
            cRef.current.xScale,
            cRef.current.yScale
          );
        }
      }
    },
    [actions, mode, tool]
  );

  useEffect(() => {
    document.addEventListener("mouseup", handleMouseUp);
    document.addEventListener("touchend", handleMouseUp);
    document.addEventListener("mousemove", handleMouseMove);
    document.addEventListener("touchmove", handleMouseMove);
    return () => {
      document.removeEventListener("mouseup", handleMouseUp);
      document.removeEventListener("touchend", handleMouseUp);
      document.removeEventListener("mousemove", handleMouseMove);
      document.removeEventListener("touchmove", handleMouseMove);
    };
  }, [handleMouseMove, handleMouseUp]);

  return (
    <div ref={viewportRef} draggable={false} className={classes.root}>
      <canvas
        ref={canvasRef}
        onMouseDown={handleMouseDown}
        onTouchStart={handleMouseDown}
        onContextMenu={(e) => {
          // prevent context menu when ctrl clicking only.
          if (e.button === 0) {
            e.preventDefault();
            return false;
          }
          return true;
        }}
      />
    </div>
  );
}

export default CanvasView;
