export interface CookieDetails {
  name: string;
  value: string;
  path?: string;
  domain?: string;
  expirationDate?: number;
  secure?: boolean;
  httpOnly?: boolean;
  sameSite?: "no_restriction" | "lax" | "strict" | undefined;
}
