export interface CreateDashboardArgs {
  name: string;
  description?: string;
  collection_id?: number;
}

export interface UpdateDashboardArgs {
  dashboard_id: number;
  name?: string;
  description?: string;
  collection_id?: number;
}

export interface AddCardToDashboardArgs {
  dashboard_id: number;
  card_id: number;
  row?: number;
  col?: number;
  size_x?: number;
  size_y?: number;
}

export interface UpdateDashboardCardsArgs {
  dashboard_id: number;
  cards: unknown[];
}

export interface DashboardOperationResponse {
  content: { type: 'text'; text: string }[];
}
