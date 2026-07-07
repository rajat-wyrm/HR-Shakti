import {
  Injectable,
  ConflictException,
  UnauthorizedException,
  Logger,
} from '@nestjs/common';
import * as argon2 from 'argon2';
import { v4 as uuidv4 } from 'uuid';
import { JwtService } from '@nestjs/jwt';
import * as fs from 'fs';
import * as path from 'path';
import * as crypto from 'crypto';
import { PrismaService } from '../prisma/prisma.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);

  constructor(
    private prisma: PrismaService,
    private jwtService: JwtService,
  ) {}

  async register(dto: RegisterDto) {
    const existing = await this.prisma.user.findUnique({ where: { email: dto.email.toLowerCase() } });
    if (existing) {
      throw new ConflictException('Email already registered');
    }

    const passwordHash = await argon2.hash(dto.password, {
      memoryCost: parseInt(process.env.ARGON2_MEMORY || '65536'),
      timeCost: parseInt(process.env.ARGON2_ITERATIONS || '3'),
      parallelism: parseInt(process.env.ARGON2_PARALLELISM || '4'),
    });

    const username = dto.email.split('@')[0] + '-' + Math.random().toString(36).slice(2, 6);

    const user = await this.prisma.user.create({
      data: {
        email: dto.email.toLowerCase(),
        passwordHash,
        firstName: dto.firstName,
        lastName: dto.lastName,
        username,
        status: 'pending_verification',
      },
    });

    const token = uuidv4();
    await this.prisma.emailVerificationToken.create({
      data: {
        userId: user.id,
        token,
        expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000),
      },
    });

    this.logger.log(`Verification token for ${user.email}: ${token}`);

    return {
      userId: user.id,
      email: user.email,
      message: 'Verification email sent. Please check your inbox.',
    };
  }

  async login(dto: LoginDto) {
    const user = await this.prisma.user.findUnique({ where: { email: dto.email.toLowerCase() } });
    if (!user) throw new UnauthorizedException('Invalid email or password');

    if (user.status === 'suspended') {
      throw new UnauthorizedException('Account suspended');
    }
    if (user.status === 'pending_verification') {
      throw new UnauthorizedException('Please verify your email first');
    }

    if (!user.passwordHash) throw new UnauthorizedException('Invalid email or password');

    const recentAttempts = await this.prisma.failedLoginAttempt.count({
      where: { userId: user.id, attemptedAt: { gte: new Date(Date.now() - 15 * 60 * 1000) } },
    });
    if (recentAttempts >= 5) {
      throw new UnauthorizedException('Account locked. Try again in 15 minutes.');
    }

    const valid = await argon2.verify(user.passwordHash, dto.password);
    if (!valid) {
      await this.prisma.failedLoginAttempt.create({
        data: { userId: user.id, ipAddress: 'unknown' },
      });
      throw new UnauthorizedException('Invalid email or password');
    }

    const tokens = await this.generateTokens(user);
    await this.prisma.user.update({ where: { id: user.id }, data: { lastLoginAt: new Date() } });

    return {
      accessToken: tokens.accessToken,
      expiresIn: parseInt(process.env.JWT_ACCESS_EXPIRATION || '900'),
      user: {
        id: user.id,
        email: user.email,
        firstName: user.firstName,
        role: user.role,
        trustLevel: user.trustLevel,
      },
      refreshToken: tokens.refreshToken,
    };
  }

  private async generateTokens(user: any) {
    const payload = { sub: user.id, email: user.email, role: user.role, trustLevel: user.trustLevel };

    const privateKey = (() => {
      const relativePath = process.env.JWT_PRIVATE_KEY_PATH || './keys/private.pem';
      const candidates = [
        path.resolve(process.cwd(), relativePath),
        path.resolve(__dirname, '../../../keys/private.pem'),
        path.resolve(__dirname, '../../../../keys/private.pem'),
        path.resolve(__dirname, '../../../../../keys/private.pem'),
        path.resolve(process.cwd(), '../../keys/private.pem'),
      ];
      for (const p of candidates) {
        try { return fs.readFileSync(p, 'utf8'); } catch {}
      }
      throw new Error(`Cannot find JWT private key. Tried: ${candidates.join(', ')}`);
    })();

    const accessToken = this.jwtService.sign(payload, {
      privateKey,
      algorithm: 'RS256',
      expiresIn: parseInt(process.env.JWT_ACCESS_EXPIRATION || '900'),
      issuer: process.env.JWT_ISSUER || 'hrshakti',
      audience: 'hrshakti-api',
    });

    const refreshToken = uuidv4();
    const refreshHash = crypto.createHash('sha256').update(refreshToken).digest('hex');

    await this.prisma.session.create({
      data: {
        userId: user.id,
        refreshTokenHash: refreshHash,
        expiresAt: new Date(Date.now() + parseInt(process.env.JWT_REFRESH_EXPIRATION || '604800') * 1000),
      },
    });

    return { accessToken, refreshToken };
  }
}
