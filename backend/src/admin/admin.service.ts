import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Question, QuestionDocument } from '../schemas/question.schema';
import { GameConfig, GameConfigDocument } from '../schemas/game-config.schema';
import { GameSession, GameSessionDocument } from '../schemas/game-session.schema';
import { Team, TeamDocument } from '../schemas/team.schema';
import * as bcrypt from 'bcrypt';

@Injectable()
export class AdminService {
  constructor(
    @InjectModel(Question.name) private questionModel: Model<QuestionDocument>,
    @InjectModel(GameConfig.name) private gameConfigModel: Model<GameConfigDocument>,
    @InjectModel(GameSession.name) private gameSessionModel: Model<GameSessionDocument>,
    @InjectModel(Team.name) private teamModel: Model<TeamDocument>,
  ) {}

  // Questions Management
  async getAllQuestions(): Promise<Question[]> {
    return this.questionModel.find().sort({ level: 1, id: 1 }).exec();
  }

  async createQuestion(questionData: Partial<Question>): Promise<Question> {
    // Auto-generate ID if not provided
    if (!questionData.id) {
      const maxQuestion = await this.questionModel.findOne().sort({ id: -1 }).exec();
      questionData.id = maxQuestion ? maxQuestion.id + 1 : 1;
    }
    const question = new this.questionModel(questionData);
    return question.save();
  }

  async updateQuestion(id: string, questionData: Partial<Question>): Promise<Question> {
    return this.questionModel.findByIdAndUpdate(id, questionData, { new: true }).exec();
  }

  async deleteQuestion(id: string): Promise<void> {
    await this.questionModel.findByIdAndDelete(id).exec();
  }

  async seedQuestions(questions: Partial<Question>[]): Promise<{ message: string; count: number }> {
    await this.questionModel.deleteMany({});
    const result = await this.questionModel.insertMany(questions);
    return { message: 'Questions seeded successfully', count: result.length };
  }

  async seedQuestionsForLevel(level: number, questions: Partial<Question>[]): Promise<{ message: string; count: number }> {
    // Deduplicate by question text before inserting
    const seen = new Set<string>();
    const unique = questions.filter(q => {
      const key = (q.text || '').replace(/\s+/g, ' ').trim();
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    });
    await this.questionModel.deleteMany({ level });
    const result = await this.questionModel.insertMany(unique);
    return { message: `Level ${level} questions seeded successfully`, count: result.length };
  }

  // Game Config Management
  async getConfig(): Promise<GameConfig> {
    let config = await this.gameConfigModel.findOne({ configName: 'default' }).exec();
    if (!config) {
      config = new this.gameConfigModel({ configName: 'default' });
      await config.save();
    }
    return config;
  }

  async updateConfig(configData: Partial<GameConfig>): Promise<GameConfig> {
    return this.gameConfigModel.findOneAndUpdate(
      { configName: 'default' },
      configData,
      { new: true, upsert: true },
    ).exec();
  }

  // Game Sessions Management
  async getAllSessions(): Promise<GameSession[]> {
    return this.gameSessionModel.find().sort({ createdAt: -1 }).exec();
  }

  async getSession(id: string): Promise<GameSession> {
    return this.gameSessionModel.findById(id).exec();
  }

  async deleteSession(id: string): Promise<void> {
    await this.gameSessionModel.findByIdAndDelete(id).exec();
  }

  // Statistics
  async getStats() {
    const totalSessions = await this.gameSessionModel.countDocuments().exec();
    const activeSessions = await this.gameSessionModel.countDocuments({ status: 'active' }).exec();
    const completedSessions = await this.gameSessionModel.countDocuments({ status: 'completed' }).exec();
    const totalQuestions = await this.questionModel.countDocuments().exec();
    
    const topPlayers = await this.gameSessionModel
      .find({ status: 'completed' })
      .sort({ totalPoints: -1 })
      .limit(5)
      .exec();

    const avgPoints = await this.gameSessionModel.aggregate([
      { $match: { status: 'completed' } },
      { $group: { _id: null, avgPoints: { $avg: '$totalPoints' } } },
    ]);

    return {
      totalSessions,
      activeSessions,
      completedSessions,
      totalQuestions,
      topPlayers,
      averagePoints: avgPoints[0]?.avgPoints || 0,
    };
  }

  // Team Management
  async getAllTeams() {
    return this.teamModel
      .find()
      .select('teamName totalScore gamesPlayed bestScore isActive createdAt')
      .sort({ totalScore: -1 })
      .exec();
  }

  async registerTeam(teamName: string, password: string) {
    const existingTeam = await this.teamModel.findOne({ teamName });
    if (existingTeam) {
      throw new Error('Team name already exists');
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const team = new this.teamModel({
      teamName,
      password: hashedPassword,
    });

    await team.save();
    return {
      teamName: team.teamName,
      message: 'Team registered successfully',
    };
  }

  async deleteTeam(teamName: string) {
    return this.teamModel.findOneAndDelete({ teamName });
  }

  async toggleTeamStatus(teamName: string) {
    const team = await this.teamModel.findOne({ teamName });
    if (!team) {
      throw new Error('Team not found');
    }
    team.isActive = !team.isActive;
    await team.save();
    return team;
  }

  async getLeaderboard(roundKey: string = 'round1') {
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

    // Merge finalized team stats with active session data
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
      });

    return sorted;
  }

  async getLeaderboardSummary() {
    const [totalTeams, activeSessions] = await Promise.all([
      this.teamModel.countDocuments({ isActive: true }),
      this.gameSessionModel.countDocuments({ status: 'active' }),
    ]);
    return { totalTeams, activeTeams: activeSessions };
  }

  async updateRoundConfig(roundKey: string, roundData: any): Promise<any> {
    const config = await this.getConfig();
    const roundIndex = config.rounds.findIndex(r => r.roundKey === roundKey);
    
    if (roundIndex === -1) {
      throw new Error('Round not found');
    }

    // Update the round config
    config.rounds[roundIndex] = {
      ...config.rounds[roundIndex],
      ...roundData
    };

    // Use findOneAndUpdate instead of save
    const updated = await this.gameConfigModel.findOneAndUpdate(
      { configName: 'default' },
      { rounds: config.rounds },
      { new: true }
    ).exec();

    return updated.rounds[roundIndex];
  }

  async getRoundConfig(roundKey: string) {
    const config = await this.getConfig();
    return config.rounds.find(r => r.roundKey === roundKey);
  }

  async getAllRoundConfigs() {
    const config = await this.getConfig();
    return {
      generalRules: config.generalRules || [],
      rounds: config.rounds
    };
  }

  async updateGeneralRules(generalRules: string[]) {
    const config = await this.getConfig();
    return this.gameConfigModel.findOneAndUpdate(
      { configName: 'default' },
      { generalRules },
      { new: true }
    ).exec();
  }
}
