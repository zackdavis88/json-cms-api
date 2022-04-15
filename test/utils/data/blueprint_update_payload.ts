export const blueprintUpdatePayload = {
  name: 'unit-test-blueprint-updated',
  fields: [
    {
      type: 'STRING',
      name: 'stringField',
    },
    {
      type: 'OBJECT',
      name: 'styles',
      fields: [
        {
          name: 'lg',
          type: 'ARRAY',
          arrayOf: {
            name: 'breakpoint-style',
            type: 'OBJECT',
            fields: [
              {
                name: 'property',
                type: 'STRING',
              },
              {
                name: 'value',
                type: 'STRING',
              },
            ],
          },
        },
        {
          name: 'md',
          type: 'ARRAY',
          arrayOf: {
            name: 'breakpoint-style',
            type: 'OBJECT',
            fields: [
              {
                name: 'property',
                type: 'STRING',
              },
              {
                name: 'value',
                type: 'STRING',
              },
            ],
          },
        },
        {
          name: 'sm',
          type: 'ARRAY',
          arrayOf: {
            name: 'breakpoint-style',
            type: 'OBJECT',
            fields: [
              {
                name: 'property',
                type: 'STRING',
              },
              {
                name: 'value',
                type: 'STRING',
              },
            ],
          },
        },
        {
          name: 'random-boolean',
          type: 'BOOLEAN',
        },
      ],
    },
    {
      name: 'some-date',
      type: 'DATE',
    },
    {
      name: 'another-object',
      type: 'OBJECT',
      fields: [
        {
          name: 'another-date',
          type: 'DATE',
        },
        {
          name: 'a-number',
          type: 'NUMBER',
        },
      ],
    },
  ],
};
