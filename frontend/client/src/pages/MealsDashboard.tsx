import React, { useState, useEffect } from 'react';
import { Plus, Search, Filter, TrendingUp } from 'lucide-react';
import { Meal } from '../types';
import { useMeal } from '../hooks/useMeal';
import MealList from '../components/meals/MealList';
import MealForm from '../components/meals/MealForm';

export const MealsDashboard: React.FC = () => {
  const { myMeals, getMyMeals, getFeaturedMeals, loading } = useMeal();
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [selectedMeal, setSelectedMeal] = useState<Meal | null>(null);
  const [activeTab, setActiveTab] = useState<'featured' | 'my-meals' | 'all'>('featured');

  useEffect(() => {
    if (activeTab === 'featured') {
      getFeaturedMeals(6);
    } else if (activeTab === 'my-meals') {
      getMyMeals();
    }
  }, [activeTab]);

  const handleMealCreated = (meal: Meal) => {
    console.log('Meal created:', meal);
    // Optionally switch to my-meals tab to show the new meal
    setActiveTab('my-meals');
  };

  const tabs = [
    { id: 'featured' as const, label: 'Featured Meals', icon: TrendingUp },
    { id: 'my-meals' as const, label: 'My Meals', icon: null },
    { id: 'all' as const, label: 'Browse All', icon: Search },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Meals Dashboard</h1>
            <p className="text-gray-600 mt-2">
              Discover, create, and manage your meals
            </p>
          </div>
          
          <button
            onClick={() => setShowCreateForm(true)}
            className="mt-4 sm:mt-0 inline-flex items-center px-4 py-2 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors"
          >
            <Plus className="h-5 w-5 mr-2" />
            Create Meal
          </button>
        </div>

        {/* Tabs */}
        <div className="border-b border-gray-200 mb-8">
          <nav className="-mb-px flex space-x-8">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`whitespace-nowrap py-2 px-1 border-b-2 font-medium text-sm transition-colors ${
                    activeTab === tab.id
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  <div className="flex items-center">
                    {Icon && <Icon className="h-4 w-4 mr-2" />}
                    {tab.label}
                  </div>
                </button>
              );
            })}
          </nav>
        </div>

        {/* Tab Content */}
        <div className="space-y-8">
          {activeTab === 'featured' && (
            <div>
              <div className="mb-6">
                <h2 className="text-xl font-semibold text-gray-900 mb-2">
                  Featured Meals
                </h2>
                <p className="text-gray-600">
                  Popular meals from our community
                </p>
              </div>
              
              <MealList
                showFilters={false}
                showSearch={false}
                onMealSelect={setSelectedMeal}
              />
            </div>
          )}

          {activeTab === 'my-meals' && (
            <div>
              <div className="mb-6">
                <h2 className="text-xl font-semibold text-gray-900 mb-2">
                  My Meals
                </h2>
                <p className="text-gray-600">
                  Meals you've created
                </p>
              </div>
              
              {myMeals.length === 0 && !loading ? (
                <div className="text-center py-12 bg-white rounded-lg border border-gray-200">
                  <div className="text-6xl mb-4">👨‍🍳</div>
                  <h3 className="text-lg font-medium text-gray-900 mb-2">
                    No meals yet
                  </h3>
                  <p className="text-gray-600 mb-6">
                    Create your first meal to get started
                  </p>
                  <button
                    onClick={() => setShowCreateForm(true)}
                    className="inline-flex items-center px-4 py-2 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Create Your First Meal
                  </button>
                </div>
              ) : (
                <MealList
                  showFilters={true}
                  showSearch={true}
                  onMealSelect={setSelectedMeal}
                />
              )}
            </div>
          )}

          {activeTab === 'all' && (
            <div>
              <div className="mb-6">
                <h2 className="text-xl font-semibold text-gray-900 mb-2">
                  Browse All Meals
                </h2>
                <p className="text-gray-600">
                  Explore our entire meal collection
                </p>
              </div>
              
              <MealList
                showFilters={true}
                showSearch={true}
                onMealSelect={setSelectedMeal}
              />
            </div>
          )}
        </div>

        {/* Quick Stats */}
        {activeTab === 'my-meals' && myMeals.length > 0 && (
          <div className="mt-8 bg-white rounded-lg border border-gray-200 p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">
              Your Meal Stats
            </h3>
            
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-600">
                  {myMeals.length}
                </div>
                <div className="text-sm text-gray-600">Total Meals</div>
              </div>
              
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600">
                  {myMeals.filter(meal => meal.isPublic).length}
                </div>
                <div className="text-sm text-gray-600">Public Meals</div>
              </div>
              
              <div className="text-center">
                <div className="text-2xl font-bold text-purple-600">
                  {myMeals.filter(meal => meal.difficulty === 'easy').length}
                </div>
                <div className="text-sm text-gray-600">Easy Meals</div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Create Meal Modal */}
      <MealForm
        isOpen={showCreateForm}
        onClose={() => setShowCreateForm(false)}
        onSuccess={handleMealCreated}
      />

      {/* Selected Meal Modal */}
      {selectedMeal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-2xl w-full max-h-screen overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-2xl font-bold text-gray-900">
                  {selectedMeal.name}
                </h2>
                <button
                  onClick={() => setSelectedMeal(null)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <span className="sr-only">Close</span>
                  ✕
                </button>
              </div>
              
              {selectedMeal.image && (
                <img
                  src={selectedMeal.image}
                  alt={selectedMeal.name}
                  className="w-full h-64 object-cover rounded-lg mb-4"
                />
              )}
              
              <div className="space-y-4">
                <div>
                  <h3 className="font-medium text-gray-900 mb-2">Description</h3>
                  <p className="text-gray-600">
                    {selectedMeal.description || 'No description available.'}
                  </p>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <h3 className="font-medium text-gray-900 mb-2">Details</h3>
                    <div className="text-sm text-gray-600 space-y-1">
                      <p>Category: {selectedMeal.category}</p>
                      <p>Difficulty: {selectedMeal.difficulty}</p>
                      <p>Prep Time: {selectedMeal.prepTime} minutes</p>
                      <p>Cook Time: {selectedMeal.cookTime} minutes</p>
                      <p>Servings: {selectedMeal.servings}</p>
                    </div>
                  </div>
                  
                  <div>
                    <h3 className="font-medium text-gray-900 mb-2">Nutrition</h3>
                    <div className="text-sm text-gray-600 space-y-1">
                      <p>Calories: {selectedMeal.nutrition.calories}</p>
                      <p>Protein: {selectedMeal.nutrition.protein}g</p>
                      <p>Carbs: {selectedMeal.nutrition.carbs}g</p>
                      <p>Fat: {selectedMeal.nutrition.fat}g</p>
                    </div>
                  </div>
                </div>
                
                <div>
                  <h3 className="font-medium text-gray-900 mb-2">Ingredients</h3>
                  <ul className="list-disc list-inside text-sm text-gray-600 space-y-1">
                    {selectedMeal.ingredients.map((ingredient, index) => (
                      <li key={index}>
                        {ingredient.amount} {ingredient.unit} {ingredient.name}
                      </li>
                    ))}
                  </ul>
                </div>
                
                <div>
                  <h3 className="font-medium text-gray-900 mb-2">Instructions</h3>
                  <ol className="list-decimal list-inside text-sm text-gray-600 space-y-2">
                    {selectedMeal.instructions.map((instruction, index) => (
                      <li key={index}>{instruction}</li>
                    ))}
                  </ol>
                </div>
                
                {selectedMeal.tags.length > 0 && (
                  <div>
                    <h3 className="font-medium text-gray-900 mb-2">Tags</h3>
                    <div className="flex flex-wrap gap-2">
                      {selectedMeal.tags.map((tag, index) => (
                        <span
                          key={index}
                          className="px-2 py-1 bg-blue-100 text-blue-700 text-xs rounded-md"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MealsDashboard;
