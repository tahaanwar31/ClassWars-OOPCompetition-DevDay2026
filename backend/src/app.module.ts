import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import { PassportModule } from '@nestjs/passport';
import { ServeStaticModule } from '@nestjs/serve-static';
import { join } from 'path';
import { AuthModule } from './auth/auth.module';
import { QuestionsModule } from './rounds/round1/questions/questions.module';
import { GameModule } from './rounds/round1/game/game.module';
import { AdminModule } from './admin/admin.module';
import { TeamsModule } from './teams/teams.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    MongooseModule.forRoot(process.env.MONGODB_URI || 'mongodb://localhost:27017/classwars'),
    PassportModule.register({ defaultStrategy: 'jwt' }),
    ServeStaticModule.forRoot({
      rootPath: join(__dirname, '..', '..', 'frontend', 'dist'),
      exclude: ['/api/(.*)'],
    }),
    AuthModule,
    QuestionsModule,
    GameModule,
    AdminModule,
    TeamsModule,
  ],
})
export class AppModule {}
