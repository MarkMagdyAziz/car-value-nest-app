import { NestFactory } from '@nestjs/core';
import { NestExpressApplication } from '@nestjs/platform-express';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { Request, Response, NextFunction } from 'express';
import { AppModule } from './app.module';
import helmet from 'helmet';

async function bootstrap() {
  if (process.env.NODE_ENV === 'production') {
    const cookieKey = process.env.COOKIE_KEY;
    if (!cookieKey || cookieKey.length < 16) {
      throw new Error(
        'COOKIE_KEY must be set to a strong secret (>= 16 chars) in production',
      );
    }
  }

  const app = await NestFactory.create<NestExpressApplication>(AppModule);

  if (process.env.NODE_ENV === 'production') {
    app.set('trust proxy', 1);
  }

  app.use(helmet());

  if (process.env.SWAGGER_ENABLED !== 'false') {
    app.use('/api', (_req: Request, res: Response, next: NextFunction) => {
      res.setHeader(
        'Content-Security-Policy',
        "default-src 'self'; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline'; img-src 'self' data:;",
      );
      next();
    });

    const swaggerConfig = new DocumentBuilder()
      .setTitle('Car Value API')
      .setDescription(
        'REST API for the Car Value Application (NestJS + Postgres)',
      )
      .setVersion('1.0.0')
      .addCookieAuth(
        'session',
        { type: 'apiKey', in: 'cookie', name: 'session' },
        'session',
      )
      .build();

    const swaggerDocument = SwaggerModule.createDocument(app, swaggerConfig);
    SwaggerModule.setup('api', app, swaggerDocument, {
      customSiteTitle: 'Car Value API Docs',
    });
  }

  await app.listen(process.env.PORT ?? 3000);
}
void bootstrap();
