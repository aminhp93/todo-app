export interface Todo {
  id: number;
  title: string;
  completed: boolean;
  created_at: string;
  category_id?: number | null;
  category_name?: string | null;
}

export interface BackendOption {
  id: string;
  name: string;
  url: string;
  framework: string;
  port: number;
  color: string;
  bgColor: string;
  borderColor: string;
  /** node-express requires a JWT (register/login) before /api/todos works. */
  requiresAuth: boolean;
}

export interface AuthUser {
  id: number;
  email: string;
  name: string;
  created_at: string;
}

export interface StatusMessage {
  type: 'success' | 'error' | 'loading';
  text: string;
}
