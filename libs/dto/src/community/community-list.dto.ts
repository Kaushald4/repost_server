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

export interface CommunityListResponse {
  data: CommunityResponseDto[];
  total: number;
}

export interface CommunityResponseDto {
  id: string;
  name: string;
  title: string;
  description?: string | null;

  visibility: CommunityVisibility;
  status: CommunityStatus;

  icon?: Omit<MediaDto, 'action'> | null;
  banner?: Omit<MediaDto, 'action'> | null;

  rules: CommunityRuleDto[];

  counts: CommunityCountsDto;

  createdAt: string;
  updatedAt: string;
}

export interface CommunityCountsDto {
  members: number;
  moderators: number;
  followers: number;
}
