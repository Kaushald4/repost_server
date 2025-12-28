import { Type } from 'class-transformer';
import {
  IsString,
  IsNotEmpty,
  IsOptional,
  ValidateNested,
  IsEnum,
} from 'class-validator';

class MediaDto {
  @IsString()
  @IsOptional()
  url?: string;

  @IsString()
  @IsOptional()
  fileId?: string;

  @IsString()
  @IsEnum(['keep', 'update', 'delete'])
  action: string;
}

export class CreateCommunityRequest {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsString()
  @IsNotEmpty()
  title: string;

  @IsString()
  @IsOptional()
  description?: string;

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

export class UpdateCommunityRequest {
  @IsString()
  @IsNotEmpty()
  title: string;

  @IsString()
  @IsOptional()
  description?: string;

  @ValidateNested()
  @Type(() => MediaDto)
  @IsOptional()
  icon?: MediaDto | null;

  @ValidateNested()
  @Type(() => MediaDto)
  @IsOptional()
  banner?: MediaDto | null;

  @IsString()
  @IsEnum(['PUBLIC', 'RESTRICTED', 'PRIVATE'])
  visibility: string;
}
