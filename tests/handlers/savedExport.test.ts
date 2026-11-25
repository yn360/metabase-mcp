import { mkdtempSync, readFileSync, rmSync } from 'fs';
import { tmpdir } from 'os';
import { join } from 'path';
import { Writable } from 'stream';
import { afterEach, describe, expect, it } from 'vitest';
import type { Response } from 'express';
import { config } from '../../src/config.js';
import {
  exportLocationFields,
  resetExportDownloadsForTests,
  saveExportFile,
  sendExportDownload,
} from '../../src/handlers/export/savedExport.js';

describe('saveExportFile', () => {
  const directories: string[] = [];

  afterEach(() => {
    resetExportDownloadsForTests();
    for (const directory of directories.splice(0)) {
      rmSync(directory, { recursive: true, force: true });
    }
  });

  function directory(): string {
    const created = mkdtempSync(join(tmpdir(), 'metabase-export-'));
    directories.push(created);
    return created;
  }

  it('writes the given filename and returns file_path when there is no public URL', () => {
    const exportDirectory = directory();
    const saved = saveExportFile({
      exportDirectory,
      downloadName: 'orders.csv',
      format: 'csv',
      body: 'id\n1\n',
    });

    expect(saved.filePath).toBe(join(exportDirectory, 'orders.csv'));
    expect(readFileSync(saved.filePath!, 'utf8')).toBe('id\n1\n');
    expect(exportLocationFields(saved)).toEqual({ file_path: saved.filePath });
  });

  it('stores a random id and returns a download URL when a public URL is set', () => {
    const exportDirectory = directory();
    const saved = saveExportFile({
      exportDirectory,
      downloadName: 'سفارش ها.csv',
      format: 'csv',
      body: 'id\n1\n',
      publicBaseUrl: 'https://metabase.example.com/mcp/',
    });

    expect(saved.filePath).toBeUndefined();
    expect(saved.expiresInSeconds).toBe(config.EXPORT_TTL_MS / 1000);
    expect(saved.downloadUrl).toMatch(
      /^https:\/\/metabase\.example\.com\/mcp\/exports\/[0-9a-f-]{36}$/
    );
    expect(exportLocationFields(saved)).toEqual({
      download_url: saved.downloadUrl,
      expires_in_seconds: config.EXPORT_TTL_MS / 1000,
    });

    const id = saved.downloadUrl!.split('/').pop()!;
    const written = readFileSync(join(exportDirectory, `${id}.csv`), 'utf8');
    expect(written).toBe('id\n1\n');
  });

  it('streams the saved file and rejects an unknown id', async () => {
    const exportDirectory = directory();
    const saved = saveExportFile({
      exportDirectory,
      downloadName: 'orders.csv',
      format: 'csv',
      body: 'id\n1\n',
      publicBaseUrl: 'https://metabase.example.com/mcp',
    });
    const id = saved.downloadUrl!.split('/').pop()!;
    const headers = new Map<string, string>();
    let streamed = '';
    const res = new Writable({
      write(chunk, _encoding, callback) {
        streamed += chunk.toString();
        callback();
      },
    }) as Writable & Response;
    res.setHeader = ((name: string, value: string) => {
      headers.set(name, value);
      return res;
    }) as Response['setHeader'];
    const finished = new Promise<void>(resolve => res.on('finish', () => resolve()));

    sendExportDownload(id, res);
    await finished;
    expect(headers.get('Content-Type')).toContain('text/csv');
    expect(headers.get('Content-Disposition')).toContain('filename="orders.csv"');
    expect(streamed).toBe('id\n1\n');

    const missing = {
      statusCode: 200,
      body: '',
      status(code: number) {
        this.statusCode = code;
        return this;
      },
      type() {
        return this;
      },
      send(body: string) {
        this.body = body;
      },
    };
    sendExportDownload('not-an-id', missing as unknown as Response);
    expect(missing.statusCode).toBe(404);
    expect(missing.body).toBe('Not found');
  });
});
