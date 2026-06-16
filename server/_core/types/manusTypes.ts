export interface ManusUser {
  openId: string;
  name: string;
  email?: string;
  avatar?: string;
}

export interface SessionPayload {
  // Doctor (Manus OAuth) session fields
  openId?: string;
  name?: string;
  email?: string;
  avatar?: string;
  // Patient (email/password) session fields
  patientId?: number;
  iat?: number;
  exp?: number;
  [key: string]: unknown;
}
