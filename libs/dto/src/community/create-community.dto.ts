import { Type } from 'class-transformer';
import {
  IsString,
  IsNotEmpty,
  IsOptional,
  ValidateNested,
  IsEnum,
} from 'class-validator';
import { MediaDto } from '../common/common.dto';

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
