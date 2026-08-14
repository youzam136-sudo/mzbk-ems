import { API_BASE_URL } from './apiConfig';
import { authTokenStorage } from './authTokenStorage';

export type ApiResponse<T> = {
  success: boolean;
  message?: string;
  code?: string;
  data?: T;
};

type ApiClientOptions = {
  method?: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';
  body?: unknown;
  auth?: boolean;
  operationName?: string;
};

export const API_AUTH_REQUIRED_EVENT = 'ems-auth-required';
export const API_ERROR_EVENT = 'ems-api-error';
export type ApiErrorType = 'http' | 'network' | 'session';

export type ApiErrorEventDetail = {
  type: ApiErrorType;
  operationName: string;
  method: string;
  path: string;
  status: number;
  code?: string;
  message: string;
};

export class ApiError extends Error {
  status: number;
  code?: string;
  type: ApiErrorType;

  constructor(message: string, status: number, code?: string, type: ApiErrorType = 'http') {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.code = code;
    this.type = type;
  }
}

const inFlightGetRequests = new Map<string, Promise<unknown>>();

function createInFlightRequestKey(path: string, auth: boolean) {
  const token = auth ? authTokenStorage.read()?.accessToken ?? '' : 'public';

  return `${token}|GET|${path}`;
}

function createHeaders(auth: boolean) {
  const headers = new Headers({ Accept: 'application/json' });

  if (auth) {
    const token = authTokenStorage.read();
    if (token?.accessToken) {
      headers.set('Authorization', `${token.tokenType || 'Bearer'} ${token.accessToken}`);
    }
  }

  return headers;
}

function isApiResponsePayload<T>(payload: unknown): payload is ApiResponse<T> {
  if (!payload || typeof payload !== 'object') {
    return false;
  }

  return 'success' in payload || 'data' in payload || 'code' in payload || 'message' in payload;
}

function notifyAuthRequired(auth: boolean, response: Response, payload?: ApiResponse<unknown>) {
  if (!auth) return;
  if (response.status !== 401 && payload?.code !== 'C002') return;
  if (typeof window === 'undefined') return;

  // 보호 API에서 인증 만료가 확인되면 화면 세션도 함께 정리한다.
  window.dispatchEvent(new CustomEvent(API_AUTH_REQUIRED_EVENT));
}

function isSessionError(status: number, code?: string) {
  return status === 401 || code === 'C002';
}

function notifyApiError(detail: ApiErrorEventDetail) {
  if (typeof window === 'undefined') return;

  window.dispatchEvent(new CustomEvent<ApiErrorEventDetail>(API_ERROR_EVENT, { detail }));
}

export async function apiClient<T>(path: string, options: ApiClientOptions = {}): Promise<T> {
  const { method = 'GET', body, auth = true, operationName = `${method} ${path}` } = options;
  const canShareInFlightRequest = method === 'GET' && body === undefined;
  const inFlightRequestKey = canShareInFlightRequest ? createInFlightRequestKey(path, auth) : undefined;

  if (inFlightRequestKey) {
    const existingRequest = inFlightGetRequests.get(inFlightRequestKey);

    if (existingRequest) {
      return existingRequest as Promise<T>;
    }
  }

  const requestPromise = executeApiRequest<T>(path, { method, body, auth, operationName });

  if (inFlightRequestKey) {
    inFlightGetRequests.set(inFlightRequestKey, requestPromise);
    requestPromise.then(
      () => {
        inFlightGetRequests.delete(inFlightRequestKey);
      },
      () => {
        inFlightGetRequests.delete(inFlightRequestKey);
      }
    );
  }

  return requestPromise;
}

async function executeApiRequest<T>(path: string, options: Required<ApiClientOptions>): Promise<T> {
  const { method, body, auth, operationName } = options;
  const headers = createHeaders(auth);
  const requestInit: RequestInit = { method, headers };

  if (body !== undefined) {
    headers.set('Content-Type', 'application/json');
    requestInit.body = JSON.stringify(body);
  }

  let response: Response;

  try {
    response = await fetch(`${API_BASE_URL}${path}`, requestInit);
  } catch {
    const message = '네트워크 연결 또는 서버 접근에 실패했습니다.';

    notifyApiError({
      type: 'network',
      operationName,
      method,
      path,
      status: 0,
      code: 'NETWORK_ERROR',
      message
    });

    throw new ApiError(message, 0, 'NETWORK_ERROR', 'network');
  }

  const contentType = response.headers.get('content-type') ?? '';
  const payload = contentType.includes('application/json') ? ((await response.json()) as ApiResponse<T> | T) : undefined;
  const apiResponsePayload = isApiResponsePayload<T>(payload) ? payload : undefined;

  if (!response.ok || apiResponsePayload?.success === false) {
    notifyAuthRequired(auth, response, apiResponsePayload as ApiResponse<unknown> | undefined);
    const code = apiResponsePayload?.code;
    const message = apiResponsePayload?.message ?? 'API 요청 처리에 실패했습니다.';
    const type = isSessionError(response.status, code) ? 'session' : 'http';

    if (type !== 'session') {
      notifyApiError({
        type,
        operationName,
        method,
        path,
        status: response.status,
        code,
        message
      });
    }

    throw new ApiError(message, response.status, code, type);
  }

  if (apiResponsePayload && 'data' in apiResponsePayload) {
    return apiResponsePayload.data as T;
  }

  return payload as T;
}
