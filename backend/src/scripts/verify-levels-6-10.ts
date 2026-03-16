import { NestFactory } from '@nestjs/core';
import { AppModule } from '../app.module';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Question, QuestionDocument } from '../schemas/question.schema';

async function bootstrap() {
  const app = await NestFactory.createApplicationContext(AppModule);
  
  const questionModel = app.get<Model<QuestionDocument>>('QuestionModel');

  console.log('🔍 Verifying Levels 6-10 Seeding...\n');
  console.log('='.repeat(60));

  try {
    // Check total count
    const totalCount = await questionModel.countDocuments({ 
      level: { $gte: 6, $lte: 10 } 
    }).exec();

    console.log(`\n📊 Total Questions (Levels 6-10): ${totalCount}/250`);
    console.log('='.repeat(60));

    // Check each level
    for (let level = 6; level <= 10; level++) {
      const count = await questionModel.countDocuments({ level }).exec();
      const status = count === 50 ? '✅' : '❌';
      console.log(`${status} Level ${level}: ${count}/50 questions`);
    }

    console.log('='.repeat(60));

    // Check question types
    console.log('\n📝 Question Types Distribution:');
    const types = await questionModel.aggregate([
      { $match: { level: { $gte: 6, $lte: 10 } } },
      { $group: { _id: '$type', count: { $sum: 1 } } },
      { $sort: { count: -1 } }
    ]).exec();

    types.forEach((type: any) => {
      console.log(`   ${type._id}: ${type.count} questions`);
    });

    console.log('='.repeat(60));

    // Check ID ranges
    console.log('\n🔢 Question ID Ranges:');
    for (let level = 6; level <= 10; level++) {
      const questions = await questionModel
        .find({ level })
        .select('id')
        .sort({ id: 1 })
        .exec();
      
      if (questions.length > 0) {
        const minId = questions[0].id;
        const maxId = questions[questions.length - 1].id;
        console.log(`   Level ${level}: ${minId} - ${maxId}`);
      }
    }

    console.log('='.repeat(60));

    // Final status
    if (totalCount === 250) {
      console.log('\n✅ SUCCESS! All 250 questions properly seeded!');
      console.log('🎉 Levels 6-10 are ready to use!\n');
    } else {
      console.log(`\n⚠️  WARNING: Expected 250 questions, found ${totalCount}`);
      console.log('   Run: npm run seed:6-10-fresh\n');
    }

  } catch (error) {
    console.error('❌ Error verifying:', error);
  }

  await app.close();
}

bootstrap().catch(err => {
  console.error('❌ Failed:', err);
  process.exit(1);
});
