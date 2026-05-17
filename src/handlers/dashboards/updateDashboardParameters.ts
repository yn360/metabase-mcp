import { MetabaseApiClient } from '../../api.js';
import { validatePositiveInteger } from '../../utils/index.js';
import { McpError, ErrorCode } from '../../types/core.js';
import { formatJson } from '../../utils/index.js';
import { UpdateDashboardParametersArgs, DashboardOperationResponse } from './types.js';

export async function updateDashboardParameters(
  args: UpdateDashboardParametersArgs,
  requestId: string,
  apiClient: MetabaseApiClient,
  logDebug: (message: string, data?: unknown) => void,
  logInfo: (message: string, data?: unknown) => void,
  logWarn: (message: string, data?: unknown, error?: Error) => void,
  logError: (message: string, error: unknown) => void
): Promise<DashboardOperationResponse> {
  const { dashboard_id, parameters } = args;

  if (typeof dashboard_id !== 'number') {
    logWarn('Missing or invalid dashboard_id parameter', { requestId });
    throw new McpError(
      ErrorCode.InvalidParams,
      'dashboard_id parameter is required and must be a number'
    );
  }
  validatePositiveInteger(dashboard_id, 'dashboard_id', requestId, logWarn);

  if (!Array.isArray(parameters) || parameters.length === 0) {
    logWarn('Missing or invalid parameters field', { requestId });
    throw new McpError(
      ErrorCode.InvalidParams,
      'parameters must be a non-empty array of parameter objects'
    );
  }

  logDebug(`Updating parameters on dashboard ${dashboard_id}`, {
    parameter_count: parameters.length,
    requestId,
  });

  try {
    const dashboard = await apiClient.updateDashboard(dashboard_id, { parameters });
    logInfo(`Updated parameters on dashboard ${dashboard_id}`, { requestId });
    return {
      content: [
        {
          type: 'text',
          text: formatJson({
            success: true,
            operation: 'update_dashboard_parameters',
            dashboard_id: dashboard.id,
            parameter_count: (dashboard.parameters ?? parameters).length,
          }),
        },
      ],
    };
  } catch (error) {
    logError(`Failed to update parameters on dashboard ${dashboard_id}`, error);
    throw error;
  }
}
