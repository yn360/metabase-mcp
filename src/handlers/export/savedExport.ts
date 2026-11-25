/**
 * Writes an export to disk.
 * Stdio (no public URL) keeps the caller's filename and returns that path.
 * HTTP (public URL set) stores the bytes under a random id and returns a short-lived download URL.
 * The id is the secret: the browser download does not send the MCP bearer token.
 */

import { randomUUID } from 'node:crypto';
import * as fs from 'fs';
import * as path from 'path';
import type { Response } from 'express';
import { config } from '../../config.js';

interface StoredExport {
  filePath: string;
  downloadName: string;
  contentType: string;
  expiresAt: number;
}

const stored = new Map<string, StoredExport>();
let sweeper: ReturnType<typeof setInterval> | undefined;

const CONTENT_TYPES: Record<string, string> = {
  csv: 'text/csv; charset=utf-8',
  json: 'application/json; charset=utf-8',
  xlsx: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
};

const EXPORT_ID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export interface SaveExportResult {
  fileSize: number;
  filePath?: string;
  downloadUrl?: string;
  expiresInSeconds?: number;
}

function contentTypeForFormat(format: string): string {
  return CONTENT_TYPES[format] ?? 'application/octet-stream';
}

function sweep(): void {
  const now = Date.now();
  for (const [id, entry] of stored) {
    if (entry.expiresAt <= now) {
      stored.delete(id);
      fs.rm(entry.filePath, { force: true }, () => undefined);
    }
  }
}

function ensureSweeper(): void {
  if (sweeper) {
    return;
  }
  sweeper = setInterval(sweep, 60_000);
  sweeper.unref();
}

function contentDisposition(downloadName: string): string {
  const ascii = downloadName.replace(/[^\x20-\x7E]/g, '_').replace(/"/g, '');
  return `attachment; filename="${ascii}"; filename*=UTF-8''${encodeURIComponent(downloadName)}`;
}

export function saveExportFile(input: {
  exportDirectory: string;
  downloadName: string;
  format: string;
  body: string | Buffer;
  publicBaseUrl?: string;
}): SaveExportResult {
  if (!fs.existsSync(input.exportDirectory)) {
    fs.mkdirSync(input.exportDirectory, { recursive: true });
  }

  const fileSize = Buffer.byteLength(input.body);
  const publicBaseUrl = input.publicBaseUrl?.replace(/\/$/, '');

  if (publicBaseUrl) {
    const id = randomUUID();
    const filePath = path.join(input.exportDirectory, `${id}.${input.format}`);
    fs.writeFileSync(filePath, input.body);
    stored.set(id, {
      filePath,
      downloadName: input.downloadName,
      contentType: contentTypeForFormat(input.format),
      expiresAt: Date.now() + config.EXPORT_TTL_MS,
    });
    ensureSweeper();
    return {
      fileSize,
      downloadUrl: `${publicBaseUrl}/exports/${id}`,
      expiresInSeconds: config.EXPORT_TTL_MS / 1000,
    };
  }

  const filePath = path.join(input.exportDirectory, input.downloadName);
  fs.writeFileSync(filePath, input.body);
  return { fileSize, filePath };
}

export function exportLocationFields(saved: SaveExportResult): Record<string, unknown> {
  if (saved.downloadUrl) {
    return {
      download_url: saved.downloadUrl,
      expires_in_seconds: saved.expiresInSeconds,
    };
  }
  return { file_path: saved.filePath };
}

export function sendExportDownload(id: string, res: Response): void {
  const entry = EXPORT_ID.test(id) ? stored.get(id) : undefined;
  if (!entry || entry.expiresAt <= Date.now()) {
    if (entry) {
      stored.delete(id);
      fs.rm(entry.filePath, { force: true }, () => undefined);
    }
    res.status(404).type('text/plain').send('Not found');
    return;
  }

  res.setHeader('Content-Type', entry.contentType);
  res.setHeader('Content-Disposition', contentDisposition(entry.downloadName));
  res.setHeader('Cache-Control', 'no-store');
  const stream = fs.createReadStream(entry.filePath);
  stream.on('error', () => {
    if (!res.headersSent) {
      res.status(404).type('text/plain').send('Not found');
    } else {
      res.destroy();
    }
  });
  stream.pipe(res);
}

export function resetExportDownloadsForTests(): void {
  if (sweeper) {
    clearInterval(sweeper);
    sweeper = undefined;
  }
  for (const entry of stored.values()) {
    fs.rmSync(entry.filePath, { force: true });
  }
  stored.clear();
}
