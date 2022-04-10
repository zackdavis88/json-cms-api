import mongoose from 'mongoose';

export interface UserTypes {
  username: string;
  displayName: string;
  hash: string;
  apiKey: string;
  isActive: boolean;
  createdOn: Date;
  updatedOn?: Date;
  deletedOn?: Date;
}

const UserSchema = new mongoose.Schema<UserTypes>({
  username: { type: String, unique: true },
  displayName: String,
  hash: String,
  apiKey: String,
  isActive: Boolean,
  createdOn: Date,
  updatedOn: Date,
  deletedOn: Date,
});

export default mongoose.model<UserTypes>('User', UserSchema);
export interface UserInstance extends UserTypes, mongoose.Document {}
