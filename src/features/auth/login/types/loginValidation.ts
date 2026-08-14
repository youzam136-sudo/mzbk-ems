export type LoginValidationStatus = 'idle' | 'checking' | 'invalid';

export type LoginValidationState = {
  status: LoginValidationStatus;
  message: string;
};

export type LoginCredentials = {
  id: string;
  password: string;
};
