import { Injectable, ConflictException, UnauthorizedException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Team, TeamDocument } from '../schemas/team.schema';
import * as bcrypt from 'bcrypt';

@Injectable()
export class TeamsService {
  constructor(
    @InjectModel(Team.name) private teamModel: Model<TeamDocument>,
  ) {}

  async register(teamName: string, password: string) {
    const existingTeam = await this.teamModel.findOne({ teamName });
    if (existingTeam) {
      throw new ConflictException('Team name already exists');
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

  async login(teamName: string, password: string) {
    const team = await this.teamModel.findOne({ teamName, isActive: true });
    if (!team) {
      throw new UnauthorizedException('Invalid team name or password');
    }

    const isPasswordValid = await bcrypt.compare(password, team.password);
    if (!isPasswordValid) {
      throw new UnauthorizedException('Invalid team name or password');
    }

    return {
      teamName: team.teamName,
      totalScore: team.totalScore,
      gamesPlayed: team.gamesPlayed,
      bestScore: team.bestScore,
    };
  }

  async updateScore(teamName: string, sessionScore: number, sessionId: string) {
    const team = await this.teamModel.findOne({ teamName });
    if (!team) {
      throw new Error('Team not found');
    }

    team.totalScore += sessionScore;
    team.gamesPlayed += 1;
    if (sessionScore > team.bestScore) {
      team.bestScore = sessionScore;
    }
    team.sessionIds.push(sessionId);

    await team.save();
    return team;
  }

  async getLeaderboard() {
    return this.teamModel
      .find({ isActive: true })
      .select('teamName totalScore gamesPlayed bestScore')
      .sort({ totalScore: -1, bestScore: -1 })
      .exec();
  }

  async getAllTeams() {
    return this.teamModel
      .find()
      .select('teamName totalScore gamesPlayed bestScore isActive createdAt')
      .sort({ totalScore: -1 })
      .exec();
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
}
