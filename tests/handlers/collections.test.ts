/**
 * Unit tests for the collection mutation handlers (create_collection, update_collection)
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { handleCollection } from '../../src/handlers/collections/index.js';
import { McpError } from '../../src/types/core.js';
import {
  mockApiClient,
  mockLogger,
  resetAllMocks,
  createMockRequest,
  getLoggerFunctions,
  sampleCollection,
} from '../setup.js';

describe('handleCollection', () => {
  beforeEach(() => {
    resetAllMocks();
  });

  describe('create_collection', () => {
    it('should throw error when name is missing', async () => {
      const request = createMockRequest('create_collection', {});
      const [logDebug, logInfo, logWarn, logError] = getLoggerFunctions();

      await expect(
        handleCollection(request, 'test-request-id', mockApiClient as any, logDebug, logInfo, logWarn, logError)
      ).rejects.toThrow(McpError);

      expect(mockLogger.logWarn).toHaveBeenCalledWith(
        'Missing or invalid name parameter',
        { requestId: 'test-request-id' }
      );
    });

    it('should create collection successfully', async () => {
      mockApiClient.createCollection.mockResolvedValue(sampleCollection);

      const request = createMockRequest('create_collection', { name: 'Test Collection' });
      const [logDebug, logInfo, logWarn, logError] = getLoggerFunctions();

      const result = await handleCollection(
        request, 'test-request-id', mockApiClient as any, logDebug, logInfo, logWarn, logError
      );

      expect(result.content).toHaveLength(1);
      const parsed = JSON.parse(result.content[0].text);
      expect(parsed.success).toBe(true);
      expect(parsed.operation).toBe('create_collection');
      expect(parsed.collection_id).toBe(sampleCollection.id);
      expect(mockApiClient.createCollection).toHaveBeenCalledWith({ name: 'Test Collection' });
    });

    it('should create collection with optional fields', async () => {
      mockApiClient.createCollection.mockResolvedValue({ ...sampleCollection, parent_id: 3 });

      const request = createMockRequest('create_collection', {
        name: 'Sub Collection',
        description: 'A nested collection',
        parent_id: 3,
      });
      const [logDebug, logInfo, logWarn, logError] = getLoggerFunctions();

      await handleCollection(
        request, 'test-request-id', mockApiClient as any, logDebug, logInfo, logWarn, logError
      );

      expect(mockApiClient.createCollection).toHaveBeenCalledWith({
        name: 'Sub Collection',
        description: 'A nested collection',
        parent_id: 3,
      });
    });
  });

  describe('update_collection', () => {
    it('should throw error when collection_id is missing', async () => {
      const request = createMockRequest('update_collection', { name: 'New Name' });
      const [logDebug, logInfo, logWarn, logError] = getLoggerFunctions();

      await expect(
        handleCollection(request, 'test-request-id', mockApiClient as any, logDebug, logInfo, logWarn, logError)
      ).rejects.toThrow(McpError);

      expect(mockLogger.logWarn).toHaveBeenCalledWith(
        'Missing or invalid collection_id parameter',
        { requestId: 'test-request-id' }
      );
    });

    it('should throw error when no update fields provided', async () => {
      const request = createMockRequest('update_collection', { collection_id: 1 });
      const [logDebug, logInfo, logWarn, logError] = getLoggerFunctions();

      await expect(
        handleCollection(request, 'test-request-id', mockApiClient as any, logDebug, logInfo, logWarn, logError)
      ).rejects.toThrow(McpError);

      expect(mockLogger.logWarn).toHaveBeenCalledWith(
        'No fields provided for update',
        expect.objectContaining({ requestId: 'test-request-id', collection_id: 1 })
      );
    });

    it('should update collection successfully', async () => {
      const updatedCollection = { ...sampleCollection, name: 'Renamed Collection' };
      mockApiClient.updateCollection.mockResolvedValue(updatedCollection);

      const request = createMockRequest('update_collection', {
        collection_id: 1,
        name: 'Renamed Collection',
      });
      const [logDebug, logInfo, logWarn, logError] = getLoggerFunctions();

      const result = await handleCollection(
        request, 'test-request-id', mockApiClient as any, logDebug, logInfo, logWarn, logError
      );

      const parsed = JSON.parse(result.content[0].text);
      expect(parsed.success).toBe(true);
      expect(parsed.operation).toBe('update_collection');
      expect(mockApiClient.updateCollection).toHaveBeenCalledWith(1, { name: 'Renamed Collection' });
    });
  });
});
