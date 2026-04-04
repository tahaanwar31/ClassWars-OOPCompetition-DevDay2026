import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { GameService } from './game.service';
import { GameController, CompetitionController } from './game.controller';
import { GameSession, GameSessionSchema } from '../../../schemas/game-session.schema';
import { GameConfig, GameConfigSchema } from '../../../schemas/game-config.schema';
import { Team, TeamSchema } from '../../../schemas/team.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: GameSession.name, schema: GameSessionSchema },
      { name: GameConfig.name, schema: GameConfigSchema },
      { name: Team.name, schema: TeamSchema },
    ]),
  ],
  providers: [GameService],
  controllers: [GameController, CompetitionController],
  exports: [GameService],
})
export class GameModule {}
