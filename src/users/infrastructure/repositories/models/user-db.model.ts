export interface UserDbModel {
  id: string;
  email: string;
  name: string;
  google_id: string;
  is_super_admin: boolean;
  created_at: Date;
}
