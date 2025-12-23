import { TMedia } from '../common/common.dto';

export interface GetUserByIdRequest {
  id: string;
}

export interface UpdateUserRequest {
  id: string;
  username?: string;
  displayName?: string;
  avatar?: TMedia;
  banner?: TMedia;
  bio?: string;
  isPrivate?: boolean;
  settings?: UserSettingsInput;
}

export interface UserSettingsInput {
  darkMode?: boolean;
  allowDMs?: boolean;
}

export interface UserResponse {
  id: string;
  username: string;
  displayName: string;
  avatar: TMedia;
  bio: string;
  email: string;
  banner: TMedia;
  isPrivate: boolean;
}
