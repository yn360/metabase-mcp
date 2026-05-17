import { MetabaseApiClient } from '../../api.js';
import { validatePositiveInteger } from '../../utils/index.js';
import { McpError, ErrorCode } from '../../types/core.js';
import { formatJson } from '../../utils/index.js';
import { UpdateDashboardTabsArgs, DashboardOperationResponse } from './types.js';

export async function updateDashboardTabs(
  args: UpdateDashboardTabsArgs,
  requestId: string,
  apiClient: MetabaseApiClient,
  logDebug: (message: string, data?: unknown) => void,
  logInfo: (message: string, data?: unknown) => void,
  logWarn: (message: string, data?: unknown, error?: Error) => void,
  logError: (message: string, error: unknown) => void
): Promise<DashboardOperationResponse> {
  const { dashboard_id, tabs } = args;

  if (typeof dashboard_id !== 'number') {
    logWarn('Missing or invalid dashboard_id parameter', { requestId });
    throw new McpError(
      ErrorCode.InvalidParams,
      'dashboard_id parameter is required and must be a number'
    );
  }
  validatePositiveInteger(dashboard_id, 'dashboard_id', requestId, logWarn);

  if (!Array.isArray(tabs) || tabs.length === 0) {
    logWarn('Missing or invalid tabs field', { requestId });
    throw new McpError(
      ErrorCode.InvalidParams,
      'tabs must be a non-empty array of tab objects with a name field'
    );
  }

  for (const tab of tabs) {
    if (typeof tab.name !== 'string' || tab.name.trim() === '') {
      logWarn('Tab missing required name field', { requestId });
      throw new McpError(ErrorCode.InvalidParams, 'Each tab must have a non-empty name field');
    }
  }

  logDebug(`Updating tabs on dashboard ${dashboard_id}`, {
    tab_count: tabs.length,
    requestId,
  });

  try {
    const dashboard = await apiClient.updateDashboard(dashboard_id, { tabs });
    logInfo(`Updated tabs on dashboard ${dashboard_id}`, { requestId });
    return {
      content: [
        {
          type: 'text',
          text: formatJson({
            success: true,
            operation: 'update_dashboard_tabs',
            dashboard_id: dashboard.id,
            tab_count: (dashboard.tabs ?? tabs).length,
          }),
        },
      ],
    };
  } catch (error) {
    logError(`Failed to update tabs on dashboard ${dashboard_id}`, error);
    throw error;
  }
}
