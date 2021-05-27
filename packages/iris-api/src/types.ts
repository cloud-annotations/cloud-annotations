export interface PathParams {
  [key: string]: string | undefined;
}

export interface QueryParams {
  [key: string]: string | undefined;
}

export interface Headers {
  [key: string]: string | undefined;
}

export interface EndpointOptions {
  baseUrl?: string;
  path?: PathParams;
  query?: QueryParams;
}

export interface MethodOptions extends EndpointOptions {
  headers?: Headers;
  body?:
    | string
    | URLSearchParams
    | FormData
    | Blob
    | ArrayBufferView
    | ArrayBuffer
    | ReadableStream<Uint8Array>;
  json?: any;
  signal?: AbortSignal;
}

export interface APIOptions extends MethodOptions {
  method: string;
}

export interface HttpError extends Error {
  status: number;
}
