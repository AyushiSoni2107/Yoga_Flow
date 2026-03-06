import { useEffect, useState } from 'react';
import { apiRequest, PricingPlan } from '../lib/api';
import { Check } from 'lucide-react';
import { Link } from '../components/Link';

export function Pricing() {
  const [plans, setPlans] = useState<PricingPlan[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchPlans();
  }, []);

  const fetchPlans = async () => {
    try {
      const data = await apiRequest<PricingPlan[]>('/pricing');
      setPlans(data || []);
    } catch (error) {
      console.error('Error fetching pricing plans:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block h-12 w-12 animate-spin rounded-full border-4 border-solid border-violet-600 border-r-transparent"></div>
          <p className="mt-4 text-gray-600">Loading pricing plans...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h1 className="text-5xl font-bold text-gray-900 mb-4">Pricing Plans</h1>
          <p className="text-xl text-gray-600">Choose the perfect plan for your yoga journey</p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8 mb-16">
          {plans.map((plan, index) => (
            <div
              key={plan.id}
              className={`bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-2xl transition-all transform hover:scale-105 ${
                index === 2 ? 'ring-4 ring-violet-600' : ''
              }`}
            >
              {index === 2 && (
                <div className="bg-violet-600 text-white text-center py-2 text-sm font-semibold">
                  MOST POPULAR
                </div>
              )}
              <div className="p-8">
                <h3 className="text-2xl font-bold text-gray-900 mb-2">{plan.name}</h3>
                <div className="mb-6">
                  <span className="text-4xl font-bold text-violet-600">${plan.price}</span>
                  <span className="text-gray-600">/{plan.interval}</span>
                </div>
                <ul className="space-y-3 mb-8">
                  {plan.features.map((feature, idx) => (
                    <li key={idx} className="flex items-start space-x-3">
                      <Check className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                      <span className="text-gray-600">{feature}</span>
                    </li>
                  ))}
                </ul>
                <Link
                  href="/register"
                  className={`block w-full text-center py-3 rounded-lg font-semibold transition-colors ${
                    index === 2
                      ? 'bg-violet-600 text-white hover:bg-violet-700'
                      : 'bg-gray-100 text-gray-900 hover:bg-gray-200'
                  }`}
                >
                  Get Started
                </Link>
              </div>
            </div>
          ))}
        </div>

        <div className="bg-white rounded-xl shadow-lg p-8">
          <h2 className="text-3xl font-bold text-violet-600 mb-6">All Plans Include</h2>
          <div className="grid md:grid-cols-3 gap-6">
            <div className="flex items-start space-x-3">
              <Check className="w-6 h-6 text-green-500 flex-shrink-0" />
              <div>
                <h3 className="font-semibold text-gray-900 mb-1">Expert Instructors</h3>
                <p className="text-gray-600 text-sm">Learn from certified yoga professionals</p>
              </div>
            </div>
            <div className="flex items-start space-x-3">
              <Check className="w-6 h-6 text-green-500 flex-shrink-0" />
              <div>
                <h3 className="font-semibold text-gray-900 mb-1">Flexible Scheduling</h3>
                <p className="text-gray-600 text-sm">Classes available throughout the week</p>
              </div>
            </div>
            <div className="flex items-start space-x-3">
              <Check className="w-6 h-6 text-green-500 flex-shrink-0" />
              <div>
                <h3 className="font-semibold text-gray-900 mb-1">Premium Facilities</h3>
                <p className="text-gray-600 text-sm">State-of-the-art yoga studios</p>
              </div>
            </div>
            <div className="flex items-start space-x-3">
              <Check className="w-6 h-6 text-green-500 flex-shrink-0" />
              <div>
                <h3 className="font-semibold text-gray-900 mb-1">Community Support</h3>
                <p className="text-gray-600 text-sm">Connect with fellow practitioners</p>
              </div>
            </div>
            <div className="flex items-start space-x-3">
              <Check className="w-6 h-6 text-green-500 flex-shrink-0" />
              <div>
                <h3 className="font-semibold text-gray-900 mb-1">Progress Tracking</h3>
                <p className="text-gray-600 text-sm">Monitor your wellness journey</p>
              </div>
            </div>
            <div className="flex items-start space-x-3">
              <Check className="w-6 h-6 text-green-500 flex-shrink-0" />
              <div>
                <h3 className="font-semibold text-gray-900 mb-1">7-Day Free Trial</h3>
                <p className="text-gray-600 text-sm">Try before you commit</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}


