import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type GameSessionDocument = GameSession & Document;

@Schema({ timestamps: true, collection: 'class_wars_sessions' })
export class GameSession {
  @Prop({ required: true })
  teamName: string;

  @Prop({ default: 1 })
  currentLevel: number;

  @Prop({ default: 0 })
  totalPoints: number;

  @Prop({ default: 0 })
  correctInLevel: number;

  @Prop({ default: 0 })
  consecutiveWrong: number;

  @Prop({ default: 3600 })
  timeRemaining: number;

  @Prop({ default: 'active', enum: ['active', 'completed', 'timeout'] })
  status: string;

  @Prop({ type: [Object], default: [] })
  answeredQuestions: Array<{
    questionId: number;
    answer: string;
    isCorrect: boolean;
    timestamp: Date;
  }>;

  @Prop()
  completedAt?: Date;

  @Prop({ default: 'round1' })
  roundKey: string;

  @Prop({ default: 1 })
  maxLevelReached: number;

  @Prop({ default: false })
  isFinalized: boolean;

  @Prop({ default: null })
  currentQuestionId: number;

  @Prop({ default: null })
  questionStartedAt: Date;
}

export const GameSessionSchema = SchemaFactory.createForClass(GameSession);

// Create compound index for efficient querying
GameSessionSchema.index({ teamName: 1, roundKey: 1, status: 1 });
