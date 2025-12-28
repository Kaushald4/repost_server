import { Type } from 'class-transformer';
import {
  IsString,
  IsNotEmpty,
  IsOptional,
  ValidateNested,
  IsEnum,
} from 'class-validator';
import { MediaDto } from '../common/common.dto';

export class UpdateCommunityRequest {
  @IsString()
  @IsNotEmpty()
  title: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsString()
  @IsEnum(['PUBLIC', 'RESTRICTED', 'PRIVATE'])
  visibility: string;

  @ValidateNested()
  @Type(() => UpdateMediaDto)
  @IsOptional()
  icon?: UpdateMediaDto;

  @ValidateNested()
  @Type(() => UpdateMediaDto)
  @IsOptional()
  banner?: UpdateMediaDto;
}

export class UpdateMediaDto extends MediaDto {
  @IsString()
  @IsEnum(['keep', 'update', 'delete'])
  action: string;
}
