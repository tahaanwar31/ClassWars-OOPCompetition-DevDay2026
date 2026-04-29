import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { AppModule } from './app.module';
import { join } from 'path';
import { existsSync } from 'fs';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.enableCors({
    origin: process.env.CORS_ORIGIN
      ? process.env.CORS_ORIGIN.split(',')
      : true,
    credentials: true,
  });

  // Prevent browser from caching index.html so new deploys don't break
  app.use((req: any, res: any, next: any) => {
    if (req.url === '/' || req.url.endsWith('.html')) {
      res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
      res.setHeader('Pragma', 'no-cache');
      res.setHeader('Expires', '0');
    }
    next();
  });

  // SPA fallback: serve index.html for any unmatched non-API route
  // so client-side routes (e.g. /competition/round2/level1) work on page refresh
  // Must exclude all backend controller prefixes so API calls reach their handlers
  const backendPrefixes = ['/api', '/auth', '/admin', '/game', '/teams', '/compile', '/round2', '/questions'];
  const indexPath = join(__dirname, '..', '..', 'frontend', 'dist', 'index.html');
  app.use((req: any, res: any, next: any) => {
    // Skip all backend API routes and static files (have file extension)
    if (backendPrefixes.some(p => req.url.startsWith(p)) || req.url.includes('.')) {
      return next();
    }
    // /competition/rounds is an API endpoint (CompetitionController), not a page
    if (req.url.startsWith('/competition/rounds')) {
      return next();
    }
    if (existsSync(indexPath)) {
      res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
      res.sendFile(indexPath);
    } else {
      next();
    }
  });

  app.useGlobalPipes(new ValidationPipe({
    whitelist: true,
    transform: true,
  }));

  const port = process.env.PORT || 3002;
  await app.listen(port, '0.0.0.0');
  console.log(`🚀 Backend running on http://0.0.0.0:${port}`);
}
bootstrap();
