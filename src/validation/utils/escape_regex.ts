// Stolen from stackoverflow. Escapes special characters in a string before performing a Mongoose regex search.
// https://stackoverflow.com/questions/3561493/is-there-a-regexp-escape-function-in-javascript/3561711#3561711
type EscapeRegex = (stringValue: string) => string;
export const escapeRegex: EscapeRegex = (stringValue) => {
  return stringValue.replace(/[-/\\^$*+?.()|[\]{}]/g, '\\$&');
};
