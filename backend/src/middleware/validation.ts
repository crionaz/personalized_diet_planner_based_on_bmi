import { Request, Response, NextFunction } from 'express';
import { body, param, query, validationResult } from 'express-validator';
import { UserRole, Permission } from '@/types';
import { errorResponse } from '@/utils/helpers';

/**
 * Validation rules for user registration
 */
export const validateRegister = [
  body('email')
    .isEmail()
    .normalizeEmail()
    .withMessage('Please provide a valid email address'),
    
  body('password')
    .isLength({ min: 8 })
    .withMessage('Password must be at least 8 characters long')
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/)
    .withMessage('Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character'),
    
  body('firstName')
    .trim()
    .isLength({ min: 1, max: 50 })
    .withMessage('First name must be between 1 and 50 characters'),
    
  body('lastName')
    .trim()
    .isLength({ min: 1, max: 50 })
    .withMessage('Last name must be between 1 and 50 characters'),
];

/**
 * Validation rules for user login
 */
export const validateLogin = [
  body('email')
    .isEmail()
    .normalizeEmail()
    .withMessage('Please provide a valid email address'),
    
  body('password')
    .notEmpty()
    .withMessage('Password is required'),
];

/**
 * Validation rules for updating user profile
 */
export const validateUpdateProfile = [
  body('firstName')
    .optional()
    .trim()
    .isLength({ min: 1, max: 50 })
    .withMessage('First name must be between 1 and 50 characters'),
    
  body('lastName')
    .optional()
    .trim()
    .isLength({ min: 1, max: 50 })
    .withMessage('Last name must be between 1 and 50 characters'),
    
  body('avatar')
    .optional()
    .isURL()
    .withMessage('Avatar must be a valid URL'),
];

/**
 * Validation rules for updating password
 */
export const validateUpdatePassword = [
  body('currentPassword')
    .notEmpty()
    .withMessage('Current password is required'),
    
  body('newPassword')
    .isLength({ min: 8 })
    .withMessage('New password must be at least 8 characters long')
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/)
    .withMessage('New password must contain at least one uppercase letter, one lowercase letter, one number, and one special character'),
];

/**
 * Validation rules for forgot password
 */
export const validateForgotPassword = [
  body('email')
    .isEmail()
    .normalizeEmail()
    .withMessage('Please provide a valid email address'),
];

/**
 * Validation rules for reset password
 */
export const validateResetPassword = [
  body('token')
    .notEmpty()
    .withMessage('Reset token is required'),
    
  body('password')
    .isLength({ min: 8 })
    .withMessage('Password must be at least 8 characters long')
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/)
    .withMessage('Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character'),
];

/**
 * Validation rules for creating user (admin)
 */
export const validateCreateUser = [
  body('email')
    .isEmail()
    .normalizeEmail()
    .withMessage('Please provide a valid email address'),
    
  body('password')
    .isLength({ min: 8 })
    .withMessage('Password must be at least 8 characters long')
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/)
    .withMessage('Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character'),
    
  body('firstName')
    .trim()
    .isLength({ min: 1, max: 50 })
    .withMessage('First name must be between 1 and 50 characters'),
    
  body('lastName')
    .trim()
    .isLength({ min: 1, max: 50 })
    .withMessage('Last name must be between 1 and 50 characters'),
    
  body('role')
    .optional()
    .isIn(Object.values(UserRole))
    .withMessage('Invalid role'),
    
  body('permissions')
    .optional()
    .isArray()
    .withMessage('Permissions must be an array')
    .custom((permissions) => {
      if (Array.isArray(permissions)) {
        const validPermissions = Object.values(Permission);
        return permissions.every(permission => validPermissions.includes(permission));
      }
      return true;
    })
    .withMessage('Invalid permissions'),
    
  body('isActive')
    .optional()
    .isBoolean()
    .withMessage('isActive must be a boolean'),
];

/**
 * Validation rules for updating user role (admin)
 */
export const validateUpdateUserRole = [
  body('role')
    .isIn(Object.values(UserRole))
    .withMessage('Invalid role'),
    
  body('permissions')
    .optional()
    .isArray()
    .withMessage('Permissions must be an array')
    .custom((permissions) => {
      if (Array.isArray(permissions)) {
        const validPermissions = Object.values(Permission);
        return permissions.every(permission => validPermissions.includes(permission));
      }
      return true;
    })
    .withMessage('Invalid permissions'),
];

