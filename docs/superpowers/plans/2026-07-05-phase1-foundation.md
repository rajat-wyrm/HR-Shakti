# Phase 1: Foundation — Implementation Plan

> **For agentic workers:** Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Set up the entire HRShakti monorepo foundation — project structure, infrastructure (Docker, DB), Prisma schema for all ~65 tables, Auth module (JWT, OAuth, email verification, RBAC), User module (profiles, experiences, education, certifications, skills), and common backend infrastructure (guards, interceptors, pipes, filters, error handling, API response format).

**Architecture:** Monorepo (pnpm + Turborepo) with two apps — `apps/web` (Next.js 14+ App Router) and `apps/api` (NestJS modular monolith). Shared configs at root. Docker Compose for local Postgres/Redis/Elasticsearch/MinIO.

**Tech Stack:** Next.js 14+ (App Router), NestJS, TypeScript strict mode, Prisma ORM, PostgreSQL 16+, Redis 7+, Elasticsearch 8+, MinIO (S3-compatible), Turborepo, pnpm, Argon2, Passport.js, JWT (RS256), class-validator, Swagger

---

## Task 1: Initialize Monorepo

**Files:**
- Create: `package.json` (root)
- Create: `pnpm-workspace.yaml`
- Create: `turbo.json`
- Create: `tsconfig/base.json`
- Create: `tsconfig/nextjs.json`
- Create: `tsconfig/nest.json`
- Create: `.prettierrc`
- Create: `.eslintrc.js`
- Create: `.gitignore`
- Create: `docker-compose.yml`
- Create: `Dockerfile` (frontend)
- Create: `Dockerfile` (backend)
- Create: `.env.example`

- [ ] **Step 1: Create root package.json**

```json
{
  "name": "hrshakti",
  "private": true,
  "scripts": {
    "dev": "turbo dev",
    "build": "turbo build",
    "lint": "turbo lint",
    "format": "prettier --write \"**/*.{ts,tsx,md}\"",
    "db:generate": "pnpm --filter @hrshakti/api run prisma:generate",
    "db:push": "pnpm --filter @hrshakti/api run prisma:push",
    "db:studio": "pnpm --filter @hrshakti/api run prisma:studio",
    "db:migrate": "pnpm --filter @hrshakti/api run prisma:migrate"
  },
  "devDependencies": {
    "turbo": "^2.0.0",
    "prettier": "^3.2.0",
    "eslint": "^8.57.0",
    "typescript": "^5.4.0"
  },
  "packageManager": "pnpm@9.0.0",
  "engines": {
    "node": ">=18"
  }
}
```

- [ ] **Step 2: Create pnpm-workspace.yaml**

```yaml
packages:
  - "apps/*"
  - "packages/*"
```

- [ ] **Step 3: Create turbo.json**

```json
{
  "$schema": "https://turbo.build/schema.json",
  "globalDependencies": ["**/.env.*local"],
  "pipeline": {
    "build": {
      "dependsOn": ["^build"],
      "outputs": [".next/**", "dist/**"]
    },
    "dev": {
      "cache": false,
      "persistent": true
    },
    "lint": {
      "dependsOn": ["^build"]
    }
  }
}
```

- [ ] **Step 4: Create tsconfig/base.json**

```json
{
  "compilerOptions": {
    "target": "ES2022",
    "module": "ESNext",
    "moduleResolution": "bundler",
    "strict": true,
    "esModuleInterop": true,
    "skipLibCheck": true,
    "forceConsistentCasingInFileNames": true,
    "resolveJsonModule": true,
    "isolatedModules": true,
    "declaration": true,
    "declarationMap": true,
    "sourceMap": true
  }
}
```

- [ ] **Step 5: Create tsconfig/nextjs.json**

```json
{
  "extends": "./base.json",
  "compilerOptions": {
    "jsx": "preserve",
    "lib": ["dom", "dom.iterable", "esnext"],
    "noEmit": true,
    "incremental": true,
    "plugins": [{ "name": "next" }],
    "paths": {
      "@/*": ["./src/*"]
    }
  }
}
```

- [ ] **Step 6: Create tsconfig/nest.json**

```json
{
  "extends": "./base.json",
  "compilerOptions": {
    "emitDecoratorMetadata": true,
    "experimentalDecorators": true,
    "target": "ES2022",
    "outDir": "./dist",
    "baseUrl": "./",
    "incremental": true,
    "paths": {
      "@/*": ["./src/*"]
    }
  }
}
```

- [ ] **Step 7: Create .prettierrc**

```json
{
  "semi": true,
  "singleQuote": true,
  "trailingComma": "all",
  "printWidth": 100,
  "tabWidth": 2
}
```

- [ ] **Step 8: Create .gitignore**

```
node_modules/
dist/
.next/
*.env
.env.local
.env.development.local
.env.production.local
!*.example
turbo-output/
.prisma/
*.tsbuildinfo
```

- [ ] **Step 9: Create docker-compose.yml**

```yaml
version: "3.8"

services:
  postgres:
    image: postgis/postgis:16-3.4
    environment:
      POSTGRES_DB: hrshakti
      POSTGRES_USER: hrshakti
      POSTGRES_PASSWORD: hrshakti_dev
    ports:
      - "5432:5432"
    volumes:
      - pgdata:/var/lib/postgresql/data
      - ./docker/postgres/init.sql:/docker-entrypoint-initdb.d/init.sql

  redis:
    image: redis:7-alpine
    ports:
      - "6379:6379"
    volumes:
      - redisdata:/data

  elasticsearch:
    image: elasticsearch:8.12.0
    environment:
      - discovery.type=single-node
      - xpack.security.enabled=false
      - ES_JAVA_OPTS=-Xms512m -Xmx512m
    ports:
      - "9200:9200"
    volumes:
      - esdata:/usr/share/elasticsearch/data

  minio:
    image: minio/minio
    command: server /data --console-address ":9001"
    environment:
      MINIO_ROOT_USER: hrshakti
      MINIO_ROOT_PASSWORD: hrshakti_dev
    ports:
      - "9000:9000"
      - "9001:9001"
    volumes:
      - miniodata:/data

volumes:
  pgdata:
  redisdata:
  esdata:
  miniodata:
```

- [ ] **Step 10: Create docker/postgres/init.sql**

```sql
CREATE EXTENSION IF NOT EXISTS pgcrypto;
CREATE EXTENSION IF NOT EXISTS ltree;
```

