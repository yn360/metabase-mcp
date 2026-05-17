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

export interface DashboardParameter {
  id?: string;
  name: string;
  type: string;
  slug?: string;
  default?: unknown;
  values_source_type?: string;
  values_source_config?: Record<string, unknown>;
}

export interface UpdateDashboardParametersArgs {
  dashboard_id: number;
  parameters: DashboardParameter[];
}

export interface DashboardTab {
  id?: number;
  name: string;
}

export interface UpdateDashboardTabsArgs {
  dashboard_id: number;
  tabs: DashboardTab[];
}

export interface ParameterMapping {
  parameter_id: string;
  card_id: number;
  target: unknown;
}

export interface DashcardMappingEntry {
  dashcard_id: number;
  parameter_mappings: ParameterMapping[];
}

export interface UpdateDashcardParameterMappingsArgs {
  dashboard_id: number;
  mappings: DashcardMappingEntry[];
}

export interface DashboardOperationResponse {
  content: { type: 'text'; text: string }[];
}
