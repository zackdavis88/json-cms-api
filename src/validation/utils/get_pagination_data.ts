import {
  ValidationError,
  PaginationData,
  ModelTypes,
  QueryArgs,
  QueryString,
} from './types';
import { NativeError } from 'mongoose';
import { ITEMS_PER_PAGE } from '../../config';

interface GetPaginationDataOutput {
  error?: ValidationError;
  paginationData?: PaginationData;
}

type GetPaginationData = (
  model: ModelTypes,
  queryArgs: QueryArgs,
  queryStringInput: QueryString,
) => Promise<GetPaginationDataOutput>;

export const getPaginationData: GetPaginationData = (
  model,
  queryArgs,
  queryStringInput,
) =>
  new Promise((resolve) => {
    model.countDocuments(queryArgs, (countError: NativeError, count: number) => {
      if (countError) {
        return resolve({ error: countError });
      }

      let itemsPerPage = ITEMS_PER_PAGE || 10;
      const ippInput = Number(queryStringInput.itemsPerPage);
      if (ippInput && !isNaN(ippInput) && Number.isInteger(ippInput) && ippInput > 0) {
        itemsPerPage = ippInput;
      }

      const totalPages = Math.ceil(count / itemsPerPage);
      let page = Number(queryStringInput.page);
      if (isNaN(page) || !Number.isInteger(Number(page)) || page <= 0) {
        page = 1;
      } else if (page > totalPages) {
        // If the page is greater than the limit. set it to the limit.
        page = totalPages ? totalPages : 1;
      }

      const pageOffset = (page - 1) * itemsPerPage;
      const paginationData = {
        page,
        totalItems: count,
        totalPages,
        itemsPerPage,
        pageOffset,
      };

      return resolve({ paginationData });
    });
  });
