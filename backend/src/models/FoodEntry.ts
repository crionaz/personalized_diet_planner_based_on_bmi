import mongoose, { Schema, Model, Document } from 'mongoose';
import { IFoodEntry, MealCategory } from '../types';

// Define interface for static methods
interface IFoodEntryModel extends Model<IFoodEntry> {
  findByDateRange(userId: string, startDate: Date, endDate: Date): Promise<IFoodEntry[]>;
  findByDate(userId: string, date: Date): Promise<IFoodEntry[]>;
  calculateDailyNutrition(userId: string, date: Date): Promise<any>;
  getTrackingStats(userId: string): Promise<any>;
  calculateCurrentStreak(userId: string): Promise<number>;
  calculateLongestStreak(userId: string): Promise<number>;
}

const CustomFoodSchema = new Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  brand: {
    type: String,
    trim: true
  },
  barcode: {
    type: String,
    trim: true
  },
  nutrition: {
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
    vitaminD: { type: Number, min: 0 },
  },
  servingSize: {
    amount: {
      type: Number,
      required: true,
      min: 0.1
    },
    unit: {
      type: String,
      required: true,
      trim: true
    }
  },
  verified: {
    type: Boolean,
    default: false
  }
}, { _id: false });

const FoodEntrySchema = new Schema<IFoodEntry>({
  userId: {
    type: String,
    required: true,
    index: true
  },
  mealId: {
    type: Schema.Types.ObjectId,
    ref: 'Meal',
    index: true
  },
  customFood: {
    type: CustomFoodSchema
  },
  mealType: {
    type: String,
    enum: Object.values(MealCategory),
    required: true,
    index: true
  },
  servings: {
    type: Number,
    required: true,
    min: 0.1,
    max: 20
  },
  consumedAt: {
    type: Date,
    required: true,
    index: true
  },
  notes: {
    type: String,
    trim: true,
    maxlength: 500
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Indexes for efficient querying
FoodEntrySchema.index({ userId: 1, consumedAt: -1 });
FoodEntrySchema.index({ userId: 1, mealType: 1, consumedAt: -1 });
FoodEntrySchema.index({ userId: 1, mealId: 1 });

// Virtual for populated meal
FoodEntrySchema.virtual('meal', {
  ref: 'Meal',
  localField: 'mealId',
  foreignField: '_id',
  justOne: true
});

// Validation: Must have either mealId or customFood
FoodEntrySchema.pre('validate', function() {
  if (!this.mealId && !this.customFood) {
    this.invalidate('mealId', 'Either mealId or customFood must be provided');
  }
  if (this.mealId && this.customFood) {
    this.invalidate('mealId', 'Cannot have both mealId and customFood');
  }
});

// Instance methods
FoodEntrySchema.methods.calculateNutrition = function() {
  let nutrition = {
    calories: 0,
    protein: 0,
    carbs: 0,
    fat: 0,
    fiber: 0,
    sugar: 0,
    sodium: 0
  };

  if (this.meal && this.meal.nutrition) {
    const mealNutrition = this.meal.nutrition;
    nutrition = {
      calories: mealNutrition.calories * this.servings,
      protein: mealNutrition.protein * this.servings,
      carbs: mealNutrition.carbs * this.servings,
      fat: mealNutrition.fat * this.servings,
      fiber: (mealNutrition.fiber || 0) * this.servings,
      sugar: (mealNutrition.sugar || 0) * this.servings,
      sodium: (mealNutrition.sodium || 0) * this.servings
    };
  } else if (this.customFood) {
    const customNutrition = this.customFood.nutrition;
    nutrition = {
      calories: customNutrition.calories * this.servings,
      protein: customNutrition.protein * this.servings,
      carbs: customNutrition.carbs * this.servings,
      fat: customNutrition.fat * this.servings,
      fiber: (customNutrition.fiber || 0) * this.servings,
      sugar: (customNutrition.sugar || 0) * this.servings,
      sodium: (customNutrition.sodium || 0) * this.servings
    };
  }

  return nutrition;
};

// Static methods
FoodEntrySchema.statics.findByDateRange = function(userId: string, startDate: Date, endDate: Date) {
  return this.find({
    userId,
    consumedAt: {
      $gte: startDate,
      $lte: endDate
    }
  }).populate('mealId').sort({ consumedAt: -1 });
};

FoodEntrySchema.statics.findByDate = function(userId: string, date: Date) {
  const startOfDay = new Date(date);
  startOfDay.setHours(0, 0, 0, 0);
  
  const endOfDay = new Date(date);
  endOfDay.setHours(23, 59, 59, 999);
  
  return (this as IFoodEntryModel).findByDateRange(userId, startOfDay, endOfDay);
};

FoodEntrySchema.statics.calculateDailyNutrition = async function(userId: string, date: Date) {
  const entries = await (this as IFoodEntryModel).findByDate(userId, date);
  
  let totalNutrition = {
    calories: 0,
    protein: 0,
    carbs: 0,
    fat: 0,
    fiber: 0,
    sodium: 0
  };

  const mealBreakdown: any = {};

  for (const entry of entries) {
    const nutrition = entry.calculateNutrition();
    
    // Add to total
    totalNutrition.calories += nutrition.calories;
    totalNutrition.protein += nutrition.protein;
    totalNutrition.carbs += nutrition.carbs;
    totalNutrition.fat += nutrition.fat;
    totalNutrition.fiber += nutrition.fiber || 0;
    totalNutrition.sodium += nutrition.sodium || 0;

    // Add to meal breakdown
    if (!mealBreakdown[entry.mealType]) {
      mealBreakdown[entry.mealType] = {
        mealType: entry.mealType,
        calories: 0,
        protein: 0,
        carbs: 0,
        fat: 0,
        entryCount: 0
      };
    }

    mealBreakdown[entry.mealType].calories += nutrition.calories;
    mealBreakdown[entry.mealType].protein += nutrition.protein;
    mealBreakdown[entry.mealType].carbs += nutrition.carbs;
    mealBreakdown[entry.mealType].fat += nutrition.fat;
    mealBreakdown[entry.mealType].entryCount += 1;
  }

  return {
    date: date.toISOString().split('T')[0],
    totalCalories: Math.round(totalNutrition.calories),
    totalProtein: Math.round(totalNutrition.protein),
    totalCarbs: Math.round(totalNutrition.carbs),
    totalFat: Math.round(totalNutrition.fat),
    totalFiber: Math.round(totalNutrition.fiber),
    totalSodium: Math.round(totalNutrition.sodium),
    mealBreakdown: Object.values(mealBreakdown)
  };
};

FoodEntrySchema.statics.getTrackingStats = async function(userId: string) {
  const pipeline = [
    { $match: { userId } },
    {
      $group: {
        _id: null,
        totalEntries: { $sum: 1 },
        totalDaysTracked: { $addToSet: { $dateToString: { format: "%Y-%m-%d", date: "$consumedAt" } } },
        avgCalories: { $avg: "$nutrition.calories" },
        avgProtein: { $avg: "$nutrition.protein" },
        avgCarbs: { $avg: "$nutrition.carbs" },
        avgFat: { $avg: "$nutrition.fat" },
        mealTypes: { $addToSet: "$mealType" },
        firstEntry: { $min: "$consumedAt" },
        lastEntry: { $max: "$consumedAt" }
      }
    }
  ];

  const [stats] = await this.aggregate(pipeline);
  
  if (!stats) {
    return {
      totalEntries: 0,
      totalDaysTracked: 0,
      averageDailyCalories: 0,
      averageDailyProtein: 0,
      averageDailyCarbs: 0,
      averageDailyFat: 0,
      currentStreak: 0,
      longestStreak: 0,
      favoriteTime: 'breakfast',
      mostTrackedMeal: 'N/A'
    };
  }

  return {
    totalEntries: stats.totalEntries,
    totalDaysTracked: stats.totalDaysTracked.length,
    averageDailyCalories: Math.round(stats.avgCalories || 0),
    averageDailyProtein: Math.round(stats.avgProtein || 0),
    averageDailyCarbs: Math.round(stats.avgCarbs || 0),
    averageDailyFat: Math.round(stats.avgFat || 0),
    currentStreak: await (this as IFoodEntryModel).calculateCurrentStreak(userId),
    longestStreak: await (this as IFoodEntryModel).calculateLongestStreak(userId),
    favoriteTime: stats.mealTypes[0] || 'breakfast',
    mostTrackedMeal: 'Mixed'
  };
};

FoodEntrySchema.statics.calculateCurrentStreak = async function(userId: string) {
  const today = new Date();
  let currentDate = new Date(today);
  let streak = 0;

  while (true) {
    const entriesForDay = await this.countDocuments({
      userId,
      consumedAt: {
        $gte: new Date(currentDate.getFullYear(), currentDate.getMonth(), currentDate.getDate()),
        $lt: new Date(currentDate.getFullYear(), currentDate.getMonth(), currentDate.getDate() + 1)
      }
    });

    if (entriesForDay === 0) {
      break;
    }

    streak++;
    currentDate.setDate(currentDate.getDate() - 1);
  }

  return streak;
};

FoodEntrySchema.statics.calculateLongestStreak = async function(userId: string) {
  // Simplified calculation - would need more complex logic for accurate longest streak
  const currentStreak = await (this as IFoodEntryModel).calculateCurrentStreak(userId);
  return currentStreak; // For MVP, assume current is longest
};

export const FoodEntry = mongoose.model<IFoodEntry, IFoodEntryModel>('FoodEntry', FoodEntrySchema);
