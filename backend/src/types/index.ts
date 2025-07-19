import { Request } from 'express';
import mongoose, { Document } from 'mongoose';

// User roles
export enum UserRole {
  USER = 'user',
  ADMIN = 'admin',
  SUPER_ADMIN = 'super_admin',
}

// User permissions
export enum Permission {
  READ_USERS = 'read:users',
  WRITE_USERS = 'write:users',
  DELETE_USERS = 'delete:users',
  READ_ADMIN = 'read:admin',
  WRITE_ADMIN = 'write:admin',
  DELETE_ADMIN = 'delete:admin',
}

// User interface
export interface IUser extends Document {
  _id: string;
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  avatar?: string;
  role: UserRole;
  permissions: Permission[];
  isActive: boolean;
  emailVerified: boolean;
  emailVerificationToken?: string;
  passwordResetToken?: string;
  passwordResetExpires?: Date;
  lastLogin?: Date;
  createdAt: Date;
  updatedAt: Date;
  
  // Diet Planner Profile Fields
  profile: {
    dateOfBirth?: Date;
    gender?: 'male' | 'female' | 'other';
    phoneNumber?: string;
  };
  
  // Health Metrics
  healthMetrics: {
    height?: number; // Height in centimeters
    weight?: number; // Current weight in kilograms
    activityLevel: 'sedentary' | 'lightly_active' | 'moderately_active' | 'very_active' | 'extremely_active';
    targetWeight?: number; // Goal weight in kilograms
    weeklyWeightLossGoal: number; // 0.25 to 1.0 kg per week
  };
  
  // Dietary Preferences
  dietaryPreferences: {
    dietType: 'regular' | 'vegetarian' | 'vegan' | 'keto' | 'paleo' | 'mediterranean';
    allergies: string[];
    excludedFoods: string[];
    mealFrequency: number; // Meals per day (3-6)
  };
  
  // Health Goals
  goals: {
    type: 'weight_loss' | 'weight_gain' | 'maintenance' | 'muscle_gain';
    targetDate?: Date;
    notes: string;
  };
  
  // Methods
  comparePassword(candidatePassword: string): Promise<boolean>;
  generateAuthToken(): string;
  generateRefreshToken(): string;
  getFullName(): string;
  hasPermission(permission: Permission): boolean;
  hasRole(role: UserRole): boolean;
  calculateBMI(): number | null;
  getBMICategory(): string | null;
  calculateDailyCalories(): number | null;
}

// Request with user
export interface AuthenticatedRequest extends Request {
  user?: IUser;
}

// JWT Payload
export interface JWTPayload {
  userId: string;
  email: string;
  role: UserRole;
  permissions: Permission[];
}

// API Response
export interface ApiResponse<T = any> {
  success: boolean;
  message: string;
  data?: T;
  error?: string;
  errors?: Record<string, string>;
}

// Pagination
export interface PaginationQuery {
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
  search?: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    pages: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
}

// Login/Register DTOs
export interface LoginDto {
  email: string;
  password: string;
}

export interface RegisterDto {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
}

export interface UpdateUserDto {
  firstName?: string;
  lastName?: string;
  avatar?: string;
}

export interface UpdatePasswordDto {
  currentPassword: string;
  newPassword: string;
}

export interface ForgotPasswordDto {
  email: string;
}

export interface ResetPasswordDto {
  token: string;
  password: string;
}

// Admin DTOs
export interface CreateUserDto extends RegisterDto {
  role?: UserRole;
  permissions?: Permission[];
  isActive?: boolean;
}

export interface UpdateUserRoleDto {
  role: UserRole;
  permissions?: Permission[];
}

// Diet Planner DTOs
export interface UpdateProfileDto {
  firstName?: string;
  lastName?: string;
  avatar?: string;
  profile?: {
    dateOfBirth?: Date;
    gender?: 'male' | 'female' | 'other';
    phoneNumber?: string;
  };
}

export interface UpdateHealthMetricsDto {
  height?: number;
  weight?: number;
  activityLevel?: 'sedentary' | 'lightly_active' | 'moderately_active' | 'very_active' | 'extremely_active';
  targetWeight?: number;
  weeklyWeightLossGoal?: number;
}

export interface UpdateDietaryPreferencesDto {
  dietType?: 'regular' | 'vegetarian' | 'vegan' | 'keto' | 'paleo' | 'mediterranean';
  allergies?: string[];
  excludedFoods?: string[];
  mealFrequency?: number;
}

export interface UpdateGoalsDto {
  type?: 'weight_loss' | 'weight_gain' | 'maintenance' | 'muscle_gain';
  targetDate?: Date;
  notes?: string;
}

// BMI DTOs
export interface CalculateBMIDto {
  weight: number;
  height: number;
}

