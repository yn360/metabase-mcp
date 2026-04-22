export interface CreateCardArgs {
  name: string;
  database_id: number;
  dataset_query: Record<string, unknown>;
  display?: string;
  description?: string;
  collection_id?: number;
  visualization_settings?: Record<string, unknown>;
}

export interface UpdateCardArgs {
  card_id: number;
  name?: string;
  description?: string;
  collection_id?: number;
  dataset_query?: Record<string, unknown>;
  display?: string;
  visualization_settings?: Record<string, unknown>;
}

export interface CardOperationResponse {
  content: { type: 'text'; text: string }[];
}
