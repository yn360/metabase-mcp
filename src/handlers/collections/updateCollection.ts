import { MetabaseApiClient } from '../../api.js';
import { validatePositiveInteger } from '../../utils/index.js';
import { McpError, ErrorCode } from '../../types/core.js';
import { formatJson } from '../../utils/index.js';
import { UpdateCollectionArgs, CollectionOperationResponse } from './types.js';

export async function updateCollection(
  args: UpdateCollectionArgs,
  requestId: string,
  apiClient: MetabaseApiClient,
  logDebug: (message: string, data?: unknown) => void,
  logInfo: (message: string, data?: unknown) => void,
  logWarn: (message: string, data?: unknown, error?: Error) => void,
  logError: (message: string, error: unknown) => void
): Promise<CollectionOperationResponse> {
  const { collection_id, name, description, parent_id } = args;

  if (typeof collection_id !== 'number') {
    logWarn('Missing or invalid collection_id parameter', { requestId });
    throw new McpError(
      ErrorCode.InvalidParams,
      'collection_id parameter is required and must be a number'
    );
  }
  validatePositiveInteger(collection_id, 'collection_id', requestId, logWarn);

  if (parent_id !== undefined) {
    validatePositiveInteger(parent_id, 'parent_id', requestId, logWarn);
  }

  const data: Record<string, unknown> = {};
  if (name !== undefined) {
    data.name = name;
  }
  if (description !== undefined) {
    data.description = description;
  }
  if (parent_id !== undefined) {
    data.parent_id = parent_id;
  }

  if (Object.keys(data).length === 0) {
    logWarn('No fields provided for update', { requestId, collection_id });
    throw new McpError(ErrorCode.InvalidParams, 'At least one field to update must be provided');
  }

  logDebug(`Updating collection ${collection_id}`, { fields: Object.keys(data), requestId });

  try {
    const collection = await apiClient.updateCollection(collection_id, data);
    logInfo(`Updated collection ${collection_id}`, { requestId });
    return {
      content: [
        {
          type: 'text',
          text: formatJson({
            success: true,
            operation: 'update_collection',
            collection_id: collection.id,
            name: collection.name,
          }),
        },
      ],
    };
  } catch (error) {
    logError(`Failed to update collection ${collection_id}`, error);
    throw error;
  }
}
