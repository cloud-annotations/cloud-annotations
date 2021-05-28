/*
 * Copyright (c) International Business Machines
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

export namespace Canvas {
  export interface Options {
    width: number;
    height: number;
    mode: "move" | "draw";
    padding?: number;
  }

  export interface Point {
    x: number;
    y: number;
  }

  export interface Box extends Point {
    width: number;
    height: number;
  }

  export interface Shape {
    targets: Point[];
    [key: string]: any;
  }

  export interface TouchTarget {
    shapeID: string;
    targetID: string;
    tool: string;
    target: Path2D;
  }

  export class Context {
    private readonly dp: number;
    private readonly ctx: CanvasRenderingContext2D;
    private readonly width: number;
    private readonly height: number;
    private readonly padding: number;
    private readonly mode: "move" | "draw";

    private offsetX = 0;
    private offsetY = 0;
    private scaledWidth = 0;
    private scaledHeight = 0;
    private tool = "";

    private touchTargets: TouchTarget[] = [];

    constructor(
      canvas: HTMLCanvasElement,
      { width, height, padding = 64, mode }: Options
    ) {
      this.dp = window.devicePixelRatio;
      this.width = width;
      this.height = height;
      this.padding = padding;
      this.mode = mode;

      canvas.width = width * this.dp;
      canvas.height = height * this.dp;

      canvas.style.width = width + "px";
      canvas.style.height = height + "px";

      const ctx = canvas.getContext("2d");
      if (!ctx) {
        throw Error();
      }

      this.ctx = ctx;
    }

    get xScale() {
      return this.scaledWidth * this.dp;
    }

    get yScale() {
      return this.scaledHeight * this.dp;
    }

    private x(x: number) {
      return this.px(this.offsetX + x * this.scaledWidth);
    }

    private y(y: number) {
      return this.px(this.offsetY + y * this.scaledHeight);
    }

    private w(w: number) {
      return this.px(w * this.scaledWidth);
    }

    private h(h: number) {
      return this.px(h * this.scaledHeight);
    }

    private px(px: number) {
      return Math.round(px * this.dp);
    }

    getCoords({ x, y }: Point) {
      return {
        x: (x - this.offsetX) / this.scaledWidth,
        y: (y - this.offsetY) / this.scaledHeight,
      };
    }

    setTargets(tool: string, shape: { id: string; targets: any[] }) {
      this.tool = tool;

      if (shape.targets === undefined) {
        return;
      }

      for (const t of shape.targets) {
        const target = new Path2D();
        target.arc(this.x(t.x), this.y(t.y), this.px(8), 0, Math.PI * 2);
        this.touchTargets.push({
          shapeID: shape.id,
          targetID: t.id,
          tool: this.tool,
          target: target,
        });
      }
    }

    toolForClick({ x, y }: Point) {
      for (const t of this.touchTargets) {
        if (this.ctx.isPointInPath(t.target, this.px(x), this.px(y))) {
          return t;
        }
      }
      return undefined;
    }

    drawImage(imageData: HTMLImageElement) {
      const { naturalWidth, naturalHeight } = imageData;

      const spaceMaxWidth = this.width - 2 * this.padding;
      const spaceMaxHeight = this.height - 2 * this.padding;

      const maxWidth = Math.min(spaceMaxWidth, naturalWidth);
      const maxHeight = Math.min(spaceMaxHeight, naturalHeight);

      const rs = maxWidth / maxHeight;
      const ri = naturalWidth / naturalHeight;

      if (rs > ri) {
        this.scaledWidth = (naturalWidth * maxHeight) / naturalHeight;
        this.scaledHeight = maxHeight;
      } else {
        this.scaledWidth = maxWidth;
        this.scaledHeight = (naturalHeight * maxWidth) / naturalWidth;
      }

      this.offsetX = this.padding + (spaceMaxWidth - this.scaledWidth) / 2;
      this.offsetY = this.padding + (spaceMaxHeight - this.scaledHeight) / 2;

      this.ctx.drawImage(
        imageData,
        this.px(this.offsetX),
        this.px(this.offsetY),
        this.px(this.scaledWidth),
        this.px(this.scaledHeight)
      );
    }

    drawBox(box: Box, { color, highlight }: any) {
      switch (this.mode) {
        case "move": {
          this.strokeRect(box, {
            color: "#000000",
            dash: [4, 4],
            offset: 4,
            size: 1,
          });

          this.strokeRect(box, {
            color: "#ffffff",
            dash: [4, 4],
            offset: 0,
            size: 1,
          });

          this.drawAnchor({
            x: box.x,
            y: box.y,
          });

          this.drawAnchor({
            x: box.x + box.width,
            y: box.y,
          });

          this.drawAnchor({
            x: box.x + box.width,
            y: box.y + box.height,
          });

          this.drawAnchor({
            x: box.x,
            y: box.y + box.height,
          });
          return;
        }
        case "draw": {
          this.strokeRect(box, {
            color: "#000000",
            size: 1,
            adjust: -2,
          });

          this.strokeRect(box, {
            color: color,
            size: 2,
            adjust: -1,
          });

          this.strokeRect(box, {
            color: "#000000",
            size: 1,
            adjust: 1,
          });

          this.fillRect(box, {
            color: color,
            opacity: highlight ? 0.6 : 0.1,
            adjust: 2,
          });
          return;
        }
      }
    }

    drawAnchor(point: Point, options?: any) {
      const { color, debug } = options ?? {};
      if (debug) {
        this.point(point, { color: "red", size: 5 });
        return;
      }
      switch (this.mode) {
        case "move": {
          this.point(point, { color: "#ffffff", size: 4.5 });
          this.point(point, { color: "#a2a9b0", size: 3.5 });
          return;
        }
        case "draw": {
          this.point(point, { color: "#000000", size: 4.5 });
          this.point(point, { color: color, size: 3.5 });
          return;
        }
      }
    }

    private point(point: Point, { color, size }: any) {
      this.ctx.save();
      this.ctx.fillStyle = color;
      this.ctx.beginPath();
      this.ctx.arc(
        this.x(point.x),
        this.y(point.y),
        this.px(size),
        0,
        Math.PI * 2,
        true
      );
      this.ctx.fill();
      this.ctx.restore();
    }

    private strokeRect(
      box: Box,
      { color, dash = [], offset, size, adjust = 0 }: any
    ) {
      this.ctx.save();

      this.ctx.lineWidth = this.px(size);

      const inlineFix = this.ctx.lineWidth / 2;

      this.ctx.strokeStyle = color;

      this.ctx.setLineDash(dash.map((d: number) => this.px(d)));

      this.ctx.lineDashOffset = this.px(offset);
      this.ctx.strokeRect(
        this.x(box.x) + inlineFix + this.px(adjust),
        this.y(box.y) + inlineFix + this.px(adjust),
        this.w(box.width) - 2 * inlineFix - 2 * this.px(adjust),
        this.h(box.height) - 2 * inlineFix - 2 * this.px(adjust)
      );
      this.ctx.restore();
    }

    private fillRect(box: Box, { color, opacity = 1, adjust = 0 }: any) {
      this.ctx.save();

      this.ctx.fillStyle = color;
      this.ctx.globalAlpha = opacity;
      this.ctx.fillRect(
        this.x(box.x) + this.px(adjust),
        this.y(box.y) + this.px(adjust),
        this.w(box.width) - 2 * this.px(adjust),
        this.h(box.height) - 2 * this.px(adjust)
      );
      this.ctx.restore();
    }
  }
}
