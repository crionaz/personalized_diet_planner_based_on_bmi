import React from 'react';

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

// Form validation schemas
export interface LoginFormData {
  email: string;
  password: string;
}

export interface RegisterFormData {
  email: string;
  password: string;
  confirmPassword: string;
  firstName: string;
  lastName: string;
}

export interface ProfileFormData {
  firstName: string;
  lastName: string;
  avatar?: string;
}

export interface PasswordFormData {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
}

export interface HealthMetricsFormData {
  height?: number;
  weight?: number;
  activityLevel: string;
  targetWeight?: number;
  weeklyWeightLossGoal?: number;
}

export interface DietaryPreferencesFormData {
  dietType: string;
  allergies: string[];
  excludedFoods: string[];
  mealFrequency: number;
}

export interface GoalsFormData {
  type: string;
  targetDate?: string;
  notes: string;
}

export interface UserProfileFormData extends ProfileFormData {
  dateOfBirth?: string;
  gender?: string;
  phoneNumber?: string;
}

// Redux state interfaces
export interface AuthState {
  user: User | null;
  token: string | null;
  refreshToken: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
}

export interface UIState {
  theme: 'light' | 'dark';
  sidebarOpen: boolean;
  notifications: Notification[];
}

export interface Notification {
  id: string;
  type: 'success' | 'error' | 'warning' | 'info';
  title: string;
  message?: string;
  duration?: number;
  createdAt: string;
}

// Component props
export interface LayoutProps {
  children: React.ReactNode;
}

export interface ProtectedRouteProps {
  children: React.ReactNode;
  requiredRole?: UserRole;
  requiredPermission?: Permission;
}

export interface FormFieldProps {
  label: string;
  error?: string;
  required?: boolean;
  children: React.ReactNode;
}

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  loading?: boolean;
  children: React.ReactNode;
}

export interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
}

export interface TableProps<T> {
  data: T[];
  columns: TableColumn<T>[];
  loading?: boolean;
  pagination?: PaginatedResponse<T>['pagination'];
  onPageChange?: (page: number) => void;
  onSort?: (sortBy: string, sortOrder: 'asc' | 'desc') => void;
}

export interface TableColumn<T> {
  key: keyof T | string;
  title: string;
  render?: (value: any, record: T) => React.ReactNode;
  sortable?: boolean;
  width?: string;
}

// Route definitions
export interface RouteConfig {
  path: string;
  element: React.ComponentType;
  requiredRole?: UserRole;
  requiredPermission?: Permission;
  layout?: 'default' | 'auth' | 'minimal';
}

// Error types
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

export interface BMIRecordRequest {
  weight: number;
  height: number;
  bodyFatPercentage?: number;
  muscleMass?: number;
  measurementDate?: string;
  notes?: string;
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
  dietType?: string; // Based on user's dietary preferences
}

export interface MealFormData {
  name: string;
  description: string;
  category: string;
  cuisine: string;
  prepTime: number;
  cookTime: number;
  servings: number;
  difficulty: string;
  ingredients: MealIngredientFormData[];
  instructions: string[];
  tags: string[];
  image: string;
  isPublic: boolean;
}

