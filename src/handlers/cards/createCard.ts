import { MetabaseApiClient } from '../../api.js';
import { validatePositiveInteger } from '../../utils/index.js';
import { McpError, ErrorCode } from '../../types/core.js';
import { formatJson } from '../../utils/index.js';
import { CreateCardArgs, CardOperationResponse } from './types.js';

export async function createCard(
  args: CreateCardArgs,
  requestId: string,
  apiClient: MetabaseApiClient,
  logDebug: (message: string, data?: unknown) => void,
  logInfo: (message: string, data?: unknown) => void,
  logWarn: (message: string, data?: unknown, error?: Error) => void,
  logError: (message: string, error: unknown) => void
): Promise<CardOperationResponse> {
  const {
    name,
    database_id,
    dataset_query,
    display,
    description,
    collection_id,
    visualization_settings,
  } = args;

  if (!name || typeof name !== 'string') {
    logWarn('Missing or invalid name parameter', { requestId });
    throw new McpError(ErrorCode.InvalidParams, 'name parameter is required and must be a string');
  }

  if (typeof database_id !== 'number') {
    logWarn('Missing or invalid database_id parameter', { requestId });
    throw new McpError(
      ErrorCode.InvalidParams,
      'database_id parameter is required and must be a number'
    );
  }
  validatePositiveInteger(database_id, 'database_id', requestId, logWarn);

  if (!dataset_query || typeof dataset_query !== 'object') {
    logWarn('Missing or invalid dataset_query parameter', { requestId });
    throw new McpError(
      ErrorCode.InvalidParams,
      'dataset_query parameter is required and must be an object'
    );
  }

  if (collection_id !== undefined) {
    validatePositiveInteger(collection_id, 'collection_id', requestId, logWarn);
  }

  logDebug(`Creating card: ${name}`, { database_id, requestId });

  const data: Record<string, unknown> = {
    name,
    database_id,
    dataset_query,
    display: display ?? 'table',
    visualization_settings: visualization_settings ?? {},
  };
  if (description !== undefined) {
    data.description = description;
  }
  if (collection_id !== undefined) {
    data.collection_id = collection_id;
  }

  try {
    const card = await apiClient.createCard(data);
    logInfo(`Created card ${card.id}`, { requestId });
    return {
      content: [
        {
          type: 'text',
          text: formatJson({
            success: true,
            operation: 'create_card',
            card_id: card.id,
            name: card.name,
          }),
        },
      ],
    };
  } catch (error) {
    logError('Failed to create card', error);
    throw error;
  }
}
