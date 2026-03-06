import { useEffect, useMemo, useState } from 'react';
import { BookOpen, Radio, TrendingUp, CheckCircle2, Clock, Target, PlayCircle } from 'lucide-react';
import { authApiRequest, YogaClass } from '../lib/api';
import { useAuth } from '../contexts/AuthContext';
import { Link } from '../components/Link';

type LiveSession = {
  id: string;
  topic: string;
  is_live: boolean;
  updated_at: string;
};

type WeeklyItem = {
  day: string;
  minutes: number;
};

type CompletedSession = {
  id: string;
  class_title: string;
  minutes: number;
  session_date: string;
};

type LearnerDashboardResponse = {
  enrolled_classes: YogaClass[];
  live_sessions: LiveSession[];
  weekly_progress: WeeklyItem[];
  total_weekly_minutes: number;
  practice_days: number;
  completed_sessions: number;
  recent_completed: CompletedSession[];
};

export function LearnerDashboard() {
  const { profile } = useAuth();
  const isPractitioner = profile?.role === 'practitioner';

  const [data, setData] = useState<LearnerDashboardResponse | null>(null);
  const [selectedClass, setSelectedClass] = useState('');
  const [minutes, setMinutes] = useState(30);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  const loadDashboard = async () => {
    if (!isPractitioner) return;

    try {
      setError('');
      const payload = await authApiRequest<LearnerDashboardResponse>('/learner/dashboard');
      setData(payload);
      if (!selectedClass && payload.enrolled_classes.length > 0) {
        setSelectedClass(payload.enrolled_classes[0].title);
      }
    } catch (err) {
      setError((err as Error).message || 'Failed to load learner dashboard.');
    }
  };

  useEffect(() => {
    loadDashboard();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isPractitioner]);

  const liveSessions = useMemo(() => data?.live_sessions || [], [data]);

  const handleLogSession = async () => {
    if (!selectedClass || minutes <= 0) {
      setError('Please select class and valid minutes.');
      return;
    }

    try {
      setError('');
      await authApiRequest('/learner/progress', {
        method: 'POST',
        body: JSON.stringify({ classTitle: selectedClass, minutes, completed: true }),
      });
      setMessage('Session logged successfully.');
      setTimeout(() => setMessage(''), 2500);
      await loadDashboard();
    } catch (err) {
      setError((err as Error).message || 'Failed to log session.');
    }
  };

  const joinLive = async (topic: string) => {
    try {
      await authApiRequest('/learner/progress', {
        method: 'POST',
        body: JSON.stringify({ classTitle: `Live: ${topic}`, minutes: 20, completed: true }),
      });
      setMessage(`Joined ${topic}. Progress updated.`);
      setTimeout(() => setMessage(''), 2500);
      await loadDashboard();
    } catch (err) {
      setError((err as Error).message || 'Unable to join live session.');
    }
  };

  const formatDate = (dateString: string) =>
    new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });

  if (!isPractitioner) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
        <div className="max-w-md w-full bg-white rounded-xl shadow-lg p-8 text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-3">Learner Access Only</h2>
          <p className="text-gray-600 mb-6">
            Yoga Learner Progress Dashboard is available only for Yoga Practitioner profiles.
          </p>
          <Link
            href="/profile"
            className="inline-block bg-violet-600 text-white px-6 py-3 rounded-lg hover:bg-violet-700 transition-colors"
          >
            Go to Profile
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-10 text-center">
          <h1 className="text-5xl font-bold text-gray-900 mb-3">Yoga Learner Progress Dashboard</h1>
          <p className="text-lg text-gray-600">
            Watch classes, join live sessions, track daily and weekly progress, and review completed sessions.
          </p>
        </div>

        {error && (
          <div className="mb-4 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-red-700">{error}</div>
        )}
        {message && (
          <div className="mb-4 rounded-lg border border-green-200 bg-green-50 px-4 py-3 text-green-700">{message}</div>
        )}

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
          <div className="bg-white rounded-xl shadow-md p-6">
            <div className="w-12 h-12 rounded-lg bg-violet-100 flex items-center justify-center mb-4">
              <BookOpen className="w-6 h-6 text-violet-600" />
            </div>
            <h2 className="text-lg font-semibold text-gray-900 mb-2">Watch Enrolled Classes</h2>
            <p className="text-gray-600 text-sm">{data?.enrolled_classes.length || 0} classes available.</p>
          </div>

          <div className="bg-white rounded-xl shadow-md p-6">
            <div className="w-12 h-12 rounded-lg bg-violet-100 flex items-center justify-center mb-4">
              <Radio className="w-6 h-6 text-violet-600" />
            </div>
            <h2 className="text-lg font-semibold text-gray-900 mb-2">Join Live Sessions</h2>
            <p className="text-gray-600 text-sm">{liveSessions.length} live sessions running now.</p>
          </div>

          <div className="bg-white rounded-xl shadow-md p-6">
            <div className="w-12 h-12 rounded-lg bg-violet-100 flex items-center justify-center mb-4">
              <TrendingUp className="w-6 h-6 text-violet-600" />
            </div>
            <h2 className="text-lg font-semibold text-gray-900 mb-2">Track Daily Progress</h2>
            <p className="text-gray-600 text-sm">Practice on {data?.practice_days || 0} days this week.</p>
          </div>

          <div className="bg-white rounded-xl shadow-md p-6">
            <div className="w-12 h-12 rounded-lg bg-violet-100 flex items-center justify-center mb-4">
              <CheckCircle2 className="w-6 h-6 text-violet-600" />
            </div>
            <h2 className="text-lg font-semibold text-gray-900 mb-2">View Completed Sessions</h2>
            <p className="text-gray-600 text-sm">{data?.completed_sessions || 0} sessions completed.</p>
          </div>
        </div>

        <div className="grid lg:grid-cols-3 gap-6 mb-6">
          <div className="bg-white rounded-xl shadow-md p-6">
            <div className="flex items-center space-x-2 mb-3">
              <Clock className="w-5 h-5 text-violet-600" />
              <h3 className="text-lg font-semibold text-gray-900">This Week Practice</h3>
            </div>
            <p className="text-3xl font-bold text-violet-600">{data?.total_weekly_minutes || 0} min</p>
            <p className="text-sm text-gray-500 mt-1">Total weekly yoga minutes</p>
          </div>

          <div className="bg-white rounded-xl shadow-md p-6">
            <div className="flex items-center space-x-2 mb-3">
              <CheckCircle2 className="w-5 h-5 text-violet-600" />
              <h3 className="text-lg font-semibold text-gray-900">Completed Sessions</h3>
            </div>
            <p className="text-3xl font-bold text-violet-600">{data?.completed_sessions || 0}</p>
            <p className="text-sm text-gray-500 mt-1">Sessions completed overall</p>
          </div>

          <div className="bg-white rounded-xl shadow-md p-6">
            <div className="flex items-center space-x-2 mb-3">
              <Target className="w-5 h-5 text-violet-600" />
              <h3 className="text-lg font-semibold text-gray-900">Current Goal</h3>
            </div>
            <p className="text-3xl font-bold text-violet-600">{data?.practice_days || 0}/7</p>
            <p className="text-sm text-gray-500 mt-1">Practice days achieved this week</p>
          </div>
        </div>

        <div className="grid lg:grid-cols-2 gap-6">
          <div className="bg-white rounded-xl shadow-md p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Log Completed Session</h3>
            <div className="space-y-3">
              <select
                value={selectedClass}
                onChange={(e) => setSelectedClass(e.target.value)}
                className="w-full border border-gray-300 rounded-lg px-3 py-2"
              >
                <option value="">Select class</option>
                {data?.enrolled_classes.map((c) => (
                  <option key={c.id} value={c.title}>{c.title}</option>
                ))}
              </select>
              <input
                type="number"
                min={1}
                value={minutes}
                onChange={(e) => setMinutes(Number(e.target.value || 0))}
                className="w-full border border-gray-300 rounded-lg px-3 py-2"
                placeholder="Minutes practiced"
              />
              <button
                onClick={handleLogSession}
                className="w-full bg-violet-600 text-white rounded-lg py-2 hover:bg-violet-700"
              >
                Save Progress
              </button>
            </div>

            <h4 className="text-md font-semibold text-gray-900 mt-6 mb-3">Live Sessions</h4>
            <div className="space-y-2 max-h-48 overflow-auto">
              {liveSessions.length === 0 && (
                <p className="text-sm text-gray-500">No live sessions currently active.</p>
              )}
              {liveSessions.map((session) => (
                <div key={session.id} className="border border-gray-200 rounded-lg p-3 flex items-center justify-between">
                  <div>
                    <p className="font-medium text-gray-900">{session.topic}</p>
                    <p className="text-xs text-gray-500">Live now</p>
                  </div>
                  <button
                    onClick={() => joinLive(session.topic)}
                    className="inline-flex items-center text-violet-700 hover:text-violet-800 text-sm"
                  >
                    <PlayCircle className="w-4 h-4 mr-1" />
                    Join
                  </button>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-md p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Daily Progress (Minutes)</h3>
            <div className="grid grid-cols-7 gap-3 mb-6">
              {data?.weekly_progress.map((entry) => (
                <div key={entry.day} className="text-center">
                  <p className="text-xs text-gray-500 mb-2">{entry.day}</p>
                  <div className="bg-violet-100 rounded-lg h-24 flex items-end justify-center">
                    <div
                      className="bg-violet-600 rounded-md w-8"
                      style={{ height: `${Math.max(12, Math.min(100, entry.minutes))}%` }}
                    />
                  </div>
                  <p className="text-xs text-gray-700 mt-2">{entry.minutes}m</p>
                </div>
              ))}
            </div>

            <h4 className="text-md font-semibold text-gray-900 mb-3">Recent Completed Sessions</h4>
            <div className="space-y-2 max-h-48 overflow-auto">
              {data?.recent_completed.length === 0 && (
                <p className="text-sm text-gray-500">No completed sessions yet.</p>
              )}
              {data?.recent_completed.map((item) => (
                <div key={item.id} className="border border-gray-200 rounded-lg p-3">
                  <p className="font-medium text-gray-900 text-sm">{item.class_title}</p>
                  <p className="text-xs text-gray-500">{item.minutes} min • {formatDate(item.session_date)}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}


