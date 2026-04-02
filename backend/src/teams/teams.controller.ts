import { Controller, Post, Get, Body, UseGuards } from '@nestjs/common';
import { TeamsService } from './teams.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@Controller('teams')
export class TeamsController {
  constructor(private readonly teamsService: TeamsService) {}

  @Post('login')
  async login(@Body() body: { teamName: string; password: string }) {
    return this.teamsService.login(body.teamName, body.password);
  }

  @Get('leaderboard')
  async getLeaderboard() {
    return this.teamsService.getLeaderboard();
  }
}
