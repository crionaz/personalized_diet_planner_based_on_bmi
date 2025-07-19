import React, { useState } from 'react';

// Temporary enums and types for demonstration
enum MealCategory {
  BREAKFAST = 'breakfast',
  LUNCH = 'lunch',
  DINNER = 'dinner',
  SNACK = 'snack'
}

interface CreateFoodEntryRequest {
  customFood?: {
    name: string;
    nutrition: {
      calories: number;
      protein: number;
      carbs: number;
      fat: number;
      fiber: number;
      sugar: number;
      sodium: number;
    };
    servingSize: { amount: number; unit: string };
  };
  mealType: MealCategory;
  servings: number;
}

const TrackingPage: React.FC = () => {
  // Mock state for demonstration
  const [currentDate, setCurrentDate] = useState(new Date().toISOString().split('T')[0]);
  const [showAddFood, setShowAddFood] = useState(false);
  const [selectedMealType, setSelectedMealType] = useState<MealCategory>(MealCategory.BREAKFAST);
  const [customFoodData, setCustomFoodData] = useState({
    name: '',
    calories: 0,
    protein: 0,
    carbs: 0,
    fat: 0,
    servings: 1
  });

  // Mock data for demonstration
  const nutrition = {
    totalCalories: 1850,
    totalProtein: 125,
    totalCarbs: 200,
    totalFat: 65,
    targets: {
      dailyCalories: 2000,
      dailyProtein: 150,
      dailyCarbs: 250,
      dailyFat: 67
    }
  };

  const waterIntake = {
    totalAmount: 1200,
    targetAmount: 2000,
    progress: 60
  };

  const handleDateChange = (newDate: string) => {
    setCurrentDate(newDate);
  };

  const handleAddWater = async (amount: number) => {
    try {
      console.log('Adding water:', amount);
      // This would call the tracking service
    } catch (error) {
      console.error('Failed to add water:', error);
    }
  };

  const handleAddCustomFood = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const foodEntry: CreateFoodEntryRequest = {
      customFood: {
        name: customFoodData.name,
        nutrition: {
          calories: customFoodData.calories,
          protein: customFoodData.protein,
          carbs: customFoodData.carbs,
          fat: customFoodData.fat,
          fiber: 0,
          sugar: 0,
          sodium: 0
        },
        servingSize: { amount: 1, unit: 'serving' }
      },
      mealType: selectedMealType,
      servings: customFoodData.servings
    };

    try {
      console.log('Adding food entry:', foodEntry);
      setShowAddFood(false);
      setCustomFoodData({
        name: '',
        calories: 0,
        protein: 0,
        carbs: 0,
        fat: 0,
        servings: 1
      });
    } catch (error) {
      console.error('Failed to add food:', error);
    }
  };

  // Quick water amounts
  const quickWaterAmounts = [
    { label: 'Glass', amount: 250, icon: '🥤' },
    { label: 'Bottle', amount: 500, icon: '🍼' },
    { label: 'Large Cup', amount: 350, icon: '☕' },
    { label: 'Sports Bottle', amount: 750, icon: '🚰' }
  ];

  // Calculate progress percentages
  const calorieProgress = Math.round((nutrition.totalCalories / nutrition.targets.dailyCalories) * 100);
  const proteinProgress = Math.round((nutrition.totalProtein / nutrition.targets.dailyProtein) * 100);
  const carbsProgress = Math.round((nutrition.totalCarbs / nutrition.targets.dailyCarbs) * 100);
  const fatProgress = Math.round((nutrition.totalFat / nutrition.targets.dailyFat) * 100);

  // Calculate macro percentages (of total calories)
  const macroBalance = {
    protein: Math.round((nutrition.totalProtein * 4 / nutrition.totalCalories) * 100),
    carbs: Math.round((nutrition.totalCarbs * 4 / nutrition.totalCalories) * 100),
    fat: Math.round((nutrition.totalFat * 9 / nutrition.totalCalories) * 100)
  };

  const loading = false; // Mock loading state

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Food & Water Tracking</h1>
          <p className="text-gray-600">Monitor your daily nutrition and hydration</p>
        </div>

        {/* Date Selector */}
        <div className="bg-white rounded-lg shadow-md p-4 mb-6">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-gray-900">Tracking Date</h2>
            <input
              type="date"
              value={currentDate}
              onChange={(e) => handleDateChange(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              aria-label="Select tracking date"
            />
          </div>
        </div>

        {/* Daily Overview Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          {/* Calories */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">Calories</h3>
              <span className="text-2xl">🔥</span>
            </div>
            {false ? ( // Simplified for demo - nutritionLoading
              <div className="animate-pulse">
                <div className="h-4 bg-gray-200 rounded mb-2"></div>
                <div className="h-8 bg-gray-200 rounded"></div>
              </div>
            ) : (
              <>
                <div className="text-2xl font-bold text-blue-600 mb-2">
                  {nutrition?.totalCalories || 0}
                  <span className="text-sm text-gray-500 ml-1">
                    / {nutrition?.targets?.dailyCalories || 2000}
                  </span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div 
                    className={`h-2 rounded-full ${
                      calorieProgress >= 90 && calorieProgress <= 110 ? 'bg-green-500' :
                      calorieProgress > 110 ? 'bg-red-500' : 'bg-blue-500'
                    }`}
                    style={{ width: `${Math.min(calorieProgress, 100)}%` }}
                  ></div>
                </div>
              </>
            )}
          </div>

          {/* Protein */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">Protein</h3>
              <span className="text-2xl">💪</span>
            </div>
            <div className="text-2xl font-bold text-green-600 mb-2">
              {nutrition?.totalProtein || 0}g
              <span className="text-sm text-gray-500 ml-1">
                / {nutrition?.targets?.dailyProtein || 150}g
              </span>
            </div>
            <div className="text-sm text-gray-600">
              {macroBalance?.protein || 0}% of calories
            </div>
          </div>

          {/* Carbs */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">Carbs</h3>
              <span className="text-2xl">🍞</span>
            </div>
            <div className="text-2xl font-bold text-yellow-600 mb-2">
              {nutrition?.totalCarbs || 0}g
              <span className="text-sm text-gray-500 ml-1">
                / {nutrition?.targets?.dailyCarbs || 250}g
              </span>
            </div>
            <div className="text-sm text-gray-600">
              {macroBalance?.carbs || 0}% of calories
            </div>
          </div>

          {/* Fat */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">Fat</h3>
              <span className="text-2xl">🥑</span>
            </div>
            <div className="text-2xl font-bold text-purple-600 mb-2">
              {nutrition?.totalFat || 0}g
              <span className="text-sm text-gray-500 ml-1">
                / {nutrition?.targets?.dailyFat || 67}g
              </span>
            </div>
            <div className="text-sm text-gray-600">
              {macroBalance?.fat || 0}% of calories
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Food Tracking Section */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold text-gray-900">Food Intake</h2>
              <button
                onClick={() => setShowAddFood(true)}
                className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
              >
                Add Food
              </button>
            </div>

            {/* Meal Breakdown - Simplified for demo */}
            <div className="text-center py-8 text-gray-500">
              <div className="mb-4">
                <div className="border rounded-lg p-4 mb-4">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center space-x-2">
                      <span className="text-lg">🍳</span>
                      <h3 className="font-semibold capitalize">Breakfast</h3>
                      <span className="px-2 py-1 rounded text-xs bg-blue-100 text-blue-800">
                        2 items
                      </span>
                    </div>
                    <div className="text-sm text-gray-600">
                      7:30 AM
                    </div>
                  </div>
                  <div className="grid grid-cols-4 gap-2 text-sm">
                    <div>
                      <div className="font-medium">450</div>
                      <div className="text-gray-500">calories</div>
                    </div>
                    <div>
                      <div className="font-medium">25g</div>
                      <div className="text-gray-500">protein</div>
                    </div>
                    <div>
                      <div className="font-medium">45g</div>
                      <div className="text-gray-500">carbs</div>
                    </div>
                    <div>
                      <div className="font-medium">15g</div>
                      <div className="text-gray-500">fat</div>
                    </div>
                  </div>
                </div>
                
                <div className="border rounded-lg p-4">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center space-x-2">
                      <span className="text-lg">🥗</span>
                      <h3 className="font-semibold capitalize">Lunch</h3>
                      <span className="px-2 py-1 rounded text-xs bg-green-100 text-green-800">
                        3 items
                      </span>
                    </div>
                    <div className="text-sm text-gray-600">
                      12:30 PM
                    </div>
                  </div>
                  <div className="grid grid-cols-4 gap-2 text-sm">
                    <div>
                      <div className="font-medium">650</div>
                      <div className="text-gray-500">calories</div>
                    </div>
                    <div>
                      <div className="font-medium">35g</div>
                      <div className="text-gray-500">protein</div>
                    </div>
                    <div>
                      <div className="font-medium">75g</div>
                      <div className="text-gray-500">carbs</div>
                    </div>
                    <div>
                      <div className="font-medium">25g</div>
                      <div className="text-gray-500">fat</div>
                    </div>
                  </div>
                </div>
              </div>
              <p className="text-sm">Click "Add Food" to start tracking your meals!</p>
            </div>
          </div>

          {/* Water Tracking Section */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold text-gray-900">Water Intake</h2>
              <span className="text-2xl">💧</span>
            </div>

            {false ? ( // Simplified for demo - waterLoading
              <div className="animate-pulse">
                <div className="h-4 bg-gray-200 rounded mb-4"></div>
                <div className="h-20 bg-gray-200 rounded"></div>
              </div>
            ) : (
              <>
                {/* Water Progress */}
                <div className="mb-6">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-lg font-semibold">
                      {waterIntake?.totalAmount || 0} ml
                    </span>
                    <span className="text-sm text-gray-600">
                      Goal: {waterIntake?.targetAmount || 2000} ml
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-4">
                    <div 
                      className="bg-blue-500 h-4 rounded-full transition-all duration-300"
                      style={{ width: `${Math.min((waterIntake?.progress || 0), 100)}%` }}
                    ></div>
                  </div>
                  <div className="text-center mt-2 text-sm">
                    <span className="text-blue-600">
                      {waterIntake?.progress && waterIntake.progress >= 100 
                        ? "Great job! You've reached your daily goal!" 
                        : "Keep drinking water to reach your goal!"}
                    </span>
                  </div>
                </div>

                {/* Quick Add Water */}
                <div>
                  <h3 className="font-semibold mb-3">Quick Add</h3>
                  <div className="grid grid-cols-2 gap-2">
                    {quickWaterAmounts.map((item) => (
                      <button
                        key={item.amount}
                        onClick={() => handleAddWater(item.amount)}
                        className="flex items-center justify-center space-x-2 p-3 border border-gray-300 rounded-lg hover:bg-blue-50 hover:border-blue-300 transition-colors"
                      >
                        <span className="text-lg">{item.icon}</span>
                        <div>
                          <div className="font-medium">{item.label}</div>
                          <div className="text-sm text-gray-600">{item.amount}ml</div>
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
              </>
            )}
          </div>
        </div>

        {/* Add Food Modal */}
        {showAddFood && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-lg p-6 w-full max-w-md">
              <h2 className="text-xl font-semibold mb-4">Add Custom Food</h2>
              
              <form onSubmit={handleAddCustomFood} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Food Name</label>
                  <input
                    type="text"
                    value={customFoodData.name}
                    onChange={(e) => setCustomFoodData({...customFoodData, name: e.target.value})}
                    className="w-full p-2 border border-gray-300 rounded-lg"
                    placeholder="Enter food name"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Meal Type</label>
                  <select
                    value={selectedMealType}
                    onChange={(e) => setSelectedMealType(e.target.value as MealCategory)}
                    className="w-full p-2 border border-gray-300 rounded-lg"
                    aria-label="Select meal type"
                  >
                    {Object.values(MealCategory).map((type) => (
                      <option key={type} value={type}>
                        {type.charAt(0).toUpperCase() + type.slice(1)}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Calories</label>
                    <input
                      type="number"
                      value={customFoodData.calories}
                      onChange={(e) => setCustomFoodData({...customFoodData, calories: Number(e.target.value)})}
                      className="w-full p-2 border border-gray-300 rounded-lg"
                      min="0"
                      placeholder="0"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Servings</label>
                    <input
                      type="number"
                      step="0.1"
                      value={customFoodData.servings}
                      onChange={(e) => setCustomFoodData({...customFoodData, servings: Number(e.target.value)})}
                      className="w-full p-2 border border-gray-300 rounded-lg"
                      min="0.1"
                      placeholder="1"
                      required
                    />
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Protein (g)</label>
                    <input
                      type="number"
                      value={customFoodData.protein}
                      onChange={(e) => setCustomFoodData({...customFoodData, protein: Number(e.target.value)})}
                      className="w-full p-2 border border-gray-300 rounded-lg"
                      min="0"
                      placeholder="0"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Carbs (g)</label>
                    <input
                      type="number"
                      value={customFoodData.carbs}
                      onChange={(e) => setCustomFoodData({...customFoodData, carbs: Number(e.target.value)})}
                      className="w-full p-2 border border-gray-300 rounded-lg"
                      min="0"
                      placeholder="0"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Fat (g)</label>
                    <input
                      type="number"
                      value={customFoodData.fat}
                      onChange={(e) => setCustomFoodData({...customFoodData, fat: Number(e.target.value)})}
                      className="w-full p-2 border border-gray-300 rounded-lg"
                      min="0"
                      placeholder="0"
                    />
                  </div>
                </div>

                <div className="flex justify-end space-x-4">
                  <button
                    type="button"
                    onClick={() => setShowAddFood(false)}
                    className="px-4 py-2 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                  >
                    Add Food
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default TrackingPage;
