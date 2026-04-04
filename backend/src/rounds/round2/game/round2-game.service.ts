import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { GameSession, GameSessionDocument } from '../../../schemas/game-session.schema';
import { GameConfig, GameConfigDocument, RoundConfig } from '../../../schemas/game-config.schema';
import { Team, TeamDocument } from '../../../schemas/team.schema';

@Injectable()
export class Round2GameService {
  constructor(
    @InjectModel(GameSession.name) private gameSessionModel: Model<GameSessionDocument>,
    @InjectModel(GameConfig.name) private gameConfigModel: Model<GameConfigDocument>,
    @InjectModel(Team.name) private teamModel: Model<TeamDocument>,
  ) {}

  async createSession(teamName: string): Promise<GameSession> {
    const team = await this.teamModel.findOne({ teamName, isActive: true });
    if (!team) {
      throw new BadRequestException('Team not found or inactive');
    }

    const roundConfig = await this.getRoundConfig();
    if (!roundConfig) {
      throw new BadRequestException('Round 2 not found');
    }
    if (!roundConfig.enabled) {
      throw new BadRequestException('Round 2 is not enabled');
    }
    if (roundConfig.underConstruction) {
      throw new BadRequestException('Round 2 is under construction');
    }
    if (roundConfig.status !== 'active') {
      throw new BadRequestException(`Round 2 is ${roundConfig.status}`);
    }

    // Validate play window
    const now = new Date();
    if (roundConfig.playWindowStart && now < new Date(roundConfig.playWindowStart)) {
      throw new BadRequestException('Round 2 has not started yet');
    }
    if (roundConfig.playWindowEnd && now > new Date(roundConfig.playWindowEnd)) {
      throw new BadRequestException('Round 2 has ended');
    }

    // Check for existing active session
    const existingSession = await this.gameSessionModel.findOne({
      teamName,
      roundKey: 'round2',
      status: 'active'
    });

    if (existingSession) {
      return existingSession;
    }

    // Create new session
    const session = new this.gameSessionModel({
      teamName,
      roundKey: 'round2',
      currentLevel: 1,
      timeRemaining: roundConfig.totalGameTimeSeconds,
      maxLevelReached: 1,
    });

    return session.save();
  }

  async getSession(sessionId: string): Promise<GameSession> {
    const session = await this.gameSessionModel.findById(sessionId).exec();
    if (!session) {
      throw new NotFoundException('Session not found');
    }
    return session;
  }

  async submitLevelResult(
    sessionId: string,
    level: number,
    result: {
      success: boolean;
      timeTakenMs: number;
      hpRemaining: number;
      codeSubmitted: string;
    },
  ): Promise<GameSession> {
    const session = await this.getSession(sessionId);

    if (session.status === 'completed' || session.isFinalized) {
      return session;
    }

    const roundConfig = await this.getRoundConfig();
    const basePoints = roundConfig?.pointsPerCorrect || 100;

    let pointsEarned = 0;
    if (result.success) {
      // HP bonus: up to 50 extra points for finishing with full HP
      const hpBonus = Math.floor((result.hpRemaining / 100) * 50);
      // Time bonus: faster completion = more points (max 50)
      const timeTakenSec = result.timeTakenMs / 1000;
      const timeBonus = Math.max(0, 50 - Math.floor(timeTakenSec / 10));
      pointsEarned = basePoints + hpBonus + timeBonus;
    }

    const updateData: any = {
      totalPoints: session.totalPoints + pointsEarned,
      $push: {
        answeredQuestions: {
          questionId: level,
          answer: result.codeSubmitted,
          isCorrect: result.success,
          timestamp: new Date(),
        },
      },
    };

    if (result.success) {
      const maxLevel = roundConfig?.maxLevel || 3;

      if (level >= maxLevel) {
        // All levels completed
        updateData.currentLevel = maxLevel;
        updateData.maxLevelReached = maxLevel;
        updateData.status = 'completed';
        updateData.completedAt = new Date();
        updateData.isFinalized = true;
      } else {
        const nextLevel = level + 1;
        updateData.currentLevel = nextLevel;
        if (nextLevel > session.maxLevelReached) {
          updateData.maxLevelReached = nextLevel;
        }
      }
    }

    return this.gameSessionModel.findByIdAndUpdate(sessionId, updateData, { new: true }).exec();
  }

  async endSession(sessionId: string): Promise<GameSession> {
    const session = await this.gameSessionModel.findById(sessionId).exec();
    if (!session) {
      throw new NotFoundException('Session not found');
    }
    if (session.isFinalized) {
      return session;
    }

    session.status = 'completed';
    session.completedAt = new Date();
    session.isFinalized = true;

    if (session.currentLevel > session.maxLevelReached) {
      session.maxLevelReached = session.currentLevel;
    }

    await session.save();
    await this.updateTeamStats(session);

    return session;
  }

  private async updateTeamStats(session: GameSession) {
    const team = await this.teamModel.findOne({ teamName: session.teamName });
    if (!team) return;

    if (!team.roundStats) {
      team.roundStats = {
        round1: { totalPoints: 0, bestPoints: 0, maxLevelReached: 0, sessionsPlayed: 0 },
        round2: { totalPoints: 0, bestPoints: 0, maxLevelReached: 0, sessionsPlayed: 0 }
      };
    }

    if (!team.roundStats.round2) {
      team.roundStats.round2 = { totalPoints: 0, bestPoints: 0, maxLevelReached: 0, sessionsPlayed: 0 };
    }

    team.roundStats.round2.totalPoints += session.totalPoints;
    team.roundStats.round2.sessionsPlayed += 1;
    if (session.totalPoints > team.roundStats.round2.bestPoints) {
      team.roundStats.round2.bestPoints = session.totalPoints;
    }
    if (session.maxLevelReached > team.roundStats.round2.maxLevelReached) {
      team.roundStats.round2.maxLevelReached = session.maxLevelReached;
    }

    team.totalScore += session.totalPoints;
    team.gamesPlayed += 1;
    if (session.totalPoints > team.bestScore) {
      team.bestScore = session.totalPoints;
    }
    team.sessionIds.push((session as any)._id.toString());

    await team.save();
  }

  async getLeaderboard(limit: number = 10) {
    const teams = await this.teamModel
      .find({ isActive: true })
      .select('teamName roundStats')
      .exec();

    return teams
      .map(team => {
        const stats = team.roundStats?.round2 || { totalPoints: 0, bestPoints: 0, maxLevelReached: 0, sessionsPlayed: 0 };
        return {
          teamName: team.teamName,
          maxLevelReached: stats.maxLevelReached,
          totalPoints: stats.totalPoints,
          bestPoints: stats.bestPoints,
          sessionsPlayed: stats.sessionsPlayed
        };
      })
      .sort((a, b) => {
        if (b.maxLevelReached !== a.maxLevelReached) return b.maxLevelReached - a.maxLevelReached;
        return b.totalPoints - a.totalPoints;
      })
      .slice(0, limit);
  }

  async getRoundConfig(): Promise<RoundConfig | null> {
    const config = await this.gameConfigModel.findOne({ isActive: true }).exec();
    if (!config) return null;
    return config.rounds.find(r => r.roundKey === 'round2') || null;
  }
}
