export interface GetUserByIdRequest {
  id: string;
}

export interface UserResponse {
  id: string;
  username: string;
  displayName: string;
  avatar: string;
  bio: string;
  email: string;
}
