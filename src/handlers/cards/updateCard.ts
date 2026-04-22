import { MetabaseApiClient } from '../../api.js';
import { validatePositiveInteger } from '../../utils/index.js';
import { McpError, ErrorCode } from '../../types/core.js';
import { formatJson } from '../../utils/index.js';
import { UpdateCardArgs, CardOperationResponse } from './types.js';

export async function updateCard(
  args: UpdateCardArgs,
  requestId: string,
  apiClient: MetabaseApiClient,
  logDebug: (message: string, data?: unknown) => void,
  logInfo: (message: string, data?: unknown) => void,
  logWarn: (message: string, data?: unknown, error?: Error) => void,
  logError: (message: string, error: unknown) => void
): Promise<CardOperationResponse> {
  const {
    card_id,
    name,
    description,
    collection_id,
    dataset_query,
    display,
    visualization_settings,
  } = args;

  if (typeof card_id !== 'number') {
    logWarn('Missing or invalid card_id parameter', { requestId });
    throw new McpError(
      ErrorCode.InvalidParams,
      'card_id parameter is required and must be a number'
    );
  }
  validatePositiveInteger(card_id, 'card_id', requestId, logWarn);

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
  if (dataset_query !== undefined) {
    data.dataset_query = dataset_query;
  }
  if (display !== undefined) {
    data.display = display;
  }
  if (visualization_settings !== undefined) {
    data.visualization_settings = visualization_settings;
  }

  if (Object.keys(data).length === 0) {
    logWarn('No fields provided for update', { requestId, card_id });
    throw new McpError(ErrorCode.InvalidParams, 'At least one field to update must be provided');
  }

  logDebug(`Updating card ${card_id}`, { fields: Object.keys(data), requestId });

  try {
    const card = await apiClient.updateCard(card_id, data);
    logInfo(`Updated card ${card_id}`, { requestId });
    return {
      content: [
        {
          type: 'text',
          text: formatJson({
            success: true,
            operation: 'update_card',
            card_id: card.id,
            name: card.name,
          }),
        },
      ],
    };
  } catch (error) {
    logError(`Failed to update card ${card_id}`, error);
    throw error;
  }
}
