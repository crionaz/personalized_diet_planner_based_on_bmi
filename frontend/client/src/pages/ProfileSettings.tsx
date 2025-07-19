import React, { useState, useEffect } from 'react';
import { useAuth } from '../hooks/useAuth';
import { userService } from '../services/userService';

interface HealthMetricsFormData {
  height: string;
  weight: string;
  activityLevel: string;
  targetWeight: string;
  weeklyWeightLossGoal: string;
}

interface DietaryPreferencesFormData {
  dietType: string;
  allergies: string;
  excludedFoods: string;
  mealFrequency: string;
}

interface GoalsFormData {
  type: string;
  targetDate: string;
  notes: string;
}

export const ProfileSettings: React.FC = () => {
  const { user, updateProfile } = useAuth();
  const [activeTab, setActiveTab] = useState('health');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  // Health Metrics Form
  const [healthMetrics, setHealthMetrics] = useState<HealthMetricsFormData>({
    height: '',
    weight: '',
    activityLevel: 'sedentary',
    targetWeight: '',
    weeklyWeightLossGoal: '0.5',
  });

  // Dietary Preferences Form
  const [dietaryPreferences, setDietaryPreferences] = useState<DietaryPreferencesFormData>({
    dietType: 'regular',
    allergies: '',
    excludedFoods: '',
    mealFrequency: '3',
  });

  // Goals Form
  const [goals, setGoals] = useState<GoalsFormData>({
    type: 'maintenance',
    targetDate: '',
    notes: '',
  });

  // Load user data
  useEffect(() => {
    if (user) {
      setHealthMetrics({
        height: user.healthMetrics?.height?.toString() || '',
        weight: user.healthMetrics?.weight?.toString() || '',
        activityLevel: user.healthMetrics?.activityLevel || 'sedentary',
        targetWeight: user.healthMetrics?.targetWeight?.toString() || '',
        weeklyWeightLossGoal: user.healthMetrics?.weeklyWeightLossGoal?.toString() || '0.5',
      });

      setDietaryPreferences({
        dietType: user.dietaryPreferences?.dietType || 'regular',
        allergies: user.dietaryPreferences?.allergies?.join(', ') || '',
        excludedFoods: user.dietaryPreferences?.excludedFoods?.join(', ') || '',
        mealFrequency: user.dietaryPreferences?.mealFrequency?.toString() || '3',
      });

      setGoals({
        type: user.goals?.type || 'maintenance',
        targetDate: user.goals?.targetDate ? new Date(user.goals.targetDate).toISOString().split('T')[0] : '',
        notes: user.goals?.notes || '',
      });
    }
  }, [user]);

  const clearMessages = () => {
    setError(null);
    setSuccess(null);
  };

  const handleHealthMetricsSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    clearMessages();

    try {
      const data = {
        height: healthMetrics.height ? parseFloat(healthMetrics.height) : undefined,
        weight: healthMetrics.weight ? parseFloat(healthMetrics.weight) : undefined,
        activityLevel: healthMetrics.activityLevel as any,
        targetWeight: healthMetrics.targetWeight ? parseFloat(healthMetrics.targetWeight) : undefined,
        weeklyWeightLossGoal: parseFloat(healthMetrics.weeklyWeightLossGoal),
      };

      await userService.updateHealthMetrics(data);
      setSuccess('Health metrics updated successfully!');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update health metrics');
    } finally {
      setLoading(false);
    }
  };

  const handleDietaryPreferencesSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    clearMessages();

    try {
      const data = {
        dietType: dietaryPreferences.dietType as any,
        allergies: dietaryPreferences.allergies.split(',').map(item => item.trim()).filter(Boolean),
        excludedFoods: dietaryPreferences.excludedFoods.split(',').map(item => item.trim()).filter(Boolean),
        mealFrequency: parseInt(dietaryPreferences.mealFrequency),
      };

      await userService.updateDietaryPreferences(data);
      setSuccess('Dietary preferences updated successfully!');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update dietary preferences');
    } finally {
      setLoading(false);
    }
  };

  const handleGoalsSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    clearMessages();

    try {
      const data = {
        type: goals.type as any,
        targetDate: goals.targetDate || undefined,
        notes: goals.notes,
      };

      await userService.updateGoals(data);
      setSuccess('Goals updated successfully!');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update goals');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Profile Settings</h1>
        <p className="text-gray-600">Manage your health metrics and dietary preferences</p>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200 mb-8">
        <nav className="-mb-px flex space-x-8">
          {[
            { id: 'health', label: 'Health Metrics' },
            { id: 'diet', label: 'Dietary Preferences' },
            { id: 'goals', label: 'Goals' },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === tab.id
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </nav>
      </div>

      {/* Messages */}
      {error && (
        <div className="mb-6 bg-red-50 border border-red-200 rounded-md p-4">
          <p className="text-sm text-red-800">{error}</p>
        </div>
      )}

      {success && (
        <div className="mb-6 bg-green-50 border border-green-200 rounded-md p-4">
          <p className="text-sm text-green-800">{success}</p>
        </div>
      )}

      {/* Tab Content */}
      {activeTab === 'health' && (
        <form onSubmit={handleHealthMetricsSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Height (cm)
              </label>
              <input
                type="number"
                min="100"
                max="250"
                step="0.1"
                value={healthMetrics.height}
                onChange={(e) => setHealthMetrics(prev => ({ ...prev, height: e.target.value }))}
                className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                placeholder="Enter your height"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Current Weight (kg)
              </label>
              <input
                type="number"
                min="20"
                max="500"
                step="0.1"
                value={healthMetrics.weight}
                onChange={(e) => setHealthMetrics(prev => ({ ...prev, weight: e.target.value }))}
                className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                placeholder="Enter your weight"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Activity Level
              </label>
              <select
                value={healthMetrics.activityLevel}
                onChange={(e) => setHealthMetrics(prev => ({ ...prev, activityLevel: e.target.value }))}
                className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              >
                <option value="sedentary">Sedentary (little or no exercise)</option>
                <option value="lightly_active">Lightly Active (light exercise 1-3 days/week)</option>
                <option value="moderately_active">Moderately Active (moderate exercise 3-5 days/week)</option>
                <option value="very_active">Very Active (hard exercise 6-7 days/week)</option>
                <option value="extremely_active">Extremely Active (very hard exercise, 2x/day)</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Target Weight (kg)
              </label>
              <input
                type="number"
                min="20"
                max="500"
                step="0.1"
                value={healthMetrics.targetWeight}
                onChange={(e) => setHealthMetrics(prev => ({ ...prev, targetWeight: e.target.value }))}
                className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                placeholder="Enter your target weight"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Weekly Weight Loss Goal (kg)
            </label>
            <select
              value={healthMetrics.weeklyWeightLossGoal}
              onChange={(e) => setHealthMetrics(prev => ({ ...prev, weeklyWeightLossGoal: e.target.value }))}
              className="block w-full max-w-xs rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            >
              <option value="0.25">0.25 kg/week (Slow)</option>
              <option value="0.5">0.5 kg/week (Moderate)</option>
              <option value="0.75">0.75 kg/week (Fast)</option>
              <option value="1.0">1.0 kg/week (Very Fast)</option>
            </select>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="bg-blue-600 text-white px-6 py-2 rounded-md hover:bg-blue-700 disabled:opacity-50"
          >
            {loading ? 'Updating...' : 'Update Health Metrics'}
          </button>
        </form>
      )}

      {activeTab === 'diet' && (
        <form onSubmit={handleDietaryPreferencesSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Diet Type
              </label>
              <select
                value={dietaryPreferences.dietType}
                onChange={(e) => setDietaryPreferences(prev => ({ ...prev, dietType: e.target.value }))}
                className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              >
                <option value="regular">Regular</option>
                <option value="vegetarian">Vegetarian</option>
                <option value="vegan">Vegan</option>
                <option value="keto">Ketogenic</option>
                <option value="paleo">Paleo</option>
                <option value="mediterranean">Mediterranean</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Meal Frequency (per day)
              </label>
              <select
                value={dietaryPreferences.mealFrequency}
                onChange={(e) => setDietaryPreferences(prev => ({ ...prev, mealFrequency: e.target.value }))}
                className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              >
                <option value="3">3 meals</option>
                <option value="4">4 meals</option>
                <option value="5">5 meals</option>
                <option value="6">6 meals</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Allergies (comma-separated)
            </label>
            <input
              type="text"
              value={dietaryPreferences.allergies}
              onChange={(e) => setDietaryPreferences(prev => ({ ...prev, allergies: e.target.value }))}
              className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              placeholder="e.g., nuts, dairy, gluten"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Foods to Exclude (comma-separated)
            </label>
            <input
              type="text"
              value={dietaryPreferences.excludedFoods}
              onChange={(e) => setDietaryPreferences(prev => ({ ...prev, excludedFoods: e.target.value }))}
              className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              placeholder="e.g., spicy food, seafood, broccoli"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="bg-blue-600 text-white px-6 py-2 rounded-md hover:bg-blue-700 disabled:opacity-50"
          >
            {loading ? 'Updating...' : 'Update Dietary Preferences'}
          </button>
        </form>
      )}

      {activeTab === 'goals' && (
        <form onSubmit={handleGoalsSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Goal Type
              </label>
              <select
                value={goals.type}
                onChange={(e) => setGoals(prev => ({ ...prev, type: e.target.value }))}
                className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              >
                <option value="weight_loss">Weight Loss</option>
                <option value="weight_gain">Weight Gain</option>
                <option value="maintenance">Weight Maintenance</option>
                <option value="muscle_gain">Muscle Gain</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Target Date
              </label>
              <input
                type="date"
                value={goals.targetDate}
                onChange={(e) => setGoals(prev => ({ ...prev, targetDate: e.target.value }))}
                className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Notes
            </label>
            <textarea
              rows={4}
              value={goals.notes}
              onChange={(e) => setGoals(prev => ({ ...prev, notes: e.target.value }))}
              className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              placeholder="Additional notes about your goals..."
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="bg-blue-600 text-white px-6 py-2 rounded-md hover:bg-blue-700 disabled:opacity-50"
          >
            {loading ? 'Updating...' : 'Update Goals'}
          </button>
        </form>
      )}
    </div>
  );
};
