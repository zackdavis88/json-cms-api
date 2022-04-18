/* eslint-disable @typescript-eslint/no-explicit-any */
import { BlueprintField } from '../../../models';
import {
  validateStringContent,
  validateBooleanContent,
  validateDateContent,
  validateNumberContent,
} from './validate_field_content';
import { reduceContent } from './reduce_content';

interface ReduceArrayContentOutput {
  error?: string;
  sanitizedArray?: any[];
}

type ReduceArrayContent = (
  arrayContent: any[],
  arrayOf: BlueprintField,
  fieldName: string,
) => ReduceArrayContentOutput;

export const reduceArrayContent: ReduceArrayContent = (
  arrayContent,
  arrayOf,
  fieldName,
) => {
  return arrayContent.reduce(
    (prev, arrayField) => {
      if (prev.error) {
        return prev;
      }

      const { type, fields, regex, min, max, isInteger } = arrayOf;
      if (type === 'STRING') {
        const error = validateStringContent(arrayField, 'item', `${fieldName} array`, {
          regex,
          min,
          max,
        });

        if (error) {
          return { error };
        }

        return { ...prev, sanitizedArray: [...prev.sanitizedArray, arrayField] };
      } else if (type === 'BOOLEAN') {
        const error = validateBooleanContent(arrayField, 'item', `${fieldName} array`);

        if (error) {
          return { error };
        }

        return { ...prev, sanitizedArray: [...prev.sanitizedArray, arrayField] };
      } else if (type === 'NUMBER') {
        const error = validateNumberContent(arrayField, 'item', `${fieldName} array`, {
          isInteger,
          min,
          max,
        });

        if (error) {
          return { error };
        }

        return { ...prev, sanitizedArray: [...prev.sanitizedArray, arrayField] };
      } else if (type === 'DATE') {
        const error = validateDateContent(arrayField, 'item', `${fieldName} array`);

        if (error) {
          return { error };
        }

        return { ...prev, sanitizedArray: [...prev.sanitizedArray, arrayField] };
      } else if (type === 'OBJECT') {
        const { error, sanitizedContent } = reduceContent(arrayField, fields, fieldName);

        if (error) {
          return { error };
        }

        return { ...prev, sanitizedArray: [...prev.sanitizedArray, sanitizedContent] };
      }
    },
    { error: '', sanitizedArray: [] },
  );
};
