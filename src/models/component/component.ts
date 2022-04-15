import mongoose from 'mongoose';

export interface ComponentTypes {
  blueprint: mongoose.Types.ObjectId;
  name: string;
  isActive: boolean;
  createdOn: Date;
  updatedOn: Date;
  deletedOn: Date;
  createdBy: mongoose.Types.ObjectId;
  updatedBy: mongoose.Types.ObjectId;
  deletedBy: mongoose.Types.ObjectId;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  content: any;
}

const ComponentSchema = new mongoose.Schema<ComponentTypes>(
  {
    blueprint: { type: mongoose.Schema.Types.ObjectId, ref: 'Blueprint' },
    name: String,
    isActive: Boolean,
    createdOn: Date,
    updatedOn: Date,
    deletedOn: Date,
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    updatedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    deletedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    content: { type: mongoose.Schema.Types.Mixed, default: {} },
  },
  { minimize: false },
);

export default mongoose.model<ComponentTypes>('Component', ComponentSchema);
export interface ComponentInstance extends ComponentTypes, mongoose.Document {}
