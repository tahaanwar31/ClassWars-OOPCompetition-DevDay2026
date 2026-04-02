import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type TeamDocument = Team & Document;

@Schema({ timestamps: true, collection: 'class_wars_teams' })
export class Team {
  @Prop({ required: true, unique: true })
  teamName: string;

  @Prop({ required: true })
  password: string;

  @Prop({ default: 0 })
  totalScore: number;

  @Prop({ default: 0 })
  gamesPlayed: number;

  @Prop({ default: 0 })
  bestScore: number;

  @Prop({ default: true })
  isActive: boolean;

  @Prop({ type: [String], default: [] })
  sessionIds: string[];

  @Prop({ 
    type: Object, 
    default: () => ({
      round1: {
        totalPoints: 0,
        bestPoints: 0,
        maxLevelReached: 0,
        sessionsPlayed: 0
      },
      round2: {
        totalPoints: 0,
        bestPoints: 0,
        maxLevelReached: 0,
        sessionsPlayed: 0
      }
    })
  })
  roundStats: {
    round1: {
      totalPoints: number;
      bestPoints: number;
      maxLevelReached: number;
      sessionsPlayed: number;
    };
    round2: {
      totalPoints: number;
      bestPoints: number;
      maxLevelReached: number;
      sessionsPlayed: number;
    };
  };
}

export const TeamSchema = SchemaFactory.createForClass(Team);
