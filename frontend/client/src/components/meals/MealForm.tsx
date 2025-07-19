import React, { useState } from 'react';
import { Plus, Minus, Save, X } from 'lucide-react';
import { CreateMealRequest, MealCategory, MealIngredientFormData } from '../../types';
import { useMeal } from '../../hooks/useMeal';
import Button  from '../ui/Button';
import FormField from '../ui/Input';
import Modal  from '../ui/Modal';

interface MealFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: (meal: any) => void;
  initialData?: Partial<CreateMealRequest>;
}

export const MealForm: React.FC<MealFormProps> = ({
  isOpen,
  onClose,
  onSuccess,
  initialData
}) => {
  const { createMeal, loading, error, clearError } = useMeal();

  const [formData, setFormData] = useState<CreateMealRequest>({
    name: initialData?.name || '',
    description: initialData?.description || '',
    category: initialData?.category || MealCategory.LUNCH,
    cuisine: initialData?.cuisine || '',
    prepTime: initialData?.prepTime || 15,
    cookTime: initialData?.cookTime || 30,
    servings: initialData?.servings || 4,
    difficulty: initialData?.difficulty || 'medium',
    ingredients: initialData?.ingredients || [{
      name: '',
      amount: 0,
      unit: '',
      calories: 0,
      protein: 0,
      carbs: 0,
      fat: 0
    }],
    instructions: initialData?.instructions || [''],
    tags: initialData?.tags || [],
    image: initialData?.image || '',
    isPublic: initialData?.isPublic || false
  });

  const [tagInput, setTagInput] = useState('');

  const handleInputChange = (field: keyof CreateMealRequest, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleIngredientChange = (index: number, field: keyof MealIngredientFormData, value: any) => {
    const newIngredients = [...formData.ingredients];
    newIngredients[index] = { ...newIngredients[index], [field]: value };
    setFormData(prev => ({ ...prev, ingredients: newIngredients }));
  };

  const addIngredient = () => {
    setFormData(prev => ({
      ...prev,
      ingredients: [...prev.ingredients, {
        name: '',
        amount: 0,
        unit: '',
        calories: 0,
        protein: 0,
        carbs: 0,
        fat: 0
      }]
    }));
  };

  const removeIngredient = (index: number) => {
    if (formData.ingredients.length > 1) {
      setFormData(prev => ({
        ...prev,
        ingredients: prev.ingredients.filter((_, i) => i !== index)
      }));
    }
  };

  const handleInstructionChange = (index: number, value: string) => {
    const newInstructions = [...formData.instructions];
    newInstructions[index] = value;
    setFormData(prev => ({ ...prev, instructions: newInstructions }));
  };

  const addInstruction = () => {
    setFormData(prev => ({
      ...prev,
      instructions: [...prev.instructions, '']
    }));
  };

  const removeInstruction = (index: number) => {
    if (formData.instructions.length > 1) {
      setFormData(prev => ({
        ...prev,
        instructions: prev.instructions.filter((_, i) => i !== index)
      }));
    }
  };

  const addTag = () => {
    if (tagInput.trim() && !formData.tags.includes(tagInput.trim())) {
      setFormData(prev => ({
        ...prev,
        tags: [...prev.tags, tagInput.trim()]
      }));
      setTagInput('');
    }
  };

  const removeTag = (tagToRemove: string) => {
    setFormData(prev => ({
      ...prev,
      tags: prev.tags.filter(tag => tag !== tagToRemove)
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    clearError();

    try {
      const meal = await createMeal(formData);
      if (meal) {
        onSuccess?.(meal);
        onClose();
        // Reset form
        setFormData({
          name: '',
          description: '',
          category: MealCategory.LUNCH,
          cuisine: '',
          prepTime: 15,
          cookTime: 30,
          servings: 4,
          difficulty: 'medium',
          ingredients: [{
            name: '',
            amount: 0,
            unit: '',
            calories: 0,
            protein: 0,
            carbs: 0,
            fat: 0
          }],
          instructions: [''],
          tags: [],
          image: '',
          isPublic: false
        });
      }
    } catch (err) {
      console.error('Failed to create meal:', err);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Create New Meal">
      <form onSubmit={handleSubmit} className="space-y-6">
        {error && (
          <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-red-600 text-sm">{error}</p>
          </div>
        )}

        {/* Basic Information */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormField label="Meal Name" required>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => handleInputChange('name', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Enter meal name"
              required
            />
          </FormField>

          <FormField label="Category" required>
            <select
              value={formData.category}
              onChange={(e) => handleInputChange('category', e.target.value as MealCategory)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              {Object.values(MealCategory).map(category => (
                <option key={category} value={category}>
                  {category.charAt(0).toUpperCase() + category.slice(1).replace('_', ' ')}
                </option>
              ))}
            </select>
          </FormField>

          <FormField label="Cuisine">
            <input
              type="text"
              value={formData.cuisine}
              onChange={(e) => handleInputChange('cuisine', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="e.g., Italian, Mexican, Asian"
            />
          </FormField>

          <FormField label="Difficulty" required>
            <select
              value={formData.difficulty}
              onChange={(e) => handleInputChange('difficulty', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="easy">Easy</option>
              <option value="medium">Medium</option>
              <option value="hard">Hard</option>
            </select>
          </FormField>

          <FormField label="Prep Time (minutes)" required>
            <input
              type="number"
              value={formData.prepTime}
              onChange={(e) => handleInputChange('prepTime', parseInt(e.target.value))}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              min="0"
              required
            />
          </FormField>

          <FormField label="Cook Time (minutes)" required>
            <input
              type="number"
              value={formData.cookTime}
              onChange={(e) => handleInputChange('cookTime', parseInt(e.target.value))}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              min="0"
              required
            />
          </FormField>

          <FormField label="Servings" required>
            <input
              type="number"
              value={formData.servings}
              onChange={(e) => handleInputChange('servings', parseInt(e.target.value))}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              min="1"
              max="20"
              required
            />
          </FormField>
        </div>

        <FormField label="Description">
          <textarea
            value={formData.description}
            onChange={(e) => handleInputChange('description', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            rows={3}
            placeholder="Describe your meal..."
          />
        </FormField>

        {/* Ingredients */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-medium text-gray-900">Ingredients</h3>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={addIngredient}
            >
              <Plus className="h-4 w-4 mr-1" />
              Add Ingredient
            </Button>
          </div>

          <div className="space-y-4">
            {formData.ingredients.map((ingredient, index) => (
              <div key={index} className="p-4 border border-gray-200 rounded-lg">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-gray-700">
                    Ingredient {index + 1}
                  </span>
                  {formData.ingredients.length > 1 && (
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => removeIngredient(index)}
                    >
                      <Minus className="h-4 w-4" />
                    </Button>
                  )}
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                  <input
                    type="text"
                    placeholder="Name"
                    value={ingredient.name}
                    onChange={(e) => handleIngredientChange(index, 'name', e.target.value)}
                    className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  />
                  <input
                    type="number"
                    placeholder="Amount"
                    value={ingredient.amount}
                    onChange={(e) => handleIngredientChange(index, 'amount', parseFloat(e.target.value))}
                    className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    min="0"
                    step="0.1"
                    required
                  />
                  <input
                    type="text"
                    placeholder="Unit"
                    value={ingredient.unit}
                    onChange={(e) => handleIngredientChange(index, 'unit', e.target.value)}
                    className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  />
                  <input
                    type="number"
                    placeholder="Calories"
                    value={ingredient.calories}
                    onChange={(e) => handleIngredientChange(index, 'calories', parseFloat(e.target.value))}
                    className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    min="0"
                    required
                  />
                </div>

                <div className="grid grid-cols-3 gap-2 mt-2">
                  <input
                    type="number"
                    placeholder="Protein (g)"
                    value={ingredient.protein}
                    onChange={(e) => handleIngredientChange(index, 'protein', parseFloat(e.target.value))}
                    className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    min="0"
                    step="0.1"
                    required
                  />
                  <input
                    type="number"
                    placeholder="Carbs (g)"
                    value={ingredient.carbs}
                    onChange={(e) => handleIngredientChange(index, 'carbs', parseFloat(e.target.value))}
                    className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    min="0"
                    step="0.1"
                    required
                  />
                  <input
                    type="number"
                    placeholder="Fat (g)"
                    value={ingredient.fat}
                    onChange={(e) => handleIngredientChange(index, 'fat', parseFloat(e.target.value))}
                    className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    min="0"
                    step="0.1"
                    required
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Instructions */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-medium text-gray-900">Instructions</h3>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={addInstruction}
            >
              <Plus className="h-4 w-4 mr-1" />
              Add Step
            </Button>
          </div>

          <div className="space-y-2">
            {formData.instructions.map((instruction, index) => (
              <div key={index} className="flex items-start space-x-2">
                <span className="text-sm font-medium text-gray-500 mt-2 min-w-[2rem]">
                  {index + 1}.
                </span>
                <textarea
                  value={instruction}
                  onChange={(e) => handleInstructionChange(index, e.target.value)}
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  rows={2}
                  placeholder={`Step ${index + 1}...`}
                  required
                />
                {formData.instructions.length > 1 && (
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => removeInstruction(index)}
                    className="mt-1"
                  >
                    <X className="h-4 w-4" />
                  </Button>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Tags */}
        <div>
          <FormField label="Tags">
            <div className="space-y-2">
              <div className="flex space-x-2">
                <input
                  type="text"
                  value={tagInput}
                  onChange={(e) => setTagInput(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addTag())}
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Add a tag and press Enter"
                />
                <Button
                  type="button"
                  variant="outline"
                  onClick={addTag}
                >
                  Add
                </Button>
              </div>
              
              {formData.tags.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {formData.tags.map((tag, index) => (
                    <span
                      key={index}
                      className="inline-flex items-center px-2 py-1 bg-blue-100 text-blue-800 text-sm rounded-md"
                    >
                      {tag}
                      <button
                        type="button"
                        onClick={() => removeTag(tag)}
                        className="ml-1 text-blue-600 hover:text-blue-800"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </span>
                  ))}
                </div>
              )}
            </div>
          </FormField>
        </div>

        {/* Image URL */}
        <FormField label="Image URL">
          <input
            type="url"
            value={formData.image}
            onChange={(e) => handleInputChange('image', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="https://example.com/image.jpg"
          />
        </FormField>

        {/* Public checkbox */}
        <div className="flex items-center">
          <input
            type="checkbox"
            id="isPublic"
            checked={formData.isPublic}
            onChange={(e) => handleInputChange('isPublic', e.target.checked)}
            className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
          />
          <label htmlFor="isPublic" className="ml-2 text-sm text-gray-700">
            Make this meal public (others can see and use it)
          </label>
        </div>

        {/* Submit buttons */}
        <div className="flex justify-end space-x-3 pt-4 border-t">
          <Button
            type="button"
            variant="outline"
            onClick={onClose}
            disabled={loading}
          >
            Cancel
          </Button>
          <Button
            type="submit"
            loading={loading}
          >
            <Save className="h-4 w-4 mr-2" />
            Create Meal
          </Button>
        </div>
      </form>
    </Modal>
  );
};

export default MealForm;
