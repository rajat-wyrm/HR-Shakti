import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import * as fs from 'fs';
import * as path from 'path';
import { PrismaService } from '../../prisma/prisma.service';

function loadPublicKey(): string {
  const relativePath = process.env.JWT_PUBLIC_KEY_PATH || './keys/public.pem';
  const candidates = [
    path.resolve(process.cwd(), relativePath),
    path.resolve(__dirname, '../../../keys/public.pem'),
    path.resolve(__dirname, '../../../../keys/public.pem'),
    path.resolve(__dirname, '../../../../../keys/public.pem'),
  ];
  for (const p of candidates) {
    try {
      return fs.readFileSync(p, 'utf8');
    } catch {}
  }
  throw new Error(`Cannot find JWT public key. Tried: ${candidates.join(', ')}`);
}

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(private prisma: PrismaService) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: loadPublicKey(),
      algorithms: ['RS256'],
      issuer: process.env.JWT_ISSUER || 'hrshakti',
    });
  }

  async validate(payload: { sub: string; email: string; role: string; trustLevel: number }) {
    const user = await this.prisma.user.findUnique({
      where: { id: payload.sub },
      select: { id: true, email: true, role: true, trustLevel: true, status: true },
    });
    if (!user || user.status !== 'active') {
      throw new UnauthorizedException('User not found or inactive');
    }
    return user;
  }
}
