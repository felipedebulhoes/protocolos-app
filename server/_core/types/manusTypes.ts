export interface ManusUser {
  openId: string;
  name: string;
  email?: string;
  avatar?: string;
}

export interface SessionPayload {
  openId: string;
  name: string;
  email?: string;
  avatar?: string;
  iat?: number;
  exp?: number;
}
