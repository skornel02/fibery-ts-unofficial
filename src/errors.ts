import { FiberyCommandExecutionError, FiberyErrorResult } from "./types";

export class APIError extends Error {
  public status: number;
  public payload: string;

  constructor(
    message: string,
    options: ErrorOptions & { status: number; payload: string },
  ) {
    super(message, options);
    this.name = "APIError";
    this.status = options.status;
    this.payload = options.payload;
  }
}

export class FiberyCommandError extends Error {
  public errors: FiberyCommandExecutionError[];

  constructor(
    message: string,
    options: ErrorOptions & { errors: FiberyCommandExecutionError[] },
  ) {
    const errorMessages = options.errors
      .map((error, i) => {
        const { command, error: err } = error;
        return `Command[${i}]: ${command.command} failed with error: ${err.name} - ${err.message}`;
      })
      .join("\n");

    super(`${message}\n${errorMessages}`, options);
    this.name = "FiberyError";
    this.errors = options.errors;
  }
}
