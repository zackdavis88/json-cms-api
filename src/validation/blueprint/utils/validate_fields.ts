import { isMissing, BlueprintField } from '../../utils';
import { reduceFields } from './reduce_fields';

interface ValidateFieldsOutput {
  error?: string;
  sanitizedFields?: BlueprintField[];
}

type ValidateFields = (
  /* eslint-disable-next-line @typescript-eslint/no-explicit-any */
  fields: any,
  isRequired?: boolean,
) => Promise<ValidateFieldsOutput>;

export const validateFields: ValidateFields = (fields, isRequired = true) =>
  new Promise((resolve) => {
    if (isMissing(fields) && !isRequired) {
      return resolve({});
    } else if (isMissing(fields) && isRequired) {
      return resolve({ error: 'fields is missing from input' });
    }

    if (!Array.isArray(fields)) {
      return resolve({ error: 'fields must be an array of field objects' });
    }

    if (!fields.length) {
      return resolve({ error: 'fields must contain at least 1 field object' });
    }

    const { error, fields: sanitizedFields } = reduceFields(fields);
    if (error) {
      return resolve({ error });
    }

    resolve({ sanitizedFields });
  });
