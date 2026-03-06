import { useEffect, useMemo, useState } from 'react';
import { Video, CalendarPlus, Radio, FileText, Users, Upload, PlayCircle } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { Link } from '../components/Link';
import { authApiRequest, YogaClass, BlogPost } from '../lib/api';

type InstructorVideo = {
  id: string;
  title: string;
  level: 'Beginner' | 'Intermediate' | 'Advanced';
  file_name: string;
  views: number;
  created_at: string;
};

type Learner = {
  id: string;
  name: string;
  email: string;
  plan: string;
  attendance: string;
};

type LiveStatus = {
  topic: string;
  is_live: boolean;
  updated_at?: string;
};

export function InstructorDashboard() {
  const { profile } = useAuth();
  const isInstructor = profile?.role === 'instructor';

  const [videoTitle, setVideoTitle] = useState('');
  const [videoLevel, setVideoLevel] = useState<'Beginner' | 'Intermediate' | 'Advanced'>('Beginner');
  const [videoFileName, setVideoFileName] = useState('');

  const [classes, setClasses] = useState<YogaClass[]>([]);
  const [newClassName, setNewClassName] = useState('');
  const [newClassTime, setNewClassTime] = useState('');

  const [liveTopic, setLiveTopic] = useState('Evening Relax Session');
  const [isLive, setIsLive] = useState(false);

  const [blogTitle, setBlogTitle] = useState('');
  const [blogBody, setBlogBody] = useState('');

  const [learners, setLearners] = useState<Learner[]>([]);

  const [videos, setVideos] = useState<InstructorVideo[]>([]);
  const [videoSearch, setVideoSearch] = useState('');

  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  const filteredVideos = useMemo(
    () => videos.filter((video) => video.title.toLowerCase().includes(videoSearch.toLowerCase())),
    [videos, videoSearch]
  );

  const loadData = async () => {
    if (!isInstructor) return;

    try {
      setError('');
      const [classesData, videosData, learnersData, liveData] = await Promise.all([
        authApiRequest<YogaClass[]>('/classes'),
        authApiRequest<InstructorVideo[]>('/instructor/videos'),
        authApiRequest<Learner[]>('/instructor/learners'),
        authApiRequest<LiveStatus>('/instructor/live'),
      ]);

      setClasses(classesData || []);
      setVideos(videosData || []);
      setLearners(learnersData || []);
      setLiveTopic(liveData?.topic || 'Evening Relax Session');
      setIsLive(Boolean(liveData?.is_live));
    } catch (err) {
      setError((err as Error).message || 'Failed to load instructor dashboard.');
    }
  };

  useEffect(() => {
    loadData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isInstructor]);

  const showMessage = (text: string) => {
    setMessage(text);
    setTimeout(() => setMessage(''), 2500);
  };

  const handleUploadVideo = async () => {
    if (!videoTitle || !videoFileName) {
      setError('Video title and file are required.');
      return;
    }

    try {
      setError('');
      const created = await authApiRequest<InstructorVideo>('/instructor/videos', {
        method: 'POST',
        body: JSON.stringify({ title: videoTitle, level: videoLevel, fileName: videoFileName }),
      });
      setVideos((prev) => [created, ...prev]);
      setVideoTitle('');
      setVideoFileName('');
      setVideoLevel('Beginner');
      showMessage('Video uploaded successfully.');
    } catch (err) {
      setError((err as Error).message || 'Failed to upload video.');
    }
  };

  const handleAddClass = async () => {
    if (!newClassName || !newClassTime) {
      setError('Class name and time are required.');
      return;
    }

    try {
      setError('');
      const created = await authApiRequest<YogaClass>('/classes', {
        method: 'POST',
        body: JSON.stringify({
          title: newClassName,
          description: `Scheduled at ${newClassTime}`,
          difficulty_level: 'Beginner',
          duration_minutes: 45,
          instructor: profile?.full_name || 'Instructor',
          max_participants: 25,
        }),
      });
      setClasses((prev) => [created, ...prev]);
      setNewClassName('');
      setNewClassTime('');
      showMessage('Class added successfully.');
    } catch (err) {
      setError((err as Error).message || 'Failed to add class.');
    }
  };

  const handleToggleLive = async () => {
    try {
      setError('');
      const updated = await authApiRequest<LiveStatus>('/instructor/live', {
        method: 'POST',
        body: JSON.stringify({ topic: liveTopic, isLive: !isLive }),
      });
      setIsLive(updated.is_live);
      setLiveTopic(updated.topic);
      showMessage(updated.is_live ? 'Live session started.' : 'Live session ended.');
    } catch (err) {
      setError((err as Error).message || 'Failed to update live session.');
    }
  };

  const handlePublishBlog = async (published: boolean) => {
    if (!blogTitle || !blogBody) {
      setError('Blog title and content are required.');
      return;
    }

    try {
      setError('');
      await authApiRequest<BlogPost>('/blogs', {
        method: 'POST',
        body: JSON.stringify({ title: blogTitle, content: blogBody, published }),
      });
      setBlogTitle('');
      setBlogBody('');
      showMessage(published ? 'Blog published successfully.' : 'Blog saved as draft.');
    } catch (err) {
      setError((err as Error).message || 'Failed to publish blog.');
    }
  };

  if (!isInstructor) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
        <div className="max-w-md w-full bg-white rounded-xl shadow-lg p-8 text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-3">Instructor Access Only</h2>
          <p className="text-gray-600 mb-6">
            Instructor Studio is available only for profiles registered as Yoga Instructor.
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
          <h1 className="text-5xl font-bold text-gray-900 mb-3">Instructor Studio Dashboard</h1>
          <p className="text-lg text-gray-600">
            For yoga instructors to upload videos, manage classes, start live sessions, publish blogs, and manage learners.
          </p>
        </div>

        {error && (
          <div className="mb-4 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-red-700">{error}</div>
        )}
        {message && (
          <div className="mb-4 rounded-lg border border-green-200 bg-green-50 px-4 py-3 text-green-700">{message}</div>
        )}

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          <div className="bg-white rounded-xl shadow-md p-6 hover:shadow-lg transition-shadow">
            <div className="w-12 h-12 rounded-lg bg-violet-100 flex items-center justify-center mb-4">
              <Upload className="w-6 h-6 text-violet-600" />
            </div>
            <h2 className="text-xl font-semibold text-gray-900 mb-2">Upload Class Videos</h2>
            <p className="text-gray-600 mb-4">Upload recorded classes with level and file details.</p>
            <div className="space-y-3">
              <input value={videoTitle} onChange={(e) => setVideoTitle(e.target.value)} placeholder="Video title" className="w-full border border-gray-300 rounded-lg px-3 py-2" />
              <select value={videoLevel} onChange={(e) => setVideoLevel(e.target.value as 'Beginner' | 'Intermediate' | 'Advanced')} className="w-full border border-gray-300 rounded-lg px-3 py-2">
                <option>Beginner</option>
                <option>Intermediate</option>
                <option>Advanced</option>
              </select>
              <input
                type="file"
                accept="video/*"
                className="w-full border border-gray-300 rounded-lg px-3 py-2"
                onChange={(e) => setVideoFileName(e.target.files?.[0]?.name || '')}
              />
              <button onClick={handleUploadVideo} className="w-full bg-violet-600 text-white rounded-lg py-2 hover:bg-violet-700">Upload Video</button>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-md p-6 hover:shadow-lg transition-shadow">
            <div className="w-12 h-12 rounded-lg bg-violet-100 flex items-center justify-center mb-4">
              <CalendarPlus className="w-6 h-6 text-violet-600" />
            </div>
            <h2 className="text-xl font-semibold text-gray-900 mb-2">Create & Manage Classes</h2>
            <p className="text-gray-600 mb-4">Plan your schedule and monitor class enrollment.</p>
            <div className="space-y-2 mb-4 max-h-36 overflow-auto">
              {classes.map((item) => (
                <div key={item.id} className="flex items-center justify-between text-sm bg-gray-50 rounded-lg px-3 py-2">
                  <span>{item.title}</span>
                  <span className="text-violet-700 font-medium">Max {item.max_participants}</span>
                </div>
              ))}
            </div>
            <div className="space-y-2">
              <input value={newClassName} onChange={(e) => setNewClassName(e.target.value)} placeholder="New class name" className="w-full border border-gray-300 rounded-lg px-3 py-2" />
              <input value={newClassTime} onChange={(e) => setNewClassTime(e.target.value)} placeholder="Time (e.g. 05:30 PM)" className="w-full border border-gray-300 rounded-lg px-3 py-2" />
              <button onClick={handleAddClass} className="w-full border border-violet-300 text-violet-700 rounded-lg py-2 hover:bg-violet-50">Add Class</button>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-md p-6 hover:shadow-lg transition-shadow">
            <div className="w-12 h-12 rounded-lg bg-violet-100 flex items-center justify-center mb-4">
              <Radio className="w-6 h-6 text-violet-600" />
            </div>
            <h2 className="text-xl font-semibold text-gray-900 mb-2">Start Live Sessions</h2>
            <p className="text-gray-600 mb-4">Launch and control your live class room.</p>
            <div className="space-y-3">
              <input value={liveTopic} onChange={(e) => setLiveTopic(e.target.value)} placeholder="Live session topic" className="w-full border border-gray-300 rounded-lg px-3 py-2" />
              <div className="flex items-center justify-between bg-gray-50 rounded-lg px-3 py-2">
                <span className="text-sm text-gray-700">Status</span>
                <span className={`text-sm font-semibold ${isLive ? 'text-green-600' : 'text-gray-500'}`}>{isLive ? 'LIVE NOW' : 'Offline'}</span>
              </div>
              <button onClick={handleToggleLive} className={`w-full rounded-lg py-2 text-white ${isLive ? 'bg-red-600 hover:bg-red-700' : 'bg-violet-600 hover:bg-violet-700'}`}>
                {isLive ? 'End Live Session' : 'Go Live'}
              </button>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-md p-6 hover:shadow-lg transition-shadow">
            <div className="w-12 h-12 rounded-lg bg-violet-100 flex items-center justify-center mb-4">
              <FileText className="w-6 h-6 text-violet-600" />
            </div>
            <h2 className="text-xl font-semibold text-gray-900 mb-2">Publish Blogs</h2>
            <p className="text-gray-600 mb-4">Share posture guides, breathing tips, and insights.</p>
            <div className="space-y-3">
              <input value={blogTitle} onChange={(e) => setBlogTitle(e.target.value)} placeholder="Blog title" className="w-full border border-gray-300 rounded-lg px-3 py-2" />
              <textarea value={blogBody} onChange={(e) => setBlogBody(e.target.value)} rows={4} placeholder="Write your blog content..." className="w-full border border-gray-300 rounded-lg px-3 py-2 resize-none" />
              <div className="grid grid-cols-2 gap-2">
                <button
                  onClick={() => handlePublishBlog(false)}
                  className="border border-gray-300 rounded-lg py-2 hover:bg-gray-50"
                >
                  Save Draft
                </button>
                <button
                  onClick={() => handlePublishBlog(true)}
                  className="bg-violet-600 text-white rounded-lg py-2 hover:bg-violet-700"
                >
                  Publish
                </button>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-md p-6 hover:shadow-lg transition-shadow">
            <div className="w-12 h-12 rounded-lg bg-violet-100 flex items-center justify-center mb-4">
              <Users className="w-6 h-6 text-violet-600" />
            </div>
            <h2 className="text-xl font-semibold text-gray-900 mb-2">Manage Learners</h2>
            <p className="text-gray-600 mb-4">Track attendance and engagement for your batches.</p>
            <div className="space-y-2 max-h-48 overflow-auto">
              {learners.map((learner) => (
                <div key={learner.id} className="border border-gray-200 rounded-lg p-3">
                  <div className="flex items-center justify-between">
                    <p className="font-medium text-gray-900">{learner.name}</p>
                    <p className="text-sm text-violet-700">{learner.attendance}</p>
                  </div>
                  <p className="text-sm text-gray-500">{learner.plan} plan</p>
                  <a href={`mailto:${learner.email}`} className="text-xs text-violet-700 hover:text-violet-800">Message learner</a>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-md p-6 hover:shadow-lg transition-shadow">
            <div className="w-12 h-12 rounded-lg bg-violet-100 flex items-center justify-center mb-4">
              <Video className="w-6 h-6 text-violet-600" />
            </div>
            <h2 className="text-xl font-semibold text-gray-900 mb-2">Video Library</h2>
            <p className="text-gray-600 mb-4">Search and review uploaded video performance.</p>
            <input value={videoSearch} onChange={(e) => setVideoSearch(e.target.value)} placeholder="Search video title..." className="w-full border border-gray-300 rounded-lg px-3 py-2 mb-3" />
            <div className="space-y-2 max-h-48 overflow-auto">
              {filteredVideos.map((video) => (
                <div key={video.id} className="bg-gray-50 rounded-lg p-3">
                  <div className="flex items-center justify-between">
                    <p className="font-medium text-gray-900 text-sm">{video.title}</p>
                    <span className="text-xs px-2 py-1 rounded-full bg-violet-100 text-violet-700">{video.level}</span>
                  </div>
                  <div className="flex items-center justify-between mt-2 text-xs text-gray-500">
                    <span>{video.views} views</span>
                    <button className="inline-flex items-center text-violet-700 hover:text-violet-800">
                      <PlayCircle className="w-4 h-4 mr-1" />
                      Preview
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}


