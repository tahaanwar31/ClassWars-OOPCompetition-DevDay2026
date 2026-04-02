import { connect, connection } from 'mongoose';
import * as dotenv from 'dotenv';

dotenv.config();

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/classwars';

async function enableRound2() {
  try {
    console.log('Connecting to MongoDB...');
    await connect(MONGODB_URI);
    console.log('Connected!');

    const db = connection.db;
    const configCollection = db.collection('class_wars_config');

    // Delete existing config and create a new one
    console.log('Removing old config...');
    await configCollection.deleteMany({ configName: 'default' });

    console.log('Creating new config with Round 2 enabled...');

    // Create default config with round2 enabled
    await configCollection.insertOne({
      configName: 'default',
      isActive: true,
      totalGameTime: 3600,
      questionTimeout: 60,
      pointsPerCorrect: 5,
      maxConsecutiveWrong: 2,
      maxLevel: 10,
      generalRules: [
        'Teams must use only their assigned credentials.',
        'Do not refresh repeatedly during gameplay.',
        'Any unfair means may result in disqualification.'
      ],
      rounds: [
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
          roundName: 'Round 2: Tank Warfare',
          enabled: true,
          status: 'active',
          underConstruction: false,
          startTime: null,
          endTime: null,
          playWindowStart: null,
          playWindowEnd: null,
          totalGameTimeSeconds: 1800,
          questionTimeoutSeconds: 300,
          pointsPerCorrect: 100,
          maxLevel: 3,
          maxConsecutiveWrong: 3,
          rules: [
            'Write C++ code to control your tank',
            'Complete 3 levels with increasing difficulty',
            'Level 1: Static enemy',
            'Level 2: Moving enemy with patrol patterns',
            'Level 3: Erratic movement with shield',
            'Defeat the enemy tank to progress'
          ],
          leaderboardEnabled: true
        }
      ],
      createdAt: new Date(),
      updatedAt: new Date()
    });

    console.log('✅ Created default config with Round 2 enabled!');

    // Fetch and display the final config
    const finalConfig = await configCollection.findOne({ configName: 'default' });
    const round1 = finalConfig?.rounds?.find((r: any) => r.roundKey === 'round1');
    const round2 = finalConfig?.rounds?.find((r: any) => r.roundKey === 'round2');

    console.log('\n📋 Competition Configuration:');
    console.log('===============================');

    if (round1) {
      console.log('\n🎯 Round 1:');
      console.log('  Name:', round1.roundName);
      console.log('  Enabled:', round1.enabled);
      console.log('  Status:', round1.status);
      console.log('  Max Level:', round1.maxLevel);
    }

    if (round2) {
      console.log('\n🎮 Round 2:');
      console.log('  Name:', round2.roundName);
      console.log('  Enabled:', round2.enabled);
      console.log('  Status:', round2.status);
      console.log('  Under Construction:', round2.underConstruction);
      console.log('  Max Level:', round2.maxLevel);
      console.log('  Rules:');
      round2.rules.forEach((rule: string, idx: number) => {
        console.log(`    ${idx + 1}. ${rule}`);
      });
    }

    await connection.close();
    console.log('\n✨ Done! Restart your backend server to see the changes.');
  } catch (error) {
    console.error('Error:', error);
    await connection.close();
    process.exit(1);
  }
}

enableRound2();
