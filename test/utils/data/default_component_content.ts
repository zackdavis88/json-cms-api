export const defaultComponentContent = {
  stringField: 'test_string',
  arrayField: [
    {
      arrayNestedStringField: 'this is another string',
      arrayNestedNumberField: 55,
    },
    {
      arrayNestedStringField: 'string again',
      arrayNestedNumberField: 1,
    },
    {
      arrayNestedStringField: 'string again again',
      arrayNestedNumberField: 789,
    },
    {
      arrayNestedStringField: 'string number four in the array',
      arrayNestedNumberField: 100,
    },
  ],
  objectField: {
    nestedBooleanField: true,
    nestedDateField: new Date().toString(),
  },
  booleanField: false,
  dateField: new Date().toString(),
  numberField: 25,
};
