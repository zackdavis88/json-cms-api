import mongoose from 'mongoose';

export interface FragmentTypes {
  name: string;
  isActive: boolean;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  content: any;
  createdOn: Date;
  updatedOn: Date;
  deletedOn: Date;
  createdBy: mongoose.Types.ObjectId;
  updatedBy: mongoose.Types.ObjectId;
  deletedBy: mongoose.Types.ObjectId;
}

const FragmentSchema = new mongoose.Schema<FragmentTypes>({
  name: String,
  isActive: Boolean,
  content: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Component' }],
  createdOn: Date,
  updatedOn: Date,
  deletedOn: Date,
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  updatedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  deletedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
});

export default mongoose.model<FragmentTypes>('Fragment', FragmentSchema);
export interface FragmentInstance extends FragmentTypes, mongoose.Document {}
