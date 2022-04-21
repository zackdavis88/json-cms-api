import mongoose from 'mongoose';
import { BlueprintField } from '../blueprint';

export interface BlueprintVersionTypes {
  name: string;
  blueprintId: mongoose.Types.ObjectId;
  version: number;
  fields: BlueprintField[];
  createdOn: Date;
  createdBy: mongoose.Types.ObjectId;
}

// This is duplicate code but exporting mongoose Schemas causes the app to crash.
const FieldSchema = new mongoose.Schema<BlueprintField>(
  {
    id: mongoose.Types.ObjectId,
    type: String,
    name: String,
    isRequired: Boolean,
    isInteger: Boolean,
    regex: String,
    min: Number,
    max: Number,
    arrayOf: this,
    fields: { type: [this], default: undefined },
  },
  { _id: false },
);

const BlueprintVersionSchema = new mongoose.Schema<BlueprintVersionTypes>({
  name: String,
  blueprintId: { type: mongoose.Schema.Types.ObjectId, ref: 'Blueprint' },
  fields: [FieldSchema],
  version: Number,
  createdOn: Date,
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
});

export default mongoose.model<BlueprintVersionTypes>(
  'BlueprintVersion',
  BlueprintVersionSchema,
);

export interface BlueprintVersionInstance
  extends BlueprintVersionTypes,
    mongoose.Document {}
