import { Type } from 'class-transformer';
import {
  IsString,
  IsNotEmpty,
  IsOptional,
  ValidateNested,
  IsEnum,
  IsBoolean,
} from 'class-validator';
import { MediaDto } from '../common/common.dto';
import {
  CommunityRuleDto,
  CommunityStatus,
  CommunityVisibility,
} from './common.dto';

export class GetCommunityMembershipRequestDto {
  @IsString()
  @IsNotEmpty()
  communityId: string;

  @IsString()
  @IsNotEmpty()
  userId: string;
}

export class CommunityMembershipResponseDto {
  @IsBoolean()
  exists: boolean;

  @IsString()
  @IsNotEmpty()
  communityId: string;

  @IsString()
  @IsNotEmpty()
  userId: string;

  @IsString()
  @IsNotEmpty()
  joinedAt: string;

  @IsString()
  @IsNotEmpty()
  id: string;

  @IsString()
  @IsEnum(['PENDING', 'ACTIVE', 'BANNED'])
  status: string;

  @IsOptional()
  @IsString()
  leftAt: string | null;

  @IsOptional()
  @IsString()
  bannedAt: string | null;
}

export interface CommunityInfoRequestDto {
  communityName: string;
}

export interface CommunityInfoResponseDto {
  id: string;
  name: string;
  title: string;
  description?: string | null;

  ownerId: string;

  visibility: CommunityVisibility;
  status: CommunityStatus;

  icon?: Omit<MediaDto, 'action'> | null;
  banner?: Omit<MediaDto, 'action'> | null;

  moderators: CommunityModeratorDto[];
  rules: CommunityRuleDto[];

  counts: CommunityInfoCountsDto;

  createdAt: string;
  updatedAt: string;
}

interface CommunityModeratorDto {
  id: string;
  communityId: string;
  userId: string;
  role: 'MODERATOR' | 'OWNER';
  status: 'INVITED' | 'ACTIVE' | 'REJECTED' | 'REMOVED';
  invitedAt: string;
  respondedAt?: string;
}

export interface CommunityInfoCountsDto {
  members: number;
  followers: number;
}
