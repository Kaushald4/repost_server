import {
  IsString,
  IsOptional,
  IsBoolean,
  ValidateNested,
  IsNotEmpty,
  IsNumber,
} from 'class-validator';
import { Type } from 'class-transformer';
import { MediaDto } from '../common/common.dto';

export class GetUserByIdRequest {
  @IsString({ message: 'id must be a string' })
  @IsNotEmpty({ message: 'id is required' })
  id: string;
}

export class UserSettingsInput {
  @IsBoolean({ message: 'darkMode must be a boolean' })
  @IsOptional()
  darkMode?: boolean;

  @IsBoolean({ message: 'allowDMs must be a boolean' })
  @IsOptional()
  allowDMs?: boolean;
}

class UserStatsDto {
  @IsNumber()
  helper: number;

  @IsNumber()
  debate: number;

  @IsNumber()
  creative: number;
}

class UserBadgeDto {
  @IsString()
  badgeName: string;

  @IsString()
  earnedAt: string;
}

export class UpdateUserRequest {
  @IsString({ message: 'id must be a string' })
  @IsNotEmpty({ message: 'id is required' })
  id: string;

  @IsString({ message: 'username must be a string' })
  @IsOptional()
  username?: string;

  @IsString({ message: 'displayName must be a string' })
  @IsOptional()
  displayName?: string;

  @ValidateNested()
  @Type(() => MediaDto)
  @IsOptional()
  avatar?: MediaDto;

  @ValidateNested()
  @Type(() => MediaDto)
  @IsOptional()
  banner?: MediaDto;

  @IsString({ message: 'bio must be a string' })
  @IsOptional()
  bio?: string;

  @IsBoolean({ message: 'isPrivate must be a boolean' })
  @IsOptional()
  isPrivate?: boolean;

  @ValidateNested()
  @Type(() => UserSettingsInput)
  @IsOptional()
  settings?: UserSettingsInput;
}

export class UserResponse {
  @IsString()
  id: string;

  @IsString()
  username: string;

  @IsString()
  displayName: string;

  @ValidateNested()
  @Type(() => MediaDto)
  @IsOptional()
  avatar?: Omit<MediaDto, 'action'>;

  @IsString()
  @IsOptional()
  bio?: string;

  @IsString()
  email: string;

  @ValidateNested()
  @Type(() => MediaDto)
  @IsOptional()
  banner?: Omit<MediaDto, 'action'>;

  @IsBoolean()
  isPrivate: boolean;

  @IsNumber()
  karma: number;

  @IsNumber()
  level: number;

  @ValidateNested()
  @Type(() => UserSettingsInput)
  @IsOptional()
  settings?: UserSettingsInput;

  @ValidateNested()
  @Type(() => UserStatsDto)
  @IsOptional()
  stats?: UserStatsDto;

  @ValidateNested({ each: true })
  @Type(() => UserBadgeDto)
  @IsOptional()
  badges?: UserBadgeDto[];

  @IsString()
  createdAt: string;
}
