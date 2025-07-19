import mongoose, { Schema } from 'mongoose';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { IUser, UserRole, Permission } from '@/types';
import { config } from '@/config/config';

/**
 * @swagger
 * components:
 *   schemas:
 *     User:
 *       type: object
 *       required:
 *         - email
 *         - password
 *         - firstName
 *         - lastName
 *       properties:
 *         _id:
 *           type: string
 *           description: User ID
 *         email:
 *           type: string
 *           format: email
 *           description: User email address
 *         firstName:
 *           type: string
 *           description: User first name
 *         lastName:
 *           type: string
 *           description: User last name
 *         avatar:
 *           type: string
 *           description: User avatar URL
 *         role:
 *           type: string
 *           enum: [user, admin, super_admin]
 *           description: User role
 *         permissions:
 *           type: array
 *           items:
 *             type: string
 *           description: User permissions
 *         isActive:
 *           type: boolean
 *           description: Whether user is active
 *         emailVerified:
 *           type: boolean
 *           description: Whether email is verified
 *         lastLogin:
 *           type: string
 *           format: date-time
 *           description: Last login date
 *         createdAt:
 *           type: string
 *           format: date-time
 *           description: Creation date
 *         updatedAt:
 *           type: string
 *           format: date-time
 *           description: Last update date
 */

const userSchema = new Schema<IUser>({
  email: {
    type: String,
    required: [true, 'Email is required'],
    unique: true,
    lowercase: true,
    trim: true,
    match: [
      /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/,
      'Please provide a valid email address'
    ],
  },
  password: {
    type: String,
    required: [true, 'Password is required'],
    minlength: [8, 'Password must be at least 8 characters long'],
    select: false, // Don't include password in queries by default
  },
  firstName: {
    type: String,
    required: [true, 'First name is required'],
    trim: true,
    maxlength: [50, 'First name cannot exceed 50 characters'],
  },
  lastName: {
    type: String,
    required: [true, 'Last name is required'],
    trim: true,
    maxlength: [50, 'Last name cannot exceed 50 characters'],
  },
  avatar: {
    type: String,
    default: null,
  },
  role: {
    type: String,
    enum: Object.values(UserRole),
    default: UserRole.USER,
  },
  permissions: [{
    type: String,
    enum: Object.values(Permission),
  }],
  isActive: {
    type: Boolean,
    default: true,
  },
  emailVerified: {
    type: Boolean,
    default: false,
  },
  // Diet Planner Profile Fields
  profile: {
    dateOfBirth: {
      type: Date,
      default: null,
    },
    gender: {
      type: String,
      enum: ['male', 'female', 'other'],
      default: null,
    },
    phoneNumber: {
      type: String,
      default: null,
    },
  },
  // Health Metrics
  healthMetrics: {
    height: {
      type: Number, // Height in centimeters
      default: null,
    },
    weight: {
      type: Number, // Current weight in kilograms
      default: null,
    },
    activityLevel: {
      type: String,
      enum: ['sedentary', 'lightly_active', 'moderately_active', 'very_active', 'extremely_active'],
      default: 'sedentary',
    },
    targetWeight: {
      type: Number, // Goal weight in kilograms
      default: null,
    },
    weeklyWeightLossGoal: {
      type: Number, // 0.25 to 1.0 kg per week
      min: 0.25,
      max: 1.0,
      default: 0.5,
    },
  },
  // Dietary Preferences
  dietaryPreferences: {
    dietType: {
      type: String,
      enum: ['regular', 'vegetarian', 'vegan', 'keto', 'paleo', 'mediterranean'],
      default: 'regular',
    },
    allergies: [{
      type: String,
      trim: true,
    }],
    excludedFoods: [{
      type: String,
      trim: true,
    }],
    mealFrequency: {
      type: Number, // Meals per day (3-6)
      min: 3,
      max: 6,
      default: 3,
    },
  },
  // Health Goals
  goals: {
    type: {
      type: String,
      enum: ['weight_loss', 'weight_gain', 'maintenance', 'muscle_gain'],
      default: 'maintenance',
    },
    targetDate: {
      type: Date,
      default: null,
    },
    notes: {
      type: String,
      trim: true,
      maxlength: [500, 'Goal notes cannot exceed 500 characters'],
      default: '',
    },
  },
  emailVerificationToken: {
    type: String,
    select: false,
  },
  passwordResetToken: {
    type: String,
    select: false,
  },
  passwordResetExpires: {
    type: Date,
    select: false,
  },
  lastLogin: {
    type: Date,
    default: null,
  },
}, {
  timestamps: true,
  toJSON: {
    transform: function(doc, ret) {
      delete (ret as any).password;
      delete (ret as any).emailVerificationToken;
      delete (ret as any).passwordResetToken;
      delete (ret as any).passwordResetExpires;
      delete (ret as any).__v;
      return ret;
    },
  },
});