/**
 * Validation rules for MongoDB ObjectId parameters
 */
export const validateObjectId = (paramName: string = 'id') => [
  param(paramName)
    .isMongoId()
    .withMessage(`Invalid ${paramName} format`),
];

/**
 * Validation rules for pagination query parameters
 */
export const validatePagination = [
  query('page')
    .optional()
    .isInt({ min: 1 })
    .withMessage('Page must be a positive integer'),
    
  query('limit')
    .optional()
    .isInt({ min: 1, max: 100 })
    .withMessage('Limit must be between 1 and 100'),
    
  query('sortBy')
    .optional()
    .isString()
    .withMessage('SortBy must be a string'),
    
  query('sortOrder')
    .optional()
    .isIn(['asc', 'desc'])
    .withMessage('SortOrder must be either "asc" or "desc"'),
    
  query('search')
    .optional()
    .isString()
    .trim()
    .isLength({ min: 1, max: 100 })
    .withMessage('Search term must be between 1 and 100 characters'),
];

/**
 * Validation rules for BMI calculation
 */
export const validateCalculateBMI = [
  body('weight')
    .isFloat({ min: 20, max: 500 })
    .withMessage('Weight must be between 20 and 500 kg'),
    
  body('height')
    .isFloat({ min: 100, max: 250 })
    .withMessage('Height must be between 100 and 250 cm'),
];

/**
 * Validation rules for recording BMI
 */
export const validateRecordBMI = [
  body('weight')
    .isFloat({ min: 20, max: 500 })
    .withMessage('Weight must be between 20 and 500 kg'),
    
  body('height')
    .isFloat({ min: 100, max: 250 })
    .withMessage('Height must be between 100 and 250 cm'),

  body('bmi')
    .isFloat({ min: 10, max: 100 })
    .withMessage('BMI must be between 10 and 100'),

  body('category')
    .isIn(['underweight', 'normal', 'overweight', 'obese'])
    .withMessage('Invalid BMI category'),

  body('date')
    .optional()
    .isISO8601()
    .withMessage('Date must be a valid ISO 8601 date'),
    
  body('bodyFat')
    .optional()
    .isFloat({ min: 3, max: 50 })
    .withMessage('Body fat percentage must be between 3 and 50'),
    
  body('muscleMass')
    .optional()
    .isFloat({ min: 10, max: 200 })
    .withMessage('Muscle mass must be between 10 and 200 kg'),
];

/**
 * Validation rules for creating a meal
 */
export const validateCreateMeal = [
  body('name')
    .trim()
    .isLength({ min: 1, max: 100 })
    .withMessage('Meal name must be between 1 and 100 characters'),
    
  body('description')
    .optional()
    .trim()
    .isLength({ max: 500 })
    .withMessage('Description cannot exceed 500 characters'),
    
  body('category')
    .isIn(['breakfast', 'lunch', 'dinner', 'snack', 'dessert', 'drink', 'appetizer', 'side_dish'])
    .withMessage('Invalid meal category'),
    
  body('cuisine')
    .optional()
    .trim()
    .isLength({ max: 50 })
    .withMessage('Cuisine cannot exceed 50 characters'),
    
  body('prepTime')
    .isInt({ min: 0 })
    .withMessage('Preparation time must be a non-negative integer'),
    
  body('cookTime')
    .isInt({ min: 0 })
    .withMessage('Cooking time must be a non-negative integer'),
    
  body('servings')
    .isInt({ min: 1, max: 20 })
    .withMessage('Servings must be between 1 and 20'),
    
  body('difficulty')
    .isIn(['easy', 'medium', 'hard'])
    .withMessage('Difficulty must be easy, medium, or hard'),
    
  body('ingredients')
    .isArray({ min: 1 })
    .withMessage('At least one ingredient is required'),
    
  body('ingredients.*.name')
    .trim()
    .isLength({ min: 1, max: 100 })
    .withMessage('Ingredient name must be between 1 and 100 characters'),
    
  body('ingredients.*.amount')
    .isFloat({ min: 0 })
    .withMessage('Ingredient amount must be a non-negative number'),
    
  body('ingredients.*.unit')
    .trim()
    .isLength({ min: 1, max: 20 })
    .withMessage('Ingredient unit must be between 1 and 20 characters'),
    
  body('ingredients.*.calories')
    .isFloat({ min: 0 })
    .withMessage('Ingredient calories must be a non-negative number'),
    
  body('ingredients.*.protein')
    .isFloat({ min: 0 })
    .withMessage('Ingredient protein must be a non-negative number'),
    
  body('ingredients.*.carbs')
    .isFloat({ min: 0 })
    .withMessage('Ingredient carbs must be a non-negative number'),
    
  body('ingredients.*.fat')
    .isFloat({ min: 0 })
    .withMessage('Ingredient fat must be a non-negative number'),
    
  body('instructions')
    .isArray({ min: 1 })
    .withMessage('At least one instruction is required'),
    
  body('instructions.*')
    .trim()
    .isLength({ min: 1 })
    .withMessage('Each instruction must not be empty'),
    
  body('tags')
    .optional()
    .isArray()
    .withMessage('Tags must be an array'),
    
  body('tags.*')
    .optional()
    .trim()
    .isLength({ max: 30 })
    .withMessage('Each tag cannot exceed 30 characters'),
    
  body('image')
    .optional()
    .isURL()
    .withMessage('Image must be a valid URL'),
    
  body('isPublic')
    .optional()
    .isBoolean()
    .withMessage('isPublic must be a boolean'),
];

