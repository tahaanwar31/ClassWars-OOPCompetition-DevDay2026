import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { GameSession, GameSessionDocument } from '../../../schemas/game-session.schema';
import { GameConfig, GameConfigDocument, RoundConfig } from '../../../schemas/game-config.schema';
import { Team, TeamDocument } from '../../../schemas/team.schema';
import { Question, QuestionDocument } from '../../../schemas/question.schema';

@Injectable()
export class GameService {
  constructor(
    @InjectModel(GameSession.name) private gameSessionModel: Model<GameSessionDocument>,
    @InjectModel(GameConfig.name) private gameConfigModel: Model<GameConfigDocument>,
    @InjectModel(Team.name) private teamModel: Model<TeamDocument>,
    @InjectModel(Question.name) private questionModel: Model<QuestionDocument>,
  ) {}

  async createSession(teamName: string, roundKey: string = 'round1'): Promise<GameSession> {
    // Validate team exists and is active
    const team = await this.teamModel.findOne({ teamName, isActive: true });
    if (!team) {
      throw new BadRequestException('Team not found or inactive');
    }

    // Get round config
    const roundConfig = await this.getRoundConfig(roundKey);
    if (!roundConfig) {
      throw new BadRequestException('Round not found');
    }

    // Validate round availability
    if (!roundConfig.enabled) {
      throw new BadRequestException('Round is not enabled');
    }

    if (roundConfig.underConstruction) {
      throw new BadRequestException('Round is under construction');
    }

    if (roundConfig.status !== 'active') {
      throw new BadRequestException(`Round is ${roundConfig.status}`);
    }

    // Validate play window
    const now = new Date();
    if (roundConfig.playWindowStart && now < new Date(roundConfig.playWindowStart)) {
      throw new BadRequestException('Round has not started yet');
    }
    if (roundConfig.playWindowEnd && now > new Date(roundConfig.playWindowEnd)) {
      throw new BadRequestException('Round has ended');
    }

    // Check for existing active session for this team and round
    const existingSession = await this.gameSessionModel.findOne({
      teamName,
      roundKey,
      status: 'active'
    });

    if (existingSession) {
      return existingSession;
    }

    // Create new session
    const session = new this.gameSessionModel({
      teamName,
      roundKey,
      timeRemaining: roundConfig.totalGameTimeSeconds,
      maxLevelReached: 1
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

  async updateSession(sessionId: string, updateData: Partial<GameSession>): Promise<GameSession> {
    return this.gameSessionModel.findByIdAndUpdate(sessionId, updateData, { new: true }).exec();
  }

  async submitAnswer(
    sessionId: string,
    questionId: number,
    answer: string,
    isCorrect: boolean,
  ): Promise<GameSession> {
    const session = await this.getSession(sessionId);

    // Don't allow answers on completed/finalized sessions
    if (session.status === 'completed' || session.isFinalized) {
      return session;
    }

    // Server-side answer verification — ignore frontend's isCorrect
    const question = await this.questionModel.findOne({ id: questionId, roundKey: session.roundKey });
    if (!question) {
      throw new NotFoundException('Question not found');
    }

    let isVerified: boolean;
    if (question.type === 'mcq') {
      isVerified = answer === question.correct;
    } else {
      const normalize = (s: string) => s.replace(/\s+/g, '').replace(/;$/, '').toLowerCase();
      isVerified = normalize(answer) === normalize(question.correct);
    }

    const roundConfig = await this.getRoundConfig(session.roundKey);
    
    const updateData: any = {
      $push: {
        answeredQuestions: {
          questionId,
          answer,
          isCorrect: isVerified,
          timestamp: new Date(),
        },
      },
    };

    if (isVerified) {
      updateData.totalPoints = session.totalPoints + roundConfig.pointsPerCorrect;
      updateData.correctInLevel = session.correctInLevel + 1;
      updateData.consecutiveWrong = 0;

      if (session.correctInLevel + 1 >= session.currentLevel) {
        const maxLevel = roundConfig.maxLevel || 10;
        
        if (session.currentLevel >= maxLevel) {
          // Player has completed the final level — mark round as completed
          updateData.correctInLevel = session.currentLevel; // keep it full
          updateData.status = 'completed';
          updateData.completedAt = new Date();
          updateData.isFinalized = true;
          updateData.maxLevelReached = maxLevel;
        } else {
          const nextLevel = session.currentLevel + 1;
          updateData.currentLevel = nextLevel;
          updateData.correctInLevel = 0;
          
          // Update max level reached
          if (nextLevel > session.maxLevelReached) {
            updateData.maxLevelReached = nextLevel;
          }
        }
      }
    } else {
      updateData.consecutiveWrong = session.consecutiveWrong + 1;

      if (session.consecutiveWrong + 1 >= roundConfig.maxConsecutiveWrong) {
        const nextLevel = Math.max(1, session.currentLevel - 1);
        updateData.currentLevel = nextLevel;
        updateData.consecutiveWrong = 0;
        updateData.correctInLevel = 0;
      }
    }

    const updatedSession = await this.gameSessionModel.findByIdAndUpdate(sessionId, updateData, { new: true }).exec();

    // Live-update team's maxLevelReached so leaderboard reflects progress during active play
    if (isVerified && updatedSession && updatedSession.maxLevelReached > session.maxLevelReached) {
      await this.teamModel.updateOne(
        { teamName: session.teamName },
        { $max: { [`roundStats.${session.roundKey}.maxLevelReached`]: updatedSession.maxLevelReached } }
      );
    }

    return updatedSession;
  }

  async setCurrentQuestion(sessionId: string, questionId: number): Promise<GameSession> {
    const updated = await this.gameSessionModel.findByIdAndUpdate(
      sessionId,
      { currentQuestionId: questionId, questionStartedAt: new Date() },
      { new: true },
    ).exec();
    if (!updated) throw new NotFoundException('Session not found');
    return updated;
  }

  async endSession(sessionId: string): Promise<GameSession> {
    const session = await this.gameSessionModel.findById(sessionId).exec();

    if (!session) {
      throw new NotFoundException('Session not found');
    }

    // Finalize session if not already
    if (!session.isFinalized) {
      session.status = 'completed';
      session.completedAt = new Date();
      session.isFinalized = true;

      // Update max level reached one final time
      if (session.currentLevel > session.maxLevelReached) {
        session.maxLevelReached = session.currentLevel;
      }

      await session.save();
    }

    // Always update team stats — idempotent check inside updateTeamStats
    await this.updateTeamStats(session);

    return session;
  }

  async updateTeamStats(session: GameSession) {
    const team = await this.teamModel.findOne({ teamName: session.teamName });
    if (!team) {
      return;
    }

    // Idempotent: skip if this session was already counted
    const sessionIdStr = (session as any)._id.toString();
    if (team.sessionIds?.map(String).includes(sessionIdStr)) {
      return;
    }

    // Initialize roundStats if not exists
    if (!team.roundStats) {
      team.roundStats = {
        round1: { totalPoints: 0, bestPoints: 0, maxLevelReached: 0, sessionsPlayed: 0 },
        round2: { totalPoints: 0, bestPoints: 0, maxLevelReached: 0, sessionsPlayed: 0 }
      };
    }

    const roundKey = session.roundKey as 'round1' | 'round2';
    
    // Ensure the round stats exist
    if (!team.roundStats[roundKey]) {
      team.roundStats[roundKey] = {
        totalPoints: 0,
        bestPoints: 0,
        maxLevelReached: 0,
        sessionsPlayed: 0
      };
    }

    // Update round-specific stats
    team.roundStats[roundKey].totalPoints += session.totalPoints;
    team.roundStats[roundKey].sessionsPlayed += 1;
    
    if (session.totalPoints > team.roundStats[roundKey].bestPoints) {
      team.roundStats[roundKey].bestPoints = session.totalPoints;
    }
    
    if (session.maxLevelReached > team.roundStats[roundKey].maxLevelReached) {
      team.roundStats[roundKey].maxLevelReached = session.maxLevelReached;
    }

    // Update legacy fields for backward compatibility
    team.totalScore += session.totalPoints;
    team.gamesPlayed += 1;
    if (session.totalPoints > team.bestScore) {
      team.bestScore = session.totalPoints;
    }
    
    team.sessionIds.push((session as any)._id.toString());
    
    await team.save();
  }

  async getLeaderboard(roundKey: string = 'round1', limit: number = 10) {
    const [teams, activeSessions] = await Promise.all([
      this.teamModel
        .find({ isActive: true })
        .select('teamName roundStats updatedAt')
        .exec(),
      this.gameSessionModel
        .find({ roundKey, status: 'active' })
        .select('teamName totalPoints maxLevelReached updatedAt')
        .exec(),
    ]);

    const activeMap = new Map(activeSessions.map(s => [s.teamName, s]));

    const sorted = teams
      .map(team => {
        const stats = team.roundStats?.[roundKey] || {
          totalPoints: 0,
          bestPoints: 0,
          maxLevelReached: 0,
          sessionsPlayed: 0
        };
        const active = activeMap.get(team.teamName);

        return {
          teamName: team.teamName,
          maxLevelReached: Math.max(stats.maxLevelReached, active?.maxLevelReached || 0),
          totalPoints: stats.totalPoints + (active?.totalPoints || 0),
          bestPoints: Math.max(stats.bestPoints, active?.totalPoints || 0),
          sessionsPlayed: stats.sessionsPlayed,
          lastUpdated: (active as any)?.updatedAt?.toISOString() || (team as any).updatedAt?.toISOString() || '',
          isActive: !!active,
        };
      })
      .sort((a, b) => {
        if (b.maxLevelReached !== a.maxLevelReached) {
          return b.maxLevelReached - a.maxLevelReached;
        }
        if (b.totalPoints !== a.totalPoints) {
          return b.totalPoints - a.totalPoints;
        }
        const aTime = a.lastUpdated ? new Date(a.lastUpdated).getTime() : Infinity;
        const bTime = b.lastUpdated ? new Date(b.lastUpdated).getTime() : Infinity;
        return aTime - bTime;
      })
      .slice(0, limit);

    return sorted;
  }

  async getRoundConfig(roundKey: string): Promise<RoundConfig | null> {
    const config = await this.getActiveConfig();
    return config.rounds.find(r => r.roundKey === roundKey) || null;
  }

  async getActiveConfig(): Promise<GameConfig> {
    let config = await this.gameConfigModel.findOne({ isActive: true }).exec();
    if (!config) {
      config = new this.gameConfigModel({ configName: 'default' });
      await config.save();
    }
    return config;
  }

  async getAllSessions(): Promise<GameSession[]> {
    return this.gameSessionModel.find().sort({ createdAt: -1 }).exec();
  }

  async getCompetitionRounds() {
    const config = await this.getActiveConfig();
    const now = new Date();

    return {
      generalRules: config.generalRules || [],
      rounds: config.rounds.map(round => {
        let canEnter = round.enabled && !round.underConstruction && round.status === 'active';
        let availabilityLabel = 'Available Now';
        
        // Check play window timing
        if (round.playWindowStart && now < new Date(round.playWindowStart)) {
          canEnter = false;
          availabilityLabel = 'Not Started Yet';
        } else if (round.playWindowEnd && now > new Date(round.playWindowEnd)) {
          canEnter = false;
          availabilityLabel = 'Closed';
        } else if (round.underConstruction) {
          canEnter = false;
          availabilityLabel = 'Under Construction';
        } else if (!round.enabled) {
          canEnter = false;
          availabilityLabel = 'Disabled';
        } else if (round.status === 'ended') {
          canEnter = false;
          availabilityLabel = 'Ended';
        } else if (round.status === 'scheduled') {
          canEnter = false;
          availabilityLabel = 'Scheduled';
        }

        return {
          roundKey: round.roundKey,
          roundName: round.roundName,
          status: round.status,
          underConstruction: round.underConstruction,
          startTime: round.startTime,
          endTime: round.endTime,
          playWindowStart: round.playWindowStart,
          playWindowEnd: round.playWindowEnd,
          rules: round.rules,
          enabled: round.enabled,
          canEnter,
          availabilityLabel
        };
      })
    };
  }
}