- [ ] **Step 11: Create .env.example**

```env
# Database
DATABASE_URL=postgresql://hrshakti:hrshakti_dev@localhost:5432/hrshakti

# Redis
REDIS_URL=redis://localhost:6379

# Elasticsearch
ELASTICSEARCH_URL=http://localhost:9200

# S3/MinIO
S3_ENDPOINT=http://localhost:9000
S3_REGION=us-east-1
S3_ACCESS_KEY=hrshakti
S3_SECRET_KEY=hrshakti_dev
S3_BUCKET=hrshakti-uploads

# JWT
JWT_PRIVATE_KEY_PATH=./keys/private.pem
JWT_PUBLIC_KEY_PATH=./keys/public.pem
JWT_ACCESS_EXPIRATION=900
JWT_REFRESH_EXPIRATION=604800
JWT_ISSUER=hrshakti

# Argon2
ARGON2_MEMORY=65536
ARGON2_ITERATIONS=3
ARGON2_PARALLELISM=4

# OAuth
GOOGLE_CLIENT_ID=
GOOGLE_CLIENT_SECRET=
LINKEDIN_CLIENT_ID=
LINKEDIN_CLIENT_SECRET=
MICROSOFT_CLIENT_ID=
MICROSOFT_CLIENT_SECRET=

# SMTP
SMTP_HOST=
SMTP_PORT=587
SMTP_USER=
SMTP_PASS=
SMTP_FROM=noreply@hrshakti.com

# App
APP_URL=http://localhost:3000
API_URL=http://localhost:4000
NODE_ENV=development
```

- [ ] **Step 12: Initialize the repo**

```bash
cd /home/princetheprogrammerbtw/HrSakthi
pnpm install
git add -A && git commit -m "chore: initialize monorepo structure"
```

---

## Task 2: Generate RSA Key Pair for JWT

**Files:**
- Create: `scripts/generate-keys.sh`

- [ ] **Step 1: Create the key generation script**

```bash
mkdir -p keys
openssl genpkey -algorithm RSA -out keys/private.pem -pkeyopt rsa_keygen_bits:2048
openssl rsa -pubout -in keys/private.pem -out keys/public.pem
echo "JWT RSA key pair generated in keys/"
```

- [ ] **Step 2: Run it and add keys to .gitignore**

```bash
bash scripts/generate-keys.sh
```

Add to `.gitignore`:
```
keys/
```

---

## Task 3: Scaffold Next.js Frontend App

**Files:**
- Create: `apps/web/package.json`
- Create: `apps/web/tsconfig.json`
- Create: `apps/web/next.config.js`
- Create: `apps/web/tailwind.config.ts`
- Create: `apps/web/postcss.config.js`
- Create: `apps/web/src/app/layout.tsx`
- Create: `apps/web/src/app/page.tsx`
- Create: `apps/web/src/app/globals.css`
- Create: `apps/web/src/lib/api.ts`
- Create: `apps/web/src/lib/utils.ts`
- Create: `apps/web/src/types/index.ts`

- [ ] **Step 1: Create apps/web/package.json**

```json
{
  "name": "@hrshakti/web",
  "version": "0.1.0",
  "private": true,
  "scripts": {
    "dev": "next dev",
    "build": "next build",
    "start": "next start",
    "lint": "next lint"
  },
  "dependencies": {
    "next": "^14.2.0",
    "react": "^18.3.0",
    "react-dom": "^18.3.0",
    "lucide-react": "^0.400.0",
    "clsx": "^2.1.0",
    "tailwind-merge": "^2.3.0",
    "class-variance-authority": "^0.7.0",
    "zustand": "^4.5.0",
    "@tanstack/react-query": "^5.40.0",
    "axios": "^1.7.0",
    "react-hook-form": "^7.51.0",
    "zod": "^3.23.0",
    "@hookform/resolvers": "^3.6.0",
    "socket.io-client": "^4.7.0"
  },
  "devDependencies": {
    "@types/node": "^20.12.0",
    "@types/react": "^18.3.0",
    "@types/react-dom": "^18.3.0",
    "typescript": "^5.4.0",
    "tailwindcss": "^3.4.0",
    "postcss": "^8.4.0",
    "autoprefixer": "^10.4.0",
    "eslint": "^8.57.0",
    "eslint-config-next": "^14.2.0",
    "@tailwindcss/typography": "^0.5.0"
  }
}
```

- [ ] **Step 2: Create apps/web/tsconfig.json**

```json
{
  "extends": "../../tsconfig/nextjs.json",
  "compilerOptions": {
    "baseUrl": ".",
    "paths": {
      "@/*": ["./src/*"]
    }
  },
  "include": ["next-env.d.ts", "**/*.ts", "**/*.tsx", ".next/types/**/*.ts"],
  "exclude": ["node_modules"]
}
```

- [ ] **Step 3: Create apps/web/next.config.js**

```javascript
/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      { protocol: 'https', hostname: '**' },
    ],
  },
  experimental: {
    serverActions: true,
  },
};

module.exports = nextConfig;
```

- [ ] **Step 4: Create apps/web/tailwind.config.ts**

```typescript
import type { Config } from 'tailwindcss';

const config: Config = {
  content: ['./src/**/*.{js,ts,jsx,tsx,mdx}'],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: '#6366F1',
          dark: '#4F46E5',
          light: '#EEF2FF',
        },
        secondary: '#0EA5E9',
        accent: '#F59E0B',
        success: '#22C55E',
        danger: '#EF4444',
        warning: '#F97316',
        anonymous: {
          purple: '#8B5CF6',
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        mono: ['JetBrains Mono', 'monospace'],
      },
      borderRadius: {
        sm: '6px',
        md: '8px',
        lg: '12px',
        xl: '16px',
      },
    },
  },
  plugins: [require('@tailwindcss/typography')],
};

export default config;
```

- [ ] **Step 5: Create apps/web/postcss.config.js**

```javascript
module.exports = {
  plugins: {
    tailwindcss: {},
    autoprefixer: {},
  },
};
```

- [ ] **Step 6: Create apps/web/src/app/globals.css**

```css
@tailwind base;
@tailwind components;
@tailwind utilities;

@layer base {
  :root {
    --background: #F8FAFC;
    --foreground: #0F172A;
    --card: #FFFFFF;
    --card-foreground: #0F172A;
    --border: #E2E8F0;
    --muted: #64748B;
  }

  body {
    @apply bg-[var(--background)] text-[var(--foreground)] font-sans;
  }
}
```

