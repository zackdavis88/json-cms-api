import { BlueprintField } from '..';

interface DefaultBlueprintFields {
  fields: BlueprintField[];
}

export const defaultBlueprintFields: DefaultBlueprintFields = {
  fields: [
    {
      type: 'STRING',
      name: 'stringField',
      isRequired: true,
      regex: '^test',
    },
    {
      type: 'ARRAY',
      name: 'arrayField',
      min: 1,
      max: 5,
      arrayOf: {
        type: 'OBJECT',
        name: 'arrayField_objectField',
        fields: [
          {
            type: 'STRING',
            name: 'arrayNestedStringField',
            min: 1,
            max: 50,
          },
          {
            type: 'NUMBER',
            name: 'arrayNestedNumberField',
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
          name: 'nestedBooleanField',
        },
        {
          type: 'DATE',
          name: 'nestedDateField',
          isRequired: true,
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
      isInteger: true,
      min: 23,
      max: 55,
    },
    {
      type: 'ARRAY',
      name: 'arrayOfStrings',
      arrayOf: {
        type: 'STRING',
        name: 'stringItem',
      },
    },
    {
      type: 'ARRAY',
      name: 'arrayOfBooleans',
      arrayOf: {
        type: 'BOOLEAN',
        name: 'booleanItem',
      },
    },
    {
      type: 'ARRAY',
      name: 'arrayOfNumbers',
      arrayOf: {
        type: 'NUMBER',
        name: 'numberItem',
      },
    },
    {
      type: 'ARRAY',
      name: 'arrayOfDates',
      arrayOf: {
        type: 'DATE',
        name: 'dateItem',
      },
    },
  ],
};
