import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { AdminService } from './admin.service';
import { AdminController } from './admin.controller';
import { Question, QuestionSchema } from '../schemas/question.schema';
import { GameConfig, GameConfigSchema } from '../schemas/game-config.schema';
import { GameSession, GameSessionSchema } from '../schemas/game-session.schema';
import { Team, TeamSchema } from '../schemas/team.schema';
import { AuthModule } from '../auth/auth.module';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Question.name, schema: QuestionSchema },
      { name: GameConfig.name, schema: GameConfigSchema },
      { name: GameSession.name, schema: GameSessionSchema },
      { name: Team.name, schema: TeamSchema },
    ]),
    AuthModule,
  ],
  providers: [AdminService],
  controllers: [AdminController],
})
export class AdminModule {}
