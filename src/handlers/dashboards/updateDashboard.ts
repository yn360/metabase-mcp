import { MetabaseApiClient } from '../../api.js';
import { validatePositiveInteger } from '../../utils/index.js';
import { McpError, ErrorCode } from '../../types/core.js';
import { formatJson } from '../../utils/index.js';
import { UpdateDashboardArgs, DashboardOperationResponse } from './types.js';

export async function updateDashboard(
  args: UpdateDashboardArgs,
  requestId: string,
  apiClient: MetabaseApiClient,
  logDebug: (message: string, data?: unknown) => void,
  logInfo: (message: string, data?: unknown) => void,
  logWarn: (message: string, data?: unknown, error?: Error) => void,
  logError: (message: string, error: unknown) => void
): Promise<DashboardOperationResponse> {
  const { dashboard_id, name, description, collection_id } = args;

  if (typeof dashboard_id !== 'number') {
    logWarn('Missing or invalid dashboard_id parameter', { requestId });
    throw new McpError(
      ErrorCode.InvalidParams,
      'dashboard_id parameter is required and must be a number'
    );
  }
  validatePositiveInteger(dashboard_id, 'dashboard_id', requestId, logWarn);

  if (collection_id !== undefined) {
    validatePositiveInteger(collection_id, 'collection_id', requestId, logWarn);
  }

  const data: Record<string, unknown> = {};
  if (name !== undefined) {
    data.name = name;
  }
  if (description !== undefined) {
    data.description = description;
  }
  if (collection_id !== undefined) {
    data.collection_id = collection_id;
  }

  if (Object.keys(data).length === 0) {
    logWarn('No fields provided for update', { requestId, dashboard_id });
    throw new McpError(ErrorCode.InvalidParams, 'At least one field to update must be provided');
  }

  logDebug(`Updating dashboard ${dashboard_id}`, { fields: Object.keys(data), requestId });

  try {
    const dashboard = await apiClient.updateDashboard(dashboard_id, data);
    logInfo(`Updated dashboard ${dashboard_id}`, { requestId });
    return {
      content: [
        {
          type: 'text',
          text: formatJson({
            success: true,
            operation: 'update_dashboard',
            dashboard_id: dashboard.id,
            name: dashboard.name,
          }),
        },
      ],
    };
  } catch (error) {
    logError(`Failed to update dashboard ${dashboard_id}`, error);
    throw error;
  }
}
