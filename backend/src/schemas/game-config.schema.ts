import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type GameConfigDocument = GameConfig & Document;

export interface RoundConfig {
  roundKey: string;
  roundName: string;
  enabled: boolean;
  status: 'active' | 'scheduled' | 'ended' | 'under_construction';
  underConstruction: boolean;
  startTime: Date | null;
  endTime: Date | null;
  playWindowStart: Date | null;
  playWindowEnd: Date | null;
  totalGameTimeSeconds: number;
  questionTimeoutSeconds: number;
  pointsPerCorrect: number;
  maxLevel: number;
  maxConsecutiveWrong: number;
  rules: string[];
  leaderboardEnabled: boolean;
}

@Schema({ timestamps: true, collection: 'class_wars_config' })
export class GameConfig {
  @Prop({ required: true, unique: true, default: 'default' })
  configName: string;

  @Prop({ default: 3600 })
  totalGameTime: number;

  @Prop({ default: 60 })
  questionTimeout: number;

  @Prop({ default: 5 })
  pointsPerCorrect: number;

  @Prop({ default: 2 })
  maxConsecutiveWrong: number;

  @Prop({ default: 10 })
  maxLevel: number;

  @Prop({ default: true })
  isActive: boolean;

  @Prop({ type: [String], default: () => [
    'Teams must use only their assigned credentials.',
    'Do not refresh repeatedly during gameplay.',
    'Any unfair means may result in disqualification.'
  ]})
  generalRules: string[];

  @Prop({ 
    type: Array, 
    default: () => [
      {
        roundKey: 'round1',
        roundName: 'Round 1',
        enabled: true,
        status: 'active',
        underConstruction: false,
        startTime: null,
        endTime: null,
        playWindowStart: null,
        playWindowEnd: null,
        totalGameTimeSeconds: 3600,
        questionTimeoutSeconds: 60,
        pointsPerCorrect: 5,
        maxLevel: 10,
        maxConsecutiveWrong: 2,
        rules: [
          'Answer [Current Level] questions correctly to level up',
          '2 consecutive wrong answers or 2 consecutive missed questions drops you 1 level',
          'Missing a question counts as a strike (treated like an incorrect answer)',
          'Winners are decided by highest level reached; ties are broken by who reached that level first'
        ],
        leaderboardEnabled: true
      },
      {
        roundKey: 'round2',
        roundName: 'Round 2',
        enabled: true,
        status: 'active',
        underConstruction: false,
        startTime: null,
        endTime: null,
        playWindowStart: null,
        playWindowEnd: null,
        totalGameTimeSeconds: 1800,
        questionTimeoutSeconds: 60,
        pointsPerCorrect: 100,
        maxLevel: 3,
        maxConsecutiveWrong: 0,
        rules: [
          'Write C++ code to control your tank',
          'Level 1: Navigate through checkpoints using moveUp()/moveDown()',
          'Level 2: Destroy moving targets using fire() when aligned',
          'Level 3: Defeat MAKAROV using move(), attack(), and defend()',
          'Each level scores up to 200 points (base + HP bonus + time bonus)'
        ],
        leaderboardEnabled: true
      }
    ]
  })
  rounds: RoundConfig[];
}

export const GameConfigSchema = SchemaFactory.createForClass(GameConfig);
