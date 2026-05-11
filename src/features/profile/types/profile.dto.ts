// GET /api/user/profile
export interface UserProfileDTO {
  user_id: string;
  username: string;
  email: string;
  phone: string | null;
  date_of_birth: string | null;
  gender: string | null;
  profile_picture_url: string | null;
}
