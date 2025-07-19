import React, { useState } from 'react';
import { useBMI } from '../../hooks/useBMI';
import Card, { CardHeader, CardTitle } from '../ui/Card';
import Button  from '../ui/Button';
import Input  from '../ui/Input';
import { CardContent } from '../ui';

interface BMICalculatorProps {
  onRecordSuccess?: () => void;
}

export const BMICalculator: React.FC<BMICalculatorProps> = ({ onRecordSuccess }) => {
  const { 
    loading, 
    error, 
    bmiResult, 
    calculateBMI, 
    recordBMI, 
    clearError 
  } = useBMI();

  const [weight, setWeight] = useState('');
  const [height, setHeight] = useState('');
  const [bodyFat, setBodyFat] = useState('');
  const [muscleMass, setMuscleMass] = useState('');
  const [isRecording, setIsRecording] = useState(false);

  const handleCalculate = async (e: React.FormEvent) => {
    e.preventDefault();
    clearError();

    const weightNum = parseFloat(weight);
    const heightNum = parseFloat(height);

    if (!weightNum || !heightNum) {
      return;
    }

    try {
      await calculateBMI({
        weight: weightNum,
        height: heightNum,
      });
    } catch (error) {
      // Error is already handled in the hook
    }
  };

  const handleRecord = async () => {
    if (!bmiResult) return;

    setIsRecording(true);
    try {
      await recordBMI({
        weight: bmiResult.weight,
        height: bmiResult.height,
        bmi: bmiResult.bmi,
        category: bmiResult.category as 'underweight' | 'normal' | 'overweight' | 'obese',
        bodyFat: bodyFat ? parseFloat(bodyFat) : undefined,
        muscleMass: muscleMass ? parseFloat(muscleMass) : undefined,
      });
      onRecordSuccess?.();
    } catch (error) {
      // Error is already handled in the hook
    } finally {
      setIsRecording(false);
    }
  };

  const getBMIColor = (category: string) => {
    switch (category) {
      case 'underweight':
        return 'text-blue-600';
      case 'normal':
        return 'text-green-600';
      case 'overweight':
        return 'text-yellow-600';
      case 'obese':
        return 'text-red-600';
      default:
        return 'text-gray-600';
    }
  };

  const getBMIDescription = (category: string) => {
    switch (category) {
      case 'underweight':
        return 'Below normal weight';
      case 'normal':
        return 'Normal weight';
      case 'overweight':
        return 'Above normal weight';
      case 'obese':
        return 'Obese';
      default:
        return 'Unknown';
    }
  };

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader>
        <CardTitle className="text-center">BMI Calculator</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleCalculate} className="space-y-4">
          <div>
            <Input
              label="Weight (kg)"
              type="number"
              step="0.1"
              min="20"
              max="500"
              value={weight}
              onChange={(e) => setWeight(e.target.value)}
              placeholder="Enter your weight"
              required
            />
          </div>

          <div>
            <Input
              label="Height (cm)"
              type="number"
              step="0.1"
              min="100"
              max="250"
              value={height}
              onChange={(e) => setHeight(e.target.value)}
              placeholder="Enter your height"
              required
            />
          </div>

          <Button
            type="submit"
            disabled={loading || !weight || !height}
            className="w-full"
          >
            {loading ? 'Calculating...' : 'Calculate BMI'}
          </Button>

          {error && (
            <div className="text-red-600 text-sm text-center bg-red-50 p-2 rounded">
              {error}
            </div>
          )}

          {bmiResult && (
            <div className="mt-6 p-4 bg-gray-50 rounded-lg">
              <div className="text-center">
                <div className="text-3xl font-bold mb-2">
                  {bmiResult.bmi}
                </div>
                <div className={`text-lg font-semibold mb-1 ${getBMIColor(bmiResult.category)}`}>
                  {bmiResult.category.charAt(0).toUpperCase() + bmiResult.category.slice(1)}
                </div>
                <div className="text-sm text-gray-600 mb-4">
                  {getBMIDescription(bmiResult.category)}
                </div>

                {/* Optional additional measurements for recording */}
                <div className="space-y-3 mt-4">
                  <div>
                    <Input
                      label="Body Fat % (optional)"
                      type="number"
                      step="0.1"
                      min="3"
                      max="50"
                      value={bodyFat}
                      onChange={(e) => setBodyFat(e.target.value)}
                      placeholder="Body fat percentage"
                    />
                  </div>

                  <div>
                    <Input
                      label="Muscle Mass (kg, optional)"
                      type="number"
                      step="0.1"
                      min="10"
                      max="200"
                      value={muscleMass}
                      onChange={(e) => setMuscleMass(e.target.value)}
                      placeholder="Muscle mass"
                    />
                  </div>

                  <Button
                    onClick={handleRecord}
                    disabled={isRecording}
                    variant="outline"
                    className="w-full"
                  >
                    {isRecording ? 'Recording...' : 'Save Record'}
                  </Button>
                </div>
              </div>
            </div>
          )}
        </form>
      </CardContent>
    </Card>
  );
};
