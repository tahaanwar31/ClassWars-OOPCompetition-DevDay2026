import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Team, TeamDocument } from '../../schemas/team.schema';
import { GameSession, GameSessionDocument } from '../../schemas/game-session.schema';

const POINTS_PER_LEVEL = 10;

@Injectable()
export class Round2Service {
  constructor(
    @InjectModel(Team.name) private teamModel: Model<TeamDocument>,
    @InjectModel(GameSession.name) private sessionModel: Model<GameSessionDocument>,
  ) {}

  async completeLevel(teamName: string, level: number) {
    const points = POINTS_PER_LEVEL;

    // Find or create an active round2 session
    let session = await this.sessionModel.findOne({
      teamName,
      roundKey: 'round2',
      status: 'active',
    });

    if (!session) {
      session = new this.sessionModel({
        teamName,
        roundKey: 'round2',
        currentLevel: 1,
        maxLevelReached: 1,
        totalPoints: 0,
        status: 'active',
      });
    }

    // Update session
    session.maxLevelReached = Math.max(session.maxLevelReached, level);
    session.maxLevelReached = Math.min(session.maxLevelReached, 3); // cap at 3 levels
    session.currentLevel = level + 1;
    session.totalPoints += points;

    // Mark completed if all 3 levels done
    if (level >= 3) {
      session.status = 'completed';
      session.completedAt = new Date();
      session.isFinalized = true;
    }

    await session.save();

    // Update team round stats
    const team = await this.teamModel.findOne({ teamName });
    if (team) {
      const rs = team.roundStats.round2;
      rs.totalPoints += points;
      rs.maxLevelReached = Math.max(rs.maxLevelReached, level);
      rs.bestPoints = Math.max(rs.bestPoints, session.totalPoints);
      rs.sessionsPlayed = Math.max(rs.sessionsPlayed, 1);

      // Legacy fields
      team.totalScore += points;
      team.bestScore = Math.max(team.bestScore, session.totalPoints);

      // Mongoose doesn't track changes to Mixed (Object) type nested properties
      team.markModified('roundStats');

      await team.save();
    }

    return {
      level,
      pointsEarned: points,
      totalPoints: session.totalPoints,
      maxLevelReached: session.maxLevelReached,
    };
  }
}
