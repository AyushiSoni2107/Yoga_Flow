import { useAuth } from '../contexts/AuthContext';
import { Link } from '../components/Link';
import { User, Mail, Calendar } from 'lucide-react';

export function Profile() {
  const { user, profile, signOut } = useAuth();

  if (!user || !profile) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-600 mb-4">Please log in to view your profile</p>
          <Link
            href="/login"
            className="inline-block bg-violet-600 text-white px-6 py-3 rounded-lg hover:bg-violet-700"
          >
            Go to Login
          </Link>
        </div>
      </div>
    );
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white rounded-xl shadow-lg overflow-hidden">
          <div className="bg-gradient-to-r from-violet-500 to-violet-600 h-32"></div>

          <div className="px-8 pb-8">
            <div className="flex flex-col md:flex-row md:items-end md:space-x-6 -mt-16">
              {profile.avatar_url ? (
                <img
                  src={profile.avatar_url}
                  alt={profile.full_name}
                  className="w-32 h-32 rounded-full border-4 border-white shadow-lg object-cover"
                />
              ) : (
                <div className="w-32 h-32 rounded-full border-4 border-white shadow-lg bg-violet-100 flex items-center justify-center">
                  <User className="w-16 h-16 text-violet-600" />
                </div>
              )}

              <div className="mt-4 md:mt-0 md:mb-4 flex-1">
                <h1 className="text-3xl font-bold text-gray-900">{profile.full_name}</h1>
                <p className="text-gray-600">Yoga Practitioner</p>
              </div>

              <button
                onClick={signOut}
                className="mt-4 md:mt-0 md:mb-4 px-6 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Sign Out
              </button>
            </div>

            <div className="mt-8 grid md:grid-cols-2 gap-6">
              <div className="border rounded-lg p-6">
                <div className="flex items-center space-x-3 mb-4">
                  <Mail className="w-5 h-5 text-violet-600" />
                  <h2 className="text-lg font-semibold text-gray-900">Email</h2>
                </div>
                <p className="text-gray-600">{user.email}</p>
              </div>

              <div className="border rounded-lg p-6">
                <div className="flex items-center space-x-3 mb-4">
                  <Calendar className="w-5 h-5 text-violet-600" />
                  <h2 className="text-lg font-semibold text-gray-900">Member Since</h2>
                </div>
                <p className="text-gray-600">{formatDate(profile.created_at)}</p>
              </div>
            </div>

            <div className="mt-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">Quick Actions</h2>
              <div className="grid md:grid-cols-3 gap-4">
                <Link
                  href="/classes"
                  className="block p-4 border border-violet-200 rounded-lg hover:bg-violet-50 transition-colors text-center"
                >
                  <h3 className="font-semibold text-violet-600">Browse Classes</h3>
                  <p className="text-sm text-gray-600 mt-1">Find your next session</p>
                </Link>

                <Link
                  href="/pricing"
                  className="block p-4 border border-violet-200 rounded-lg hover:bg-violet-50 transition-colors text-center"
                >
                  <h3 className="font-semibold text-violet-600">View Plans</h3>
                  <p className="text-sm text-gray-600 mt-1">Upgrade your membership</p>
                </Link>

                <Link
                  href="/blogs"
                  className="block p-4 border border-violet-200 rounded-lg hover:bg-violet-50 transition-colors text-center"
                >
                  <h3 className="font-semibold text-violet-600">Read Blogs</h3>
                  <p className="text-sm text-gray-600 mt-1">Learn and improve</p>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
