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
}

export interface refreshTokenResponse {
  accessToken: string;
  refreshToken: string;
}


export interface UserProfile {
  _id: string;
  name: string;
  email: string;
  date: string;
}

export interface Task {
  _id: string; 
  title: string;
  done: boolean;
  createdAt: Date;
  user: string; 
}

export interface TaskStatistics {
  total: number;
  done: number;
  pending: number;
}
