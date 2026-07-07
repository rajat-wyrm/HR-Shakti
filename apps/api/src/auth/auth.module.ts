import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import * as fs from 'fs';
import * as path from 'path';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { JwtStrategy } from './strategies/jwt.strategy';

function loadPrivateKey(): string {
  const relativePath = process.env.JWT_PRIVATE_KEY_PATH || './keys/private.pem';
  const candidates = [
    path.resolve(process.cwd(), relativePath),
    path.resolve(__dirname, '../../../keys/private.pem'),
    path.resolve(__dirname, '../../../../keys/private.pem'),
    path.resolve(__dirname, '../../../../../keys/private.pem'),
    path.resolve(process.cwd(), '../../keys/private.pem'),
    path.resolve(__dirname, '../../../../../keys/private.pem'),
  ];
  for (const p of candidates) {
    try {
      return fs.readFileSync(p, 'utf8');
    } catch {}
  }
  throw new Error(`Cannot find JWT private key. Tried: ${candidates.join(', ')}`);
}

@Module({
  imports: [
    PassportModule.register({ defaultStrategy: 'jwt' }),
    JwtModule.register({
      privateKey: loadPrivateKey(),
      signOptions: { algorithm: 'RS256' },
    }),
  ],
  controllers: [AuthController],
  providers: [AuthService, JwtStrategy],
  exports: [JwtModule, PassportModule],
})
export class AuthModule {}
