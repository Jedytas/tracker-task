export interface RegisterPayload {
  name: string;
  email: string;
  password: string;
  confirmPassword: string; 
}
export interface LoginPayload {
  email: string;
  password: string;
}

export interface LoginResponse {
  accessToken: string;
  refreshToken: string;
}

export interface RegisterResponse {
  message: string;
  verificationDelivery?: 'email' | 'log';
}

export interface refreshTokenResponse {
  accessToken: string;
  refreshToken: string;
}


export interface UserProfile {
  _id: string;
  name: string;
  email: string;
  avatar?: string | null;
  createdAt: string;
  updatedAt?: string;
  isEmailVerified?: boolean;
  pendingEmail?: string | null;
}

export interface Task {
  _id: string; 
  title: string;
  description?: string;
  category?: string;
  priority?: string;
  done: boolean;
  date: Date;
  user: string;
  deadline?: Date;
  completedDate?: Date;
}

export interface TaskStatistics {
  total: number;
  done: number;
  pending: number;
}
