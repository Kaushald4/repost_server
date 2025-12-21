import { Controller } from '@nestjs/common';
import { GrpcMethod } from '@nestjs/microservices';
import { MediaServiceService } from './media-service.service';
import type { UploadFileRequest, UploadFileResponse } from './media.dto';

@Controller()
export class MediaServiceController {
  constructor(private readonly mediaService: MediaServiceService) {}

  @GrpcMethod('MediaService', 'UploadFile')
  uploadFile(data: UploadFileRequest): Promise<UploadFileResponse> {
    return this.mediaService.uploadFile(data);
  }
}
