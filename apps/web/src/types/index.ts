export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  username: string;
  avatarUrl?: string;
  headline?: string;
  role: 'super_admin' | 'admin' | 'moderator' | 'member' | 'guest';
  trustLevel: number;
  isVerified: boolean;
  isProfessionalVerified: boolean;
}

export interface ApiResponse<T> {
  data: T;
  meta?: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
  message?: string;
}

export interface PaginationParams {
  page?: number;
  limit?: number;
  sort?: string;
}
