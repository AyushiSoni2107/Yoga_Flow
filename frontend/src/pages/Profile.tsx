import { useState, type ChangeEvent } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { Link } from '../components/Link';
import { User, Mail, Calendar, Upload } from 'lucide-react';

export function Profile() {
  const { user, profile, signOut, updateProfile } = useAuth();
  const isInstructor = profile?.role === 'instructor';
  const isAdmin = profile?.role === 'admin';
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  const [savingAvatar, setSavingAvatar] = useState(false);
  const [avatarMessage, setAvatarMessage] = useState('');
  const [avatarError, setAvatarError] = useState('');

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

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setAvatarError('');
    setAvatarMessage('');

    if (file.size > 5 * 1024 * 1024) {
      setAvatarError('Profile photo must be less than 5MB.');
      return;
    }

    if (!file.type.startsWith('image/')) {
      setAvatarError('Please choose an image file.');
      return;
    }

    const reader = new FileReader();
    reader.onloadend = () => {
      setAvatarPreview(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  const saveAvatar = async () => {
    if (!avatarPreview) {
      setAvatarError('Please choose an image first.');
      return;
    }

    setSavingAvatar(true);
    setAvatarError('');
    setAvatarMessage('');
    const { error } = await updateProfile({ avatar_url: avatarPreview });
    setSavingAvatar(false);

    if (error) {
      setAvatarError(error.message);
      return;
    }

    setAvatarMessage('Profile photo updated.');
    setAvatarPreview(null);
  };

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white rounded-xl shadow-lg overflow-hidden">
          <div className="bg-gradient-to-r from-violet-500 to-violet-600 h-32"></div>

          <div className="px-8 pb-8">
            <div className="flex flex-col md:flex-row md:items-end md:space-x-6 -mt-16">
              {(avatarPreview || profile.avatar_url) ? (
                <img
                  src={avatarPreview || profile.avatar_url || ''}
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
                <p className="text-gray-600">
                  {isAdmin ? 'Platform Admin' : isInstructor ? 'Yoga Instructor' : 'Yoga Practitioner'}
                </p>
                <div className="mt-3 flex flex-wrap items-center gap-2">
                  <label className="inline-flex items-center gap-2 px-3 py-2 text-sm border border-gray-300 rounded-lg cursor-pointer hover:bg-gray-50">
                    <Upload className="w-4 h-4 text-violet-600" />
                    Change Photo
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleFileChange}
                      className="hidden"
                    />
                  </label>
                  <button
                    onClick={saveAvatar}
                    disabled={!avatarPreview || savingAvatar}
                    className="px-3 py-2 text-sm rounded-lg bg-violet-600 text-white hover:bg-violet-700 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {savingAvatar ? 'Saving...' : 'Save Photo'}
                  </button>
                </div>
                {avatarError && <p className="mt-2 text-sm text-red-600">{avatarError}</p>}
                {avatarMessage && <p className="mt-2 text-sm text-green-600">{avatarMessage}</p>}
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
                {isAdmin ? (
                  <>
                    <Link
                      href="/admin-dashboard"
                      className="block p-4 border border-violet-200 rounded-lg hover:bg-violet-50 transition-colors text-center"
                    >
                      <h3 className="font-semibold text-violet-600">Admin Control Center</h3>
                      <p className="text-sm text-gray-600 mt-1">Manage platform operations and analytics</p>
                    </Link>

                    <Link
                      href="/blogs"
                      className="block p-4 border border-violet-200 rounded-lg hover:bg-violet-50 transition-colors text-center"
                    >
                      <h3 className="font-semibold text-violet-600">Review Blogs</h3>
                      <p className="text-sm text-gray-600 mt-1">Moderate instructor blog posts</p>
                    </Link>

                    <Link
                      href="/classes"
                      className="block p-4 border border-violet-200 rounded-lg hover:bg-violet-50 transition-colors text-center"
                    >
                      <h3 className="font-semibold text-violet-600">Review Classes</h3>
                      <p className="text-sm text-gray-600 mt-1">Inspect class catalogue quality</p>
                    </Link>
                  </>
                ) : isInstructor ? (
                  <>
                    <Link
                      href="/instructor-dashboard"
                      className="block p-4 border border-violet-200 rounded-lg hover:bg-violet-50 transition-colors text-center"
                    >
                      <h3 className="font-semibold text-violet-600">Instructor Studio</h3>
                      <p className="text-sm text-gray-600 mt-1">Manage classes and live sessions</p>
                    </Link>

                    <Link
                      href="/classes"
                      className="block p-4 border border-violet-200 rounded-lg hover:bg-violet-50 transition-colors text-center"
                    >
                      <h3 className="font-semibold text-violet-600">Manage Classes</h3>
                      <p className="text-sm text-gray-600 mt-1">Review your yoga sessions</p>
                    </Link>

                    <Link
                      href="/blogs"
                      className="block p-4 border border-violet-200 rounded-lg hover:bg-violet-50 transition-colors text-center"
                    >
                      <h3 className="font-semibold text-violet-600">Publish Blogs</h3>
                      <p className="text-sm text-gray-600 mt-1">Share wellness knowledge</p>
                    </Link>
                  </>
                ) : (
                  <>
                    <Link
                      href="/learner-dashboard"
                      className="block p-4 border border-violet-200 rounded-lg hover:bg-violet-50 transition-colors text-center"
                    >
                      <h3 className="font-semibold text-violet-600">Learner Progress</h3>
                      <p className="text-sm text-gray-600 mt-1">Track your yoga journey</p>
                    </Link>

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
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}


