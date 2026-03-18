export interface Category {
  id: string;
  name: string;
  icon: string;
  color: string;
  isDefault: boolean;
}

export interface CreateCategoryRequest {
  name: string;
  icon: string;
  color: string;
}

export interface BulkCategorizeRequest {
  transactionIds: string[];
  categoryId: string;
}