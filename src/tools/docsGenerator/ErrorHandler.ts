export enum ErrorLevel {
  Fatal,
  NonFatal
}

export type ErrorHandler = (message: any, errorLevel?: ErrorLevel) => void;