- [ ] **Step 7: Create apps/web/src/app/layout.tsx**

```tsx
import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';

const inter = Inter({ subsets: ['latin'], variable: '--font-inter' });

export const metadata: Metadata = {
  title: 'HRShakti — The Professional Home for HR',
  description: 'A verified, community-first ecosystem where HR professionals network, discuss, learn, and get AI-powered assistance.',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={inter.variable}>
      <body className="min-h-screen">{children}</body>
    </html>
  );
}
```

- [ ] **Step 8: Create apps/web/src/app/page.tsx**

```tsx
export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-8">
      <h1 className="text-4xl font-bold text-primary">HRShakti</h1>
      <p className="mt-4 text-lg text-muted">The Professional Home for HR</p>
      <p className="mt-2 text-sm text-muted">Coming soon.</p>
    </main>
  );
}
```

- [ ] **Step 9: Create apps/web/src/lib/api.ts**

```typescript
import axios from 'axios';

const apiClient = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api/v1',
  headers: { 'Content-Type': 'application/json' },
});

apiClient.interceptors.request.use((config) => {
  if (typeof window !== 'undefined') {
    const token = localStorage.getItem('accessToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
  }
  return config;
});

apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response?.status === 401 && typeof window !== 'undefined') {
      try {
        const { data } = await axios.post(
          `${apiClient.defaults.baseURL}/auth/refresh`,
          {},
          { withCredentials: true },
        );
        localStorage.setItem('accessToken', data.data.accessToken);
        error.config.headers.Authorization = `Bearer ${data.data.accessToken}`;
        return apiClient(error.config);
      } catch {
        localStorage.removeItem('accessToken');
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  },
);

export default apiClient;
```

- [ ] **Step 10: Create apps/web/src/lib/utils.ts**

```typescript
import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
```

- [ ] **Step 11: Create apps/web/src/types/index.ts**

```typescript
export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  username: string;
  avatarUrl?: string;
  headline?: string;
  role: 'super_admin' | 'admin' | 'moderator' | 'member' | 'guest';
  trustLevel: number;
  isVerified: boolean;
  isProfessionalVerified: boolean;
}

export interface ApiResponse<T> {
  data: T;
  meta?: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
  message?: string;
}

export interface PaginationParams {
  page?: number;
  limit?: number;
  sort?: string;
}
```

- [ ] **Step 12: Install and verify frontend builds**

```bash
cd /home/princetheprogrammerbtw/HrSakthi
pnpm install
pnpm --filter @hrshakti/web build
```

---

## Task 4: Scaffold NestJS Backend App

**Files:**
- Create: `apps/api/package.json`
- Create: `apps/api/tsconfig.json`
- Create: `apps/api/nest-cli.json`
- Create: `apps/api/src/main.ts`
- Create: `apps/api/src/app.module.ts`
- Create: `apps/api/src/config/index.ts`
- Create: `apps/api/src/common/`

- [ ] **Step 1: Create apps/api/package.json**

```json
{
  "name": "@hrshakti/api",
  "version": "0.1.0",
  "private": true,
  "scripts": {
    "dev": "nest start --watch",
    "build": "nest build",
    "start": "node dist/main",
    "lint": "eslint \"{src,test}/**/*.ts\"",
    "prisma:generate": "prisma generate",
    "prisma:push": "prisma db push",
    "prisma:studio": "prisma studio",
    "prisma:migrate": "prisma migrate dev"
  },
  "dependencies": {
    "@nestjs/common": "^10.3.0",
    "@nestjs/core": "^10.3.0",
    "@nestjs/platform-express": "^10.3.0",
    "@nestjs/platform-socket.io": "^10.3.0",
    "@nestjs/websockets": "^10.3.0",
    "@nestjs/jwt": "^10.2.0",
    "@nestjs/passport": "^10.0.3",
    "@nestjs/elasticsearch": "^10.0.0",
    "@nestjs/schedule": "^4.0.0",
    "@nestjs/throttler": "^6.0.0",
    "@prisma/client": "^5.14.0",
    "prisma": "^5.14.0",
    "passport": "^0.7.0",
    "passport-jwt": "^4.0.1",
    "passport-google-oauth20": "^2.0.0",
    "@types/passport-google-oauth20": "^2.0.16",
    "class-validator": "^0.14.1",
    "class-transformer": "^0.5.1",
    "argon2": "^0.40.0",
    "socket.io": "^4.7.0",
    "redis": "^4.6.0",
    "bullmq": "^5.7.0",
    "reflect-metadata": "^0.2.2",
    "rxjs": "^7.8.0",
    "helmet": "^7.1.0",
    "swagger-ui-express": "^5.0.0",
    "@nestjs/swagger": "^7.3.0"
  },
  "devDependencies": {
    "@nestjs/cli": "^10.3.0",
    "@nestjs/schematics": "^10.1.0",
    "@types/node": "^20.12.0",
    "@types/express": "^4.17.21",
    "typescript": "^5.4.0",
    "ts-node": "^10.9.0",
    "ts-loader": "^9.5.0"
  }
}
```

- [ ] **Step 2: Create apps/api/tsconfig.json**

```json
{
  "extends": "../../tsconfig/nest.json",
  "compilerOptions": {
    "baseUrl": ".",
    "outDir": "./dist",
    "paths": {
      "@/*": ["./src/*"]
    }
  },
  "include": ["src/**/*", "prisma/**/*"],
  "exclude": ["node_modules", "dist"]
}
```

- [ ] **Step 3: Create apps/api/nest-cli.json**

```json
{
  "$schema": "https://json.schemastore.org/nest-cli",
  "collection": "@nestjs/schematics",
  "sourceRoot": "src",
  "compilerOptions": {
    "deleteOutDir": true,
    "tsConfigPath": "tsconfig.json"
  }
}
```

- [ ] **Step 4: Create apps/api/src/main.ts**

