import { Controller, Post, Body, HttpException, HttpStatus } from '@nestjs/common';
import { CompilerService } from './compiler.service';

@Controller('api')
export class CompilerController {
  constructor(private compilerService: CompilerService) {}

  @Post('compile')
  async compile(@Body() body: { code: string; level: number }) {
    try {
      const result = await this.compilerService.compileCode(body.code, body.level);
      return result;
    } catch (error) {
      throw new HttpException(
        error.message || 'Compilation failed',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }
}