export interface RecordBMIDto {
  weight: number;
  height: number;
  date?: Date;
  bodyFat?: number;
  muscleMass?: number;
}

// Error types
export class AppError extends Error {
  public statusCode: number;
  public isOperational: boolean;

  constructor(message: string, statusCode: number) {
    super(message);
    this.statusCode = statusCode;
    this.isOperational = true;

    Error.captureStackTrace(this, this.constructor);
  }
}

// Meal Types
export enum MealCategory {
  BREAKFAST = 'breakfast',
  LUNCH = 'lunch',
  DINNER = 'dinner',
  SNACK = 'snack',
  DESSERT = 'dessert',
  DRINK = 'drink',
  APPETIZER = 'appetizer',
  SIDE_DISH = 'side_dish'
}

export interface IMealIngredient {
  _id?: string;
  name: string;
  amount: number;
  unit: string;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  fiber?: number;
  sugar?: number;
  sodium?: number;
}

export interface INutritionInfo {
  calories: number;
  protein: number; // grams
  carbs: number; // grams
  fat: number; // grams
  fiber?: number; // grams
  sugar?: number; // grams
  sodium?: number; // mg
  cholesterol?: number; // mg
  saturatedFat?: number; // grams
  transFat?: number; // grams
  monounsaturatedFat?: number; // grams
  polyunsaturatedFat?: number; // grams
  potassium?: number; // mg
  calcium?: number; // mg
  iron?: number; // mg
  vitaminA?: number; // IU
  vitaminC?: number; // mg
  vitaminD?: number; // IU
}

export interface IMeal extends Document {
  _id: string;
  name: string;
  description?: string;
  category: MealCategory;
  cuisine?: string;
  prepTime: number; // minutes
  cookTime: number; // minutes
  servings: number;
  difficulty: 'easy' | 'medium' | 'hard';
  ingredients: IMealIngredient[];
  instructions: string[];
  nutrition: INutritionInfo;
  tags: string[];
  image?: string;
  isPublic: boolean;
  createdBy: mongoose.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
  
  // Methods
  calculateNutritionPerServing(): INutritionInfo;
  isCompatibleWithDiet(dietType: string): boolean;
}

export interface CreateMealRequest {
  name: string;
  description?: string;
  category: MealCategory;
  cuisine?: string;
  prepTime: number;
  cookTime: number;
  servings: number;
  difficulty: 'easy' | 'medium' | 'hard';
  ingredients: Omit<IMealIngredient, '_id'>[];
  instructions: string[];
  tags: string[];
  image?: string;
  isPublic?: boolean;
}

export interface UpdateMealRequest extends Partial<CreateMealRequest> {
  id: string;
}

export interface MealSearchQuery extends PaginationQuery {
  category?: MealCategory;
  cuisine?: string;
  difficulty?: 'easy' | 'medium' | 'hard';
  prepTimeMax?: number;
  cookTimeMax?: number;
  tags?: string[];
  isPublic?: boolean;
  createdBy?: string;
  caloriesMin?: number;
  caloriesMax?: number;
  proteinMin?: number;
  dietType?: string;
}

// Diet Plan Types
export interface INutritionalTargets {
  dailyCalories: number;
  dailyProtein: number; // grams
  dailyCarbs: number; // grams
  dailyFat: number; // grams
  dailyFiber?: number; // grams
  dailySodium?: number; // mg
  proteinPercentage: number; // % of total calories
  carbsPercentage: number; // % of total calories
  fatPercentage: number; // % of total calories
}

export interface IDietPlanMeal {
  _id?: string | undefined;
  mealId: string;
  meal?: IMeal | undefined; // Populated meal data
  dayOfWeek: number; // 0-6 (Sunday-Saturday)
  mealType: MealCategory;
  servings: number;
  plannedDate?: Date | undefined; // For specific date plans
  isCompleted: boolean;
  completedAt?: Date | undefined;
  notes?: string | undefined;
}

export interface IDietPlan extends Document {
  _id: string;
  userId: string;
  name: string;
  description?: string;
  startDate: Date;
  endDate: Date;
  isActive: boolean;
  nutritionalTargets: INutritionalTargets;
  meals: IDietPlanMeal[];
  generatedBy: 'user' | 'ai' | 'nutritionist';
  tags: string[];
  createdAt: Date;
  updatedAt: Date;
  
  // Methods
  calculateDailyNutrition(dayOfWeek: number): INutritionInfo;
  markMealCompleted(mealId: string, completed?: boolean): Promise<void>;
}

// Static methods for DietPlan model
export interface IDietPlanModel extends mongoose.Model<IDietPlan> {
  findActiveByUser(userId: string): Promise<IDietPlan | null>;
}

