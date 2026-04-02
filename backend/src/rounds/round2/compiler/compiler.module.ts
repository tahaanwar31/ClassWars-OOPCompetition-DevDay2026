import { Module } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';
import { CompilerController } from './compiler.controller';
import { CompilerService } from './compiler.service';

@Module({
  imports: [HttpModule],
  controllers: [CompilerController],
  providers: [CompilerService],
  exports: [CompilerService],
})
export class CompilerModule {}
