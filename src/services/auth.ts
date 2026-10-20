import { request } from '@/lib/api'
import type { AuthSession, User } from '@/types'

export function register(body: {
  username: string
  email: string
  password: string
  timezone?: string
}) {
  return request<AuthSession>('/auth/register', { method: 'POST', body })
}

export function login(body: { email: string; password: string }) {
  return request<AuthSession>('/auth/login', { method: 'POST', body })
}

export function getMe() {
  return request<User>('/auth/me')
}
