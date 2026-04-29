import { Controller, Get, Post, Put, Delete, Body, Param, Query, UseGuards } from '@nestjs/common';
import { AdminService } from './admin.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@Controller('admin')
@UseGuards(JwtAuthGuard)
export class AdminController {
  constructor(private adminService: AdminService) {}

  // Questions Management
  @Get('questions')
  async getAllQuestions() {
    return this.adminService.getAllQuestions();
  }

  @Post('questions')
  async createQuestion(@Body() questionData: any) {
    return this.adminService.createQuestion(questionData);
  }

  @Put('questions/:id')
  async updateQuestion(@Param('id') id: string, @Body() questionData: any) {
    return this.adminService.updateQuestion(id, questionData);
  }

  @Delete('questions/:id')
  async deleteQuestion(@Param('id') id: string) {
    return this.adminService.deleteQuestion(id);
  }

  @Post('questions/seed')
  async seedQuestions(@Body() body: { questions: any[] }) {
    return this.adminService.seedQuestions(body.questions);
  }

  // Game Config Management
  @Get('config')
  async getConfig() {
    return this.adminService.getConfig();
  }

  @Put('config')
  async updateConfig(@Body() configData: any) {
    return this.adminService.updateConfig(configData);
  }

  // Game Sessions Management
  @Get('sessions')
  async getAllSessions() {
    return this.adminService.getAllSessions();
  }

  @Get('sessions/:id')
  async getSession(@Param('id') id: string) {
    return this.adminService.getSession(id);
  }

  @Delete('sessions/:id')
  async deleteSession(@Param('id') id: string) {
    return this.adminService.deleteSession(id);
  }

  // Statistics
  @Get('stats')
  async getStats() {
    return this.adminService.getStats();
  }

  // Team Management
  @Get('teams')
  async getAllTeams() {
    return this.adminService.getAllTeams();
  }

  @Post('teams')
  async registerTeam(@Body() body: { teamName: string; password: string }) {
    return this.adminService.registerTeam(body.teamName, body.password);
  }

  @Delete('teams/:teamName')
  async deleteTeam(@Param('teamName') teamName: string) {
    return this.adminService.deleteTeam(teamName);
  }

  @Put('teams/:teamName/toggle')
  async toggleTeamStatus(@Param('teamName') teamName: string) {
    return this.adminService.toggleTeamStatus(teamName);
  }

  // Leaderboard
  @Get('leaderboard/summary')
  async getLeaderboardSummary() {
    return this.adminService.getLeaderboardSummary();
  }

  @Get('leaderboard')
  async getLeaderboard(@Query('roundKey') roundKey?: string) {
    return this.adminService.getLeaderboard(roundKey || 'round1');
  }

  // Leaderboard Reset
  @Post('reset-leaderboard')
  async resetLeaderboard() {
    return this.adminService.resetLeaderboard();
  }

  // Round Config Management
  @Get('config/rounds')
  async getAllRoundConfigs() {
    return this.adminService.getAllRoundConfigs();
  }

  @Get('config/rounds/:roundKey')
  async getRoundConfig(@Param('roundKey') roundKey: string) {
    return this.adminService.getRoundConfig(roundKey);
  }

  @Put('config/rounds/:roundKey')
  async updateRoundConfig(@Param('roundKey') roundKey: string, @Body() roundData: any) {
    return this.adminService.updateRoundConfig(roundKey, roundData);
  }

  @Put('config/general-rules')
  async updateGeneralRules(@Body() body: { generalRules: string[] }) {
    return this.adminService.updateGeneralRules(body.generalRules);
  }
}