```typescript
import { NestFactory } from '@nestjs/core';
import { ValidationPipe, Logger } from '@nestjs/common';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import helmet from 'helmet';
import { AppModule } from './app.module';
import { AllExceptionsFilter } from './common/filters/all-exceptions.filter';
import { TransformInterceptor } from './common/interceptors/transform.interceptor';

async function bootstrap() {
  const logger = new Logger('Bootstrap');
  const app = await NestFactory.create(AppModule);

  app.setGlobalPrefix('api/v1');

  app.use(helmet());
  app.enableCors({
    origin: process.env.APP_URL || 'http://localhost:3000',
    credentials: true,
  });

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
      forbidNonWhitelisted: true,
    }),
  );

  app.useGlobalFilters(new AllExceptionsFilter());
  app.useGlobalInterceptors(new TransformInterceptor());

  const config = new DocumentBuilder()
    .setTitle('HRShakti API')
    .setDescription('The Professional Home for HR')
    .setVersion('1.0')
    .addBearerAuth()
    .build();
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api/docs', app, document);

  const port = process.env.PORT || 4000;
  await app.listen(port);
  logger.log(`Server running on http://localhost:${port}`);
  logger.log(`Swagger docs at http://localhost:${port}/api/docs`);
}

bootstrap();
```

- [ ] **Step 5: Create apps/api/src/app.module.ts**

```typescript
import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { ThrottlerModule } from '@nestjs/throttler';
import { ScheduleModule } from '@nestjs/schedule';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    ThrottlerModule.forRoot([{ ttl: 60000, limit: 100 }]),
    ScheduleModule.forRoot(),
  ],
})
export class AppModule {}
```

- [ ] **Step 6: Create common filters, interceptors, and config**

Create `apps/api/src/common/filters/all-exceptions.filter.ts`:
```typescript
import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { Response } from 'express';

@Catch()
export class AllExceptionsFilter implements ExceptionFilter {
  private readonly logger = new Logger(AllExceptionsFilter.name);

  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();

    let status = HttpStatus.INTERNAL_SERVER_ERROR;
    let message = 'Internal server error';
    let details: any = undefined;

    if (exception instanceof HttpException) {
      status = exception.getStatus();
      const res = exception.getResponse();
      if (typeof res === 'string') {
        message = res;
      } else if (typeof res === 'object') {
        message = (res as any).message || message;
        details = (res as any).details;
      }
    }

    if (status === HttpStatus.INTERNAL_SERVER_ERROR) {
      this.logger.error(exception instanceof Error ? exception.stack : exception);
    }

    response.status(status).json({
      statusCode: status,
      message: Array.isArray(message) ? message[0] : message,
      error: message,
      details,
    });
  }
}
```

Create `apps/api/src/common/interceptors/transform.interceptor.ts`:
```typescript
import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

export interface ApiResponse<T> {
  data: T;
  meta?: any;
  message?: string;
}

@Injectable()
export class TransformInterceptor<T> implements NestInterceptor<T, ApiResponse<T>> {
  intercept(context: ExecutionContext, next: CallHandler): Observable<ApiResponse<T>> {
    return next.handle().pipe(
      map((response) => {
        if (response && response.data !== undefined) {
          return response;
        }
        return { data: response };
      }),
    );
  }
}
```

Create `apps/api/src/config/index.ts`:
```typescript
export const config = {
  jwt: {
    privateKey: process.env.JWT_PRIVATE_KEY_PATH || './keys/private.pem',
    publicKey: process.env.JWT_PUBLIC_KEY_PATH || './keys/public.pem',
    accessExpiration: parseInt(process.env.JWT_ACCESS_EXPIRATION || '900'),
    refreshExpiration: parseInt(process.env.JWT_REFRESH_EXPIRATION || '604800'),
    issuer: process.env.JWT_ISSUER || 'hrshakti',
  },
  argon2: {
    memory: parseInt(process.env.ARGON2_MEMORY || '65536'),
    iterations: parseInt(process.env.ARGON2_ITERATIONS || '3'),
    parallelism: parseInt(process.env.ARGON2_PARALLELISM || '4'),
  },
};
```

- [ ] **Step 7: Install backend deps and verify build**

```bash
cd /home/princetheprogrammerbtw/HrSakthi
pnpm install
pnpm --filter @hrshakti/api build
```

- [ ] **Step 8: Start Docker services and verify**

```bash
cd /home/princetheprogrammerbtw/HrSakthi
docker compose up -d
docker compose ps
```

---

## Task 5: Prisma Schema — All ~65 Tables

**Files:**
- Create: `apps/api/prisma/schema.prisma`

This is the largest single file. Use the 04-database-schema.md spec to generate every table, column, type, constraint, index, and relationship.

- [ ] **Step 1: Create apps/api/prisma/schema.prisma with datasource and generator**

```prisma
generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
  extensions = [pgcrypto, ltree]
}
```

- [ ] **Step 2: Add Users & Auth domain models** (from `04-database-schema.md` §1)

Models: `User`, `UserCredential`, `Session`, `EmailVerificationToken`, `PasswordResetToken`, `FailedLoginAttempt`

Add the full `User` model with all 30+ columns (id UUID, email, passwordHash, firstName, lastName, username, avatarUrl, headline, about, locationCity, locationCountry, locationState, timezone, website, linkedinUrl, twitterUrl, profileCompletionPct, isVerified, isProfessionalVerified, role enum, trustLevel, reputationScore, status enum, suspensionReason, suspendedAt, suspendedBy FK, lastLoginAt, lastActivityAt, onboardingCompleted, onboardingStep, preferences JSONB, createdAt, updatedAt, deletedAt) plus indexes.

```prisma
model User {
  id                     String    @id @default(dbgenerated("gen_random_uuid()")) @db.Uuid
  email                  String    @unique @db.VarChar(255)
  passwordHash           String?   @db.VarChar(255) @map("password_hash")
  firstName              String    @db.VarChar(100) @map("first_name")
  lastName               String    @db.VarChar(100) @map("last_name")
  username               String    @unique @db.VarChar(50)
  avatarUrl              String?   @db.VarChar(500) @map("avatar_url")
  headline               String?   @db.VarChar(200)
  about                  String?   @db.Text
  locationCity           String?   @db.VarChar(100) @map("location_city")
  locationCountry        String?   @db.VarChar(100) @map("location_country")
  locationState          String?   @db.VarChar(100) @map("location_state")
  timezone               String    @default("UTC") @db.VarChar(50)
  website                String?   @db.VarChar(500)
  linkedinUrl            String?   @db.VarChar(500) @map("linkedin_url")
  twitterUrl             String?   @db.VarChar(500) @map("twitter_url")
  profileCompletionPct   Int       @default(0) @map("profile_completion_pct") @db.SmallInt
  isVerified             Boolean   @default(false) @map("is_verified")
  isProfessionalVerified Boolean  @default(false) @map("is_professional_verified")
  role                   Role      @default(member)
  trustLevel             Int       @default(1) @map("trust_level") @db.SmallInt
  reputationScore        Int       @default(0) @map("reputation_score")
  status                 UserStatus @default(active)
  suspensionReason       String?   @map("suspension_reason")
  suspendedAt            DateTime? @map("suspended_at") @db.Timestamptz
  suspendedBy            String?   @map("suspended_by") @db.Uuid
  lastLoginAt            DateTime? @map("last_login_at") @db.Timestamptz
  lastActivityAt         DateTime? @map("last_activity_at") @db.Timestamptz
  onboardingCompleted    Boolean   @default(false) @map("onboarding_completed")
  onboardingStep         Int       @default(1) @map("onboarding_step") @db.SmallInt
  preferences            Json      @default("{}")
  createdAt              DateTime  @default(now()) @map("created_at") @db.Timestamptz
  updatedAt              DateTime  @updatedAt @map("updated_at") @db.Timestamptz
  deletedAt              DateTime? @map("deleted_at") @db.Timestamptz

  suspendedByUser  User?          @relation("UserSuspension", fields: [suspendedBy], references: [id])
  credentials      UserCredential[]
  sessions         Session[]
  emailTokens      EmailVerificationToken[]
  passwordResets   PasswordResetToken[]
  loginAttempts    FailedLoginAttempt[]

  @@index([status])
  @@index([role])
  @@index([isProfessionalVerified])
  @@index([trustLevel])
  @@index([locationCountry])
  @@index([lastActivityAt])
  @@index([createdAt])
  @@map("users")
}

