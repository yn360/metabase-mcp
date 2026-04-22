/**
 * Unit tests for the dashboard mutation handlers (create_dashboard, update_dashboard)
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { handleDashboard } from '../../src/handlers/dashboards/index.js';
import { McpError } from '../../src/types/core.js';
import {
  mockApiClient,
  mockLogger,
  resetAllMocks,
  createMockRequest,
  getLoggerFunctions,
  sampleDashboard,
} from '../setup.js';

describe('handleDashboard', () => {
  beforeEach(() => {
    resetAllMocks();
  });

  describe('create_dashboard', () => {
    it('should throw error when name is missing', async () => {
      const request = createMockRequest('create_dashboard', {});
      const [logDebug, logInfo, logWarn, logError] = getLoggerFunctions();

      await expect(
        handleDashboard(request, 'test-request-id', mockApiClient as any, logDebug, logInfo, logWarn, logError)
      ).rejects.toThrow(McpError);

      expect(mockLogger.logWarn).toHaveBeenCalledWith(
        'Missing or invalid name parameter',
        { requestId: 'test-request-id' }
      );
    });

    it('should create dashboard successfully', async () => {
      mockApiClient.createDashboard.mockResolvedValue(sampleDashboard);

      const request = createMockRequest('create_dashboard', { name: 'Test Dashboard' });
      const [logDebug, logInfo, logWarn, logError] = getLoggerFunctions();

      const result = await handleDashboard(
        request, 'test-request-id', mockApiClient as any, logDebug, logInfo, logWarn, logError
      );

      expect(result.content).toHaveLength(1);
      expect(result.content[0].type).toBe('text');
      const parsed = JSON.parse(result.content[0].text);
      expect(parsed.success).toBe(true);
      expect(parsed.operation).toBe('create_dashboard');
      expect(parsed.dashboard_id).toBe(sampleDashboard.id);
      expect(mockApiClient.createDashboard).toHaveBeenCalledOnce();
    });

    it('should create dashboard with optional fields', async () => {
      mockApiClient.createDashboard.mockResolvedValue({ ...sampleDashboard, collection_id: 5 });

      const request = createMockRequest('create_dashboard', {
        name: 'Test Dashboard',
        description: 'A description',
        collection_id: 5,
      });
      const [logDebug, logInfo, logWarn, logError] = getLoggerFunctions();

      await handleDashboard(
        request, 'test-request-id', mockApiClient as any, logDebug, logInfo, logWarn, logError
      );

      expect(mockApiClient.createDashboard).toHaveBeenCalledWith({
        name: 'Test Dashboard',
        description: 'A description',
        collection_id: 5,
      });
    });
  });

  describe('update_dashboard', () => {
    it('should throw error when dashboard_id is missing', async () => {
      const request = createMockRequest('update_dashboard', { name: 'New Name' });
      const [logDebug, logInfo, logWarn, logError] = getLoggerFunctions();

      await expect(
        handleDashboard(request, 'test-request-id', mockApiClient as any, logDebug, logInfo, logWarn, logError)
      ).rejects.toThrow(McpError);

      expect(mockLogger.logWarn).toHaveBeenCalledWith(
        'Missing or invalid dashboard_id parameter',
        { requestId: 'test-request-id' }
      );
    });

    it('should throw error when no update fields are provided', async () => {
      const request = createMockRequest('update_dashboard', { dashboard_id: 1 });
      const [logDebug, logInfo, logWarn, logError] = getLoggerFunctions();

      await expect(
        handleDashboard(request, 'test-request-id', mockApiClient as any, logDebug, logInfo, logWarn, logError)
      ).rejects.toThrow(McpError);

      expect(mockLogger.logWarn).toHaveBeenCalledWith(
        'No fields provided for update',
        expect.objectContaining({ requestId: 'test-request-id', dashboard_id: 1 })
      );
    });

    it('should update dashboard successfully', async () => {
      const updatedDashboard = { ...sampleDashboard, name: 'Updated Name' };
      mockApiClient.updateDashboard.mockResolvedValue(updatedDashboard);

      const request = createMockRequest('update_dashboard', { dashboard_id: 1, name: 'Updated Name' });
      const [logDebug, logInfo, logWarn, logError] = getLoggerFunctions();

      const result = await handleDashboard(
        request, 'test-request-id', mockApiClient as any, logDebug, logInfo, logWarn, logError
      );

      expect(result.content).toHaveLength(1);
      const parsed = JSON.parse(result.content[0].text);
      expect(parsed.success).toBe(true);
      expect(parsed.operation).toBe('update_dashboard');
      expect(mockApiClient.updateDashboard).toHaveBeenCalledWith(1, { name: 'Updated Name' });
    });
  });

  describe('add_card_to_dashboard', () => {
    it('should throw error when dashboard_id is missing', async () => {
      const request = createMockRequest('add_card_to_dashboard', { card_id: 5 });
      const [logDebug, logInfo, logWarn, logError] = getLoggerFunctions();

      await expect(
        handleDashboard(request, 'test-request-id', mockApiClient as any, logDebug, logInfo, logWarn, logError)
      ).rejects.toThrow(McpError);

      expect(mockLogger.logWarn).toHaveBeenCalledWith(
        'Missing or invalid dashboard_id parameter',
        { requestId: 'test-request-id' }
      );
    });

    it('should throw error when card_id is missing', async () => {
      const request = createMockRequest('add_card_to_dashboard', { dashboard_id: 1 });
      const [logDebug, logInfo, logWarn, logError] = getLoggerFunctions();

      await expect(
        handleDashboard(request, 'test-request-id', mockApiClient as any, logDebug, logInfo, logWarn, logError)
      ).rejects.toThrow(McpError);

      expect(mockLogger.logWarn).toHaveBeenCalledWith(
        'Missing or invalid card_id parameter',
        { requestId: 'test-request-id' }
      );
    });

    it('should add card to dashboard successfully with defaults', async () => {
      mockApiClient.addCardToDashboard.mockResolvedValue({ id: 42, card_id: 5 });

      const request = createMockRequest('add_card_to_dashboard', { dashboard_id: 1, card_id: 5 });
      const [logDebug, logInfo, logWarn, logError] = getLoggerFunctions();

      const result = await handleDashboard(
        request, 'test-request-id', mockApiClient as any, logDebug, logInfo, logWarn, logError
      );

      const parsed = JSON.parse(result.content[0].text);
      expect(parsed.success).toBe(true);
      expect(parsed.operation).toBe('add_card_to_dashboard');
      expect(parsed.dashcard_id).toBe(42);
      expect(mockApiClient.addCardToDashboard).toHaveBeenCalledWith(1, {
        card_id: 5,
        row: 0,
        col: 0,
        size_x: 4,
        size_y: 4,
      });
    });

    it('should add card with custom position and size', async () => {
      mockApiClient.addCardToDashboard.mockResolvedValue({ id: 99, card_id: 5 });

      const request = createMockRequest('add_card_to_dashboard', {
        dashboard_id: 1,
        card_id: 5,
        row: 2,
        col: 4,
        size_x: 8,
        size_y: 6,
      });
      const [logDebug, logInfo, logWarn, logError] = getLoggerFunctions();

      await handleDashboard(
        request, 'test-request-id', mockApiClient as any, logDebug, logInfo, logWarn, logError
      );

      expect(mockApiClient.addCardToDashboard).toHaveBeenCalledWith(1, {
        card_id: 5,
        row: 2,
        col: 4,
        size_x: 8,
        size_y: 6,
      });
    });
  });

  describe('update_dashboard_cards', () => {
    it('should throw error when dashboard_id is missing', async () => {
      const request = createMockRequest('update_dashboard_cards', {
        cards: [{ id: 42, row: 0, col: 0, size_x: 4, size_y: 4 }],
      });
      const [logDebug, logInfo, logWarn, logError] = getLoggerFunctions();

      await expect(
        handleDashboard(request, 'test-request-id', mockApiClient as any, logDebug, logInfo, logWarn, logError)
      ).rejects.toThrow(McpError);
    });

    it('should throw error when cards is empty', async () => {
      const request = createMockRequest('update_dashboard_cards', { dashboard_id: 1, cards: [] });
      const [logDebug, logInfo, logWarn, logError] = getLoggerFunctions();

      await expect(
        handleDashboard(request, 'test-request-id', mockApiClient as any, logDebug, logInfo, logWarn, logError)
      ).rejects.toThrow(McpError);

      expect(mockLogger.logWarn).toHaveBeenCalledWith(
        'Missing or invalid cards parameter',
        { requestId: 'test-request-id' }
      );
    });

    it('should update dashboard cards layout successfully', async () => {
      mockApiClient.updateDashboardCards.mockResolvedValue([]);

      const cards = [{ id: 42, row: 0, col: 0, size_x: 6, size_y: 4 }];
      const request = createMockRequest('update_dashboard_cards', { dashboard_id: 1, cards });
      const [logDebug, logInfo, logWarn, logError] = getLoggerFunctions();

      const result = await handleDashboard(
        request, 'test-request-id', mockApiClient as any, logDebug, logInfo, logWarn, logError
      );

      const parsed = JSON.parse(result.content[0].text);
      expect(parsed.success).toBe(true);
      expect(parsed.operation).toBe('update_dashboard_cards');
      expect(parsed.updated_count).toBe(1);
      expect(mockApiClient.updateDashboardCards).toHaveBeenCalledWith(1, cards);
    });
  });
});
