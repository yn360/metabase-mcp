import { CallToolRequest } from '@modelcontextprotocol/sdk/types.js';
import { MetabaseApiClient } from '../../api.js';
import { McpError, ErrorCode } from '../../types/core.js';
import { createDashboard } from './createDashboard.js';
import { updateDashboard } from './updateDashboard.js';
import { addCardToDashboard } from './addCardToDashboard.js';
import { updateDashboardCards } from './updateDashboardCards.js';
import {
  CreateDashboardArgs,
  UpdateDashboardArgs,
  AddCardToDashboardArgs,
  UpdateDashboardCardsArgs,
  DashboardOperationResponse,
} from './types.js';

export async function handleDashboard(
  request: CallToolRequest,
  requestId: string,
  apiClient: MetabaseApiClient,
  logDebug: (message: string, data?: unknown) => void,
  logInfo: (message: string, data?: unknown) => void,
  logWarn: (message: string, data?: unknown, error?: Error) => void,
  logError: (message: string, error: unknown) => void
): Promise<DashboardOperationResponse> {
  const toolName = request.params?.name;
  const args = request.params?.arguments as Record<string, unknown>;

  switch (toolName) {
    case 'create_dashboard':
      return createDashboard(
        args as unknown as CreateDashboardArgs,
        requestId,
        apiClient,
        logDebug,
        logInfo,
        logWarn,
        logError
      );

    case 'update_dashboard':
      return updateDashboard(
        args as unknown as UpdateDashboardArgs,
        requestId,
        apiClient,
        logDebug,
        logInfo,
        logWarn,
        logError
      );

    case 'add_card_to_dashboard':
      return addCardToDashboard(
        args as unknown as AddCardToDashboardArgs,
        requestId,
        apiClient,
        logDebug,
        logInfo,
        logWarn,
        logError
      );

    case 'update_dashboard_cards':
      return updateDashboardCards(
        args as unknown as UpdateDashboardCardsArgs,
        requestId,
        apiClient,
        logDebug,
        logInfo,
        logWarn,
        logError
      );

    default:
      logWarn(`Unknown dashboard tool: ${toolName}`, { requestId });
      throw new McpError(ErrorCode.MethodNotFound, `Unknown tool: ${toolName}`);
  }
}
