import { MetabaseApiClient } from '../../api.js';
import { validatePositiveInteger } from '../../utils/index.js';
import { McpError, ErrorCode } from '../../types/core.js';
import { formatJson } from '../../utils/index.js';
import { UpdateDashboardCardsArgs, DashboardOperationResponse } from './types.js';

export async function updateDashboardCards(
  args: UpdateDashboardCardsArgs,
  requestId: string,
  apiClient: MetabaseApiClient,
  logDebug: (message: string, data?: unknown) => void,
  logInfo: (message: string, data?: unknown) => void,
  logWarn: (message: string, data?: unknown, error?: Error) => void,
  logError: (message: string, error: unknown) => void
): Promise<DashboardOperationResponse> {
  const { dashboard_id, cards } = args;

  if (typeof dashboard_id !== 'number') {
    logWarn('Missing or invalid dashboard_id parameter', { requestId });
    throw new McpError(
      ErrorCode.InvalidParams,
      'dashboard_id parameter is required and must be a number'
    );
  }
  validatePositiveInteger(dashboard_id, 'dashboard_id', requestId, logWarn);

  if (!Array.isArray(cards) || cards.length === 0) {
    logWarn('Missing or invalid cards parameter', { requestId });
    throw new McpError(
      ErrorCode.InvalidParams,
      'cards parameter is required and must be a non-empty array of dashcard objects with id, row, col, size_x, size_y'
    );
  }

  logDebug(`Updating ${cards.length} card(s) layout on dashboard ${dashboard_id}`, { requestId });

  try {
    await apiClient.updateDashboardCards(dashboard_id, cards);
    logInfo(`Updated card layout on dashboard ${dashboard_id}`, { requestId });
    return {
      content: [
        {
          type: 'text',
          text: formatJson({
            success: true,
            operation: 'update_dashboard_cards',
            dashboard_id,
            updated_count: cards.length,
          }),
        },
      ],
    };
  } catch (error) {
    logError(`Failed to update card layout on dashboard ${dashboard_id}`, error);
    throw error;
  }
}
