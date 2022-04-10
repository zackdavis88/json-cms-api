import mongoose from 'mongoose';
import { User, UserInstance } from '../../models';

export type ValidationError = mongoose.NativeError | string;

export type ModelTypes = typeof User; // TODO: Add more models here as they are created.

export type ModelInstanceTypes = UserInstance; // TODO: add more model instances here as they are created.

export interface QueryArgs {
  [key: string]: unknown;
}

export interface Options {
  populate?: {
    [key: string]: string;
  };
}

export interface QueryString {
  [key: string]: string;
}

export interface PaginationData {
  page: number;
  totalItems: number;
  totalPages: number;
  itemsPerPage: number;
  pageOffset: number;
}

export interface TokenData {
  _id: mongoose.Types.ObjectId;
  apiKey: string;
}

type FieldTypes = 'STRING' | 'NUMBER' | 'BOOLEAN' | 'DATE' | 'ARRAY' | 'OBJECT';
export interface BlueprintField {
  id: mongoose.Types.ObjectId;
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
