import { http } from './http'

export const api = {
  get: <T>(path: string) => http.get<T>(path).then((r) => r.data),
  post: <T>(path: string, body?: unknown) => http.post<T>(path, body).then((r) => r.data),
  put: <T>(path: string, body?: unknown) => http.put<T>(path, body).then((r) => r.data),
  patch: <T>(path: string, body?: unknown) => http.patch<T>(path, body).then((r) => r.data),
  delete: <T>(path: string) => http.delete<T>(path).then((r) => r.data),
}