enum Role {
  super_admin
  admin
  moderator
  member
  guest
}

enum UserStatus {
  active
  suspended
  banned
  pending_verification
}

model UserCredential {
  id                String   @id @default(dbgenerated("gen_random_uuid()")) @db.Uuid
  userId            String   @map("user_id") @db.Uuid
  provider          String   @db.VarChar(50)
  providerAccountId String   @map("provider_account_id") @db.VarChar(255)
  accessToken       String?  @map("access_token") @db.Text
  refreshToken      String?  @map("refresh_token") @db.Text
  tokenExpiresAt    DateTime? @map("token_expires_at") @db.Timestamptz
  createdAt         DateTime @default(now()) @map("created_at") @db.Timestamptz

  user User @relation(fields: [userId], references: [id], onDelete: Cascade)

  @@unique([provider, providerAccountId])
  @@index([userId])
  @@map("user_credentials")
}

model Session {
  id            String   @id @default(dbgenerated("gen_random_uuid()")) @db.Uuid
  userId        String   @map("user_id") @db.Uuid
  refreshTokenHash String @map("refresh_token_hash") @db.VarChar(255)
  userAgent     String?  @map("user_agent") @db.VarChar(500)
  ipAddress     String?  @map("ip_address") @db.VarChar(45)
  deviceInfo    String?  @map("device_info") @db.Text
  expiresAt     DateTime @map("expires_at") @db.Timestamptz
  isRevoked     Boolean  @default(false) @map("is_revoked")
  lastActiveAt  DateTime? @map("last_active_at") @db.Timestamptz
  createdAt     DateTime @default(now()) @map("created_at") @db.Timestamptz

  user User @relation(fields: [userId], references: [id], onDelete: Cascade)

  @@index([userId])
  @@index([refreshTokenHash])
  @@map("sessions")
}

model EmailVerificationToken {
  id        String   @id @default(dbgenerated("gen_random_uuid()")) @db.Uuid
  userId    String   @map("user_id") @db.Uuid
  token     String   @unique @db.Uuid
  expiresAt DateTime @map("expires_at") @db.Timestamptz
  usedAt    DateTime? @map("used_at") @db.Timestamptz
  createdAt DateTime @default(now()) @map("created_at") @db.Timestamptz

  user User @relation(fields: [userId], references: [id], onDelete: Cascade)

  @@index([userId])
  @@index([token])
  @@map("email_verification_tokens")
}

model PasswordResetToken {
  id        String   @id @default(dbgenerated("gen_random_uuid()")) @db.Uuid
  userId    String   @map("user_id") @db.Uuid
  token     String   @unique @db.Uuid
  expiresAt DateTime @map("expires_at") @db.Timestamptz
  usedAt    DateTime? @map("used_at") @db.Timestamptz
  createdAt DateTime @default(now()) @map("created_at") @db.Timestamptz

  user User @relation(fields: [userId], references: [id], onDelete: Cascade)

  @@index([userId])
  @@map("password_reset_tokens")
}

