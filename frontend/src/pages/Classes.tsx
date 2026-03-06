import { useEffect, useState } from 'react';
import { apiRequest, YogaClass } from '../lib/api';
import { Clock, Users } from 'lucide-react';

export function Classes() {
  const [classes, setClasses] = useState<YogaClass[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchClasses();
  }, []);

  const fetchClasses = async () => {
    try {
      const data = await apiRequest<YogaClass[]>('/classes');
      setClasses(data || []);
    } catch (error) {
      console.error('Error fetching classes:', error);
    } finally {
      setLoading(false);
    }
  };

  const getDifficultyColor = (level: string) => {
    switch (level) {
      case 'Beginner':
        return 'bg-green-100 text-green-800';
      case 'Intermediate':
        return 'bg-yellow-100 text-yellow-800';
      case 'Advanced':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block h-12 w-12 animate-spin rounded-full border-4 border-solid border-violet-600 border-r-transparent"></div>
          <p className="mt-4 text-gray-600">Loading classes...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h1 className="text-5xl font-bold text-gray-900 mb-4">Our Classes</h1>
          <p className="text-xl text-gray-600">Find the perfect class for your level and goals</p>
        </div>

        <div className="mb-12 bg-violet-50 border-l-4 border-violet-600 p-6 rounded-lg">
          <h2 className="text-2xl font-semibold text-violet-600 mb-2">Free Trial for 7 Days</h2>
          <p className="text-gray-700">Try any class free for the first week. No credit card required.</p>
        </div>

        <div className="grid md:grid-cols-2 gap-8 mb-16">
          {classes.map((yogaClass) => (
            <div
              key={yogaClass.id}
              className="bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-xl transition-shadow"
            >
              <img
                src={yogaClass.image_url || 'https://images.pexels.com/photos/3822906/pexels-photo-3822906.jpeg?auto=compress&cs=tinysrgb&w=800'}
                alt={yogaClass.title}
                className="w-full h-64 object-cover"
              />
              <div className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-2xl font-bold text-gray-900">{yogaClass.title}</h3>
                  <span className={`px-3 py-1 rounded-full text-sm font-semibold ${getDifficultyColor(yogaClass.difficulty_level)}`}>
                    {yogaClass.difficulty_level}
                  </span>
                </div>
                <p className="text-gray-600 mb-4">{yogaClass.description}</p>
                <div className="flex items-center justify-between text-sm text-gray-500 mb-4">
                  <div className="flex items-center space-x-2">
                    <Clock className="w-4 h-4" />
                    <span>{yogaClass.duration_minutes} minutes</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Users className="w-4 h-4" />
                    <span>Max {yogaClass.max_participants} participants</span>
                  </div>
                </div>
                <div className="border-t pt-4">
                  <p className="text-gray-700">
                    <span className="font-semibold">Instructor:</span> {yogaClass.instructor}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="bg-white rounded-xl shadow-lg p-8">
          <h2 className="text-3xl font-bold text-violet-600 mb-6">Class Schedule</h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            <div className="border-l-4 border-violet-600 pl-4">
              <h3 className="font-semibold text-gray-900 mb-2">Monday & Wednesday</h3>
              <p className="text-gray-600">Beginner Yoga: 9:00 AM - 10:00 AM</p>
              <p className="text-gray-600">Power Yoga: 6:00 PM - 7:15 PM</p>
            </div>
            <div className="border-l-4 border-violet-600 pl-4">
              <h3 className="font-semibold text-gray-900 mb-2">Tuesday & Thursday</h3>
              <p className="text-gray-600">Meditation: 7:00 AM - 7:45 AM</p>
              <p className="text-gray-600">Advanced Flow: 7:00 PM - 8:30 PM</p>
            </div>
            <div className="border-l-4 border-violet-600 pl-4">
              <h3 className="font-semibold text-gray-900 mb-2">Friday & Saturday</h3>
              <p className="text-gray-600">All Levels: 10:00 AM - 11:00 AM</p>
              <p className="text-gray-600">Restorative Yoga: 5:00 PM - 6:00 PM</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}


