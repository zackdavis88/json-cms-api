import { BlueprintField } from '..';

interface DefaultBlueprintFields {
  fields: BlueprintField[];
}

export const defaultBlueprintFields: DefaultBlueprintFields = {
  fields: [
    {
      type: 'STRING',
      name: 'stringField',
    },
    {
      type: 'ARRAY',
      name: 'arrayField',
      arrayOf: {
        type: 'OBJECT',
        name: 'arrayField_objectField',
        fields: [
          {
            type: 'STRING',
            name: 'arrayField_objectField_stringField',
          },
          {
            type: 'NUMBER',
            name: 'arrayField_objectField_numberField',
          },
        ],
      },
    },
    {
      type: 'OBJECT',
      name: 'objectField',
      fields: [
        {
          type: 'BOOLEAN',
          name: 'objectField_booleanField',
        },
        {
          type: 'DATE',
          name: 'objectField_dateField',
        },
      ],
    },
    {
      type: 'BOOLEAN',
      name: 'booleanField',
    },
    {
      type: 'DATE',
      name: 'dateField',
    },
    {
      type: 'NUMBER',
      name: 'numberField',
    },
  ],
};