model FailedLoginAttempt {
  id         String   @id @default(dbgenerated("gen_random_uuid()")) @db.Uuid
  userId     String   @map("user_id") @db.Uuid
  ipAddress  String   @map("ip_address") @db.VarChar(45)
  attemptedAt DateTime @default(now()) @map("attempted_at") @db.Timestamptz

  user User @relation(fields: [userId], references: [id], onDelete: Cascade)

  @@index([userId])
  @@index([attemptedAt])
  @@map("failed_login_attempts")
}
```

- [ ] **Step 3: Add Profile & Onboarding domain** (from `04-database-schema.md` §2)

Models: `UserExperience`, `UserEducation`, `UserCertification`, `UserSkill`, `OnboardingTask`

- [ ] **Step 4: Add Network & Connections domain** (from `04-database-schema.md` §3)

Models: `Connection`, `Follow`, `Block`, `ConnectionRequest`

- [ ] **Step 5: Add Organizations domain** (from `04-database-schema.md` §4)

Models: `Organization`, `OrganizationMember`, `OrganizationClaim`, `OrganizationVerification`

- [ ] **Step 6: Add Communities domain** (from `04-database-schema.md` §5)

Models: `Community`, `CommunityMember`, `CommunityModerator`, `CommunityAnnouncement`, `CommunityStat`

- [ ] **Step 7: Add Discussions domain** (from `04-database-schema.md` §6)

Models: `Discussion`, `DiscussionComment`, `DiscussionPoll`, `DiscussionPollOption`, `DiscussionPollVote`, `DiscussionBookmark`

- [ ] **Step 8: Add Q&A domain** (from `04-database-schema.md` §7)

Models: `Question`, `Answer`, `QuestionTag`, `QuestionBounty`, `QuestionReviewQueue`, `Tag`

- [ ] **Step 9: Add Blogs domain** (from `04-database-schema.md` §8)

Models: `BlogPost`, `BlogSeries`, `BlogSeriesPost`, `BlogComment`

- [ ] **Step 10: Add Knowledge Hub domain** (from `04-database-schema.md` §9)

Models: `KnowledgeArticle`, `KnowledgeArticleVersion`, `KnowledgeCategory`

- [ ] **Step 11: Add Events domain** (from `04-database-schema.md` §10)

Models: `Event`, `EventRegistration`, `EventSpeaker`, `EventSeries`, `EventCertificate`

- [ ] **Step 12: Add Learning domain** (from `04-database-schema.md` §11)

Models: `Course`, `CourseModule`, `Lesson`, `Enrollment`, `LessonProgress`, `Assessment`, `AssessmentQuestion`, `AssessmentAttempt`, `StudyGroup`

- [ ] **Step 13: Add Reactions & Bookmarks domain** (from `04-database-schema.md` §12) — polymorphic

Models: `ContentReaction`, `ContentBookmark`, `ContentReport`

- [ ] **Step 14: Add Notifications domain** (from `04-database-schema.md` §13)

Models: `Notification`, `NotificationPreference`

- [ ] **Step 15: Add Messaging domain** (from `04-database-schema.md` §14)

Models: `Conversation`, `ConversationParticipant`, `Message`

- [ ] **Step 16: Add AI domain** (from `04-database-schema.md` §15)

Models: `AiConversation`, `AiMessage`, `AiSystemPrompt`, `AiUsageLog`

- [ ] **Step 17: Add Review & Benchmarking domain** (from `04-database-schema.md` §16)

Models: `EmployerReview`, `VendorListing`, `VendorReview`, `SalaryBenchmark`

- [ ] **Step 18: Add Mentorship domain** (from `04-database-schema.md` §17)

Models: `MentorshipProfile`, `MentorshipRequest`, `MentorshipGoal`, `MentorshipSession`, `MentorshipFeedback`

- [ ] **Step 19: Add Career domain** (from `04-database-schema.md` §18)

Models: `CareerPath`, `CareerPathStep`, `SelfAssessment`

- [ ] **Step 20: Add News & Compliance domain** (from `04-database-schema.md` §19)

Models: `NewsArticle`, `ComplianceAlert`, `ComplianceRegion`

- [ ] **Step 21: Add Reputation domain** (from `04-database-schema.md` §20)

Models: `Badge`, `UserBadge`, `ReputationEvent`, `ReputationLeaderboard`

- [ ] **Step 22: Add Moderation & Audit domain** (from `04-database-schema.md` §21-22)

Models: `ModerationAction`, `AuditLog`

- [ ] **Step 23: Generate Prisma client and push schema**

```bash
cd /home/princetheprogrammerbtw/HrSakthi
pnpm --filter @hrshakti/api prisma:generate
pnpm --filter @hrshakti/api prisma:push
```

---

## Task 6: PrismaService + Base Repository

**Files:**
- Create: `apps/api/src/prisma/prisma.service.ts`
- Create: `apps/api/src/prisma/prisma.module.ts`

- [ ] **Step 1: Create PrismaService**

```typescript
import { Injectable, OnModuleInit, OnModuleDestroy, Logger } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';

@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(PrismaService.name);

  async onModuleInit() {
    await this.$connect();
    this.logger.log('Connected to database');
  }

  async onModuleDestroy() {
    await this.$disconnect();
    this.logger.log('Disconnected from database');
  }
}
```

- [ ] **Step 2: Create PrismaModule**

```typescript
import { Global, Module } from '@nestjs/common';
import { PrismaService } from './prisma.service';

@Global()
@Module({
  providers: [PrismaService],
  exports: [PrismaService],
})
export class PrismaModule {}
```

- [ ] **Step 3: Import PrismaModule in AppModule**

Add to `apps/api/src/app.module.ts`:
```typescript
import { PrismaModule } from './prisma/prisma.module';

// in imports array:
PrismaModule,
```

---

## Task 7: Auth Module — DTOs, Guards, JWT Strategy

**Files:**
- Create: `apps/api/src/auth/auth.module.ts`
- Create: `apps/api/src/auth/auth.controller.ts`
- Create: `apps/api/src/auth/auth.service.ts`
- Create: `apps/api/src/auth/dto/register.dto.ts`
- Create: `apps/api/src/auth/dto/login.dto.ts`
- Create: `apps/api/src/auth/guards/jwt-auth.guard.ts`
- Create: `apps/api/src/auth/guards/roles.guard.ts`
- Create: `apps/api/src/auth/strategies/jwt.strategy.ts`
- Create: `apps/api/src/common/decorators/current-user.decorator.ts`
- Create: `apps/api/src/common/decorators/roles.decorator.ts`

- [ ] **Step 1: Create Register DTO**

```typescript
import { IsEmail, IsString, MinLength, MaxLength } from 'class-validator';

export class RegisterDto {
  @IsEmail()
  email: string;

  @IsString()
  @MinLength(8)
  @MaxLength(128)
  password: string;

  @IsString()
  @MinLength(1)
  @MaxLength(100)
  firstName: string;

  @IsString()
  @MinLength(1)
  @MaxLength(100)
  lastName: string;
}
```

- [ ] **Step 2: Create Login DTO**

```typescript
import { IsEmail, IsString } from 'class-validator';

export class LoginDto {
  @IsEmail()
  email: string;

  @IsString()
  password: string;
}
```

- [ ] **Step 3: Create CurrentUser decorator**

```typescript
import { createParamDecorator, ExecutionContext } from '@nestjs/common';

export const CurrentUser = createParamDecorator(
  (data: string | undefined, ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest();
    if (data) return request.user?.[data];
    return request.user;
  },
);
```

- [ ] **Step 4: Create Roles decorator**

```typescript
import { SetMetadata } from '@nestjs/common';
import { Role } from '@prisma/client';