// Indexes
userSchema.index({ email: 1 });
userSchema.index({ role: 1 });
userSchema.index({ isActive: 1 });
userSchema.index({ createdAt: -1 });

// Pre-save middleware to hash password
userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  
  try {
    const salt = await bcrypt.genSalt(12);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    next(error as Error);
  }
});

// Instance method to compare password
userSchema.methods.comparePassword = async function(candidatePassword: string): Promise<boolean> {
  return bcrypt.compare(candidatePassword, this.password);
};

// Instance method to generate auth token
userSchema.methods.generateAuthToken = function(): string {
  const payload = {
    userId: this._id.toString(),
    email: this.email,
    role: this.role,
    permissions: this.permissions,
  };
  
  return jwt.sign(payload, config.jwtSecret, {
    expiresIn: config.jwtExpiresIn,
  } as any);
};

// Instance method to generate refresh token
userSchema.methods.generateRefreshToken = function(): string {
  const payload = {
    userId: this._id.toString(),
    type: 'refresh',
  };
  
  return jwt.sign(payload, config.jwtRefreshSecret, {
    expiresIn: config.jwtRefreshExpiresIn,
  } as any);
};

// Instance method to get full name
userSchema.methods.getFullName = function(): string {
  return `${this.firstName} ${this.lastName}`;
};

// Instance method to check permissions
userSchema.methods.hasPermission = function(permission: Permission): boolean {
  return this.permissions.includes(permission);
};

// Instance method to check role
userSchema.methods.hasRole = function(role: UserRole): boolean {
  return this.role === role;
};

// Instance method to calculate BMI
userSchema.methods.calculateBMI = function(): number | null {
  if (!this.healthMetrics.height || !this.healthMetrics.weight) {
    return null;
  }
  // BMI = weight(kg) / (height(m))^2
  const heightInMeters = this.healthMetrics.height / 100;
  return Number((this.healthMetrics.weight / (heightInMeters * heightInMeters)).toFixed(2));
};

// Instance method to get BMI category
userSchema.methods.getBMICategory = function(): string | null {
  const bmi = this.calculateBMI();
  if (!bmi) return null;
  
  if (bmi < 18.5) return 'underweight';
  if (bmi >= 18.5 && bmi < 25) return 'normal';
  if (bmi >= 25 && bmi < 30) return 'overweight';
  return 'obese';
};

// Instance method to calculate daily calories based on Harris-Benedict equation
userSchema.methods.calculateDailyCalories = function(): number | null {
  if (!this.healthMetrics.height || !this.healthMetrics.weight || !this.profile.gender || !this.profile.dateOfBirth) {
    return null;
  }
  
  const age = Math.floor((Date.now() - this.profile.dateOfBirth.getTime()) / (365.25 * 24 * 60 * 60 * 1000));
  let bmr: number;
  
  // Harris-Benedict Equation
  if (this.profile.gender === 'male') {
    bmr = 88.362 + (13.397 * this.healthMetrics.weight) + (4.799 * this.healthMetrics.height) - (5.677 * age);
  } else {
    bmr = 447.593 + (9.247 * this.healthMetrics.weight) + (3.098 * this.healthMetrics.height) - (4.330 * age);
  }
  
  // Apply activity level multiplier
  const activityMultipliers = {
    sedentary: 1.2,
    lightly_active: 1.375,
    moderately_active: 1.55,
    very_active: 1.725,
    extremely_active: 1.9
  };
  
  const totalCalories = bmr * activityMultipliers[this.healthMetrics.activityLevel as keyof typeof activityMultipliers];
  
  // Adjust for weight goal
  if (this.goals.type === 'weight_loss') {
    return Math.round(totalCalories - (this.healthMetrics.weeklyWeightLossGoal * 7700) / 7); // 1kg = 7700 calories
  } else if (this.goals.type === 'weight_gain') {
    return Math.round(totalCalories + (this.healthMetrics.weeklyWeightLossGoal * 7700) / 7);
  }
  
  return Math.round(totalCalories);
};

// Static method to find active users
userSchema.statics.findActive = function() {
  return this.find({ isActive: true });
};

// Virtual for full name
userSchema.virtual('fullName').get(function() {
  return `${this.firstName} ${this.lastName}`;
});

// Ensure virtual fields are serialized
userSchema.set('toJSON', { virtuals: true });

const User = mongoose.model<IUser>('User', userSchema);

export default User;
