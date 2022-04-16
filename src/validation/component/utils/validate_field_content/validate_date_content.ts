/*
  fieldType DATE

  Dates must be valid timestamps strings.
*/
type ValidateDateContent = (
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  contentValue: any,
  fieldName: string,
  parentFieldName: string,
) => void | string;
export const validateDateContent: ValidateDateContent = (
  contentValue,
  fieldName,
  parentFieldName,
) => {
  if (typeof contentValue !== 'string') {
    return `${parentFieldName} field ${fieldName} must be an ISO timestamp string`;
  }

  const dateObject = new Date(contentValue);
  if (dateObject.toString() === 'Invalid Date') {
    return `${parentFieldName} field ${fieldName} must be a valid ISO timestamp string`;
  }
  return;
};
