import { Injectable } from '@nestjs/common';
import { RpcException } from '@nestjs/microservices';
import { status } from '@grpc/grpc-js';
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from './prisma.service';
import {
  RedisService,
  USER_EVENTS_STREAM,
  USER_CREATED_EVENT,
} from '@app/common';
import * as bcrypt from 'bcrypt';
import {
  RegisterRequest,
  RegisterResponse,
  LoginRequest,
  LoginResponse,
  ValidateRequest,
  ValidateResponse,
  RefreshRequest,
  RefreshResponse,
} from '@app/dto';
import { ConfigService } from '@nestjs/config';

interface JwtPayload {
  sub: string;
  email: string;
}

@Injectable()
export class AuthServiceService {
  constructor(
    private prisma: PrismaService,
    private jwtService: JwtService,
    private redisService: RedisService,
    private configService: ConfigService,
  ) {}

  async register(data: RegisterRequest): Promise<RegisterResponse> {
    const existingUser = await this.prisma.authUser.findUnique({
      where: { email: data.email },
    });

    if (existingUser) {
      console.log('User already exists, throwing RpcException');
      throw new RpcException({
        code: status.ALREADY_EXISTS,
        message: 'User already exists',
      });
    }

    const hashedPassword = await bcrypt.hash(data.password, 10);

    const user = await this.prisma.authUser.create({
      data: {
        email: data.email,
        passwordHash: hashedPassword,
      },
    });

    // Publish user.created event to Redis Stream
    await this.redisService.publishEvent(USER_EVENTS_STREAM, {
      eventType: USER_CREATED_EVENT,
      userId: user.id,
      email: user.email,
      timestamp: new Date().toISOString(),
    });

    return {
      id: user.id,
      email: user.email,
    };
  }

  async login(data: LoginRequest): Promise<LoginResponse> {
    const user = await this.prisma.authUser.findUnique({
      where: { email: data.email },
    });

    if (!user || !user.passwordHash) {
      throw new RpcException({
        code: status.UNAUTHENTICATED,
        message: 'Invalid credentials',
      });
    }

    const isPasswordValid = await bcrypt.compare(
      data.password,
      user.passwordHash,
    );

    if (!isPasswordValid) {
      throw new RpcException({
        code: status.UNAUTHENTICATED,
        message: 'Invalid credentials',
      });
    }

    const accessTokenExpiresIn = this.configService.get<string>(
      'JWT_EXPIRATION_TIME',
    )! as unknown as number;

    const refreshTokenExpiresIn = this.configService.get<string>(
      'REFRESH_TOKEN_EXPIRATION_TIME',
    )! as unknown as number;

    const payload = { sub: user.id, email: user.email };
    const accessToken = this.jwtService.sign(payload, {
      expiresIn: Number(accessTokenExpiresIn),
    });
    const refreshToken = this.jwtService.sign(payload, {
      expiresIn: Number(refreshTokenExpiresIn),
    });

    // Clean up expired refresh tokens
    await this.prisma.refreshToken.deleteMany({
      where: {
        authUserId: user.id,
        expiresAt: { lt: new Date() },
      },
    });

    // Enforce maximum active sessions of 4 per user
    const MAX_SESSIONS = 4;
    const activeTokens = await this.prisma.refreshToken.findMany({
      where: { authUserId: user.id },
      orderBy: { createdAt: 'asc' },
      select: { id: true },
    });

    if (activeTokens.length >= MAX_SESSIONS) {
      const numsToRemove = activeTokens.length - MAX_SESSIONS + 1;

      if (numsToRemove > 0) {
        const idsToRemove = activeTokens
          .slice(0, numsToRemove)
          .map((token) => token.id);
        await this.prisma.refreshToken.deleteMany({
          where: { id: { in: idsToRemove } },
        });
      }
    }

    // Store refresh token
    const refreshTokenRecord = await this.prisma.refreshToken.create({
      data: {
        authUserId: user.id,
        token: refreshToken,
        expiresAt: new Date(Date.now() + Number(refreshTokenExpiresIn) * 1000),
        ipAddress: data.ipAddress,
        userAgent: data.userAgent,
      },
    });

    await this.prisma.authUser.update({
      where: { id: user.id },
      data: { lastLoginAt: new Date() },
    });

    return {
      accessToken,
      refreshToken,
      userId: user.id,
      refreshTokenId: refreshTokenRecord.id,
    };
  }

  async validate(data: ValidateRequest): Promise<ValidateResponse> {
    try {
      const payload = await this.jwtService.verifyAsync<JwtPayload>(data.token);
      return { userId: payload.sub, valid: true };
    } catch {
      return { userId: '', valid: false };
    }
  }

  async refresh(data: RefreshRequest): Promise<RefreshResponse> {
    try {
      const storedToken = await this.prisma.refreshToken.findUnique({
        where: { id: data.refreshTokenId },
      });

      if (!storedToken || storedToken.expiresAt < new Date()) {
        throw new RpcException({
          code: status.UNAUTHENTICATED,
          message: 'Invalid refresh token',
        });
      }

      const payload = await this.jwtService.verifyAsync<JwtPayload>(
        storedToken.token,
      );

      const accessTokenExpiresIn = this.configService.get<string>(
        'JWT_EXPIRATION_TIME',
      )! as unknown as number;

      const refreshTokenExpiresIn = this.configService.get<string>(
        'REFRESH_TOKEN_EXPIRATION_TIME',
      )! as unknown as number;

      // Rotate tokens
      const newPayload: JwtPayload = { sub: payload.sub, email: payload.email };
      const newAccessToken = this.jwtService.sign(newPayload, {
        expiresIn: Number(accessTokenExpiresIn),
      });
      const newRefreshToken = this.jwtService.sign(newPayload, {
        expiresIn: Number(refreshTokenExpiresIn),
      });

      // Update stored token
      await this.prisma.refreshToken.update({
        where: { id: storedToken.id },
        data: {
          token: newRefreshToken,
          expiresAt: new Date(
            Date.now() + Number(refreshTokenExpiresIn) * 1000,
          ),
        },
      });

      return {
        accessToken: newAccessToken,
        refreshToken: newRefreshToken,
        refreshTokenId: storedToken.id,
      };
    } catch {
      throw new RpcException({
        code: status.UNAUTHENTICATED,
        message: 'Invalid refresh token',
      });
    }
  }
}
