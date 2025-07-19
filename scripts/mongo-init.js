// MongoDB initialization script
db = db.getSiblingDB('fullstack_app');

// Create application user
db.createUser({
  user: 'app_user',
  pwd: 'app_password',
  roles: [
    {
      role: 'readWrite',
      db: 'fullstack_app'
    }
  ]
});

// Create collections
db.createCollection('users');
db.createCollection('sessions');

// Create indexes
db.users.createIndex({ "email": 1 }, { unique: true });
db.users.createIndex({ "createdAt": 1 });
db.sessions.createIndex({ "expiresAt": 1 }, { expireAfterSeconds: 0 });

// Insert default admin user (for development only)
if (db.getName() === 'fullstack_app') {
  const bcrypt = require('bcrypt');
  const saltRounds = 12;
  
  // Note: In production, create admin user through API or separate script
  db.users.insertOne({
    name: 'System Administrator',
    email: 'admin@fullstack.com',
    password: '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewlVWEyhtQyDdS6m', // password123
    role: 'admin',
    isActive: true,
    isEmailVerified: true,
    createdAt: new Date(),
    updatedAt: new Date()
  });
}

print('Database initialization completed!');
