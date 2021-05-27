import { Canvas } from "./Canvas";

export abstract class CanvasPlugin {
  abstract onTargetMove(point: Canvas.Point, target: Canvas.TouchTarget): void;

  abstract onMouseDown(point: Canvas.Point): void;

  abstract onMouseMove(point: Canvas.Point): void;

  abstract onMouseUp(point: Canvas.Point, xScale: number, yScale: number): void;

  abstract render(ctx: Canvas.Context, v: Canvas.Shape): void;
}

export { Canvas } from "./Canvas";
