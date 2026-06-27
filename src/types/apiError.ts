export interface ApiFieldErrors {
  [field: string]: string;
}

export interface ApiError {
  status: number;
  message: string;
  errors?: ApiFieldErrors;
}

export class AppError extends Error {
  status: number;
  errors?: ApiFieldErrors;
  isNetworkError: boolean;

  constructor(message: string, status = 0, errors?: ApiFieldErrors, isNetworkError = false) {
    super(message);
    this.status = status;
    this.errors = errors;
    this.isNetworkError = isNetworkError;
  }
}