export interface CreateDietPlanRequest {
  name: string;
  description?: string;
  startDate: string;
  endDate: string;
  nutritionalTargets?: Partial<INutritionalTargets>;
  preferences?: {
    includeBreakfast: boolean;
    includeLunch: boolean;
    includeDinner: boolean;
    includeSnacks: boolean;
    maxPrepTime?: number;
    maxCookTime?: number;
    difficulty?: 'easy' | 'medium' | 'hard';
    preferredCuisines?: string[];
    excludedIngredients?: string[];
  };
  generationType: 'ai' | 'manual';
}

export interface UpdateDietPlanRequest extends Partial<CreateDietPlanRequest> {
  id: string;
  isActive?: boolean;
}

export interface DietPlanSearchQuery extends PaginationQuery {
  isActive?: boolean;
  startDate?: string;
  endDate?: string;
  generatedBy?: 'user' | 'ai' | 'nutritionist';
  tags?: string[];
}

// Food Tracking Types
export interface IFoodEntry extends Document {
  _id: string;
  userId: string;
  mealId?: string;
  meal?: IMeal;
  customFood?: ICustomFood;
  mealType: MealCategory;
  servings: number;
  consumedAt: Date;
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
  
  // Methods
  calculateNutrition(): INutritionInfo;
}

export interface ICustomFood {
  id: string;
  name: string;
  brand?: string;
  barcode?: string;
  nutrition: INutritionInfo;
  servingSize: {
    amount: number;
    unit: string;
  };
  verified: boolean;
}

export interface CreateFoodEntryRequest {
  mealId?: string;
  customFood?: Omit<ICustomFood, 'id' | 'verified'>;
  mealType: MealCategory;
  servings: number;
  consumedAt?: string;
  notes?: string;
}

export interface UpdateFoodEntryRequest extends Partial<CreateFoodEntryRequest> {
  id: string;
}

export interface FoodEntrySearchQuery extends PaginationQuery {
  date?: string;
  dateFrom?: string;
  dateTo?: string;
  mealType?: MealCategory;
  mealId?: string;
}

export interface DailyNutritionSummary {
  date: string;
  totalCalories: number;
  totalProtein: number;
  totalCarbs: number;
  totalFat: number;
  totalFiber: number;
  totalSodium: number;
  mealBreakdown: {
    mealType: MealCategory;
    calories: number;
    protein: number;
    carbs: number;
    fat: number;
    entryCount: number;
  }[];
  targets?: INutritionalTargets;
  targetProgress: {
    calories: number;
    protein: number;
    carbs: number;
    fat: number;
  };
}

export interface WeeklyProgressSummary {
  weekStartDate: string;
  weekEndDate: string;
  dailySummaries: DailyNutritionSummary[];
  weeklyAverages: {
    calories: number;
    protein: number;
    carbs: number;
    fat: number;
    fiber: number;
    sodium: number;
  };
  targetAchievement: {
    calories: number;
    protein: number;
    carbs: number;
    fat: number;
  };
  totalEntries: number;
  adherenceScore: number;
}

export interface TrackingStats {
  totalEntries: number;
  totalDaysTracked: number;
  averageDailyCalories: number;
  averageDailyProtein: number;
  averageDailyCarbs: number;
  averageDailyFat: number;
  currentStreak: number;
  longestStreak: number;
  favoriteTime: string;
  mostTrackedMeal: string;
  targetAchievementRate: {
    calories: number;
    protein: number;
    carbs: number;
    fat: number;
  };
  weeklyTrends: {
    week: string;
    averageCalories: number;
    adherenceScore: number;
  }[];
}

export interface INutritionGoal extends Document {
  _id: string;
  userId: string;
  type: 'calories' | 'protein' | 'carbs' | 'fat' | 'fiber' | 'sodium' | 'water';
  targetValue: number;
  unit: string;
  frequency: 'daily' | 'weekly' | 'monthly';
  startDate: Date;
  endDate?: Date;
  isActive: boolean;
  description?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateNutritionGoalRequest {
  type: 'calories' | 'protein' | 'carbs' | 'fat' | 'fiber' | 'sodium' | 'water';
  targetValue: number;
  unit: string;
  frequency: 'daily' | 'weekly' | 'monthly';
  startDate: string;
  endDate?: string;
  description?: string;
}

export interface IWaterIntake extends Document {
  _id: string;
  userId: string;
  amount: number;
  recordedAt: Date;
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateWaterIntakeRequest {
  amount: number;
  recordedAt?: string;
  notes?: string;
}

export interface IQuickAddFood extends Document {
  _id: string;
  userId: string;
  name: string;
  nutrition: INutritionInfo;
  servingSize: {
    amount: number;
    unit: string;
  };
  category: MealCategory;
  lastUsed: Date;
  useCount: number;
  createdAt: Date;
}