export const ROLES_KEY = 'roles';
export const Roles = (...roles: Role[]) => SetMetadata(ROLES_KEY, roles);
```

- [ ] **Step 5: Create JwtAuthGuard**

```typescript
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {
  handleRequest(err: any, user: any) {
    if (err || !user) {
      throw err || new UnauthorizedException('Authentication required');
    }
    return user;
  }
}
```

- [ ] **Step 6: Create RolesGuard**

```typescript
import { Injectable, CanActivate, ExecutionContext } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Role } from '@prisma/client';
import { ROLES_KEY } from '../../common/decorators/roles.decorator';

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const requiredRoles = this.reflector.getAllAndOverride<Role[]>(ROLES_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);
    if (!requiredRoles) return true;
    const { user } = context.switchToHttp().getRequest();
    return requiredRoles.includes(user.role);
  }
}
```

- [ ] **Step 7: Create JwtStrategy**

```typescript
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import * as fs from 'fs';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(private prisma: PrismaService) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: fs.readFileSync(process.env.JWT_PUBLIC_KEY_PATH || './keys/public.pem', 'utf8'),
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
```

- [ ] **Step 8: Create AuthService**

```typescript
import {
  Injectable,
  ConflictException,
  UnauthorizedException,
  Logger,
} from '@nestjs/common';
import * as argon2 from 'argon2';
import { v4 as uuidv4 } from 'uuid';
import { JwtService } from '@nestjs/jwt';
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

    // ponytail: log token instead of sending email in dev
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

    // Check lockout
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

    const fs = require('fs');
    const privateKey = fs.readFileSync(process.env.JWT_PRIVATE_KEY_PATH || './keys/private.pem', 'utf8');

    const accessToken = this.jwtService.sign(payload, {
      privateKey,
      algorithm: 'RS256',
      expiresIn: parseInt(process.env.JWT_ACCESS_EXPIRATION || '900'),
      issuer: process.env.JWT_ISSUER || 'hrshakti',
      audience: 'hrshakti-api',
    });

    const refreshToken = uuidv4();
    const crypto = require('crypto');
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
```

- [ ] **Step 9: Create AuthController**

```typescript
import { Controller, Post, Body, HttpCode, HttpStatus } from '@nestjs/common';
import { AuthService } from './auth.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @Post('register')
  async register(@Body() dto: RegisterDto) {
    return { data: await this.authService.register(dto) };
  }

  @Post('login')
  @HttpCode(HttpStatus.OK)
  async login(@Body() dto: LoginDto) {
    return { data: await this.authService.login(dto) };
  }
}
```

- [ ] **Step 10: Create AuthModule**

```typescript
import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import * as fs from 'fs';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { JwtStrategy } from './strategies/jwt.strategy';

@Module({
  imports: [
    PassportModule.register({ defaultStrategy: 'jwt' }),
    JwtModule.register({
      privateKey: fs.readFileSync(process.env.JWT_PRIVATE_KEY_PATH || './keys/private.pem', 'utf8'),
      signOptions: { algorithm: 'RS256' },
    }),
  ],
  controllers: [AuthController],
  providers: [AuthService, JwtStrategy],
  exports: [JwtModule, PassportModule],
})
export class AuthModule {}
```

- [ ] **Step 11: Import AuthModule in AppModule**

```typescript
import { AuthModule } from './auth/auth.module';

// in imports array:
AuthModule,
```

---

## Task 8: User Module — Profiles, Experiences, Education, Certifications, Skills

**Files:**
- Create: `apps/api/src/users/users.module.ts`
- Create: `apps/api/src/users/users.controller.ts`
- Create: `apps/api/src/users/users.service.ts`
- Create: `apps/api/src/users/dto/update-profile.dto.ts`
- Create: `apps/api/src/users/dto/add-experience.dto.ts`
- Create: `apps/api/src/users/dto/add-education.dto.ts`
- Create: `apps/api/src/users/dto/add-certification.dto.ts`

- [ ] **Step 1: Create DTOs**

`update-profile.dto.ts`:
```typescript
import { IsOptional, IsString, MaxLength } from 'class-validator';

export class UpdateProfileDto {
  @IsOptional() @IsString() @MaxLength(100) firstName?: string;
  @IsOptional() @IsString() @MaxLength(100) lastName?: string;
  @IsOptional() @IsString() @MaxLength(200) headline?: string;
  @IsOptional() @IsString() @MaxLength(2000) about?: string;
  @IsOptional() @IsString() @MaxLength(100) locationCity?: string;
  @IsOptional() @IsString() @MaxLength(100) locationCountry?: string;
  @IsOptional() @IsString() @MaxLength(500) website?: string;
  @IsOptional() @IsString() @MaxLength(500) linkedinUrl?: string;
}
```

`add-experience.dto.ts`:
```typescript
import { IsString, IsOptional, IsBoolean, MaxLength } from 'class-validator';

export class AddExperienceDto {
  @IsString() @MaxLength(200) title: string;
  @IsString() @MaxLength(200) company: string;
  @IsString() companyId?: string;
  @IsString() @MaxLength(100) location?: string;
  @IsBoolean() isCurrent?: boolean;
  @IsString() startDate: string;
  @IsString() endDate?: string;
  @IsOptional() @IsString() @MaxLength(2000) description?: string;
}
```

`add-education.dto.ts` and `add-certification.dto.ts` — similar pattern.

- [ ] **Step 2: Create UsersService**

```typescript
import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { UpdateProfileDto } from './dto/update-profile.dto';

@Injectable()
export class UsersService {
  constructor(private prisma: PrismaService) {}

