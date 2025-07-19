import dotenv from 'dotenv';

dotenv.config();

export const config = {
  nodeEnv: process.env.NODE_ENV || 'development',
  port: parseInt(process.env.PORT || '5001', 10),
  
  // Database
  mongodbUri: process.env.MONGODB_URI || 'mongodb://localhost:27017/fullstack-app',
  mongodbTestUri: process.env.MONGODB_TEST_URI || 'mongodb://localhost:27017/fullstack-app-test',
  
  // JWT
  jwtSecret: process.env.JWT_SECRET || 'fallback-secret-change-in-production',
  jwtExpiresIn: process.env.JWT_EXPIRES_IN || '7d',
  jwtRefreshSecret: process.env.JWT_REFRESH_SECRET || 'fallback-refresh-secret-change-in-production',
  jwtRefreshExpiresIn: process.env.JWT_REFRESH_EXPIRES_IN || '30d',
  
  // CORS
  frontendUrl: process.env.FRONTEND_URL || 'http://localhost:3000',
  adminUrl: process.env.ADMIN_URL || 'http://localhost:3001',
  
  // Rate Limiting
  rateLimitWindowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS || '900000', 10), // 15 minutes
  rateLimitMaxRequests: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS || '1000', 10),
  
  // Email (Optional)
  emailFrom: process.env.EMAIL_FROM || 'noreply@ihealthbmi.com',
  smtpHost: process.env.SMTP_HOST,
  smtpPort: parseInt(process.env.SMTP_PORT || '587', 10),
  smtpUser: process.env.SMTP_USER,
  smtpPass: process.env.SMTP_PASS,
  
  // Cloudinary (Optional)
  cloudinaryCloudName: process.env.CLOUDINARY_CLOUD_NAME,
  cloudinaryApiKey: process.env.CLOUDINARY_API_KEY,
  cloudinaryApiSecret: process.env.CLOUDINARY_API_SECRET,
  
  // Logging
  logLevel: process.env.LOG_LEVEL || 'info',
} as const;

// Validate required environment variables in production
if (config.nodeEnv === 'production') {
  const requiredEnvVars = [
    'JWT_SECRET',
    'JWT_REFRESH_SECRET',
    'MONGODB_URI',
  ];
  
  const missingEnvVars = requiredEnvVars.filter(
    (envVar) => !process.env[envVar]
  );
  
  if (missingEnvVars.length > 0) {
    throw new Error(
      `Missing required environment variables: ${missingEnvVars.join(', ')}`
    );
  }
}
