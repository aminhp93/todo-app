export interface User {
  id: number;
  email: string;
  password_hash: string;
  name: string;
  created_at: Date;
}

export interface PublicUser {
  id: number;
  email: string;
  name: string;
  created_at: Date;
}

export interface Category {
  id: number;
  user_id: number;
  name: string;
  color: string;
  created_at: Date;
}

export interface Todo {
  id: number;
  user_id: number;
  category_id: number | null;
  title: string;
  completed: boolean;
  created_at: Date;
}

export interface TodoWithCategory extends Todo {
  category_name: string | null;
  category_color: string | null;
}

export function toPublicUser(user: User): PublicUser {
  const { password_hash: _password_hash, ...publicUser } = user;
  return publicUser;
}
