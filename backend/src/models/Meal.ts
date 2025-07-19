import mongoose, { Schema, model } from 'mongoose';
import { IMeal, IMealIngredient, INutritionInfo, MealCategory } from '../types';

// Nutrition Info Schema
const NutritionInfoSchema = new Schema<INutritionInfo>({
  calories: { type: Number, required: true, min: 0 },
  protein: { type: Number, required: true, min: 0 },
  carbs: { type: Number, required: true, min: 0 },
  fat: { type: Number, required: true, min: 0 },
  fiber: { type: Number, min: 0 },
  sugar: { type: Number, min: 0 },
  sodium: { type: Number, min: 0 },
  cholesterol: { type: Number, min: 0 },
  saturatedFat: { type: Number, min: 0 },
  transFat: { type: Number, min: 0 },
  monounsaturatedFat: { type: Number, min: 0 },
  polyunsaturatedFat: { type: Number, min: 0 },
  potassium: { type: Number, min: 0 },
  calcium: { type: Number, min: 0 },
  iron: { type: Number, min: 0 },
  vitaminA: { type: Number, min: 0 },
  vitaminC: { type: Number, min: 0 },
  vitaminD: { type: Number, min: 0 }
}, { _id: false });

// Meal Ingredient Schema
const MealIngredientSchema = new Schema<IMealIngredient>({
  name: { 
    type: String, 
    required: true, 
    trim: true,
    maxlength: 100
  },
  amount: { 
    type: Number, 
    required: true, 
    min: 0 
  },
  unit: { 
    type: String, 
    required: true, 
    trim: true,
    maxlength: 20
  },
  calories: { type: Number, required: true, min: 0 },
  protein: { type: Number, required: true, min: 0 },
  carbs: { type: Number, required: true, min: 0 },
  fat: { type: Number, required: true, min: 0 },
  fiber: { type: Number, min: 0 },
  sugar: { type: Number, min: 0 },
  sodium: { type: Number, min: 0 }
});

// Main Meal Schema
const MealSchema = new Schema<IMeal>({
  name: {
    type: String,
    required: [true, 'Meal name is required'],
    trim: true,
    maxlength: [100, 'Meal name cannot exceed 100 characters'],
    index: true
  },
  description: {
    type: String,
    trim: true,
    maxlength: [500, 'Description cannot exceed 500 characters']
  },
  category: {
    type: String,
    required: [true, 'Meal category is required'],
    enum: Object.values(MealCategory),
    index: true
  },
  cuisine: {
    type: String,
    trim: true,
    maxlength: [50, 'Cuisine cannot exceed 50 characters'],
    index: true
  },
  prepTime: {
    type: Number,
    required: [true, 'Preparation time is required'],
    min: [0, 'Preparation time cannot be negative']
  },
  cookTime: {
    type: Number,
    required: [true, 'Cooking time is required'],
    min: [0, 'Cooking time cannot be negative']
  },
  servings: {
    type: Number,
    required: [true, 'Number of servings is required'],
    min: [1, 'Servings must be at least 1'],
    max: [20, 'Servings cannot exceed 20']
  },
  difficulty: {
    type: String,
    required: [true, 'Difficulty level is required'],
    enum: ['easy', 'medium', 'hard'],
    index: true
  },
  ingredients: {
    type: [MealIngredientSchema],
    required: [true, 'At least one ingredient is required'],
    validate: {
      validator: function(ingredients: IMealIngredient[]) {
        return ingredients && ingredients.length > 0;
      },
      message: 'At least one ingredient is required'
    }
  },
  instructions: {
    type: [String],
    required: [true, 'At least one instruction is required'],
    validate: {
      validator: function(instructions: string[]) {
        return instructions && instructions.length > 0;
      },
      message: 'At least one instruction is required'
    }
  },
  nutrition: {
    type: NutritionInfoSchema,
    required: [true, 'Nutrition information is required']
  },
  tags: [{
    type: String,
    trim: true,
    maxlength: [30, 'Tag cannot exceed 30 characters']
  }],
  image: {
    type: String,
    trim: true
  },
  isPublic: {
    type: Boolean,
    default: false,
    index: true
  },
  createdBy: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'Creator is required'],
    index: true
  }
}, {
  timestamps: true,
  toJSON: { 
    virtuals: true,
    transform: function(doc: any, ret: any) {
      (ret as any).id = ret._id;
      delete ret._id;
      delete ret.__v;
      return ret;
    }
  },
  toObject: { virtuals: true }
});

