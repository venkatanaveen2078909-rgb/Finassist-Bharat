export class GnaniError extends Error {
  constructor(message, { stage, statusCode = null, errorType = "GNANI_ERROR", cause = null } = {}) {
    super(message);
    this.name = "GnaniError";
    this.stage = stage; // "STT" | "TTS"
    this.statusCode = statusCode;
    this.errorType = errorType;
    this.cause = cause;
  }
}

export class GnaniAuthError extends GnaniError {
  constructor(message, details = {}) {
    super(message, { ...details, errorType: "AUTH_ERROR" });
    this.name = "GnaniAuthError";
  }
}

export class GnaniRateLimitError extends GnaniError {
  constructor(message, details = {}) {
    super(message, { ...details, errorType: "RATE_LIMIT_ERROR" });
    this.name = "GnaniRateLimitError";
  }
}

export class GnaniInvalidInputError extends GnaniError {
  constructor(message, details = {}) {
    super(message, { ...details, errorType: "INVALID_INPUT_ERROR" });
    this.name = "GnaniInvalidInputError";
  }
}

export class GnaniTimeoutError extends GnaniError {
  constructor(message, details = {}) {
    super(message, { ...details, errorType: "TIMEOUT_ERROR" });
    this.name = "GnaniTimeoutError";
  }
}

export class GnaniNetworkError extends GnaniError {
  constructor(message, details = {}) {
    super(message, { ...details, errorType: "NETWORK_ERROR" });
    this.name = "GnaniNetworkError";
  }
}
