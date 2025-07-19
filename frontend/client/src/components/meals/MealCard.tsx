import React from 'react';
import { Clock, Users, ChefHat } from 'lucide-react';
import { Meal, MealCategory } from '../../types';

interface MealCardProps {
  meal: Meal;
  onClick?: (meal: Meal) => void;
  showCreator?: boolean;
}

export const MealCard: React.FC<MealCardProps> = ({
  meal,
  onClick,
  showCreator = true
}) => {
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

  const formatTime = (minutes: number) => {
    if (minutes >= 60) {
      const hours = Math.floor(minutes / 60);
      const remainingMinutes = minutes % 60;
      return remainingMinutes > 0 ? `${hours}h ${remainingMinutes}m` : `${hours}h`;
    }
    return `${minutes}m`;
  };

  const totalTime = meal.prepTime + meal.cookTime;

  return (
    <div
      className={`bg-white rounded-lg shadow-md overflow-hidden transition-transform hover:scale-105 ${
        onClick ? 'cursor-pointer' : ''
      }`}
      onClick={() => onClick?.(meal)}
    >
      {/* Image */}
      {meal.image ? (
        <img
          src={meal.image}
          alt={meal.name}
          className="w-full h-48 object-cover"
        />
      ) : (
        <div className="w-full h-48 bg-gray-200 flex items-center justify-center">
          <ChefHat className="h-12 w-12 text-gray-400" />
        </div>
      )}

      {/* Content */}
      <div className="p-4">
        {/* Header */}
        <div className="flex items-start justify-between mb-2">
          <h3 className="text-lg font-semibold text-gray-900 line-clamp-2">
            {meal.name}
          </h3>
          <span className="text-lg" title={meal.category}>
            {getCategoryIcon(meal.category)}
          </span>
        </div>

        {/* Description */}
        {meal.description && (
          <p className="text-gray-600 text-sm mb-3 line-clamp-2">
            {meal.description}
          </p>
        )}

        {/* Stats */}
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center space-x-4 text-sm text-gray-500">
            <div className="flex items-center">
              <Clock className="h-4 w-4 mr-1" />
              {formatTime(totalTime)}
            </div>
            <div className="flex items-center">
              <Users className="h-4 w-4 mr-1" />
              {meal.servings}
            </div>
          </div>
          
          <span
            className={`px-2 py-1 text-xs font-medium rounded-full ${getDifficultyColor(
              meal.difficulty
            )}`}
          >
            {meal.difficulty.charAt(0).toUpperCase() + meal.difficulty.slice(1)}
          </span>
        </div>

        {/* Nutrition */}
        <div className="flex items-center justify-between mb-3 text-sm">
          <div className="text-gray-600">
            <span className="font-medium">{meal.nutrition.calories}</span> cal
          </div>
          <div className="text-gray-600">
            P: {meal.nutrition.protein}g • C: {meal.nutrition.carbs}g • F: {meal.nutrition.fat}g
          </div>
        </div>

        {/* Tags */}
        {meal.tags.length > 0 && (
          <div className="flex flex-wrap gap-1 mb-3">
            {meal.tags.slice(0, 3).map((tag, index) => (
              <span
                key={index}
                className="px-2 py-1 bg-blue-100 text-blue-700 text-xs rounded-md"
              >
                {tag}
              </span>
            ))}
            {meal.tags.length > 3 && (
              <span className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded-md">
                +{meal.tags.length - 3} more
              </span>
            )}
          </div>
        )}

        {/* Footer */}
        <div className="flex items-center justify-between text-xs text-gray-500">
          {meal.cuisine && (
            <span className="font-medium">{meal.cuisine}</span>
          )}
          
          {showCreator && (
            <span>
              {meal.isPublic ? 'Public' : 'Private'}
            </span>
          )}
        </div>
      </div>
    </div>
  );
};

export default MealCard;
