export interface ApiError {
  field: string;
  message: string;
}

export interface ApiEnvelope<T> {
  data: T;
  meta: Record<string, unknown>;
  errors: ApiError[];
}

export interface UserProfile {
  id: number;
  email: string;
  first_name: string;
  last_name: string;
  role: string;
  token?: string;
}

export interface FieldmarkConfig {
  baseUrl: string;
  token?: string;
  email?: string;
}
