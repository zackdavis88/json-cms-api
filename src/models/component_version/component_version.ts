import mongoose from 'mongoose';

interface ComponentVersionTypes {
  name: string;
  componentId: mongoose.Types.ObjectId;
  version: number;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  content: any;
  createdOn: Date;
  createdBy: mongoose.Types.ObjectId;
}

const ComponentVersionSchema = new mongoose.Schema<ComponentVersionTypes>({
  name: String,
  componentId: { type: mongoose.Schema.Types.ObjectId, ref: 'Component' },
  content: mongoose.Schema.Types.Mixed,
  version: Number,
  createdOn: Date,
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
});

export default mongoose.model<ComponentVersionTypes>(
  'ComponentVersion',
  ComponentVersionSchema,
);

export interface ComponentVersionInstance
  extends ComponentVersionTypes,
    mongoose.Document {}
