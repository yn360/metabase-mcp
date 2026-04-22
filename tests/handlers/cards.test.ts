/**
 * Unit tests for the card mutation handlers (create_card, update_card)
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { handleCard } from '../../src/handlers/cards/index.js';
import { McpError } from '../../src/types/core.js';
import {
  mockApiClient,
  mockLogger,
  resetAllMocks,
  createMockRequest,
  getLoggerFunctions,
  sampleCard,
} from '../setup.js';

describe('handleCard', () => {
  beforeEach(() => {
    resetAllMocks();
  });

  describe('create_card', () => {
    it('should throw error when name is missing', async () => {
      const request = createMockRequest('create_card', {
        database_id: 1,
        dataset_query: { type: 'native', native: { query: 'SELECT 1' }, database: 1 },
      });
      const [logDebug, logInfo, logWarn, logError] = getLoggerFunctions();

      await expect(
        handleCard(request, 'test-request-id', mockApiClient as any, logDebug, logInfo, logWarn, logError)
      ).rejects.toThrow(McpError);

      expect(mockLogger.logWarn).toHaveBeenCalledWith(
        'Missing or invalid name parameter',
        { requestId: 'test-request-id' }
      );
    });

    it('should throw error when database_id is missing', async () => {
      const request = createMockRequest('create_card', {
        name: 'My Card',
        dataset_query: { type: 'native', native: { query: 'SELECT 1' }, database: 1 },
      });
      const [logDebug, logInfo, logWarn, logError] = getLoggerFunctions();

      await expect(
        handleCard(request, 'test-request-id', mockApiClient as any, logDebug, logInfo, logWarn, logError)
      ).rejects.toThrow(McpError);

      expect(mockLogger.logWarn).toHaveBeenCalledWith(
        'Missing or invalid database_id parameter',
        { requestId: 'test-request-id' }
      );
    });

    it('should throw error when dataset_query is missing', async () => {
      const request = createMockRequest('create_card', {
        name: 'My Card',
        database_id: 1,
      });
      const [logDebug, logInfo, logWarn, logError] = getLoggerFunctions();

      await expect(
        handleCard(request, 'test-request-id', mockApiClient as any, logDebug, logInfo, logWarn, logError)
      ).rejects.toThrow(McpError);

      expect(mockLogger.logWarn).toHaveBeenCalledWith(
        'Missing or invalid dataset_query parameter',
        { requestId: 'test-request-id' }
      );
    });

    it('should create card successfully', async () => {
      mockApiClient.createCard.mockResolvedValue(sampleCard);

      const request = createMockRequest('create_card', {
        name: 'Test Card',
        database_id: 1,
        dataset_query: { type: 'native', native: { query: 'SELECT * FROM test_table' }, database: 1 },
      });
      const [logDebug, logInfo, logWarn, logError] = getLoggerFunctions();

      const result = await handleCard(
        request, 'test-request-id', mockApiClient as any, logDebug, logInfo, logWarn, logError
      );

      expect(result.content).toHaveLength(1);
      expect(result.content[0].type).toBe('text');
      const parsed = JSON.parse(result.content[0].text);
      expect(parsed.success).toBe(true);
      expect(parsed.operation).toBe('create_card');
      expect(parsed.card_id).toBe(sampleCard.id);
      expect(mockApiClient.createCard).toHaveBeenCalledOnce();
    });
  });

  describe('update_card', () => {
    it('should throw error when card_id is missing', async () => {
      const request = createMockRequest('update_card', { name: 'New Name' });
      const [logDebug, logInfo, logWarn, logError] = getLoggerFunctions();

      await expect(
        handleCard(request, 'test-request-id', mockApiClient as any, logDebug, logInfo, logWarn, logError)
      ).rejects.toThrow(McpError);

      expect(mockLogger.logWarn).toHaveBeenCalledWith(
        'Missing or invalid card_id parameter',
        { requestId: 'test-request-id' }
      );
    });

    it('should throw error when no update fields are provided', async () => {
      const request = createMockRequest('update_card', { card_id: 1 });
      const [logDebug, logInfo, logWarn, logError] = getLoggerFunctions();

      await expect(
        handleCard(request, 'test-request-id', mockApiClient as any, logDebug, logInfo, logWarn, logError)
      ).rejects.toThrow(McpError);

      expect(mockLogger.logWarn).toHaveBeenCalledWith(
        'No fields provided for update',
        expect.objectContaining({ requestId: 'test-request-id', card_id: 1 })
      );
    });

    it('should update card successfully', async () => {
      const updatedCard = { ...sampleCard, name: 'Updated Name' };
      mockApiClient.updateCard.mockResolvedValue(updatedCard);

      const request = createMockRequest('update_card', { card_id: 1, name: 'Updated Name' });
      const [logDebug, logInfo, logWarn, logError] = getLoggerFunctions();

      const result = await handleCard(
        request, 'test-request-id', mockApiClient as any, logDebug, logInfo, logWarn, logError
      );

      expect(result.content).toHaveLength(1);
      const parsed = JSON.parse(result.content[0].text);
      expect(parsed.success).toBe(true);
      expect(parsed.operation).toBe('update_card');
      expect(mockApiClient.updateCard).toHaveBeenCalledWith(1, { name: 'Updated Name' });
    });
  });
});
