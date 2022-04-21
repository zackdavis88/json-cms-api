import mongoose from 'mongoose';

export interface LayoutTypes {
  name: string;
  isActive: boolean;
  components: mongoose.Types.ObjectId[];
  createdOn: Date;
  updatedOn: Date;
  deletedOn: Date;
  createdBy: mongoose.Types.ObjectId;
  updatedBy: mongoose.Types.ObjectId;
  deletedBy: mongoose.Types.ObjectId;
}

const LayoutSchema = new mongoose.Schema<LayoutTypes>({
  name: String,
  isActive: Boolean,
  components: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Component' }],
  createdOn: Date,
  updatedOn: Date,
  deletedOn: Date,
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  updatedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  deletedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
});

export default mongoose.model<LayoutTypes>('Layout', LayoutSchema);
export interface LayoutInstance extends LayoutTypes, mongoose.Document {}
