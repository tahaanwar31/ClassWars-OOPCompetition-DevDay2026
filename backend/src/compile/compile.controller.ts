import { Controller, Post, Body } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import axios from 'axios';

@Controller('compile')
export class CompileController {
  private readonly rapidApiKey: string;

  constructor(private configService: ConfigService) {
    this.rapidApiKey = this.configService.get<string>('ONECOMPILER_RAPIDAPI_KEY') || '';
  }

  @Post()
  async compile(@Body() body: { script: string }) {
    const { script } = body;

    if (!script) {
      return { error: 'No script provided' };
    }

    try {
      const res = await axios.post(
        'https://onecompiler-apis.p.rapidapi.com/api/v1/run',
        {
          language: 'cpp',
          files: [
            {
              name: 'main.cpp',
              content: script,
            },
          ],
          stdin: '',
        },
        {
          headers: {
            'Content-Type': 'application/json',
            'X-RapidAPI-Key': this.rapidApiKey,
            'X-RapidAPI-Host': 'onecompiler-apis.p.rapidapi.com',
          },
          timeout: 30000,
        },
      );

      // Map OneCompiler response to JDoodle-compatible format for frontend
      const stdout = res.data.stdout || '';
      const stderr = res.data.stderr || '';
      const exitCode = res.data.exitCode;

      // If stderr has content and no stdout, it's likely a compilation error
      const output = stdout || stderr || '';

      return {
        output,
        statusCode: exitCode ?? 0,
      };
    } catch (err: any) {
      return {
        output: `error: ${err.response?.data?.message || err.response?.data?.error || err.message}`,
        statusCode: err.response?.status || 500,
      };
    }
  }
}
