import { useEffect, useMemo, useState } from 'react';
import { authApiRequest } from '../lib/api';
import { useAuth } from '../contexts/AuthContext';
import { Link } from '../components/Link';

type AdminAnalytics = {
  totals: {
    instructors: number;
    learners: number;
    videos: number;
    blogs: number;
    live_sessions: number;
    open_complaints: number;
  };
  popular_classes: Array<{ class_title: string; views: number; total_minutes: number }>;
};

type AdminUser = {
  id: string;
  full_name: string;
  email: string;
  role: 'admin' | 'instructor' | 'practitioner';
  account_status: 'active' | 'inactive' | 'blocked';
  instructor_status: 'pending' | 'approved' | 'rejected' | 'suspended';
  is_verified: boolean;
};

type AdminBlog = { id: string; title: string; approval_status: string; published: boolean; spam_flag: boolean };
type AdminVideo = { id: string; title: string; status: string; level: string; category: string };
type AdminSession = { id: string; topic: string; status: string; is_live: boolean; scheduled_for: string | null };
type AdminComplaint = { id: string; target_type: string; reason: string; status: string; action_taken: string };
type AdminCategory = { id: string; name: string; tags: string[]; is_active: boolean };
type AdminSetting = { id: string; key: string; value: unknown; description: string };
type LearnerActivity = {
  id: string;
  name: string;
  email: string;
  account_status: string;
  total_sessions: number;
  total_minutes: number;
  inactive: boolean;
};