  async getProfile(userId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      include: {
        experiences: { orderBy: { startDate: 'desc' } },
        education: { orderBy: { startDate: 'desc' } },
        certifications: { orderBy: { earnedDate: 'desc' } },
        skills: true,
      },
    });
    if (!user) throw new NotFoundException('User not found');
    return user;
  }

  async updateProfile(userId: string, dto: UpdateProfileDto) {
    const data: any = {};
    if (dto.firstName !== undefined) data.firstName = dto.firstName;
    if (dto.lastName !== undefined) data.lastName = dto.lastName;
    if (dto.headline !== undefined) data.headline = dto.headline;
    if (dto.about !== undefined) data.about = dto.about;
    if (dto.locationCity !== undefined) data.locationCity = dto.locationCity;
    if (dto.locationCountry !== undefined) data.locationCountry = dto.locationCountry;
    if (dto.website !== undefined) data.website = dto.website;
    if (dto.linkedinUrl !== undefined) data.linkedinUrl = dto.linkedinUrl;

    return this.prisma.user.update({ where: { id: userId }, data });
  }

  // Experience CRUD
  async addExperience(userId: string, dto: any) {
    return this.prisma.userExperience.create({ data: { ...dto, userId } });
  }

  async updateExperience(experienceId: string, userId: string, dto: any) {
    const exp = await this.prisma.userExperience.findFirst({ where: { id: experienceId, userId } });
    if (!exp) throw new NotFoundException('Experience not found');
    return this.prisma.userExperience.update({ where: { id: experienceId }, data: dto });
  }

  async deleteExperience(experienceId: string, userId: string) {
    const exp = await this.prisma.userExperience.findFirst({ where: { id: experienceId, userId } });
    if (!exp) throw new NotFoundException('Experience not found');
    return this.prisma.userExperience.delete({ where: { id: experienceId } });
  }

  // Education CRUD
  async addEducation(userId: string, dto: any) {
    return this.prisma.userEducation.create({ data: { ...dto, userId } });
  }

  async deleteEducation(educationId: string, userId: string) {
    const edu = await this.prisma.userEducation.findFirst({ where: { id: educationId, userId } });
    if (!edu) throw new NotFoundException('Education not found');
    return this.prisma.userEducation.delete({ where: { id: educationId } });
  }

  // Certification CRUD
  async addCertification(userId: string, dto: any) {
    return this.prisma.userCertification.create({ data: { ...dto, userId } });
  }

  async deleteCertification(certId: string, userId: string) {
    const cert = await this.prisma.userCertification.findFirst({ where: { id: certId, userId } });
    if (!cert) throw new NotFoundException('Certification not found');
    return this.prisma.userCertification.delete({ where: { id: certId } });
  }

  // Skills
  async addSkill(userId: string, skillName: string) {
    return this.prisma.userSkill.create({ data: { userId, skill: skillName } });
  }

  async removeSkill(skillId: string, userId: string) {
    const skill = await this.prisma.userSkill.findFirst({ where: { id: skillId, userId } });
    if (!skill) throw new NotFoundException('Skill not found');
    return this.prisma.userSkill.delete({ where: { id: skillId } });
  }
}
```

- [ ] **Step 3: Create UsersController**

```typescript
import {
  Controller, Get, Put, Post, Delete, Body, Param, UseGuards,
} from '@nestjs/common';
import { UsersService } from './users.service';
import { UpdateProfileDto } from './dto/update-profile.dto';
import { AddExperienceDto } from './dto/add-experience.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../common/decorators/current-user.decorator';

@Controller('users')
@UseGuards(JwtAuthGuard)
export class UsersController {
  constructor(private usersService: UsersService) {}

  @Get('me')
  async getMyProfile(@CurrentUser() user: any) {
    return { data: await this.usersService.getProfile(user.id) };
  }

  @Put('me')
  async updateProfile(@CurrentUser() user: any, @Body() dto: UpdateProfileDto) {
    return { data: await this.usersService.updateProfile(user.id, dto) };
  }

  @Get(':id')
  async getProfile(@Param('id') id: string) {
    return { data: await this.usersService.getProfile(id) };
  }

  @Post('me/experiences')
  async addExperience(@CurrentUser() user: any, @Body() dto: AddExperienceDto) {
    return { data: await this.usersService.addExperience(user.id, dto) };
  }

  @Put('me/experiences/:id')
  async updateExperience(@CurrentUser() user: any, @Param('id') id: string, @Body() dto: any) {
    return { data: await this.usersService.updateExperience(id, user.id, dto) };
  }

  @Delete('me/experiences/:id')
  async deleteExperience(@CurrentUser() user: any, @Param('id') id: string) {
    return { data: await this.usersService.deleteExperience(id, user.id) };
  }

  @Post('me/education')
  async addEducation(@CurrentUser() user: any, @Body() dto: any) {
    return { data: await this.usersService.addEducation(user.id, dto) };
  }

  @Delete('me/education/:id')
  async deleteEducation(@CurrentUser() user: any, @Param('id') id: string) {
    return { data: await this.usersService.deleteEducation(id, user.id) };
  }

  @Post('me/certifications')
  async addCertification(@CurrentUser() user: any, @Body() dto: any) {
    return { data: await this.usersService.addCertification(user.id, dto) };
  }

  @Delete('me/certifications/:id')
  async deleteCertification(@CurrentUser() user: any, @Param('id') id: string) {
    return { data: await this.usersService.deleteCertification(id, user.id) };
  }

  @Post('me/skills')
  async addSkill(@CurrentUser() user: any, @Body('skill') skill: string) {
    return { data: await this.usersService.addSkill(user.id, skill) };
  }

  @Delete('me/skills/:id')
  async removeSkill(@CurrentUser() user: any, @Param('id') id: string) {
    return { data: await this.usersService.removeSkill(id, user.id) };
  }
}
```

- [ ] **Step 4: Create UsersModule**

```typescript
import { Module } from '@nestjs/common';
import { UsersController } from './users.controller';
import { UsersService } from './users.service';

@Module({
  controllers: [UsersController],
  providers: [UsersService],
  exports: [UsersService],
})
export class UsersModule {}
```

- [ ] **Step 5: Import UsersModule in AppModule**

```typescript
import { UsersModule } from './users/users.module';

// in imports array:
UsersModule,
```

---

## Task 9: Verify the Foundation

- [ ] **Step 1: Build and verify both apps compile**

```bash
cd /home/princetheprogrammerbtw/HrSakthi
pnpm build
```

- [ ] **Step 2: Start API server and test auth endpoints**

```bash
# Terminal 1
cd /home/princetheprogrammerbtw/HrSakthi
pnpm --filter @hrshakti/api dev

# Terminal 2
curl -X POST http://localhost:4000/api/v1/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email":"test@hrshakti.com","password":"TestPass123!","firstName":"Test","lastName":"User"}'
```

Expected: 201 with user ID and message.

```bash
curl -X POST http://localhost:4000/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@hrshakti.com","password":"TestPass123!"}'
```

Expected: 200 with accessToken, user object.

- [ ] **Step 3: Test user profile endpoint**

```bash
TOKEN="<access_token_from_login>"
curl http://localhost:4000/api/v1/users/me \
  -H "Authorization: Bearer $TOKEN"
```

Expected: 200 with user profile data.

---

## Phase 1 Complete — What's Next

Once Phase 1 is verified working, Phase 2 builds the core social layer:
- **Network Module** — follow, connect, block, suggestions
- **Organization Module** — CRUD, claim, verify
- **Community Module** — CRUD, join/leave, moderators
- **Discussion Module** — posts, nested comments (LTREE), multi-signal reactions, anonymous mode
- **Content Reactions** — polymorphic reaction system
