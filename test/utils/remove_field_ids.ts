import { BlueprintField } from './index';

type RemoveFieldIds = (fields: BlueprintField[]) => BlueprintField[];
export const removeFieldIds: RemoveFieldIds = (fields) => {
  return fields.map((field) => {
    delete field.id;
    if (field.type === 'ARRAY') {
      return { ...field, arrayOf: removeFieldIds([field.arrayOf])[0] };
    } else if (field.type === 'OBJECT') {
      return { ...field, fields: removeFieldIds(field.fields) };
    }
    return { ...field };
  });
};
