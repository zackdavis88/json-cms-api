import { isMissing, compareType, BlueprintField } from '../../utils';
import mongoose from 'mongoose';

interface ReduceFieldsOutput {
  error?: string;
  fields?: BlueprintField[];
}

/* eslint-disable-next-line @typescript-eslint/no-explicit-any */
type ReduceFields = (fields: any[], fieldName?: string) => ReduceFieldsOutput;

const FIELD_TYPES = {
  STRING: 'STRING',
  NUMBER: 'NUMBER',
  BOOLEAN: 'BOOLEAN',
  DATE: 'DATE',
  ARRAY: 'ARRAY',
  OBJECT: 'OBJECT',
};

export const reduceFields: ReduceFields = (fields, fieldName) => {
  /*
    This recursive method is responsible for:
      1. Validating the fields array contains no items with duplicate names.
      2. Validating each of the fields array items.
  */
  const fieldNames = fields.map((field) => field.name || '');
  let duplicateFieldName = '';
  const hasDuplicate = fieldNames.some((fieldName) => {
    const isDuplicate =
      fieldNames.indexOf(fieldName) !== fieldNames.lastIndexOf(fieldName);
    if (isDuplicate) {
      duplicateFieldName = fieldName;
    }
    return isDuplicate;
  });

  if (hasDuplicate) {
    return {
      error: `${
        fieldName || 'blueprint'
      } fields contains duplicate name value: ${duplicateFieldName}`,
    };
  }

  return fields.reduce<ReduceFieldsOutput>(
    (prev, field) => {
      // Bail on validation if we found an error.
      if (prev.error) {
        return prev;
      }

      if (!compareType(field, 'object') || Array.isArray(field)) {
        return {
          ...prev,
          error: `${
            fieldName || 'blueprint'
          } fields contains a value that is not an object`,
        };
      }

      const {
        type,
        name,
        isRequired,
        isInteger,
        regex,
        min,
        max,
        arrayOf,
        fields: childrenFields,
      } = field;

      if (isMissing(type)) {
        return {
          ...prev,
          error: `${fieldName || 'blueprint'} field object type is missing`,
        };
      }

      if (!compareType(type, 'string')) {
        return {
          ...prev,
          error: `${fieldName || 'blueprint'} field object type must be a string`,
        };
      }

      if (Object.keys(FIELD_TYPES).indexOf(type.toUpperCase()) === -1) {
        return {
          ...prev,
          error: `${fieldName || 'blueprint'} field object type is invalid`,
        };
      }

      if (isMissing(name)) {
        return {
          ...prev,
          error: `${fieldName || 'blueprint'} field object name is missing`,
        };
      }

      if (!compareType(name, 'string')) {
        return {
          ...prev,
          error: `${fieldName || 'blueprint'} field object name must be a string`,
        };
      }

      if (name.length < 1 || name.length > 100) {
        return {
          ...prev,
          error: `${
            fieldName || 'blueprint'
          } field object name must be 1 - 100 characters in length`,
        };
      }

      // eslint-disable-next-line quotes
      const nameRegex = new RegExp("^[A-Za-z0-9-_+=&^%$#*@!|(){}?.,<>;': ]+$");
      if (!nameRegex.test(name)) {
        return {
          ...prev,
          error: `${
            fieldName || 'blueprint'
          } field object name contains invalid characters`,
        };
      }

      if (!isMissing(isRequired) && !compareType(isRequired, 'boolean')) {
        return {
          ...prev,
          error: `${fieldName || 'blueprint'} field object isRequired must be a boolean`,
        };
      }

      if (!isMissing(isInteger) && !compareType(isInteger, 'boolean')) {
        return {
          ...prev,
          error: `${fieldName || 'blueprint'} field object isInteger must be a boolean`,
        };
      }

      if (!isMissing(regex) && !compareType(regex, 'string')) {
        return {
          ...prev,
          error: `${fieldName || 'blueprint'} field object regex must be a string`,
        };
      }

      if (!isMissing(min) && !compareType(min, 'number')) {
        return {
          ...prev,
          error: `${fieldName || 'blueprint'} field object min must be a number`,
        };
      }

      if (!isMissing(max) && !compareType(max, 'number')) {
        return {
          ...prev,
          error: `${fieldName || 'blueprint'} field object max must be a number`,
        };
      }

      if (type.toUpperCase() === FIELD_TYPES.ARRAY) {
        if (isMissing(arrayOf)) {
          return {
            ...prev,
            error: `${
              fieldName || 'blueprint'
            } field object contains an array-type without arrayOf`,
          };
        }

        if (!compareType(arrayOf, 'object') || Array.isArray(arrayOf)) {
          return {
            ...prev,
            error: `${
              fieldName || 'blueprint'
            } field object arrayOf must be a field object`,
          };
        }

        if (
          arrayOf.type &&
          typeof arrayOf.type === 'string' &&
          arrayOf.type === FIELD_TYPES.ARRAY
        ) {
          return {
            ...prev,
            error: `${
              fieldName || 'blueprint'
            } field object arrayOf can not contain an array-type`,
          };
        }

        const { error, fields: reducedFields } = reduceFields([arrayOf], name);
        if (error) {
          return { ...prev, error };
        }

        return {
          ...prev,
          fields: prev.fields.concat({
            id: new mongoose.Types.ObjectId(),
            type,
            name,
            isRequired: typeof isRequired === 'boolean' ? isRequired : undefined,
            min: typeof min === 'number' ? min : undefined,
            max: typeof max === 'number' ? max : undefined,
            arrayOf: reducedFields[0],
          }),
        };
      } else if (type.toUpperCase() === FIELD_TYPES.OBJECT) {
        if (isMissing(childrenFields)) {
          return {
            ...prev,
            error: `${
              fieldName || 'blueprint'
            } field object contains an object-type without fields`,
          };
        }

        if (!Array.isArray(childrenFields)) {
          return {
            ...prev,
            error: `${
              fieldName || 'blueprint'
            } field object fields must be an array of field objects`,
          };
        }

        if (!childrenFields.length) {
          return {
            ...prev,
            error: `${
              fieldName || 'blueprint'
            } field object contains an object-type with an empty fields array`,
          };
        }

        const { error, fields: reducedChildrenFields } = reduceFields(
          childrenFields,
          name,
        );
        if (error) {
          return { ...prev, error };
        }

        return {
          ...prev,
          fields: prev.fields.concat({
            id: new mongoose.Types.ObjectId(),
            type,
            name,
            isRequired: typeof isRequired === 'boolean' ? isRequired : undefined,
            fields: reducedChildrenFields,
          }),
        };
      }

      return {
        ...prev,
        fields: prev.fields.concat({
          id: new mongoose.Types.ObjectId(),
          type,
          name,
          isRequired: typeof isRequired === 'boolean' ? isRequired : undefined,
          isInteger: typeof isInteger === 'boolean' ? isInteger : undefined,
          regex: typeof regex === 'string' ? regex : undefined,
          min: typeof min === 'number' ? min : undefined,
          max: typeof max === 'number' ? max : undefined,
        }),
      };
    },
    { error: '', fields: [] },
  );
};
