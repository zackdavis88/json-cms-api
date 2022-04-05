import mongoose from 'mongoose';

interface User {
  username: string;
  displayName: string;
  hash: string;
  apiKey: string;
  isActive: boolean;
  createdOn: Date;
  updatedOn?: Date;
  deletedOn?: Date;
}

const userSchema = new mongoose.Schema<User>({
  username: { type: String, unique: true },
  displayName: String,
  hash: String,
  apiKey: String,
  isActive: Boolean,
  createdOn: Date,
  updatedOn: Date,
  deletedOn: Date,
});

export default mongoose.model<User>('User', userSchema);
export interface UserInstance extends User, mongoose.Document {}
