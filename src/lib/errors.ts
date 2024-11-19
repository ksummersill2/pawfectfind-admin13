export class OpenAIError extends Error {
  constructor(
    message: string,
    public status?: number,
    public response?: any
  ) {
    super(message);
    this.name = 'OpenAIError';

    // Ensure proper stack trace
    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, OpenAIError);
    }
  }
}