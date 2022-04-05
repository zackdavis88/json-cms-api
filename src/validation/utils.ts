import { NativeError } from 'mongoose';

const NULL_TYPE = Object.prototype.toString.call(null);
const UNDEFINED_TYPE = Object.prototype.toString.call(undefined);

export type ValidationError = string | NativeError;

/* eslint-disable-next-line @typescript-eslint/no-explicit-any */
type IsMissing = (inputValue: any) => boolean;
export const isMissing: IsMissing = (inputValue) => {
  const inputType = Object.prototype.toString.call(inputValue);
  return (
    inputType.toLowerCase() === NULL_TYPE.toLowerCase() ||
    inputType.toLowerCase() === UNDEFINED_TYPE.toLowerCase()
  );
};

/* eslint-disable-next-line @typescript-eslint/no-explicit-any */
type CompareType = (inputValue: any, expectedType: string) => boolean;
export const compareType: CompareType = (inputValue, expectedType) => {
  const inputType = Object.prototype.toString.call(inputValue);
  expectedType = `[object ${expectedType}]`;
  return inputType.toLowerCase() === expectedType.toLowerCase();
};
