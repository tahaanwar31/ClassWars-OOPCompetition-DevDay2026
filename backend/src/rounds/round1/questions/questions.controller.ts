import { Controller, Get, Query } from '@nestjs/common';
import { QuestionsService } from './questions.service';

@Controller('questions')
export class QuestionsController {
  constructor(private questionsService: QuestionsService) {}

  @Get('random')
  async getRandomQuestion(@Query('level') level: string, @Query('roundKey') roundKey: string) {
    const levelNum = parseInt(level) || 1;
    return this.questionsService.getRandomQuestion(levelNum, roundKey || 'round1');
  }

  @Get('by-level')
  async getQuestionsByLevel(@Query('level') level: string, @Query('roundKey') roundKey: string) {
    const levelNum = parseInt(level) || 1;
    return this.questionsService.getQuestionsByLevel(levelNum, roundKey || 'round1');
  }
}
