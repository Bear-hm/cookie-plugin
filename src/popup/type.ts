export interface CookieDetails {
  name: string;
  value: string;
  path?: string;
  domain?: string;
  expirationDate?: number;
  secure?: boolean;
  httpOnly?: boolean;
  session?: boolean;
  hostOnly?: boolean;
  sameSite?: "no_restriction" | "lax" | "strict" | undefined;
}