/**
 * Validation rules for updating a meal
 */
export const validateUpdateMeal = [
  param('id')
    .isMongoId()
    .withMessage('Invalid meal ID'),
    
  body('name')
    .optional()
    .trim()
    .isLength({ min: 1, max: 100 })
    .withMessage('Meal name must be between 1 and 100 characters'),
    
  body('description')
    .optional()
    .trim()
    .isLength({ max: 500 })
    .withMessage('Description cannot exceed 500 characters'),
    
  body('category')
    .optional()
    .isIn(['breakfast', 'lunch', 'dinner', 'snack', 'dessert', 'drink', 'appetizer', 'side_dish'])
    .withMessage('Invalid meal category'),
    
  body('cuisine')
    .optional()
    .trim()
    .isLength({ max: 50 })
    .withMessage('Cuisine cannot exceed 50 characters'),
    
  body('prepTime')
    .optional()
    .isInt({ min: 0 })
    .withMessage('Preparation time must be a non-negative integer'),
    
  body('cookTime')
    .optional()
    .isInt({ min: 0 })
    .withMessage('Cooking time must be a non-negative integer'),
    
  body('servings')
    .optional()
    .isInt({ min: 1, max: 20 })
    .withMessage('Servings must be between 1 and 20'),
    
  body('difficulty')
    .optional()
    .isIn(['easy', 'medium', 'hard'])
    .withMessage('Difficulty must be easy, medium, or hard'),
    
  body('ingredients')
    .optional()
    .isArray({ min: 1 })
    .withMessage('At least one ingredient is required'),
    
  body('instructions')
    .optional()
    .isArray({ min: 1 })
    .withMessage('At least one instruction is required'),
    
  body('tags')
    .optional()
    .isArray()
    .withMessage('Tags must be an array'),
    
  body('image')
    .optional()
    .isURL()
    .withMessage('Image must be a valid URL'),
    
  body('isPublic')
    .optional()
    .isBoolean()
    .withMessage('isPublic must be a boolean'),
];

/**
 * Validation rules for meal query parameters
 */
export const validateMealQuery = [
  query('page')
    .optional()
    .isInt({ min: 1 })
    .withMessage('Page must be a positive integer'),
    
  query('limit')
    .optional()
    .isInt({ min: 1, max: 100 })
    .withMessage('Limit must be between 1 and 100'),
    
  query('category')
    .optional()
    .isIn(['breakfast', 'lunch', 'dinner', 'snack', 'dessert', 'drink', 'appetizer', 'side_dish'])
    .withMessage('Invalid meal category'),
    
  query('difficulty')
    .optional()
    .isIn(['easy', 'medium', 'hard'])
    .withMessage('Invalid difficulty level'),
    
  query('prepTimeMax')
    .optional()
    .isInt({ min: 0 })
    .withMessage('Maximum prep time must be a non-negative integer'),
    
  query('cookTimeMax')
    .optional()
    .isInt({ min: 0 })
    .withMessage('Maximum cook time must be a non-negative integer'),
    
  query('caloriesMin')
    .optional()
    .isInt({ min: 0 })
    .withMessage('Minimum calories must be a non-negative integer'),
    
  query('caloriesMax')
    .optional()
    .isInt({ min: 0 })
    .withMessage('Maximum calories must be a non-negative integer'),
    
  query('proteinMin')
    .optional()
    .isFloat({ min: 0 })
    .withMessage('Minimum protein must be a non-negative number'),
];

