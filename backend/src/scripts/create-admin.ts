import { NestFactory } from '@nestjs/core';
import { AppModule } from '../app.module';
import { Model } from 'mongoose';
import { getModelToken } from '@nestjs/mongoose';
import { Admin } from '../schemas/admin.schema';
import * as bcrypt from 'bcrypt';

async function bootstrap() {
  const app = await NestFactory.createApplicationContext(AppModule);
  const adminModel = app.get<Model<Admin>>(getModelToken(Admin.name));

  console.log('Creating admin user...');

  const adminExists = await adminModel.findOne({ email: 'admin@classwars.com' });
  
  if (adminExists) {
    console.log('✅ Admin user already exists');
    console.log('   Email: admin@classwars.com');
    console.log('   Password: admin123');
  } else {
    const hashedPassword = await bcrypt.hash('admin123', 10);
    await adminModel.create({
      email: 'admin@classwars.com',
      password: hashedPassword,
      role: 'admin',
    });
    console.log('✅ Admin user created successfully!');
    console.log('   Email: admin@classwars.com');
    console.log('   Password: admin123');
  }

  await app.close();
}

bootstrap();
