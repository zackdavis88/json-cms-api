import mongoose from 'mongoose';

type FieldTypes = 'STRING' | 'NUMBER' | 'BOOLEAN' | 'DATE' | 'ARRAY' | 'OBJECT';

export interface BlueprintField {
  _id?: mongoose.Types.ObjectId;
  type: FieldTypes;
  name: string;
  isRequired?: boolean;
  isInteger?: boolean;
  regex?: string;
  min?: number;
  max?: number;
  arrayOf?: BlueprintField;
  fields?: BlueprintField[];
}

export interface BlueprintTypes {
  name: string;
  isActive: boolean;
  createdOn: Date;
  updatedOn?: Date;
  deletedOn?: Date;
  createdBy: mongoose.Schema.Types.ObjectId;
  updatedBy?: mongoose.Schema.Types.ObjectId;
  deletedBy?: mongoose.Schema.Types.ObjectId;
  fields: BlueprintField[];
}

const FieldSchema = new mongoose.Schema<BlueprintField>(
  {
    _id: mongoose.Types.ObjectId,
    type: String,
    name: String,
    isRequired: Boolean,
    isInteger: Boolean,
    regex: String,
    min: Number,
    max: Number,
    arrayOf: this,
    fields: [this],
  },
  { _id: false },
);

const BlueprintSchema = new mongoose.Schema<BlueprintTypes>({
  name: String,
  isActive: Boolean,
  createdOn: Date,
  updatedOn: Date,
  deletedOn: Date,
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  updatedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  deletedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  fields: [FieldSchema],
});

export default mongoose.model<BlueprintTypes>('Blueprint', BlueprintSchema);
export interface BlueprintInstance extends BlueprintTypes, mongoose.Document {}
