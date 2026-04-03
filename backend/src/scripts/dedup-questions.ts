import { NestFactory } from '@nestjs/core';
import { AppModule } from '../app.module';
import { getModelToken } from '@nestjs/mongoose';
import { Model } from 'mongoose';

async function bootstrap() {
  const app = await NestFactory.createApplicationContext(AppModule);
  const questionModel = app.get<Model<any>>(getModelToken('Question'));

  console.log('Scanning for duplicate questions in database...\n');

  const allQuestions = await questionModel.find().sort({ level: 1, id: 1 }).exec();
  console.log(`Total questions in DB: ${allQuestions.length}`);

  // Group by level + normalized text
  const seen = new Map<string, any>();
  const duplicateIds: string[] = [];

  for (const q of allQuestions) {
    const key = `${q.level}::${(q.text || '').replace(/\s+/g, ' ').trim()}`;
    if (seen.has(key)) {
      console.log(`  DUPLICATE found: Level ${q.level}, ID ${q.id} (duplicate of ID ${seen.get(key).id})`);
      duplicateIds.push(q._id.toString());
    } else {
      seen.set(key, q);
    }
  }

  if (duplicateIds.length === 0) {
    console.log('\nNo duplicates found! Database is clean.');
  } else {
    console.log(`\nRemoving ${duplicateIds.length} duplicate(s)...`);
    await questionModel.deleteMany({ _id: { $in: duplicateIds } });
    console.log('Duplicates removed successfully!');

    const remaining = await questionModel.countDocuments();
    console.log(`Questions remaining: ${remaining}`);
  }

  await app.close();
}

bootstrap().catch(console.error);
