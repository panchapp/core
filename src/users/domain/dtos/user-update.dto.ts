export interface UserUpdateDto {
  email?: string;
  name?: string;
  googleId?: string | null;
  isSuperAdmin?: boolean;
}
