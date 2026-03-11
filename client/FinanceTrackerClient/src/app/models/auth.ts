export interface AuthResponse {
  message?: string;
  token?: string;
  username?: string;
  errors?: any[];
}

export interface RegisterRequest {
  username: string;
  email: string;
  password: string;
}