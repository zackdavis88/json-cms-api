/* eslint-disable @typescript-eslint/no-explicit-any */
import { BlueprintField, isMissing, compareType } from '../../utils';
import { reduceContent, ReduceContentOutput } from './reduce_content';

type ValidateContent = (
  content: { [key: string | number]: any },
  blueprintFields: BlueprintField[],
  isRequired?: boolean,
) => Promise<ReduceContentOutput>;
export const validateContent: ValidateContent = (
  content,
  blueprintFields,
  isRequired = true,
) =>
  new Promise((resolve) => {
    if (isMissing(content) && !isRequired) {
      return resolve({});
    } else if (isMissing(content) && isRequired) {
      return resolve({ error: 'content is missing from input' });
    }

    if (!compareType(content, 'object') || Array.isArray(content)) {
      return resolve({
        error:
          'content must be an object of key/values following the component blueprint',
      });
    }

    resolve(reduceContent(content, blueprintFields));
  });
