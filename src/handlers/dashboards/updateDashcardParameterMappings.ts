import { MetabaseApiClient } from '../../api.js';
import { validatePositiveInteger } from '../../utils/index.js';
import { McpError, ErrorCode } from '../../types/core.js';
import { formatJson } from '../../utils/index.js';
import { UpdateDashcardParameterMappingsArgs, DashboardOperationResponse } from './types.js';

export async function updateDashcardParameterMappings(
  args: UpdateDashcardParameterMappingsArgs,
  requestId: string,
  apiClient: MetabaseApiClient,
  logDebug: (message: string, data?: unknown) => void,
  logInfo: (message: string, data?: unknown) => void,
  logWarn: (message: string, data?: unknown, error?: Error) => void,
  logError: (message: string, error: unknown) => void
): Promise<DashboardOperationResponse> {
  const { dashboard_id, mappings } = args;

  if (typeof dashboard_id !== 'number') {
    logWarn('Missing or invalid dashboard_id parameter', { requestId });
    throw new McpError(
      ErrorCode.InvalidParams,
      'dashboard_id parameter is required and must be a number'
    );
  }
  validatePositiveInteger(dashboard_id, 'dashboard_id', requestId, logWarn);

  if (!Array.isArray(mappings) || mappings.length === 0) {
    logWarn('Missing or invalid mappings field', { requestId });
    throw new McpError(
      ErrorCode.InvalidParams,
      'mappings must be a non-empty array of { dashcard_id, parameter_mappings } objects'
    );
  }

  logDebug(`Updating parameter mappings on dashboard ${dashboard_id}`, {
    dashcard_count: mappings.length,
    requestId,
  });

  try {
    // Fetch current dashboard to preserve existing dashcard fields
    const dashboardResponse = await apiClient.getDashboard(dashboard_id);
    const dashboardData = (dashboardResponse as any)?.data ?? dashboardResponse;
    const existingCards: any[] = dashboardData?.dashcards ?? [];

    const mappingById = new Map(mappings.map((m) => [m.dashcard_id, m.parameter_mappings]));

    const updatedCards = existingCards.map((card: any) => {
      const newMappings = mappingById.get(card.id);
      if (newMappings !== undefined) {
        return { ...card, parameter_mappings: newMappings };
      }
      return card;
    });

    const updatedDashcardIds = mappings
      .map((m) => m.dashcard_id)
      .filter((id) => existingCards.some((c: any) => c.id === id));

    await apiClient.updateDashboardCards(dashboard_id, updatedCards);
    logInfo(`Updated parameter mappings on dashboard ${dashboard_id}`, { requestId });
    return {
      content: [
        {
          type: 'text',
          text: formatJson({
            success: true,
            operation: 'update_dashcard_parameter_mappings',
            dashboard_id,
            updated_dashcard_ids: updatedDashcardIds,
          }),
        },
      ],
    };
  } catch (error) {
    logError(`Failed to update parameter mappings on dashboard ${dashboard_id}`, error);
    throw error;
  }
}