/**
 * Validation rules for meal ID parameter
 */
export const validateMealId = [
  param('id')
    .isMongoId()
    .withMessage('Invalid meal ID'),
];

/**
 * Validation rules for updating health metrics
 */
export const validateUpdateHealthMetrics = [
  body('height')
    .optional()
    .isFloat({ min: 100, max: 250 })
    .withMessage('Height must be between 100 and 250 cm'),
    
  body('weight')
    .optional()
    .isFloat({ min: 20, max: 500 })
    .withMessage('Weight must be between 20 and 500 kg'),
    
  body('activityLevel')
    .optional()
    .isIn(['sedentary', 'lightly_active', 'moderately_active', 'very_active', 'extremely_active'])
    .withMessage('Invalid activity level'),
    
  body('targetWeight')
    .optional()
    .isFloat({ min: 20, max: 500 })
    .withMessage('Target weight must be between 20 and 500 kg'),
    
  body('weeklyWeightLossGoal')
    .optional()
    .isFloat({ min: 0.25, max: 1.0 })
    .withMessage('Weekly weight loss goal must be between 0.25 and 1.0 kg'),
];

/**
 * Validation rules for updating dietary preferences
 */
export const validateUpdateDietaryPreferences = [
  body('dietType')
    .optional()
    .isIn(['regular', 'vegetarian', 'vegan', 'keto', 'paleo', 'mediterranean'])
    .withMessage('Invalid diet type'),
    
  body('allergies')
    .optional()
    .isArray()
    .withMessage('Allergies must be an array'),
    
  body('allergies.*')
    .optional()
    .trim()
    .isLength({ min: 1, max: 50 })
    .withMessage('Each allergy must be between 1 and 50 characters'),
    
  body('excludedFoods')
    .optional()
    .isArray()
    .withMessage('Excluded foods must be an array'),
    
  body('excludedFoods.*')
    .optional()
    .trim()
    .isLength({ min: 1, max: 50 })
    .withMessage('Each excluded food must be between 1 and 50 characters'),
    
  body('mealFrequency')
    .optional()
    .isInt({ min: 3, max: 6 })
    .withMessage('Meal frequency must be between 3 and 6 meals per day'),
];

/**
 * Validation rules for updating goals
 */
export const validateUpdateGoals = [
  body('type')
    .optional()
    .isIn(['weight_loss', 'weight_gain', 'maintenance', 'muscle_gain'])
    .withMessage('Invalid goal type'),
    
  body('targetDate')
    .optional()
    .isISO8601()
    .withMessage('Target date must be a valid ISO 8601 date'),
    
  body('notes')
    .optional()
    .trim()
    .isLength({ max: 500 })
    .withMessage('Goal notes cannot exceed 500 characters'),
];

/**
 * Validation rules for updating user profile
 */
export const validateUpdateUserProfile = [
  body('dateOfBirth')
    .optional()
    .isISO8601()
    .withMessage('Date of birth must be a valid ISO 8601 date'),
    
  body('gender')
    .optional()
    .isIn(['male', 'female', 'other'])
    .withMessage('Gender must be male, female, or other'),
    
  body('phoneNumber')
    .optional()
    .trim()
    .matches(/^[\+]?[1-9][\d]{0,15}$/)
    .withMessage('Phone number must be a valid format'),
];

/**
 * Generic validation handler middleware
 * Checks for validation errors and returns appropriate response
 */
export const validate = (req: Request, res: Response, next: NextFunction): void => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const errorArray = errors.array();
    const errorMessages = errorArray.reduce((acc: Record<string, string>, error: any) => {
      acc[error.path || error.param] = error.msg;
      return acc;
    }, {});
    res.status(400).json(errorResponse('Validation failed', undefined, errorMessages));
    return;
  }
  next();
};
