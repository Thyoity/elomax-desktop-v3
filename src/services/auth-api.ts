import axios from 'axios'

import { API_BASE_URL } from '@/config/api'

const API_BASE = API_BASE_URL

export interface RawUser {
  id: string | number
  credit: any
  email: string
  username: string
  maxcoins: any
  type: any
  group?: { name: string } | null
  avatar?: { name: string } | null
  dateCreated: any
}

export interface AuthResult {
  token: string
  user: RawUser
}

export class AuthApi {
  async login(email: string, password: string): Promise<AuthResult> {
    const { data } = await axios.post(`${API_BASE}/auth`, { email, password })
    if (!data?.data?.token) {
      throw new Error('invalid_credentials')
    }
    const token = data.data.token as string
    const res = await axios.get(`${API_BASE}/me`, {
      headers: { Authorization: `Bearer ${token}` },
    })
    return { token, user: res.data.data }
  }
}

export const authApi = new AuthApi()
