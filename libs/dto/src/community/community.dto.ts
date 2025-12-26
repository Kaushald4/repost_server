import { Type } from 'class-transformer';
import {
  IsString,
  IsNotEmpty,
  IsOptional,
  ValidateNested,
  IsEnum,
} from 'class-validator';
import { MediaDto } from '../common/common.dto';

export interface CreateCommunityRequestWithOwnerId extends CreateCommunityRequest {
  ownerId: string;
}

export class CreateCommunityRequest {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsString()
  @IsNotEmpty()
  title: string;

  @IsString()
  @IsNotEmpty()
  description: string;

  @ValidateNested()
  @Type(() => MediaDto)
  @IsOptional()
  icon?: Omit<MediaDto, 'action'>;

  @ValidateNested()
  @Type(() => MediaDto)
  @IsOptional()
  banner?: Omit<MediaDto, 'action'>;

  @IsString()
  @IsEnum(['PUBLIC', 'RESTRICTED', 'PRIVATE'])
  visibility: string;
}

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

export enum CommunityVisibility {
  PUBLIC = 'PUBLIC',
  RESTRICTED = 'RESTRICTED',
  PRIVATE = 'PRIVATE',
}

export enum CommunityStatus {
  ACTIVE = 'ACTIVE',
  SUSPENDED = 'SUSPENDED',
  ARCHIVED = 'ARCHIVED',
}

export interface CommunityRuleDto {
  id: string;
  text: string;
  order: number;
}

export interface CommunityCountsDto {
  members: number;
  moderators: number;
  followers: number;
}
