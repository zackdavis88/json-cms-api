type CompareType = (inputValue: unknown, expectedType: string) => boolean;

export const compareType: CompareType = (inputValue, expectedType) => {
  const inputType = Object.prototype.toString.call(inputValue);
  expectedType = `[object ${expectedType}]`;
  return inputType.toLowerCase() === expectedType.toLowerCase();
};
