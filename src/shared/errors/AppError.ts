/** Error surfaced to the presentation layer, carrying the backend error code. */
export class AppError extends Error {
  readonly code: string;
  readonly statusCode?: number;

  constructor(code: string, message: string, statusCode?: number) {
    super(message);
    this.name = 'AppError';
    this.code = code;
    this.statusCode = statusCode;
  }
}
