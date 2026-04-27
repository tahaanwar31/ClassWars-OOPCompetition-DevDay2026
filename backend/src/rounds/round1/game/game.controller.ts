import { Controller, Post, Get, Patch, Body, Param, Query } from '@nestjs/common';
import { GameService } from './game.service';

@Controller('game')
export class GameController {
  constructor(private gameService: GameService) {}

  @Post('session')
  async createSession(@Body() body: { teamName: string; roundKey?: string }) {
    return this.gameService.createSession(body.teamName, body.roundKey || 'round1');
  }

  @Get('session/:id')
  async getSession(@Param('id') id: string) {
    return this.gameService.getSession(id);
  }

  @Post('session/:id/answer')
  async submitAnswer(
    @Param('id') id: string,
    @Body() body: { questionId: number; answer: string; isCorrect: boolean },
  ) {
    return this.gameService.submitAnswer(id, body.questionId, body.answer, body.isCorrect);
  }

  @Post('session/:id/end')
  async endSession(@Param('id') id: string) {
    return this.gameService.endSession(id);
  }

  @Patch('session/:id/current-question')
  async setCurrentQuestion(
    @Param('id') id: string,
    @Body() body: { questionId: number },
  ) {
    return this.gameService.setCurrentQuestion(id, body.questionId);
  }

  @Get('leaderboard')
  async getLeaderboard(@Query('limit') limit: string, @Query('roundKey') roundKey: string) {
    const limitNum = parseInt(limit) || 10;
    return this.gameService.getLeaderboard(roundKey || 'round1', limitNum);
  }

  @Get('config')
  async getConfig() {
    return this.gameService.getActiveConfig();
  }

  @Get('config/round/:roundKey')
  async getRoundConfig(@Param('roundKey') roundKey: string) {
    return this.gameService.getRoundConfig(roundKey);
  }
}

@Controller('competition')
export class CompetitionController {
  constructor(private gameService: GameService) {}

  @Get('rounds')
  async getCompetitionRounds() {
    return this.gameService.getCompetitionRounds();
  }
}

