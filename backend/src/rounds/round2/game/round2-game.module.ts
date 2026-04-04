import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { Round2GameService } from './round2-game.service';
import { Round2GameController } from './round2-game.controller';
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
  providers: [Round2GameService],
  controllers: [Round2GameController],
  exports: [Round2GameService],
})
export class Round2GameModule {}
