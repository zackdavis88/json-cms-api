/*
  fieldType BOOLEAN

  Booleans have no additional options to validate against.
*/
type ValidateBooleanContent = (
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  contentValue: any,
  fieldName: string,
  parentFieldName: string,
) => void | string;
export const validateBooleanContent: ValidateBooleanContent = (
  contentValue,
  fieldName,
  parentFieldName,
) => {
  if (typeof contentValue !== 'boolean') {
    return `${parentFieldName} field ${fieldName} must be a boolean`;
  }

  return;
};
