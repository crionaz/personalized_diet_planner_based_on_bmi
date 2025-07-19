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
export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  fullName?: string;
  avatar?: string;
  role: UserRole;
  permissions: Permission[];
  isActive: boolean;
  emailVerified: boolean;
  lastLogin?: string;
  createdAt: string;
  updatedAt?: string;
  
  // Diet Planner Profile Fields
  profile: {
    dateOfBirth?: string;
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
    targetDate?: string;
    notes: string;
  };
  
  // Calculated fields
  bmi?: number | null;
  bmiCategory?: string | null;
  dailyCalories?: number | null;
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

// Auth DTOs
export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
}

export interface AuthResponse {
  user: User;
  token: string;
  refreshToken: string;
}

export interface UpdateProfileRequest {
  firstName?: string;
  lastName?: string;
  avatar?: string;
  profile?: {
    dateOfBirth?: string;
    gender?: 'male' | 'female' | 'other';
    phoneNumber?: string;
  };
}

export interface UpdateHealthMetricsRequest {
  height?: number;
  weight?: number;
  activityLevel?: 'sedentary' | 'lightly_active' | 'moderately_active' | 'very_active' | 'extremely_active';
  targetWeight?: number;
  weeklyWeightLossGoal?: number;
}

export interface UpdateDietaryPreferencesRequest {
  dietType?: 'regular' | 'vegetarian' | 'vegan' | 'keto' | 'paleo' | 'mediterranean';
  allergies?: string[];
  excludedFoods?: string[];
  mealFrequency?: number;
}

export interface UpdateGoalsRequest {
  type?: 'weight_loss' | 'weight_gain' | 'maintenance' | 'muscle_gain';
  targetDate?: string;
  notes?: string;
}

export interface UpdatePasswordRequest {
  currentPassword: string;
  newPassword: string;
}

export interface ForgotPasswordRequest {
  email: string;
}

export interface ResetPasswordRequest {
  token: string;
  password: string;
}

// BMI types
export interface BMIRecord {
  id: string;
  userId: string;
  date: string;
  weight: number;
  height: number;
  bmi: number;
  category: 'underweight' | 'normal' | 'overweight' | 'obese';
  bodyFat?: number;
  muscleMass?: number;
  createdAt: string;
  updatedAt?: string;
}

export interface CalculateBMIRequest {
  weight: number;
  height: number;
}

export interface RecordBMIRequest {
  weight: number;
  height: number;
  bmi?: number; // Optional, can be calculated server-side
  category?: 'underweight' | 'normal' | 'overweight' | 'obese';
  date?: string;
  bodyFat?: number;
  muscleMass?: number;
}

export interface BMICalculationResult {
  bmi: number;
  category: string;
  weight: number;
  height: number;
}

export interface BMIStats {
  totalRecords: number;
  recentRecords: number;
  trend: 'increasing' | 'decreasing' | 'stable';
  weightChange: number;
  bmiChange: number;
  categoryDistribution: Record<string, number>;
  latestBMI: number | null;
  latestCategory: string | null;
}

// Admin DTOs
export interface CreateUserRequest extends RegisterRequest {
  role?: UserRole;
  permissions?: Permission[];
  isActive?: boolean;
}

export interface UpdateUserRoleRequest {
  role: UserRole;
  permissions?: Permission[];
}

// Error class
export class AppError extends Error {
  constructor(
    message: string,
    public statusCode: number = 500,
    public code?: string
  ) {
    super(message);
    this.name = 'AppError';
  }
}

// Utility types
export type Status = 'idle' | 'loading' | 'succeeded' | 'failed';
export type ThemeMode = 'light' | 'dark' | 'system';
export type SortOrder = 'asc' | 'desc';
export type ResponseStatus = 'success' | 'error' | 'warning' | 'info';

// BMI Types
export interface BMIRecord {
  id: string;
  userId: string;
  weight: number;
  height: number;
  bmi: number;
  category: 'underweight' | 'normal' | 'overweight' | 'obese';
  bodyFatPercentage?: number;
  muscleMass?: number;
  measurementDate: string;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface BMICalculationRequest {
  weight: number;
  height: number;
  bodyFatPercentage?: number;
  muscleMass?: number;
}

export interface BMICalculationResponse {
  bmi: number;
  category: string;
  recommendation: string;
  healthyWeightRange: {
    min: number;
    max: number;
  };
}

export interface BMIStats {
  totalRecords: number;
  averageBMI: number;
  latestBMI: number;
  bmiTrend: 'increasing' | 'decreasing' | 'stable';
  categoryDistribution: {
    underweight: number;
    normal: number;
    overweight: number;
    obese: number;
  };
  weightChange: {
    period: string;
    change: number;
    percentage: number;
  };
}

// Meal Types
export interface Meal {
  id: string;
  name: string;
  description?: string;
  category: MealCategory;
  cuisine?: string;
  prepTime: number; // minutes
  cookTime: number; // minutes
  servings: number;
  difficulty: 'easy' | 'medium' | 'hard';
  ingredients: MealIngredient[];
  instructions: string[];
  nutrition: NutritionInfo;
  tags: string[];
  image?: string;
  isPublic: boolean;
  createdBy: string;
  createdAt: string;
  updatedAt: string;
}

export interface MealIngredient {
  id: string;
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

export interface NutritionInfo {
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

export interface CreateMealRequest {
  name: string;
  description?: string;
  category: MealCategory;
  cuisine?: string;
  prepTime: number;
  cookTime: number;
  servings: number;
  difficulty: 'easy' | 'medium' | 'hard';
  ingredients: Omit<MealIngredient, 'id'>[];
  instructions: string[];
  tags: string[];
  image?: string;
  isPublic?: boolean;
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
export interface DietPlan {
  id: string;
  userId: string;
  name: string;
  description?: string;
  startDate: string;
  endDate: string;
  isActive: boolean;
  nutritionalTargets: NutritionalTargets;
  meals: DietPlanMeal[];
  generatedBy: 'user' | 'ai' | 'nutritionist';
  tags: string[];
  createdAt: string;
  updatedAt: string;
}

export interface NutritionalTargets {
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

export interface DietPlanMeal {
  id: string;
  mealId: string;
  meal?: Meal; // Populated meal data
  dayOfWeek: number; // 0-6 (Sunday-Saturday)
  mealType: MealCategory;
  servings: number;
  plannedDate?: string; // For specific date plans
  isCompleted: boolean;
  completedAt?: string;
  notes?: string;
}

export interface CreateDietPlanRequest {
  name: string;
  description?: string;
  startDate: string;
  endDate: string;
  nutritionalTargets?: Partial<NutritionalTargets>;
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

export interface DietPlanSearchQuery extends PaginationQuery {
  isActive?: boolean;
  startDate?: string;
  endDate?: string;
  generatedBy?: 'user' | 'ai' | 'nutritionist';
  tags?: string[];
}
