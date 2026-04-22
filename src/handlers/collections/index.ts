import { CallToolRequest } from '@modelcontextprotocol/sdk/types.js';
import { MetabaseApiClient } from '../../api.js';
import { McpError, ErrorCode } from '../../types/core.js';
import { createCollection } from './createCollection.js';
import { updateCollection } from './updateCollection.js';
import {
  CreateCollectionArgs,
  UpdateCollectionArgs,
  CollectionOperationResponse,
} from './types.js';

export async function handleCollection(
  request: CallToolRequest,
  requestId: string,
  apiClient: MetabaseApiClient,
  logDebug: (message: string, data?: unknown) => void,
  logInfo: (message: string, data?: unknown) => void,
  logWarn: (message: string, data?: unknown, error?: Error) => void,
  logError: (message: string, error: unknown) => void
): Promise<CollectionOperationResponse> {
  const toolName = request.params?.name;
  const args = request.params?.arguments as Record<string, unknown>;

  switch (toolName) {
    case 'create_collection':
      return createCollection(
        args as unknown as CreateCollectionArgs,
        requestId,
        apiClient,
        logDebug,
        logInfo,
        logWarn,
        logError
      );

    case 'update_collection':
      return updateCollection(
        args as unknown as UpdateCollectionArgs,
        requestId,
        apiClient,
        logDebug,
        logInfo,
        logWarn,
        logError
      );

    default:
      logWarn(`Unknown collection tool: ${toolName}`, { requestId });
      throw new McpError(ErrorCode.MethodNotFound, `Unknown tool: ${toolName}`);
  }
}
