import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import { PassportModule } from '@nestjs/passport';
import { AuthModule } from './auth/auth.module';
import { QuestionsModule } from './rounds/round1/questions/questions.module';
import { GameModule } from './rounds/round1/game/game.module';
import { AdminModule } from './admin/admin.module';
import { TeamsModule } from './teams/teams.module';
import { CompilerModule } from './rounds/round2/compiler/compiler.module';
import { Round2GameModule } from './rounds/round2/game/round2-game.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    MongooseModule.forRoot(process.env.MONGODB_URI || 'mongodb://localhost:27017/classwars'),
    PassportModule.register({ defaultStrategy: 'jwt' }),
    AuthModule,
    QuestionsModule,
    GameModule,
    AdminModule,
    TeamsModule,
    CompilerModule,
    Round2GameModule,
  ],
})
export class AppModule {}
