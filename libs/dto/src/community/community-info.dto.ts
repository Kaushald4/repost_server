import { Type } from 'class-transformer';
import {
  IsString,
  IsNotEmpty,
  IsOptional,
  ValidateNested,
  IsEnum,
} from 'class-validator';
import { MediaDto } from '../common/common.dto';
import {
  CommunityRuleDto,
  CommunityStatus,
  CommunityVisibility,
} from './common.dto';

export interface CommunityInfoRequestDto {
  communityName: string;
}

export interface CommunityInfoResponseDto {
  id: string;
  name: string;
  title: string;
  description?: string | null;

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
