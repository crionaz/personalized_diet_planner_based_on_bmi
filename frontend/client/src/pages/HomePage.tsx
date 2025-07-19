import React from 'react';
import { Link } from 'react-router-dom';
import { Button, Card, CardContent } from '../components/ui';
import { Layout } from '../components/layout';
import { ThemeToggle } from '../components/theme/ThemeComponents';

export const HomePage: React.FC = () => {
  return (
    <>
      {/* Hero Section */}
      <section className="bg-gradient-to-r from-green-600 to-green-800 dark:from-green-700 dark:to-green-900 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
          <div className="text-center">
            <h1 className="text-4xl md:text-6xl font-bold mb-6">
              Your Personalized
              <span className="block text-green-200 dark:text-green-300">Diet Journey Starts Here</span>
            </h1>
            <p className="text-xl md:text-2xl mb-8 text-green-100 dark:text-green-200 max-w-3xl mx-auto">
              Transform your health with AI-powered personalized diet plans tailored to your BMI, 
              lifestyle, and goals. Start your journey to a healthier you today.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link to="/register">
                <Button
                  variant="secondary"
                  size="lg"
                  className="bg-white dark:bg-gray-100 text-green-600 dark:text-green-700 hover:bg-gray-100 dark:hover:bg-gray-200 w-full sm:w-auto"
                >
                  Start Your Diet Plan
                </Button>
              </Link>
              <Link to="/bmi-calculator">
                <Button
                  variant="outline"
                  size="lg"
                  className="border-white dark:border-gray-200 text-white dark:text-gray-200 hover:bg-white dark:hover:bg-gray-200 hover:text-green-600 dark:hover:text-green-700 w-full sm:w-auto"
                >
                  Calculate BMI
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-24 bg-white dark:bg-dark-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-4">
              Comprehensive Diet Planning Features
            </h2>
            <p className="text-xl text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
              Everything you need to achieve your health goals with personalized nutrition guidance
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {/* Feature 1 - BMI Calculator */}
            <Card>
              <CardContent>
                <div className="text-green-600 mb-4">
                  <svg className="h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                  </svg>
                </div>
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">
                  Smart BMI Calculator
                </h3>
                <p className="text-gray-600 dark:text-gray-400">
                  Calculate your BMI instantly and understand your health category. 
                  Get personalized recommendations based on your results.
                </p>
              </CardContent>
            </Card>

            {/* Feature 2 - Personalized Plans */}
            <Card>
              <CardContent>
                <div className="text-green-600 mb-4">
                  <svg className="h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                </div>
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">
                  Personalized Diet Plans
                </h3>
                <p className="text-gray-600 dark:text-gray-400">
                  Get custom meal plans tailored to your age, weight, height, activity level, 
                  and health goals for optimal results.
                </p>
              </CardContent>
            </Card>

            {/* Feature 3 - Goal Tracking */}
            <Card>
              <CardContent>
                <div className="text-green-600 mb-4">
                  <svg className="h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                  </svg>
                </div>
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">
                  Progress Tracking
                </h3>
                <p className="text-gray-600 dark:text-gray-400">
                  Monitor your progress with detailed analytics. Track weight changes, 
                  calorie intake, and goal achievements over time.
                </p>
              </CardContent>
            </Card>

            {/* Feature 4 - Nutritional Info */}
            <Card>
              <CardContent>
                <div className="text-green-600 mb-4">
                  <svg className="h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">
                  Detailed Nutrition Info
                </h3>
                <p className="text-gray-600 dark:text-gray-400">
                  Access comprehensive nutritional information for every meal. 
                  Understand calories, macros, and micronutrients.
                </p>
              </CardContent>
            </Card>

            {/* Feature 5 - Calorie Tracking */}
            <Card>
              <CardContent>
                <div className="text-green-600 mb-4">
                  <svg className="h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">
                  Daily Calorie Tracking
                </h3>
                <p className="text-gray-600 dark:text-gray-400">
                  Keep track of your daily calorie intake with easy logging. 
                  Stay within your target range for optimal results.
                </p>
              </CardContent>
            </Card>

            {/* Feature 6 - Dashboard */}
            <Card>
              <CardContent>
                <div className="text-green-600 mb-4">
                  <svg className="h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 5a1 1 0 011-1h14a1 1 0 011 1v2a1 1 0 01-1 1H5a1 1 0 01-1-1V5zM4 13a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H5a1 1 0 01-1-1v-6zM16 13a1 1 0 011-1h2a1 1 0 011 1v6a1 1 0 01-1 1h-2a1 1 0 01-1-1v-6z" />
                  </svg>
                </div>
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">
                  Personal Dashboard
                </h3>
                <p className="text-gray-600 dark:text-gray-400">
                  Manage your profile, view progress, and adjust your diet plan 
                  from one comprehensive dashboard.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Health Goals Section */}
      <section className="py-24 bg-gray-50 dark:bg-dark-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-4">
              Support for All Health Goals
            </h2>
            <p className="text-xl text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
              Whether you want to lose weight, maintain, or gain - we have you covered
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              { 
                name: 'Weight Loss', 
                icon: '📉',
                description: 'Sustainable weight loss plans with proper nutrition balance'
              },
              { 
                name: 'Weight Maintenance', 
                icon: '⚖️',
                description: 'Maintain your current weight with healthy eating habits'
              },
              { 
                name: 'Weight Gain', 
                icon: '📈',
                description: 'Healthy weight gain with muscle-building nutrition plans'
              },
            ].map((goal) => (
              <Card key={goal.name}>
                <CardContent className="text-center">
                  <div className="text-6xl mb-4">{goal.icon}</div>
                  <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">
                    {goal.name}
                  </h3>
                  <p className="text-gray-600 dark:text-gray-400">
                    {goal.description}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 bg-green-600">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
            Ready to Transform Your Health?
          </h2>
          <p className="text-xl text-green-100 mb-8 max-w-2xl mx-auto">
            Join thousands of users who have achieved their health goals 
            with our personalized diet planning platform.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link to="/register">
              <Button
                size="lg"
                className="bg-white dark:bg-gray-100 text-green-600 dark:text-green-700 hover:bg-gray-100 dark:hover:bg-gray-200 w-full sm:w-auto"
              >
                Create Your Diet Plan
              </Button>
            </Link>
            <Link to="/dashboard">
              <Button
                variant="outline"
                size="lg"
                className="border-white dark:border-gray-200 text-white dark:text-gray-200 hover:bg-white dark:hover:bg-gray-200 hover:text-green-600 dark:hover:text-green-700 w-full sm:w-auto"
              >
                View Demo Dashboard
              </Button>
            </Link>
        </div>
        </div>
      </section>
    </>
  );
};