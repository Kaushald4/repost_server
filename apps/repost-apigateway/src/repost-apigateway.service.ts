import { Injectable } from '@nestjs/common';

@Injectable()
export class RepostApigatewayService {
  getHello(): string {
    return 'Hello World!';
  }
}
