import { isMissing, BlueprintField } from '../../utils';
import { reduceArrayContent } from './reduce_array_content';
import {
  validateStringContent,
  validateBooleanContent,
  validateNumberContent,
  validateDateContent,
} from './validate_field_content';

export interface ReduceContentOutput {
  error?: string;
  sanitizedContent?: unknown;
}

type ReduceContent = (
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  content: { [key: string | number]: any },
  blueprintFields: BlueprintField[],
  parentFieldName?: string,
) => ReduceContentOutput;
export const reduceContent: ReduceContent = (
  content,
  blueprintFields,
  parentFieldName = '',
) => {
  return blueprintFields.reduce(
    (prev, { name, type, fields: childrenFields, arrayOf, ...options }) => {
      if (prev.error) {
        return prev;
      }

      const fieldName = name;
      const fieldType = type;
      const contentValue = content[fieldName];

      if (options.isRequired && isMissing(contentValue)) {
        return {
          error: `${
            parentFieldName || 'content'
          } field ${fieldName} is a required ${fieldType.toLowerCase()}`,
        };
      } else if (!options.isRequired && isMissing(contentValue)) {
        return prev;
      }

      if (fieldType === 'STRING') {
        const error = validateStringContent(
          contentValue,
          fieldName,
          parentFieldName || 'content',
          options,
        );
        if (error) {
          return { error };
        }
        return {
          ...prev,
          sanitizedContent: { ...prev.sanitizedContent, [fieldName]: contentValue },
        };
      } else if (fieldType === 'BOOLEAN') {
        const error = validateBooleanContent(
          contentValue,
          fieldName,
          parentFieldName || 'content',
        );
        if (error) {
          return { error };
        }

        return {
          ...prev,
          sanitizedContent: { ...prev.sanitizedContent, [fieldName]: contentValue },
        };
      } else if (fieldType === 'NUMBER') {
        const error = validateNumberContent(
          contentValue,
          fieldName,
          parentFieldName || 'content',
          options,
        );
        if (error) {
          return { error };
        }

        return {
          ...prev,
          sanitizedContent: { ...prev.sanitizedContent, [fieldName]: contentValue },
        };
      } else if (fieldType === 'DATE') {
        const error = validateDateContent(
          contentValue,
          fieldName,
          parentFieldName || 'content',
        );
        if (error) {
          return { error };
        }

        return {
          ...prev,
          sanitizedContent: { ...prev.sanitizedContent, [fieldName]: contentValue },
        };
      } else if (fieldType === 'OBJECT') {
        /*
        fieldType OBJECT

        Objects have no additional options to validate against but they must have their children fields validated.
      */
        if (typeof contentValue !== 'object' || Array.isArray(contentValue)) {
          return {
            error: `${parentFieldName || 'content'} field ${fieldName} must be an object`,
          };
        }

        const { error: childFieldsError, sanitizedContent } = reduceContent(
          contentValue,
          childrenFields,
          fieldName,
        );
        if (childFieldsError) {
          return { error: childFieldsError };
        }

        return {
          ...prev,
          sanitizedContent: { ...prev.sanitizedContent, [fieldName]: sanitizedContent },
        };
      } else if (fieldType === 'ARRAY') {
        if (!Array.isArray(contentValue)) {
          return {
            error: `${parentFieldName || 'content'} field ${fieldName} must be an array`,
          };
        }

        if (typeof options.min === 'number' && contentValue.length < options.min) {
          return {
            error: `${
              parentFieldName || 'content'
            } field ${fieldName} must have a minimum length of ${options.min}`,
          };
        }

        if (typeof options.max === 'number' && contentValue.length > options.max) {
          return {
            error: `${
              parentFieldName || 'content'
            } field ${fieldName} must have a maximum length of ${options.max}`,
          };
        }

        const { error, sanitizedArray } = reduceArrayContent(
          contentValue,
          arrayOf,
          fieldName,
        );

        if (error) {
          return { error };
        }

        return {
          ...prev,
          sanitizedContent: { ...prev.sanitizedContent, [fieldName]: sanitizedArray },
        };
      }

      // We shouldnt be hitting this condition unless a blueprint has a fieldType that is not valid..but just incase...
      return prev;
    },
    { error: '', sanitizedContent: {} },
  );
};
