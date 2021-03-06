import mongoose from 'mongoose';
import {
  BlueprintInstance,
  ComponentInstance,
  UserInstance,
  LayoutInstance,
  FragmentInstance,
} from '../../models';
export type ValidationError = mongoose.NativeError | string;

export type ModelTypes = mongoose.Model<unknown>;

export type ModelInstanceTypes = mongoose.Document<unknown>;

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
  id?: mongoose.Types.ObjectId;
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

interface UserInfo {
  username?: string;
  displayName?: string;
}

export interface PopulatedBlueprintInstance
  extends Omit<BlueprintInstance, 'createdBy' | 'updatedBy'> {
  createdBy?: UserInfo;
  updatedBy?: UserInfo;
}

export interface PopulatedComponentInstance
  extends Omit<ComponentInstance, 'createdBy' | 'updatedBy' | 'blueprint'> {
  createdBy?: UserInstance;
  updatedBy?: UserInstance;
  blueprint: BlueprintInstance;
}

export interface PopulatedLayoutInstance
  extends Omit<LayoutInstance, 'createdBy' | 'updatedBy' | 'components'> {
  createdBy?: UserInstance;
  updatedBy?: UserInstance;
  components?: ComponentInstance[];
}

export interface PopulatedFragmentInstance
  extends Omit<FragmentInstance, 'createdBy' | 'updatedBy'> {
  createdBy?: UserInstance;
  updatedBy?: UserInstance;
}
