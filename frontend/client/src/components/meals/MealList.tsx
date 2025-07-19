import React, { useEffect, useState } from 'react';
import { Search, Filter, Clock, Users, ChefHat, Star } from 'lucide-react';
import { Meal, MealCategory, MealSearchQuery } from '../../types';
import { useMeal } from '../../hooks/useMeal';
import Button from '../ui/Button';
import FormField from '../ui/Input';
import MealCard from './MealCard';

interface MealListProps {
  showFilters?: boolean;
  showSearch?: boolean;
  initialCategory?: MealCategory;
  onMealSelect?: (meal: Meal) => void;
}

export const MealList: React.FC<MealListProps> = ({
  showFilters = true,
  showSearch = true,
  initialCategory,
  onMealSelect
}) => {
  const { 
    meals, 
    loading, 
    error, 
    pagination,
    getMeals, 
    searchMeals,
    categories,
    clearError 
  } = useMeal();

  const [searchTerm, setSearchTerm] = useState('');
  const [filters, setFilters] = useState<Partial<MealSearchQuery>>({
    category: initialCategory,
    page: 1,
    limit: 12
  });
  const [showFilterPanel, setShowFilterPanel] = useState(false);

  useEffect(() => {
    loadMeals();
  }, [filters]);

  const loadMeals = async () => {
    if (searchTerm.trim()) {
      await searchMeals(searchTerm, filters);
    } else {
      await getMeals(filters);
    }
  };

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    clearError();
    setFilters(prev => ({ ...prev, page: 1 }));
    
    if (searchTerm.trim()) {
      await searchMeals(searchTerm, { ...filters, page: 1 });
    } else {
      await getMeals({ ...filters, page: 1 });
    }
  };

  const handleFilterChange = (key: keyof MealSearchQuery, value: any) => {
    setFilters(prev => ({
      ...prev,
      [key]: value,
      page: 1 // Reset page when filters change
    }));
  };

  const handlePageChange = (page: number) => {
    setFilters(prev => ({ ...prev, page }));
  };

  const clearFilters = () => {
    setFilters({
      page: 1,
      limit: 12
    });
    setSearchTerm('');
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'easy': return 'text-green-600 bg-green-100';
      case 'medium': return 'text-yellow-600 bg-yellow-100';
      case 'hard': return 'text-red-600 bg-red-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getCategoryIcon = (category: MealCategory) => {
    switch (category) {
      case MealCategory.BREAKFAST: return '🍳';
      case MealCategory.LUNCH: return '🥗';
      case MealCategory.DINNER: return '🍽️';
      case MealCategory.SNACK: return '🥨';
      case MealCategory.DESSERT: return '🍰';
      case MealCategory.DRINK: return '🥤';
      default: return '🍴';
    }
  };

  if (error) {
    return (
      <div className="p-6 bg-red-50 border border-red-200 rounded-lg">
        <h3 className="text-lg font-medium text-red-800 mb-2">Error Loading Meals</h3>
        <p className="text-red-600 mb-4">{error}</p>
        <Button onClick={() => { clearError(); loadMeals(); }}>
          Try Again
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Meals</h2>
          <p className="text-gray-600">
            {pagination ? `${pagination.total} meals found` : 'Browse our meal collection'}
          </p>
        </div>
        
        {showFilters && (
          <Button
            variant="outline"
            onClick={() => setShowFilterPanel(!showFilterPanel)}
            className="mt-4 sm:mt-0"
          >
            <Filter className="h-4 w-4 mr-2" />
            {showFilterPanel ? 'Hide Filters' : 'Show Filters'}
          </Button>
        )}
      </div>

      {/* Search Bar */}
      {showSearch && (
        <form onSubmit={handleSearch} className="flex space-x-2">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search meals by name, description, or tags..."
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <Button type="submit" disabled={loading}>
            Search
          </Button>
        </form>
      )}

      {/* Filter Panel */}
      {showFilters && showFilterPanel && (
        <div className="p-6 bg-gray-50 border border-gray-200 rounded-lg">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Category Filter */}
            <FormField label="Category">
              <select
                value={filters.category || ''}
                onChange={(e) => handleFilterChange('category', e.target.value || undefined)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">All Categories</option>
                {categories.map(category => (
                  <option key={category} value={category}>
                    {getCategoryIcon(category)} {category.charAt(0).toUpperCase() + category.slice(1).replace('_', ' ')}
                  </option>
                ))}
              </select>
            </FormField>

            {/* Difficulty Filter */}
            <FormField label="Difficulty">
              <select
                value={filters.difficulty || ''}
                onChange={(e) => handleFilterChange('difficulty', e.target.value || undefined)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">All Difficulties</option>
                <option value="easy">Easy</option>
                <option value="medium">Medium</option>
                <option value="hard">Hard</option>
              </select>
            </FormField>

            {/* Cuisine Filter */}
            <FormField label="Cuisine">
              <input
                type="text"
                value={filters.cuisine || ''}
                onChange={(e) => handleFilterChange('cuisine', e.target.value || undefined)}
                placeholder="e.g., Italian, Mexican"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </FormField>

            {/* Max Prep Time */}
            <FormField label="Max Prep Time (min)">
              <input
                type="number"
                value={filters.prepTimeMax || ''}
                onChange={(e) => handleFilterChange('prepTimeMax', e.target.value ? parseInt(e.target.value) : undefined)}
                placeholder="30"
                min="0"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </FormField>

            {/* Calorie Range */}
            <FormField label="Min Calories">
              <input
                type="number"
                value={filters.caloriesMin || ''}
                onChange={(e) => handleFilterChange('caloriesMin', e.target.value ? parseInt(e.target.value) : undefined)}
                placeholder="200"
                min="0"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </FormField>

            <FormField label="Max Calories">
              <input
                type="number"
                value={filters.caloriesMax || ''}
                onChange={(e) => handleFilterChange('caloriesMax', e.target.value ? parseInt(e.target.value) : undefined)}
                placeholder="800"
                min="0"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </FormField>

            {/* Diet Type */}
            <FormField label="Diet Type">
              <select
                value={filters.dietType || ''}
                onChange={(e) => handleFilterChange('dietType', e.target.value || undefined)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">All Diets</option>
                <option value="vegetarian">Vegetarian</option>
                <option value="vegan">Vegan</option>
                <option value="keto">Keto</option>
                <option value="paleo">Paleo</option>
                <option value="mediterranean">Mediterranean</option>
              </select>
            </FormField>

            {/* Clear Filters */}
            <div className="flex items-end">
              <Button
                type="button"
                variant="outline"
                onClick={clearFilters}
                className="w-full"
              >
                Clear All
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Loading State */}
      {loading && (
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          <span className="ml-2 text-gray-600">Loading meals...</span>
        </div>
      )}

      {/* Meals Grid */}
      {!loading && meals.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {meals.map((meal) => (
            <MealCard
              key={meal.id}
              meal={meal}
              onClick={() => onMealSelect?.(meal)}
            />
          ))}
        </div>
      )}

      {/* Empty State */}
      {!loading && meals.length === 0 && (
        <div className="text-center py-12">
          <ChefHat className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No meals found</h3>
          <p className="text-gray-600 mb-4">
            {searchTerm || Object.keys(filters).length > 2
              ? 'Try adjusting your search or filters'
              : 'No meals available at the moment'}
          </p>
          {(searchTerm || Object.keys(filters).length > 2) && (
            <Button onClick={clearFilters}>
              Clear Search & Filters
            </Button>
          )}
        </div>
      )}

      {/* Pagination */}
      {pagination && pagination.pages > 1 && (
        <div className="flex items-center justify-between">
          <div className="text-sm text-gray-700">
            Showing {((pagination.page - 1) * pagination.limit) + 1} to{' '}
            {Math.min(pagination.page * pagination.limit, pagination.total)} of{' '}
            {pagination.total} results
          </div>
          
          <div className="flex space-x-2">
            <Button
              variant="outline"
              onClick={() => handlePageChange(pagination.page - 1)}
              disabled={!pagination.hasPrev}
            >
              Previous
            </Button>
            
            {/* Page numbers */}
            {Array.from({ length: Math.min(5, pagination.pages) }, (_, i) => {
              const pageNum = Math.max(1, pagination.page - 2) + i;
              if (pageNum > pagination.pages) return null;
              
              return (
                <Button
                  key={pageNum}
                  variant={pageNum === pagination.page ? 'primary' : 'outline'}
                  onClick={() => handlePageChange(pageNum)}
                  className="min-w-[2.5rem]"
                >
                  {pageNum}
                </Button>
              );
            })}
            
            <Button
              variant="outline"
              onClick={() => handlePageChange(pagination.page + 1)}
              disabled={!pagination.hasNext}
            >
              Next
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};

export default MealList;
