const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

// MongoDB connection
mongoose.connect('mongodb://localhost:27017/fullstack-app', {
  // No additional options needed for newer versions
});

// User schema (simplified version)
const userSchema = new mongoose.Schema({
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  firstName: { type: String, required: true },
  lastName: { type: String, required: true },
  role: { type: String, enum: ['user', 'admin', 'super_admin'], default: 'user' },
  permissions: [{ type: String }],
  isActive: { type: Boolean, default: true },
  emailVerified: { type: Boolean, default: false },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

// Hash password before saving
userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  this.password = await bcrypt.hash(this.password, 12);
  next();
});

const User = mongoose.model('User', userSchema);

async function createAdmin() {
  try {
    // Check if admin already exists
    const existingAdmin = await User.findOne({ email: 'admin@example.com' });
    if (existingAdmin) {
      console.log('Admin user already exists!');
      process.exit(0);
    }

    // Create admin user
    const adminUser = new User({
      email: 'admin@example.com',
      password: 'admin123',
      firstName: 'Admin',
      lastName: 'User',
      role: 'admin',
      permissions: [
        'read:users',
        'write:users', 
        'delete:users',
        'read:admin',
        'write:admin',
        'delete:admin'
      ],
      isActive: true,
      emailVerified: true
    });

    await adminUser.save();
    console.log('Admin user created successfully!');
    console.log('Email: admin@example.com');
    console.log('Password: admin123');
    
  } catch (error) {
    console.error('Error creating admin user:', error);
  } finally {
    mongoose.disconnect();
  }
}

createAdmin();
