import { MetabaseApiClient } from '../../api.js';
import { validatePositiveInteger } from '../../utils/index.js';
import { McpError, ErrorCode } from '../../types/core.js';
import { formatJson } from '../../utils/index.js';
import { AddCardToDashboardArgs, DashboardOperationResponse } from './types.js';

export async function addCardToDashboard(
  args: AddCardToDashboardArgs,
  requestId: string,
  apiClient: MetabaseApiClient,
  logDebug: (message: string, data?: unknown) => void,
  logInfo: (message: string, data?: unknown) => void,
  logWarn: (message: string, data?: unknown, error?: Error) => void,
  logError: (message: string, error: unknown) => void
): Promise<DashboardOperationResponse> {
  const { dashboard_id, card_id, row = 0, col = 0, size_x = 4, size_y = 4 } = args;

  if (typeof dashboard_id !== 'number') {
    logWarn('Missing or invalid dashboard_id parameter', { requestId });
    throw new McpError(
      ErrorCode.InvalidParams,
      'dashboard_id parameter is required and must be a number'
    );
  }
  validatePositiveInteger(dashboard_id, 'dashboard_id', requestId, logWarn);

  if (typeof card_id !== 'number') {
    logWarn('Missing or invalid card_id parameter', { requestId });
    throw new McpError(
      ErrorCode.InvalidParams,
      'card_id parameter is required and must be a number'
    );
  }
  validatePositiveInteger(card_id, 'card_id', requestId, logWarn);

  logDebug(`Adding card ${card_id} to dashboard ${dashboard_id}`, {
    row,
    col,
    size_x,
    size_y,
    requestId,
  });

  try {
    const result = await apiClient.addCardToDashboard(dashboard_id, {
      card_id,
      row,
      col,
      size_x,
      size_y,
    });
    const dashcardId = result?.id ?? result?.[0]?.id;
    logInfo(`Added card ${card_id} to dashboard ${dashboard_id}`, { requestId });
    return {
      content: [
        {
          type: 'text',
          text: formatJson({
            success: true,
            operation: 'add_card_to_dashboard',
            dashboard_id,
            card_id,
            dashcard_id: dashcardId,
          }),
        },
      ],
    };
  } catch (error) {
    logError(`Failed to add card ${card_id} to dashboard ${dashboard_id}`, error);
    throw error;
  }
}