export function AdminDashboard() {
  const { user, profile } = useAuth();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const [analytics, setAnalytics] = useState<AdminAnalytics | null>(null);
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [blogs, setBlogs] = useState<AdminBlog[]>([]);
  const [videos, setVideos] = useState<AdminVideo[]>([]);
  const [sessions, setSessions] = useState<AdminSession[]>([]);
  const [complaints, setComplaints] = useState<AdminComplaint[]>([]);
  const [categories, setCategories] = useState<AdminCategory[]>([]);
  const [settings, setSettings] = useState<AdminSetting[]>([]);
  const [learners, setLearners] = useState<LearnerActivity[]>([]);
  const [newCategory, setNewCategory] = useState({ name: '', tags: '' });
  const [settingsDraft, setSettingsDraft] = useState<Record<string, string>>({});

  const pendingInstructors = useMemo(
    () => users.filter((u) => u.role === 'instructor' && u.instructor_status === 'pending'),
    [users]
  );

  const refresh = async () => {
    setLoading(true);
    setError('');
    try {
      const [a, u, b, v, s, c, cat, l, st] = await Promise.all([
        authApiRequest<AdminAnalytics>('/admin/dashboard-analytics'),
        authApiRequest<AdminUser[]>('/admin/users'),
        authApiRequest<AdminBlog[]>('/admin/blogs'),
        authApiRequest<AdminVideo[]>('/admin/videos'),
        authApiRequest<AdminSession[]>('/admin/live-sessions'),
        authApiRequest<AdminComplaint[]>('/admin/complaints'),
        authApiRequest<AdminCategory[]>('/admin/categories'),
        authApiRequest<LearnerActivity[]>('/admin/learners/activity?inactiveDays=14'),
        authApiRequest<AdminSetting[]>('/admin/settings'),
      ]);

      setAnalytics(a);
      setUsers(u);
      setBlogs(b);
      setVideos(v);
      setSessions(s);
      setComplaints(c);
      setCategories(cat);
      setLearners(l);
      setSettings(st);
      setSettingsDraft(
        st.reduce<Record<string, string>>((acc, item) => {
          acc[item.key] = JSON.stringify(item.value ?? '', null, 0);
          return acc;
        }, {})
      );
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    refresh();
  }, []);

  const patchUser = async (id: string, payload: Record<string, unknown>) => {
    await authApiRequest(`/admin/users/${id}`, { method: 'PATCH', body: JSON.stringify(payload) });
    await refresh();
  };

  const patchBlog = async (id: string, payload: Record<string, unknown>) => {
    await authApiRequest(`/admin/blogs/${id}`, { method: 'PATCH', body: JSON.stringify(payload) });
    await refresh();
  };

  const patchSession = async (id: string, payload: Record<string, unknown>) => {
    await authApiRequest(`/admin/live-sessions/${id}`, { method: 'PATCH', body: JSON.stringify(payload) });
    await refresh();
  };

  if (!user || !profile) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-700">Please login as admin to access this page.</p>
          <Link href="/login" className="inline-block mt-4 px-5 py-2 bg-violet-600 text-white rounded-lg">
            Go to Login
          </Link>
        </div>
      </div>
    );
  }

  if (profile.role !== 'admin') {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="bg-white border rounded-lg p-6 text-center max-w-lg">
          <p className="text-gray-800 font-semibold">Admin access required.</p>
          <p className="text-gray-600 mt-2">This area is restricted to platform administrators.</p>
        </div>
      </div>
    );
  }

  if (loading) {
    return <div className="min-h-screen bg-gray-50 flex items-center justify-center">Loading admin dashboard...</div>;
  }

  return (
    <div className="min-h-screen bg-gray-50 py-10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Admin Dashboard</h1>
            <p className="text-gray-600 mt-1">Manage users, content, sessions, complaints, and platform settings.</p>
          </div>
          <button onClick={refresh} className="px-4 py-2 bg-violet-600 text-white rounded-lg hover:bg-violet-700">
            Refresh
          </button>
        </div>

        {error ? <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-red-700">{error}</div> : null}

        {analytics ? (
          <section className="bg-white rounded-xl shadow-sm border p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Platform Analytics</h2>
            <div className="grid md:grid-cols-3 lg:grid-cols-6 gap-3">
              {Object.entries(analytics.totals).map(([key, value]) => (
                <div key={key} className="border rounded-lg p-3">
                  <p className="text-xs uppercase tracking-wide text-gray-500">{key.replace('_', ' ')}</p>
                  <p className="text-2xl font-bold text-violet-700">{value}</p>
                </div>
              ))}
            </div>
            <div className="mt-5">
              <h3 className="font-semibold text-gray-800 mb-2">Most Popular Classes</h3>
              <div className="space-y-2">
                {analytics.popular_classes.map((item) => (
                  <div key={item.class_title} className="flex justify-between border rounded-lg px-3 py-2 text-sm">
                    <span className="text-gray-700">{item.class_title}</span>
                    <span className="text-gray-600">{item.views} views</span>
                  </div>
                ))}
              </div>
            </div>
          </section>
        ) : null}

        <section className="bg-white rounded-xl shadow-sm border p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">User Management & Instructor Approval</h2>
          <p className="text-sm text-gray-600 mb-4">Pending instructors: {pendingInstructors.length}</p>
          <div className="space-y-3 max-h-96 overflow-y-auto">
            {users.map((u) => (
              <div key={u.id} className="border rounded-lg p-3 flex flex-wrap gap-2 justify-between items-center">
                <div>
                  <p className="font-semibold text-gray-900">{u.full_name}</p>
                  <p className="text-sm text-gray-600">{u.email}</p>
                  <p className="text-xs text-gray-500">
                    {u.role} | {u.account_status} | instructor: {u.instructor_status}
                  </p>
                </div>
                <div className="flex gap-2 flex-wrap">
                  {u.role === 'instructor' && u.instructor_status === 'pending' ? (
                    <button
                      onClick={() => patchUser(u.id, { instructorStatus: 'approved', isVerified: true })}
                      className="px-3 py-1 text-sm bg-green-600 text-white rounded"
                    >
                      Approve
                    </button>
                  ) : null}
                  {u.role === 'instructor' ? (
                    <button
                      onClick={() => patchUser(u.id, { instructorStatus: 'suspended', accountStatus: 'blocked' })}
                      className="px-3 py-1 text-sm bg-red-600 text-white rounded"
                    >
                      Suspend
                    </button>
                  ) : null}
                  {u.role === 'practitioner' && u.account_status !== 'active' ? (
                    <button
                      onClick={() => patchUser(u.id, { accountStatus: 'active' })}
                      className="px-3 py-1 text-sm bg-violet-600 text-white rounded"
                    >
                      Activate
                    </button>
                  ) : null}
                  {u.role === 'practitioner' && u.account_status === 'active' ? (
                    <button
                      onClick={() => patchUser(u.id, { accountStatus: 'inactive' })}
                      className="px-3 py-1 text-sm border rounded"
                    >
                      Deactivate
                    </button>
                  ) : null}
                </div>
              </div>
            ))}
          </div>
        </section>

        <section className="grid lg:grid-cols-2 gap-6">
          <div className="bg-white rounded-xl shadow-sm border p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Video Management</h2>
            <div className="space-y-2 max-h-80 overflow-y-auto">
              {videos.map((video) => (
                <div key={video.id} className="border rounded-lg p-3 flex items-center justify-between">
                  <div>
                    <p className="font-medium text-gray-900">{video.title}</p>
                    <p className="text-xs text-gray-600">
                      {video.level} | {video.category || 'General'} | {video.status}
                    </p>
                  </div>
                  <button
                    onClick={() => authApiRequest(`/admin/videos/${video.id}`, { method: 'DELETE' }).then(refresh)}
                    className="px-3 py-1 text-sm bg-red-600 text-white rounded"
                  >
                    Remove
                  </button>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Blog Moderation</h2>
            <div className="space-y-2 max-h-80 overflow-y-auto">
              {blogs.map((blog) => (
                <div key={blog.id} className="border rounded-lg p-3">
                  <p className="font-medium text-gray-900">{blog.title}</p>
                  <p className="text-xs text-gray-600 mb-2">
                    {blog.approval_status} | published: {String(blog.published)} | spam: {String(blog.spam_flag)}
                  </p>
                  <div className="flex gap-2 flex-wrap">
                    <button
                      onClick={() => patchBlog(blog.id, { approvalStatus: 'approved' })}
                      className="px-3 py-1 text-sm bg-green-600 text-white rounded"
                    >
                      Approve
                    </button>
                    <button
                      onClick={() => patchBlog(blog.id, { approvalStatus: 'rejected', spamFlag: true })}
                      className="px-3 py-1 text-sm border rounded"
                    >
                      Reject/Spam
                    </button>
                    <button
                      onClick={() => authApiRequest(`/admin/blogs/${blog.id}`, { method: 'DELETE' }).then(refresh)}
                      className="px-3 py-1 text-sm bg-red-600 text-white rounded"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="grid lg:grid-cols-2 gap-6">
          <div className="bg-white rounded-xl shadow-sm border p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Live Session Monitoring</h2>
            <div className="space-y-2 max-h-80 overflow-y-auto">
              {sessions.map((session) => (
                <div key={session.id} className="border rounded-lg p-3">
                  <p className="font-medium text-gray-900">{session.topic}</p>
                  <p className="text-xs text-gray-600 mb-2">status: {session.status}</p>
                  <div className="flex gap-2">
                    <button
                      onClick={() => patchSession(session.id, { status: 'cancelled' })}
                      className="px-3 py-1 text-sm bg-red-600 text-white rounded"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={() => patchSession(session.id, { status: 'scheduled' })}
                      className="px-3 py-1 text-sm border rounded"
                    >
                      Reschedule
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Complaints & Reports</h2>
            <div className="space-y-2 max-h-80 overflow-y-auto">
              {complaints.map((report) => (
                <div key={report.id} className="border rounded-lg p-3">
                  <p className="font-medium text-gray-900">
                    {report.target_type}: {report.reason}
                  </p>
                  <p className="text-xs text-gray-600 mb-2">status: {report.status}</p>
                  <div className="flex gap-2">
                    <button
                      onClick={() =>
                        authApiRequest(`/admin/complaints/${report.id}`, {
                          method: 'PATCH',
                          body: JSON.stringify({ status: 'resolved', actionTaken: 'Reviewed and action completed.' }),
                        }).then(refresh)
                      }
                      className="px-3 py-1 text-sm bg-green-600 text-white rounded"
                    >
                      Resolve
                    </button>
                    <button
                      onClick={() =>
                        authApiRequest(`/admin/complaints/${report.id}`, {
                          method: 'PATCH',
                          body: JSON.stringify({ status: 'dismissed', actionTaken: 'Dismissed after review.' }),
                        }).then(refresh)
                      }
                      className="px-3 py-1 text-sm border rounded"
                    >
                      Dismiss
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="grid lg:grid-cols-2 gap-6">
          <div className="bg-white rounded-xl shadow-sm border p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Category & Tag Management</h2>
            <div className="flex gap-2 mb-3">
              <input
                value={newCategory.name}
                onChange={(e) => setNewCategory((s) => ({ ...s, name: e.target.value }))}
                placeholder="Category name"
                className="flex-1 border rounded px-3 py-2 text-sm"
              />
              <input
                value={newCategory.tags}
                onChange={(e) => setNewCategory((s) => ({ ...s, tags: e.target.value }))}
                placeholder="tags,comma,separated"
                className="flex-1 border rounded px-3 py-2 text-sm"
              />
              <button
                onClick={() =>
                  authApiRequest('/admin/categories', {
                    method: 'POST',
                    body: JSON.stringify({
                      name: newCategory.name,
                      tags: newCategory.tags
                        .split(',')
                        .map((t) => t.trim())
                        .filter(Boolean),
                    }),
                  }).then(() => {
                    setNewCategory({ name: '', tags: '' });
                    refresh();
                  })
                }
                className="px-3 py-2 text-sm bg-violet-600 text-white rounded"
              >
                Add
              </button>
            </div>
            <div className="space-y-2 max-h-72 overflow-y-auto">
              {categories.map((cat) => (
                <div key={cat.id} className="border rounded-lg p-3 flex justify-between items-center">
                  <div>
                    <p className="font-medium text-gray-900">{cat.name}</p>
                    <p className="text-xs text-gray-600">{cat.tags.join(', ') || 'No tags'}</p>
                  </div>
                  <button
                    onClick={() => authApiRequest(`/admin/categories/${cat.id}`, { method: 'DELETE' }).then(refresh)}
                    className="px-3 py-1 text-sm bg-red-600 text-white rounded"
                  >
                    Delete
                  </button>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Learner Activity Monitoring</h2>
            <div className="space-y-2 max-h-80 overflow-y-auto">
              {learners.map((learner) => (
                <div key={learner.id} className="border rounded-lg p-3">
                  <p className="font-medium text-gray-900">{learner.name}</p>
                  <p className="text-xs text-gray-600">{learner.email}</p>
                  <p className="text-xs text-gray-600">
                    Sessions: {learner.total_sessions} | Minutes: {learner.total_minutes} | Inactive:{' '}
                    {learner.inactive ? 'Yes' : 'No'}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="bg-white rounded-xl shadow-sm border p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Platform Settings</h2>
          <div className="grid lg:grid-cols-2 gap-3">
            {settings.map((item) => (
              <div key={item.id} className="border rounded-lg p-3">
                <p className="font-medium text-gray-900">{item.key}</p>
                <textarea
                  value={settingsDraft[item.key] || ''}
                  onChange={(e) => setSettingsDraft((s) => ({ ...s, [item.key]: e.target.value }))}
                  className="w-full border rounded mt-2 px-3 py-2 text-sm h-20"
                />
                <button
                  onClick={() =>
                    authApiRequest(`/admin/settings/${item.key}`, {
                      method: 'PUT',
                      body: JSON.stringify({
                        value: (() => {
                          try {
                            return JSON.parse(settingsDraft[item.key] || '""');
                          } catch (_error) {
                            return settingsDraft[item.key];
                          }
                        })(),
                      }),
                    }).then(refresh)
                  }
                  className="mt-2 px-3 py-1 text-sm bg-violet-600 text-white rounded"
                >
                  Save
                </button>
              </div>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}


