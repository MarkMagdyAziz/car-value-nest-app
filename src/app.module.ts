import { MiddlewareConsumer, Module, ValidationPipe } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { UsersModule } from './users/users.module';
import { ReportsModule } from './reports/reports.module';
import { TypeOrmModule, TypeOrmModuleOptions } from '@nestjs/typeorm';
import cookieSession from 'cookie-session';
import { APP_GUARD, APP_PIPE } from '@nestjs/core';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { ThrottlerGuard, ThrottlerModule } from '@nestjs/throttler';
import { Report } from './reports/entities/report.entity';
import { User } from './users/entities/user.entity';

const isProduction = () => process.env.NODE_ENV === 'production';

@Module({
  imports: [
    UsersModule,
    ReportsModule,
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: `.env.${process.env.NODE_ENV ?? 'development'}`,
    }),
    ThrottlerModule.forRoot([
      {
        ttl: 60_000,
        limit: 30,
        skipIf: () => !isProduction(),
      },
    ]),
    TypeOrmModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (config: ConfigService): TypeOrmModuleOptions => {
        const dbType =
          config.get<string>('DB_TYPE') ??
          (isProduction() ? 'postgres' : 'better-sqlite3');

        if (dbType === 'postgres') {
          return {
            type: 'postgres',
            url: config.get<string>('DATABASE_URL'),
            ssl: { rejectUnauthorized: false },
            synchronize: false,
            migrationsRun: config.get<string>('DB_MIGRATIONS_RUN') === 'true',
            entities: [User, Report],
            migrations: ['dist/migrations/*.js'],
          };
        }

        return {
          type: 'better-sqlite3',
          database: config.get<string>('DB_NAME') ?? 'db.sqlite',
          synchronize: true,
          entities: [User, Report],
        };
      },
    }),
  ],
  controllers: [AppController],
  providers: [
    AppService,
    {
      provide: APP_PIPE,
      useValue: new ValidationPipe({
        whitelist: true,
        forbidNonWhitelisted: true,
      }),
    },
    {
      provide: APP_GUARD,
      useClass: ThrottlerGuard,
    },
  ],
})
export class AppModule {
  constructor(private configService: ConfigService) {}

  configure(consumer: MiddlewareConsumer) {
    consumer
      .apply(
        cookieSession({
          keys: [this.configService.get<string>('COOKIE_KEY')!],
          secure: isProduction(),
          httpOnly: true,
          sameSite: 'lax',
          maxAge: 24 * 60 * 60 * 1000,
        }),
      )
      .forRoutes('*');
  }
}
