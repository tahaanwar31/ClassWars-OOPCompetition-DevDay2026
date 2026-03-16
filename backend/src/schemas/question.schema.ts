import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type QuestionDocument = Question & Document;

@Schema({ timestamps: true, collection: 'class_wars_questions' })
export class Question {
  @Prop({ required: true })
  id: number;

  @Prop({ required: true })
  level: number;

  @Prop({ required: true, enum: ['oneword', 'code', 'mcq', 'output', 'error', 'complete', 'design'] })
  type: string;

  @Prop({ required: true })
  text: string;

  @Prop()
  code?: string;

  @Prop({ type: [String] })
  options?: string[];

  @Prop({ required: true })
  correct: string;

  @Prop({ default: true })
  isActive: boolean;

  @Prop({ default: 'round1' })
  roundKey: string;
}

export const QuestionSchema = SchemaFactory.createForClass(Question);

// Create compound index for efficient querying
QuestionSchema.index({ roundKey: 1, level: 1, isActive: 1 });
