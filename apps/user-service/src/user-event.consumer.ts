import { Injectable, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import {
  RedisService,
  USER_EVENTS_STREAM,
  USER_CREATED_EVENT,
  USER_SERVICE_GROUP,
  USER_SERVICE_CONSUMER,
} from '@app/common';
import { UserServiceService } from './user-service.service';

@Injectable()
export class UserEventConsumer implements OnModuleInit, OnModuleDestroy {
  private consumerGroup = USER_SERVICE_GROUP;
  private consumerName = USER_SERVICE_CONSUMER;
  private isRunning = false;

  constructor(
    private redisService: RedisService,
    private userService: UserServiceService,
  ) {}

  async onModuleInit() {
    const client = this.redisService.getClient();

    // Create consumer group if it doesn't exist
    try {
      await client.xgroup(
        'CREATE',
        USER_EVENTS_STREAM,
        this.consumerGroup,
        '0',
        'MKSTREAM',
      );
      console.log('Consumer group created');
    } catch (error) {
      if (error instanceof Error && error.message.includes('BUSYGROUP')) {
        console.log('Consumer group already exists');
      } else {
        console.error('Error creating consumer group:', error);
      }
    }

    void this.startConsuming();
  }

  onModuleDestroy() {
    this.isRunning = false;
  }

  private async startConsuming() {
    this.isRunning = true;
    const client = this.redisService.getClient();

    while (this.isRunning) {
      try {
        const results = await client.xreadgroup(
          'GROUP',
          this.consumerGroup,
          this.consumerName,
          'BLOCK',
          5000,
          'STREAMS',
          USER_EVENTS_STREAM,
          '>',
        );

        if (results && results.length > 0) {
          for (const [, messages] of results as [
            string,
            [string, string[]][],
          ][]) {
            for (const [messageId, fields] of messages) {
              await this.handleMessage(messageId, fields);
              // Acknowledge the message
              await client.xack(
                USER_EVENTS_STREAM,
                this.consumerGroup,
                messageId,
              );
            }
          }
        }
      } catch (error) {
        console.error('Error consuming messages:', error);
        void new Promise((resolve) => setTimeout(resolve, 5000));
      }
    }
  }

  private async handleMessage(messageId: string, fields: string[]) {
    const event: Record<string, string> = {};
    for (let i = 0; i < fields.length; i += 2) {
      event[fields[i]] = fields[i + 1];
    }

    console.log(`Processing event ${messageId}:`, event);

    if (event.eventType === USER_CREATED_EVENT) {
      await this.userService.createUser(event.userId, event.email);
    }
  }
}
