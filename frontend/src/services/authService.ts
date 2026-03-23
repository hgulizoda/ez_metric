import api from './api';

export interface User {
  id: number;
  username: string;
  role: 'admin' | 'manager';
}

interface LoginResponse {
  token: string;
  user: User;
}

interface ApiResponse<T> {
  success: boolean;
  data: T | null;
  error: string | null;
}

export const authService = {
  async login(username: string, password: string): Promise<LoginResponse> {
    const { data } = await api.post<ApiResponse<LoginResponse>>('/auth/login', {
      username,
      password,
    });
    if (!data.success || !data.data) {
      throw new Error(data.error || 'Login failed');
    }
    return data.data;
  },

  async me(): Promise<User> {
    const { data } = await api.get<ApiResponse<User>>('/auth/me');
    if (!data.success || !data.data) {
      throw new Error(data.error || 'Failed to get user');
    }
    return data.data;
  },
};
