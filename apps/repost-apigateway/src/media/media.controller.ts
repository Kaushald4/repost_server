import {
  Controller,
  Post,
  UseInterceptors,
  UploadedFile,
  Inject,
  OnModuleInit,
  Body,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import type { ClientGrpc } from '@nestjs/microservices';
import { Observable } from 'rxjs';

interface MediaService {
  uploadFile(data: {
    file: Uint8Array;
    filename: string;
    mimetype: string;
    folder?: string;
  }): Observable<{
    url: string;
    publicId: string;
    success: boolean;
    message: string;
  }>;
}

@Controller('media')
export class MediaController implements OnModuleInit {
  private mediaService: MediaService;

  constructor(@Inject('MEDIA_SERVICE') private client: ClientGrpc) {}

  onModuleInit() {
    this.mediaService = this.client.getService<MediaService>('MediaService');
  }

  @Post('upload')
  @UseInterceptors(FileInterceptor('file'))
  uploadFile(
    @UploadedFile() file: Express.Multer.File,
    @Body('folder') folder?: string,
  ) {
    return this.mediaService.uploadFile({
      file: file.buffer,
      filename: file.originalname,
      mimetype: file.mimetype,
      folder,
    });
  }
}
