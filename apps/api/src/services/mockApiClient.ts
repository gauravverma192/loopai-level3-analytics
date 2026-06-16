import { MOCK_API_BASE_URL } from '../constants/index.js';
import type {
  MockApiErrorBody,
  MockBatchRequest,
  MockBatchResponse,
  MockStoreMetrics,
  MockStoreOrdersResponse,
  MockStoresResponse,
} from '../types/mockApi.js';
import { UpstreamError } from '../utils/errors.js';

export class MockApiClient {
  constructor(private readonly baseUrl = MOCK_API_BASE_URL) {}

  getBaseUrl(): string {
    return this.baseUrl;
  }

  async fetchJson<T>(path: string, init?: RequestInit): Promise<T> {
    const url = `${this.baseUrl}${path.startsWith('/') ? path : `/${path}`}`;

    let response: Response;
    try {
      response = await fetch(url, {
        ...init,
        headers: {
          Accept: 'application/json',
          ...(init?.body ? { 'Content-Type': 'application/json' } : {}),
          ...init?.headers,
        },
      });
    } catch (err) {
      throw new UpstreamError(`Failed to reach mock API: ${(err as Error).message}`);
    }

    if (!response.ok) {
      const body = (await response.json().catch(() => null)) as MockApiErrorBody | null;
      throw new UpstreamError(
        body?.error ?? `Mock API returned ${response.status}`,
        response.status >= 500 ? 502 : response.status,
      );
    }

    return response.json() as Promise<T>;
  }

  getStores(): Promise<MockStoresResponse> {
    return this.fetchJson<MockStoresResponse>('/api/stores');
  }

  batch(requests: MockBatchRequest[]): Promise<MockBatchResponse> {
    return this.fetchJson<MockBatchResponse>('/api/batch', {
      method: 'POST',
      body: JSON.stringify({ requests }),
    });
  }

  getStoreOrders(storeId: string, limit = 50): Promise<MockStoreOrdersResponse> {
    const params = new URLSearchParams({ limit: String(limit) });
    return this.fetchJson<MockStoreOrdersResponse>(
      `/api/stores/${encodeURIComponent(storeId)}/orders?${params}`,
    );
  }

  getStoreMetrics(storeId: string): Promise<MockStoreMetrics> {
    return this.fetchJson<MockStoreMetrics>(
      `/api/stores/${encodeURIComponent(storeId)}/metrics`,
    );
  }
}

export type MockApiClientLike = Pick<
  MockApiClient,
  'getStores' | 'batch' | 'getStoreOrders' | 'getStoreMetrics'
>;

export const mockApiClient = new MockApiClient();
