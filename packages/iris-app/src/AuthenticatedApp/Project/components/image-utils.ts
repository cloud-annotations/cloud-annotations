/*
 * Copyright (c) International Business Machines
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

import { v4 as uuidv4 } from "uuid";

type ScaleMode = "aspectFit" | "scaleFill";

interface ImageOptions {
  maxWidth: number;
  maxHeight: number;
  scaleMode: ScaleMode;
}

interface VideoOptions {
  fps: number;
  maxWidth: number;
  maxHeight: number;
  scaleMode: ScaleMode;
}

export async function createJPEGs(files: File[]) {
  const images = files
    .filter(({ type }) => type.startsWith("image/"))
    .map(async (file) => {
      return await imageToJPEG(file, {
        maxWidth: window.MAX_IMAGE_WIDTH,
        maxHeight: window.MAX_IMAGE_HEIGHT,
        scaleMode: window.IMAGE_SCALE_MODE,
      });
    });

  const videos = files
    .filter(({ type }) => type.startsWith("video/"))
    .map(async (file) => {
      return await videoToJPEGs(file, {
        fps: window.FPS,
        maxWidth: window.MAX_IMAGE_WIDTH,
        maxHeight: window.MAX_IMAGE_HEIGHT,
        scaleMode: window.IMAGE_SCALE_MODE,
      });
    });

  const nestedJPEGArray = await Promise.all(videos);
  const jpegArray = await Promise.all(images);

  return [...jpegArray, ...nestedJPEGArray.flat()];
}

function dataURItoBlob(dataURI: string) {
  const byteString = atob(dataURI.split(",")[1]);
  const mimeString = dataURI.split(",")[0].split(":")[1].split(";")[0];
  const ab = new ArrayBuffer(byteString.length);
  const ia = new Uint8Array(ab);
  for (let i = 0; i < byteString.length; i++) {
    ia[i] = byteString.charCodeAt(i);
  }
  const blob = new Blob([ab], { type: mimeString });
  return blob;
}

async function loadImage(file: File): Promise<HTMLImageElement> {
  return new Promise((resolve) => {
    const image = new Image();
    image.onload = () => {
      resolve(image);
    };
    image.src = URL.createObjectURL(file);
  });
}

async function loadVideo(file: File): Promise<HTMLVideoElement> {
  return new Promise((resolve) => {
    const video = document.createElement("video");
    video.onloadeddata = () => {
      resolve(video);
    };
    video.src = URL.createObjectURL(file);
  });
}

async function seek(video: HTMLVideoElement, to: number) {
  return new Promise<void>((resolve) => {
    video.onseeked = () => {
      resolve();
    };
    video.currentTime = to;
  });
}

function createFile(c: HTMLCanvasElement) {
  return {
    blob: dataURItoBlob(c.toDataURL("image/jpeg")),
    name: `${uuidv4()}.jpg`,
  };
}

export async function imageToJPEG(file: File, options: ImageOptions) {
  const { maxWidth, maxHeight, scaleMode } = options;
  const image = await loadImage(file);
  const resized = resize(image, { scaleMode, maxWidth, maxHeight });
  return createFile(resized);
}

export async function videoToJPEGs(file: File, options: VideoOptions) {
  const { fps, maxWidth, maxHeight, scaleMode } = options;

  const video = await loadVideo(file);

  if (isNaN(video.duration)) {
    return [];
  }

  const totalFrames = Math.floor(video.duration * fps);

  let files = [];
  for (let i = 0; i < totalFrames; i++) {
    await seek(video, i / fps);
    const resized = resize(video, { scaleMode, maxWidth, maxHeight });
    const file = createFile(resized);
    files.push(file);
  }

  return files;
}

function resize(
  frame: HTMLVideoElement | HTMLImageElement,
  options: ImageOptions
) {
  const { scaleMode, maxWidth, maxHeight } = options;
  const c = document.createElement("canvas");
  const ctx = c.getContext("2d");

  const actualWidth = (frame as HTMLVideoElement).videoWidth ?? frame.width;
  const actualHeight = (frame as HTMLVideoElement).videoHeight ?? frame.height;

  c.width = actualWidth;
  c.height = actualHeight;

  if (scaleMode === "scaleFill") {
    c.width = maxWidth || actualWidth;
    c.height = maxHeight || actualHeight;
  }

  if (scaleMode === "aspectFit") {
    if (actualWidth > actualHeight) {
      const aspect = actualHeight / actualWidth;
      const finalWidth = Math.min(actualWidth, maxWidth);
      const finalHeight = finalWidth * aspect;
      c.width = finalWidth;
      c.height = finalHeight;
    } else {
      const aspect = actualWidth / actualHeight;
      const finalHeight = Math.min(actualHeight, maxHeight);
      const finalWidth = finalHeight * aspect;
      c.width = finalWidth;
      c.height = finalHeight;
    }
  }

  if (ctx) {
    ctx.drawImage(frame, 0, 0, c.width, c.height);
  }

  return c;
}
