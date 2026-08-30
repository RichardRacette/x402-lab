export type EvidenceErrorCode =
  | "INVALID_INPUT"
  | "URL_NOT_PUBLIC"
  | "FETCH_TIMEOUT"
  | "FETCH_FAILED"
  | "TOO_MANY_REDIRECTS"
  | "SOURCE_TOO_LARGE"
  | "UNSUPPORTED_CONTENT_TYPE"
  | "NO_READABLE_CONTENT"
  | "PROVIDER_NOT_CONFIGURED"
  | "PROVIDER_FAILED"
  | "PROVIDER_RESPONSE_INVALID";

const STATUS_BY_CODE: Record<EvidenceErrorCode, number> = {
  INVALID_INPUT: 400,
  URL_NOT_PUBLIC: 400,
  FETCH_TIMEOUT: 504,
  FETCH_FAILED: 502,
  TOO_MANY_REDIRECTS: 502,
  SOURCE_TOO_LARGE: 413,
  UNSUPPORTED_CONTENT_TYPE: 415,
  NO_READABLE_CONTENT: 422,
  PROVIDER_NOT_CONFIGURED: 503,
  PROVIDER_FAILED: 502,
  PROVIDER_RESPONSE_INVALID: 502
};


export class EvidenceSliceError extends Error {
  readonly code: EvidenceErrorCode;
  readonly retryable: boolean;
  readonly status: number;

  constructor(
    code: EvidenceErrorCode,
    message: string,
    retryable = false
  ) {
    super(message);
    this.name = "EvidenceSliceError";
    this.code = code;
    this.retryable = retryable;
    this.status = STATUS_BY_CODE[code];
  }
}
