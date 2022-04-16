/* eslint-disable @typescript-eslint/no-explicit-any */
import { BlueprintField } from '../../utils';
import { reduceContent, ReduceContentOutput } from './reduce_content';

type ValidateContent = (
  content: { [key: string | number]: any },
  blueprintFields: BlueprintField[],
) => Promise<ReduceContentOutput>;
export const validateContent: ValidateContent = (content, blueprintFields) =>
  new Promise((resolve) => {
    resolve(reduceContent(content, blueprintFields));
  });
