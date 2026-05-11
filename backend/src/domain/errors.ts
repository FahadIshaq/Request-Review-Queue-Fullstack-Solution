export class DomainError extends Error {
  public readonly code: string;
  public readonly httpStatus: number;

  constructor(code: string, message: string, httpStatus = 422) {
    super(message);
    this.name = "DomainError";
    this.code = code;
    this.httpStatus = httpStatus;
  }
}

export class NotFoundError extends Error {
  public readonly code = "not_found";
  public readonly httpStatus = 404;

  constructor(message: string) {
    super(message);
    this.name = "NotFoundError";
  }
}
