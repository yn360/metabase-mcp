import { CallToolRequest } from '@modelcontextprotocol/sdk/types.js';
import { MetabaseApiClient } from '../../api.js';
import { McpError, ErrorCode } from '../../types/core.js';
import { createCard } from './createCard.js';
import { updateCard } from './updateCard.js';
import { CreateCardArgs, UpdateCardArgs, CardOperationResponse } from './types.js';

export async function handleCard(
  request: CallToolRequest,
  requestId: string,
  apiClient: MetabaseApiClient,
  logDebug: (message: string, data?: unknown) => void,
  logInfo: (message: string, data?: unknown) => void,
  logWarn: (message: string, data?: unknown, error?: Error) => void,
  logError: (message: string, error: unknown) => void
): Promise<CardOperationResponse> {
  const toolName = request.params?.name;
  const args = request.params?.arguments as Record<string, unknown>;

  switch (toolName) {
    case 'create_card':
      return createCard(
        args as unknown as CreateCardArgs,
        requestId,
        apiClient,
        logDebug,
        logInfo,
        logWarn,
        logError
      );

    case 'update_card':
      return updateCard(
        args as unknown as UpdateCardArgs,
        requestId,
        apiClient,
        logDebug,
        logInfo,
        logWarn,
        logError
      );

    default:
      logWarn(`Unknown card tool: ${toolName}`, { requestId });
      throw new McpError(ErrorCode.MethodNotFound, `Unknown tool: ${toolName}`);
  }
}
