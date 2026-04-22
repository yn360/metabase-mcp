import { MetabaseApiClient } from '../../api.js';
import { validatePositiveInteger } from '../../utils/index.js';
import { McpError, ErrorCode } from '../../types/core.js';
import { formatJson } from '../../utils/index.js';
import { CreateDashboardArgs, DashboardOperationResponse } from './types.js';

export async function createDashboard(
  args: CreateDashboardArgs,
  requestId: string,
  apiClient: MetabaseApiClient,
  logDebug: (message: string, data?: unknown) => void,
  logInfo: (message: string, data?: unknown) => void,
  logWarn: (message: string, data?: unknown, error?: Error) => void,
  logError: (message: string, error: unknown) => void
): Promise<DashboardOperationResponse> {
  const { name, description, collection_id } = args;

  if (!name || typeof name !== 'string') {
    logWarn('Missing or invalid name parameter', { requestId });
    throw new McpError(ErrorCode.InvalidParams, 'name parameter is required and must be a string');
  }

  if (collection_id !== undefined) {
    validatePositiveInteger(collection_id, 'collection_id', requestId, logWarn);
  }

  logDebug(`Creating dashboard: ${name}`, { requestId });

  const data: Record<string, unknown> = { name };
  if (description !== undefined) {
    data.description = description;
  }
  if (collection_id !== undefined) {
    data.collection_id = collection_id;
  }

  try {
    const dashboard = await apiClient.createDashboard(data);
    logInfo(`Created dashboard ${dashboard.id}`, { requestId });
    return {
      content: [
        {
          type: 'text',
          text: formatJson({
            success: true,
            operation: 'create_dashboard',
            dashboard_id: dashboard.id,
            name: dashboard.name,
          }),
        },
      ],
    };
  } catch (error) {
    logError('Failed to create dashboard', error);
    throw error;
  }
}
