const NULL_TYPE = Object.prototype.toString.call(null);
const UNDEFINED_TYPE = Object.prototype.toString.call(undefined);

type IsMissing = (inputValue: unknown) => boolean;
export const isMissing: IsMissing = (inputValue) => {
  const inputType = Object.prototype.toString.call(inputValue);
  return (
    inputType.toLowerCase() === NULL_TYPE.toLowerCase() ||
    inputType.toLowerCase() === UNDEFINED_TYPE.toLowerCase()
  );
};
