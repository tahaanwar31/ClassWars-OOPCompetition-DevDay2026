import { NestFactory } from '@nestjs/core';
import { AppModule } from '../app.module';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Question, QuestionDocument } from '../schemas/question.schema';

async function bootstrap() {
  const app = await NestFactory.createApplicationContext(AppModule);
  
  // Get the Question model
  const questionModel = app.get<Model<QuestionDocument>>('QuestionModel');

  console.log('🗑️  Clearing Levels 6-10 from database...\n');

  try {
    // Delete all questions for levels 6-10
    const result = await questionModel.deleteMany({ 
      level: { $gte: 6, $lte: 10 } 
    }).exec();

    console.log(`✅ Deleted ${result.deletedCount} questions from levels 6-10`);
    console.log('\n✨ Database cleared! Ready for fresh seeding.\n');
  } catch (error) {
    console.error('❌ Error clearing database:', error);
  }

  await app.close();
}

bootstrap().catch(err => {
  console.error('❌ Failed:', err);
  process.exit(1);
});
