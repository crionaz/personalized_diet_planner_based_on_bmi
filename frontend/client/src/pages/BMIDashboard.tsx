import React, { useEffect } from 'react';
import { useBMI } from '../hooks/useBMI';
import { BMICalculator } from '../components/bmi/BMICalculator';

export const BMIDashboard: React.FC = () => {
  const { 
    loading, 
    error, 
    bmiRecords, 
    latestBMI, 
    bmiStats, 
    getBMIHistory, 
    getLatestBMI, 
    getBMIStats,
    clearError 
  } = useBMI();

  useEffect(() => {
    // Load initial data
    const loadData = async () => {
      try {
        await Promise.all([
          getBMIHistory({ limit: 5 }),
          getLatestBMI(),
          getBMIStats(),
        ]);
      } catch (error) {
        // Errors are handled by the hook
      }
    };

    loadData();
  }, [getBMIHistory, getLatestBMI, getBMIStats]);

  const handleRecordSuccess = () => {
    // Refresh data after successful record
    getBMIHistory({ limit: 5 });
    getBMIStats();
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">BMI Tracker</h1>
        <p className="text-gray-600">Monitor your Body Mass Index and track your progress</p>
      </div>

      {error && (
        <div className="mb-6 bg-red-50 border border-red-200 rounded-md p-4">
          <div className="flex">
            <div className="ml-3">
              <p className="text-sm text-red-800">{error}</p>
              <button
                onClick={clearError}
                className="mt-2 text-sm text-red-600 hover:text-red-500"
              >
                Dismiss
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* BMI Calculator */}
        <div>
          <BMICalculator onRecordSuccess={handleRecordSuccess} />
        </div>

        {/* BMI Stats & History */}
        <div className="space-y-6">
          {/* Latest BMI */}
          {latestBMI && (
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Latest BMI</h3>
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-2xl font-bold text-gray-900">{latestBMI.bmi}</div>
                  <div className="text-sm text-gray-500">
                    {new Date(latestBMI.date).toLocaleDateString()}
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-lg font-medium text-gray-900">
                    {latestBMI.category.charAt(0).toUpperCase() + latestBMI.category.slice(1)}
                  </div>
                  <div className="text-sm text-gray-500">
                    {latestBMI.weight} kg | {latestBMI.height} cm
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* BMI Statistics */}
          {bmiStats && (
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Statistics</h3>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <div className="text-2xl font-bold text-gray-900">{bmiStats.totalRecords}</div>
                  <div className="text-sm text-gray-500">Total Records</div>
                </div>
                <div>
                  <div className="text-2xl font-bold text-gray-900">
                    {bmiStats.trend === 'increasing' ? '↗️' : bmiStats.trend === 'decreasing' ? '↘️' : '➡️'}
                  </div>
                  <div className="text-sm text-gray-500">
                    {bmiStats.trend.charAt(0).toUpperCase() + bmiStats.trend.slice(1)}
                  </div>
                </div>
              </div>
              {bmiStats.weightChange !== 0 && (
                <div className="mt-4 text-sm text-gray-600">
                  Weight change: {bmiStats.weightChange > 0 ? '+' : ''}{bmiStats.weightChange} kg
                </div>
              )}
            </div>
          )}

          {/* Recent History */}
          {bmiRecords.length > 0 && (
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Recent Records</h3>
              <div className="space-y-3">
                {bmiRecords.slice(0, 5).map((record) => (
                  <div key={record.id} className="flex items-center justify-between py-2 border-b border-gray-100 last:border-b-0">
                    <div>
                      <div className="font-medium text-gray-900">{record.bmi}</div>
                      <div className="text-sm text-gray-500">
                        {new Date(record.date).toLocaleDateString()}
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-sm font-medium text-gray-900">{record.category}</div>
                      <div className="text-sm text-gray-500">
                        {record.weight} kg
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {loading && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6">
            <div className="flex items-center space-x-3">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
              <span className="text-gray-900">Loading...</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
