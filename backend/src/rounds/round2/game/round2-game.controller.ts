import { Controller, Post, Get, Body, Param, Query } from '@nestjs/common';
import { Round2GameService } from './round2-game.service';

@Controller('api/round2')
export class Round2GameController {
  constructor(private round2Service: Round2GameService) {}

  @Post('session')
  async createSession(@Body() body: { teamName: string }) {
    return this.round2Service.createSession(body.teamName);
  }

  @Get('session/:id')
  async getSession(@Param('id') id: string) {
    return this.round2Service.getSession(id);
  }

  @Post('session/:id/level-complete')
  async submitLevelResult(
    @Param('id') id: string,
    @Body() body: {
      level: number;
      success: boolean;
      timeTakenMs: number;
      hpRemaining: number;
      codeSubmitted: string;
    },
  ) {
    return this.round2Service.submitLevelResult(id, body.level, {
      success: body.success,
      timeTakenMs: body.timeTakenMs,
      hpRemaining: body.hpRemaining,
      codeSubmitted: body.codeSubmitted,
    });
  }

  @Post('session/:id/end')
  async endSession(@Param('id') id: string) {
    return this.round2Service.endSession(id);
  }

  @Get('leaderboard')
  async getLeaderboard(@Query('limit') limit: string) {
    const limitNum = parseInt(limit) || 10;
    return this.round2Service.getLeaderboard(limitNum);
  }

  @Get('config')
  async getConfig() {
    return this.round2Service.getRoundConfig();
  }
}