export interface MealIngredientFormData {
  name: string;
  amount: number;
  unit: string;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  fiber: number;
  sugar: number;
  sodium: number;
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

export interface DietPlanStats {
  totalPlans: number;
  activePlans: number;
  completedMeals: number;
  totalMeals: number;
  averageCalories: number;
  nutritionalProgress: {
    calories: number;
    protein: number;
    carbs: number;
    fat: number;
    percentage: number;
  };
  weeklyProgress: {
    date: string;
    completedMeals: number;
    totalCalories: number;
  }[];
}

export interface MealSuggestion {
  meal: Meal;
  score: number; // 0-100 compatibility score
  reasons: string[]; // Why this meal was suggested
  nutritionalFit: {
    calories: number;
    protein: number;
    carbs: number;
    fat: number;
  };
}

export interface DietPlanGeneration {
  id: string;
  userId: string;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  progress: number; // 0-100
  preferences: CreateDietPlanRequest['preferences'];
  nutritionalTargets: NutritionalTargets;
  result?: DietPlan;
  error?: string;
  createdAt: string;
}

// Food Tracking Types
export interface FoodEntry {
  id: string;
  userId: string;
  mealId?: string; // Reference to a meal if from meal database
  meal?: Meal; // Populated meal data
  customFood?: CustomFood; // For manually entered foods
  mealType: MealCategory;
  servings: number;
  consumedAt: string; // Date/time when consumed
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface CustomFood {
  id: string;
  name: string;
  brand?: string;
  barcode?: string;
  nutrition: NutritionInfo;
  servingSize: {
    amount: number;
    unit: string;
  };
  verified: boolean; // Whether nutrition data is verified
}

export interface CreateFoodEntryRequest {
  mealId?: string;
  customFood?: Omit<CustomFood, 'id' | 'verified'>;
  mealType: MealCategory;
  servings: number;
  consumedAt?: string;
  notes?: string;
}

export interface UpdateFoodEntryRequest extends Partial<CreateFoodEntryRequest> {
  id: string;
}

export interface FoodEntrySearchQuery extends PaginationQuery {
  date?: string; // YYYY-MM-DD format
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
  targets?: NutritionalTargets;
  targetProgress: {
    calories: number; // percentage
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
    calories: number; // percentage
    protein: number;
    carbs: number;
    fat: number;
  };
  totalEntries: number;
  adherenceScore: number; // 0-100 based on target achievement
}

export interface MonthlyProgressSummary {
  month: string; // YYYY-MM format
  weeklySummaries: WeeklyProgressSummary[];
  monthlyAverages: {
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
  averageAdherenceScore: number;
  weightChange?: {
    startWeight: number;
    endWeight: number;
    change: number;
    percentage: number;
  };
}

export interface TrackingStats {
  totalEntries: number;
  totalDaysTracked: number;
  averageDailyCalories: number;
  averageDailyProtein: number;
  averageDailyCarbs: number;
  averageDailyFat: number;
  currentStreak: number; // Days in a row with entries
  longestStreak: number;
  favoriteTime: string; // Most common meal time
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

export interface NutritionGoal {
  id: string;
  userId: string;
  type: 'calories' | 'protein' | 'carbs' | 'fat' | 'fiber' | 'sodium' | 'water';
  targetValue: number;
  unit: string;
  frequency: 'daily' | 'weekly' | 'monthly';
  startDate: string;
  endDate?: string;
  isActive: boolean;
  description?: string;
  createdAt: string;
  updatedAt: string;
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

export interface UpdateNutritionGoalRequest extends Partial<CreateNutritionGoalRequest> {
  id: string;
  isActive?: boolean;
}

export interface WaterIntake {
  id: string;
  userId: string;
  amount: number; // in ml
  recordedAt: string;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateWaterIntakeRequest {
  amount: number;
  recordedAt?: string;
  notes?: string;
}

export interface DailyWaterSummary {
  date: string;
  totalAmount: number; // ml
  targetAmount: number; // ml
  progress: number; // percentage
  entries: WaterIntake[];
}

export interface QuickAddFood {
  id: string;
  userId: string;
  name: string;
  nutrition: NutritionInfo;
  servingSize: {
    amount: number;
    unit: string;
  };
  category: MealCategory;
  lastUsed: string;
  useCount: number;
  createdAt: string;
}

export interface CreateQuickAddFoodRequest {
  name: string;
  nutrition: NutritionInfo;
  servingSize: {
    amount: number;
    unit: string;
  };
  category: MealCategory;
}

// Utility types
export type Status = 'idle' | 'loading' | 'succeeded' | 'failed';
export type ThemeMode = 'light' | 'dark' | 'system';
export type SortOrder = 'asc' | 'desc';
export type ResponseStatus = 'success' | 'error' | 'warning' | 'info';
