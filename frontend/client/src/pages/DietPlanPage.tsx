import React, { useState, useEffect } from 'react';
import { useDietPlans, useActiveDietPlan } from '../hooks/useDietPlan';
import { dietPlanService } from '../services/dietPlanService';
import { NutritionalTargets, CreateDietPlanRequest } from '../types';
import { useAuth } from '../hooks/useAuth';

interface DietPlanFormData {
  name: string;
  description: string;
  startDate: string;
  endDate: string;
  generationType: 'ai' | 'manual';
  preferences: {
    includeBreakfast: boolean;
    includeLunch: boolean;
    includeDinner: boolean;
    includeSnacks: boolean;
    maxPrepTime?: number;
    maxCookTime?: number;
    difficulty?: 'easy' | 'medium' | 'hard';
  };
}

const DietPlanPage: React.FC = () => {
  const { user } = useAuth();
  const { dietPlans, loading: plansLoading, createDietPlan, deleteDietPlan, fetchDietPlans } = useDietPlans();
  const { activePlan, loading: activePlanLoading, markMealCompleted } = useActiveDietPlan();
  
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [formData, setFormData] = useState<DietPlanFormData>({
    name: '',
    description: '',
    startDate: new Date().toISOString().split('T')[0],
    endDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    generationType: 'ai',
    preferences: {
      includeBreakfast: true,
      includeLunch: true,
      includeDinner: true,
      includeSnacks: false,
      maxPrepTime: 30,
      maxCookTime: 45,
      difficulty: 'medium'
    }
  });
  const [nutritionalTargets, setNutritionalTargets] = useState<Partial<NutritionalTargets>>({});
  const [isCreating, setIsCreating] = useState(false);

  useEffect(() => {
    fetchDietPlans();
  }, [fetchDietPlans]);

  // Calculate nutritional targets based on user data
  useEffect(() => {
    if (user?.healthMetrics) {
      const { weight, height, activityLevel } = user.healthMetrics;
      const gender = user.profile.gender;
      const goal = user.goals?.type || 'maintenance';
      const dietType = user.dietaryPreferences?.dietType || 'regular';

      if (weight && height && gender) {
        const targets = dietPlanService.calculateNutritionalTargets(
          weight,
          height,
          25, // Assuming 25 years old, should get from user data
          gender,
          activityLevel,
          goal,
          dietType
        );
        setNutritionalTargets(targets);
      }
    }
  }, [user]);

  const handleCreatePlan = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsCreating(true);

    try {
      const planData: CreateDietPlanRequest = {
        ...formData,
        nutritionalTargets: nutritionalTargets as NutritionalTargets,
      };

      await createDietPlan(planData);
      setShowCreateForm(false);
      setFormData({
        name: '',
        description: '',
        startDate: new Date().toISOString().split('T')[0],
        endDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        generationType: 'ai',
        preferences: {
          includeBreakfast: true,
          includeLunch: true,
          includeDinner: true,
          includeSnacks: false,
          maxPrepTime: 30,
          maxCookTime: 45,
          difficulty: 'medium'
        }
      });
    } catch (error) {
      console.error('Failed to create diet plan:', error);
    } finally {
      setIsCreating(false);
    }
  };

  const handleMealToggle = async (mealId: string, completed: boolean) => {
    try {
      await markMealCompleted(mealId, completed);
    } catch (error) {
      console.error('Failed to update meal completion:', error);
    }
  };

  const weekDays = dietPlanService.getWeekDays();

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Diet Plans</h1>
          <p className="text-gray-600">Create and manage your personalized meal plans</p>
        </div>

        {/* Active Plan Section */}
        {activePlan && (
          <div className="bg-white rounded-lg shadow-md p-6 mb-8">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Active Plan: {activePlan.name}</h2>
            
            {/* Plan Stats */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
              <div className="bg-blue-50 p-4 rounded-lg">
                <div className="text-2xl font-bold text-blue-600">
                  {Math.round(nutritionalTargets.dailyCalories || 0)}
                </div>
                <div className="text-sm text-gray-600">Daily Calories</div>
              </div>
              <div className="bg-green-50 p-4 rounded-lg">
                <div className="text-2xl font-bold text-green-600">
                  {Math.round(nutritionalTargets.dailyProtein || 0)}g
                </div>
                <div className="text-sm text-gray-600">Daily Protein</div>
              </div>
              <div className="bg-yellow-50 p-4 rounded-lg">
                <div className="text-2xl font-bold text-yellow-600">
                  {Math.round(nutritionalTargets.dailyCarbs || 0)}g
                </div>
                <div className="text-sm text-gray-600">Daily Carbs</div>
              </div>
              <div className="bg-purple-50 p-4 rounded-lg">
                <div className="text-2xl font-bold text-purple-600">
                  {Math.round(nutritionalTargets.dailyFat || 0)}g
                </div>
                <div className="text-sm text-gray-600">Daily Fat</div>
              </div>
            </div>

            {/* Weekly Meal Plan */}
            <div className="grid grid-cols-1 lg:grid-cols-7 gap-4">
              {weekDays.map((day) => (
                <div key={day.value} className="border rounded-lg p-4">
                  <h3 className="font-semibold text-gray-900 mb-2">{day.short}</h3>
                  <div className="space-y-2">
                    {activePlan.meals
                      .filter(meal => meal.dayOfWeek === day.value)
                      .map((meal) => (
                        <div 
                          key={meal.id || `${meal.mealId}-${meal.dayOfWeek}`}
                          className="text-sm"
                        >
                          <div className="flex items-center justify-between">
                            <div>
                              <div className={`inline-block px-2 py-1 rounded text-xs ${dietPlanService.getMealTypeColor(meal.mealType)}`}>
                                {meal.mealType}
                              </div>
                              <div className="text-gray-600 mt-1">
                                {meal.meal?.name || 'Loading...'}
                              </div>
                              <div className="text-gray-500 text-xs">
                                {meal.servings}x servings
                              </div>
                            </div>
                            <input
                              title='Meal Completion'
                              type="checkbox"
                              checked={meal.isCompleted}
                              onChange={(e) => handleMealToggle(meal.id || meal.mealId, e.target.checked)}
                              className="h-4 w-4 text-green-600"
                            />
                          </div>
                        </div>
                      ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Create New Plan Button */}
        <div className="mb-6">
          <button
            onClick={() => setShowCreateForm(true)}
            className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors"
          >
            Create New Diet Plan
          </button>
        </div>

        {/* Create Plan Form */}
        {showCreateForm && (
          <div className="bg-white rounded-lg shadow-md p-6 mb-8">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Create New Diet Plan</h2>
            
            <form onSubmit={handleCreatePlan} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Plan Name</label>
                  <input
                    title='Plan Name'
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full p-2 border border-gray-300 rounded-lg"
                    required
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Generation Type</label>
                  <select
                    title='Generation Type'
                    value={formData.generationType}
                    onChange={(e) => setFormData({ ...formData, generationType: e.target.value as 'ai' | 'manual' })}
                    className="w-full p-2 border border-gray-300 rounded-lg"
                  >
                    <option value="ai">AI Generated</option>
                    <option value="manual">Manual</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                <textarea
                  title='Description'
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full p-2 border border-gray-300 rounded-lg"
                  rows={3}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Start Date</label>
                  <input
                    title='Start Date'
                    type="date"
                    value={formData.startDate}
                    onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                    className="w-full p-2 border border-gray-300 rounded-lg"
                    required
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">End Date</label>
                  <input
                    title='End Date'
                    type="date"
                    value={formData.endDate}
                    onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                    className="w-full p-2 border border-gray-300 rounded-lg"
                    required
                  />
                </div>
              </div>

              {/* Meal Preferences */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Meal Types</label>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                  {[
                    { key: 'includeBreakfast', label: 'Breakfast' },
                    { key: 'includeLunch', label: 'Lunch' },
                    { key: 'includeDinner', label: 'Dinner' },
                    { key: 'includeSnacks', label: 'Snacks' }
                  ].map(({ key, label }) => (
                    <label key={key} className="flex items-center">
                      <input
                        type="checkbox"
                        checked={formData.preferences[key as keyof typeof formData.preferences] as boolean}
                        onChange={(e) => setFormData({
                          ...formData,
                          preferences: {
                            ...formData.preferences,
                            [key]: e.target.checked
                          }
                        })}
                        className="mr-2"
                      />
                      {label}
                    </label>
                  ))}
                </div>
              </div>

              <div className="flex justify-end space-x-4">
                <button
                  type="button"
                  onClick={() => setShowCreateForm(false)}
                  className="px-4 py-2 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isCreating}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
                >
                  {isCreating ? 'Creating...' : 'Create Plan'}
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Diet Plans List */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">My Diet Plans</h2>
          
          {plansLoading ? (
            <div className="flex justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            </div>
          ) : dietPlans.length === 0 ? (
            <p className="text-gray-500 text-center py-8">No diet plans found. Create your first plan!</p>
          ) : (
            <div className="space-y-4">
              {dietPlans.map((plan) => (
                <div key={plan.id} className="border rounded-lg p-4">
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="font-semibold text-gray-900">{plan.name}</h3>
                      <p className="text-gray-600 text-sm">{plan.description}</p>
                      <div className="flex items-center space-x-4 mt-2 text-sm text-gray-500">
                        <span>{new Date(plan.startDate).toLocaleDateString()} - {new Date(plan.endDate).toLocaleDateString()}</span>
                        <span className={`px-2 py-1 rounded ${plan.isActive ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}`}>
                          {plan.isActive ? 'Active' : 'Inactive'}
                        </span>
                        <span className="capitalize">{plan.generatedBy}</span>
                      </div>
                    </div>
                    <button
                      onClick={() => deleteDietPlan(plan.id)}
                      className="text-red-600 hover:text-red-800 text-sm"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default DietPlanPage;
