import { MetabaseApiClient } from '../../api.js';
import { validatePositiveInteger } from '../../utils/index.js';
import { McpError, ErrorCode } from '../../types/core.js';
import { formatJson } from '../../utils/index.js';
import { CreateCollectionArgs, CollectionOperationResponse } from './types.js';

export async function createCollection(
  args: CreateCollectionArgs,
  requestId: string,
  apiClient: MetabaseApiClient,
  logDebug: (message: string, data?: unknown) => void,
  logInfo: (message: string, data?: unknown) => void,
  logWarn: (message: string, data?: unknown, error?: Error) => void,
  logError: (message: string, error: unknown) => void
): Promise<CollectionOperationResponse> {
  const { name, description, parent_id } = args;

  if (!name || typeof name !== 'string') {
    logWarn('Missing or invalid name parameter', { requestId });
    throw new McpError(ErrorCode.InvalidParams, 'name parameter is required and must be a string');
  }

  if (parent_id !== undefined) {
    validatePositiveInteger(parent_id, 'parent_id', requestId, logWarn);
  }

  logDebug(`Creating collection: ${name}`, { requestId });

  const data: Record<string, unknown> = { name };
  if (description !== undefined) {
    data.description = description;
  }
  if (parent_id !== undefined) {
    data.parent_id = parent_id;
  }

  try {
    const collection = await apiClient.createCollection(data);
    logInfo(`Created collection ${collection.id}`, { requestId });
    return {
      content: [
        {
          type: 'text',
          text: formatJson({
            success: true,
            operation: 'create_collection',
            collection_id: collection.id,
            name: collection.name,
          }),
        },
      ],
    };
  } catch (error) {
    logError('Failed to create collection', error);
    throw error;
  }
}
