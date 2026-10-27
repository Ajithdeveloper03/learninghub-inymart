export interface ApiResponse<T = any> {
  success: boolean;
  message?: string;
  data: T;
  error?: string;
  errors?: Record<string, string[]>;
  meta?: any;
}

function getApiBase(): string {
  if (typeof window !== 'undefined') {
    if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
      return process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:8000/api';
    }
    // If deployed in a subfolder like inymartacademy.com/learninghub
    if (window.location.pathname.startsWith('/learninghub')) {
      return '/learninghub/api';
    }
    // Subdomain root (e.g. learninghub.inymartacademy.com)
    return '/api';
  }
  return process.env.NEXT_PUBLIC_API_URL || '/api';
}

export function getAuthToken(): string | null {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem('dm_token');
}

export function setAuthToken(token: string): void {
  if (typeof window !== 'undefined') {
    localStorage.setItem('dm_token', token);
  }
}

export function removeAuthToken(): void {
  if (typeof window !== 'undefined') {
    localStorage.removeItem('dm_token');
  }
}

export async function apiFetch<T = any>(
  endpoint: string,
  options: RequestInit = {}
): Promise<ApiResponse<T>> {
  const token = getAuthToken();
  const headers = new Headers(options.headers || {});

  if (token && !headers.has('Authorization')) {
    headers.set('Authorization', `Bearer ${token}`);
  }

  // Set Content-Type only if body is not FormData
  if (!(options.body instanceof FormData) && !headers.has('Content-Type')) {
    headers.set('Content-Type', 'application/json');
  }

  const apiBase = getApiBase();
  const url = endpoint.startsWith('http') ? endpoint : `${apiBase}${endpoint.startsWith('/') ? '' : '/'}${endpoint}`;

  const response = await fetch(url, {
    ...options,
    headers,
    credentials: 'include',
  });

  const contentType = response.headers.get('content-type') || '';
  if (!contentType.includes('application/json')) {
    if (!response.ok) {
      if (response.status === 429) {
        throw new Error('Too many login attempts. Please wait 3 minutes before trying again.');
      }
      if (response.status === 500 || response.status === 502 || response.status === 503 || response.status === 504) {
        if (typeof window !== 'undefined' && window.location.hostname === 'localhost') {
          throw new Error('Backend server is not reachable. Please start the PHP server on port 8000 (php -S 127.0.0.1:8000 -t backend/public backend/public/index.php).');
        }
        throw new Error('Learning Management Service is currently unavailable. Please verify backend connection or try again shortly.');
      }
      throw new Error(`Server returned status ${response.status}`);
    }
    return { success: true, data: {} as T };
  }

  const data: ApiResponse<T> = await response.json();

  if (!response.ok || !data.success) {
    if (response.status === 401) {
      removeAuthToken();
      // Only fire session-revoked warning if the backend explicitly reports that an existing session was revoked
      const isRevokedError = data.error?.toLowerCase().includes('revoked') || 
                             (data as any)?.code === 'SESSION_REVOKED';
      if (typeof window !== 'undefined' && isRevokedError && !endpoint.includes('/auth/login')) {
        window.dispatchEvent(new CustomEvent('session-revoked', { detail: { message: data.error } }));
      }
    }

    let message = data.error || 'API request failed';
    if (data.errors && typeof data.errors === 'object') {
      const errMsgs = Object.values(data.errors).flat().filter(Boolean);
      if (errMsgs.length > 0) {
        message = errMsgs.join(' ');
      }
    }

    const error = new Error(message) as any;
    error.status = response.status;
    error.data = data;
    throw error;
  }

  return data;
}
