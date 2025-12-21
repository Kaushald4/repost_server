import { IsString, IsNotEmpty, IsOptional, IsInstance } from 'class-validator';

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

  @IsOptional()
  @IsInstance(File, { message: 'The file must be a valid image file.' })
  icon?: File;

  @IsOptional()
  @IsInstance(File, { message: 'The file must be a valid image file.' })
  banner?: File;
}
