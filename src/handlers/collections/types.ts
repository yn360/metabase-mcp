export interface CreateCollectionArgs {
  name: string;
  description?: string;
  parent_id?: number;
}

export interface UpdateCollectionArgs {
  collection_id: number;
  name?: string;
  description?: string;
  parent_id?: number;
}

export interface CollectionOperationResponse {
  content: { type: 'text'; text: string }[];
}
