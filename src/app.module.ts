import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { UsersService } from './users/users.service';
import { ReportsService } from './reports/reports.service';
import { ReportsController } from './reports/reports.controller';
import { UsersController } from './users/users.controller';
import { UsersModule } from './users/users.module';
import { ReportsModule } from './reports/reports.module';
import { TypeOrmModule } from '@nestjs/typeorm';

@Module({
  imports: [
    UsersModule,
    ReportsModule,
    TypeOrmModule.forRoot({
      entities: [__dirname + '/**/*.entity{.ts,.js}'],
      type: 'better-sqlite3',
      database: 'db.sqlite',
      synchronize: true,
    }),
  ],
  controllers: [AppController, ReportsController, UsersController],
  providers: [AppService, UsersService, ReportsService],
})
export class AppModule {}