// Indexes for efficient queries
MealSchema.index({ name: 'text', description: 'text', tags: 'text' });
MealSchema.index({ category: 1, difficulty: 1 });
MealSchema.index({ 'nutrition.calories': 1 });
MealSchema.index({ prepTime: 1, cookTime: 1 });
MealSchema.index({ createdBy: 1, isPublic: 1 });
MealSchema.index({ createdAt: -1 });

// Virtual for total time
MealSchema.virtual('totalTime').get(function(this: IMeal) {
  return this.prepTime + this.cookTime;
});

// Pre-save middleware to calculate nutrition from ingredients
MealSchema.pre('save', function(this: IMeal, next) {
  if (this.isModified('ingredients') || this.isNew) {
    const nutrition = this.ingredients.reduce((total: any, ingredient: any) => {
      return {
        calories: total.calories + ingredient.calories,
        protein: total.protein + ingredient.protein,
        carbs: total.carbs + ingredient.carbs,
        fat: total.fat + ingredient.fat,
        fiber: (total.fiber || 0) + (ingredient.fiber || 0),
        sugar: (total.sugar || 0) + (ingredient.sugar || 0),
        sodium: (total.sodium || 0) + (ingredient.sodium || 0)
      };
    }, {
      calories: 0,
      protein: 0,
      carbs: 0,
      fat: 0,
      fiber: 0,
      sugar: 0,
      sodium: 0
    });

    // Update nutrition info if not manually set
    if (!this.nutrition || this.isNew) {
      this.nutrition = {
        ...this.nutrition,
        ...nutrition
      };
    }
  }
  next();
});

// Static methods
MealSchema.statics.findByCategory = function(category: MealCategory) {
  return this.find({ category, isPublic: true });
};

MealSchema.statics.findByDifficulty = function(difficulty: string) {
  return this.find({ difficulty, isPublic: true });
};

MealSchema.statics.findByCreator = function(createdBy: string) {
  return this.find({ createdBy });
};

MealSchema.statics.findByNutritionRange = function(
  caloriesMin?: number, 
  caloriesMax?: number,
  proteinMin?: number
) {
  const query: any = { isPublic: true };
  
  if (caloriesMin !== undefined || caloriesMax !== undefined) {
    query['nutrition.calories'] = {};
    if (caloriesMin !== undefined) query['nutrition.calories'].$gte = caloriesMin;
    if (caloriesMax !== undefined) query['nutrition.calories'].$lte = caloriesMax;
  }
  
  if (proteinMin !== undefined) {
    query['nutrition.protein'] = { $gte: proteinMin };
  }
  
  return this.find(query);
};

MealSchema.statics.searchMeals = function(searchTerm: string) {
  return this.find({
    $and: [
      { isPublic: true },
      {
        $or: [
          { name: { $regex: searchTerm, $options: 'i' } },
          { description: { $regex: searchTerm, $options: 'i' } },
          { tags: { $in: [new RegExp(searchTerm, 'i')] } },
          { cuisine: { $regex: searchTerm, $options: 'i' } }
        ]
      }
    ]
  });
};

// Instance methods
MealSchema.methods.calculateNutritionPerServing = function(this: IMeal) {
  const nutrition = this.nutrition;
  const servings = this.servings;
  
  return {
    calories: Math.round(nutrition.calories / servings),
    protein: Math.round(nutrition.protein / servings * 10) / 10,
    carbs: Math.round(nutrition.carbs / servings * 10) / 10,
    fat: Math.round(nutrition.fat / servings * 10) / 10,
    fiber: nutrition.fiber ? Math.round((nutrition.fiber / servings) * 10) / 10 : 0,
    sugar: nutrition.sugar ? Math.round((nutrition.sugar / servings) * 10) / 10 : 0,
    sodium: nutrition.sodium ? Math.round(nutrition.sodium / servings) : 0
  };
};

MealSchema.methods.isCompatibleWithDiet = function(this: IMeal, dietType: string) {
  const mealTags = this.tags.map((tag: string) => tag.toLowerCase());
  
  switch (dietType.toLowerCase()) {
    case 'vegan':
      return mealTags.includes('vegan') || 
             (!mealTags.includes('meat') && !mealTags.includes('dairy') && !mealTags.includes('eggs'));
    case 'vegetarian':
      return mealTags.includes('vegetarian') || mealTags.includes('vegan') ||
             !mealTags.includes('meat');
    case 'keto':
      return mealTags.includes('keto') || mealTags.includes('low-carb');
    case 'paleo':
      return mealTags.includes('paleo');
    case 'mediterranean':
      return mealTags.includes('mediterranean');
    default:
      return true;
  }
};

export const Meal = model<IMeal>('Meal', MealSchema);
export default Meal;
