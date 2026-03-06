import { useEffect, useMemo, useState } from 'react';
import { apiRequest, BlogPost, BlogFeedback } from '../lib/api';
import { Link } from '../components/Link';
import { Calendar, Star, User } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

export function BlogDetails() {
  const { user } = useAuth();
  const slug = useMemo(() => new URLSearchParams(window.location.search).get('slug') || '', []);

  const [post, setPost] = useState<BlogPost | null>(null);
  const [feedback, setFeedback] = useState<BlogFeedback[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const [name, setName] = useState('');
  const [message, setMessage] = useState('');
  const [rating, setRating] = useState(5);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    const load = async () => {
      if (!slug) {
        setError('Invalid blog link.');
        setLoading(false);
        return;
      }

      try {
        const [blogData, feedbackData] = await Promise.all([
          apiRequest<BlogPost>(`/blogs/${slug}`),
          apiRequest<BlogFeedback[]>(`/blogs/${slug}/feedback`),
        ]);
        setPost(blogData);
        setFeedback(feedbackData || []);
      } catch (err) {
        setError((err as Error).message || 'Failed to load blog details.');
      } finally {
        setLoading(false);
      }
    };

    load();
  }, [slug]);

  const submitFeedback = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !message.trim()) {
      setError('Please enter your name and feedback message.');
      return;
    }

    try {
      setSubmitting(true);
      setError('');
      const created = await apiRequest<BlogFeedback>(`/blogs/${slug}/feedback`, {
        method: 'POST',
        body: JSON.stringify({ name: name.trim(), message: message.trim(), rating }),
      });

      setFeedback((prev) => [created, ...prev]);
      setMessage('');
      setRating(5);
    } catch (err) {
      setError((err as Error).message || 'Failed to submit feedback.');
    } finally {
      setSubmitting(false);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-gray-600">Loading blog details...</p>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
        <div className="max-w-md w-full bg-white rounded-xl shadow-lg p-8 text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-3">Login Required</h2>
          <p className="text-gray-600 mb-6">Please login to read full blog details.</p>
          <Link href="/login" className="inline-block bg-violet-600 text-white px-6 py-3 rounded-lg hover:bg-violet-700">
            Go to Login
          </Link>
        </div>
      </div>
    );
  }

  if (!post) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4">
        <div className="text-center">
          <p className="text-red-600 mb-4">{error || 'Blog not found.'}</p>
          <Link href="/blogs" className="text-violet-600 font-semibold">Back to Blogs</Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <Link href="/blogs" className="text-violet-600 font-semibold">? Back to Blogs</Link>

        <article className="mt-4 bg-white rounded-xl shadow-lg overflow-hidden">
          <img
            src={post.image_url || 'https://images.pexels.com/photos/3822354/pexels-photo-3822354.jpeg?auto=compress&cs=tinysrgb&w=1200'}
            alt={post.title}
            className="w-full h-72 object-cover"
          />
          <div className="p-8">
            <div className="flex items-center text-sm text-gray-500 mb-3">
              <Calendar className="w-4 h-4 mr-2" />
              <span>{formatDate(post.created_at)}</span>
            </div>
            <div className="flex items-center text-sm text-gray-500 mb-3">
              <User className="w-4 h-4 mr-2" />
              <span>By {post.author_name || 'Yoga Flow Team'}</span>
            </div>
            <h1 className="text-4xl font-bold text-gray-900 mb-4">{post.title}</h1>
            <p className="text-gray-700 leading-8 whitespace-pre-line">{post.content}</p>
          </div>
        </article>

        <section className="mt-8 bg-white rounded-xl shadow-lg p-6">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Share Your Feedback</h2>
          {error && <p className="text-red-600 mb-3">{error}</p>}

          <form onSubmit={submitFeedback} className="space-y-4">
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Your name"
              className="w-full border border-gray-300 rounded-lg px-4 py-3"
              required
            />
            <textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Write your feedback"
              rows={4}
              className="w-full border border-gray-300 rounded-lg px-4 py-3 resize-none"
              required
            />

            <div className="flex items-center gap-2">
              <span className="text-sm text-gray-700">Rating:</span>
              {[1, 2, 3, 4, 5].map((r) => (
                <button
                  key={r}
                  type="button"
                  onClick={() => setRating(r)}
                  className="text-yellow-500"
                >
                  <Star className={`w-5 h-5 ${r <= rating ? 'fill-current' : ''}`} />
                </button>
              ))}
            </div>

            <button
              type="submit"
              disabled={submitting}
              className="bg-violet-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-violet-700 disabled:opacity-50"
            >
              {submitting ? 'Submitting...' : 'Submit Feedback'}
            </button>
          </form>
        </section>

        <section className="mt-6 bg-white rounded-xl shadow-lg p-6">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Reader Feedback ({feedback.length})</h2>
          {feedback.length === 0 && <p className="text-gray-600">No feedback yet. Be the first to share.</p>}

          <div className="space-y-4">
            {feedback.map((item) => (
              <div key={item.id} className="border border-gray-200 rounded-lg p-4">
                <div className="flex items-center justify-between mb-1">
                  <p className="font-semibold text-gray-900">{item.name}</p>
                  <p className="text-xs text-gray-500">{formatDate(item.created_at)}</p>
                </div>
                <div className="flex items-center gap-1 mb-2 text-yellow-500">
                  {[1, 2, 3, 4, 5].map((r) => (
                    <Star key={r} className={`w-4 h-4 ${r <= item.rating ? 'fill-current' : ''}`} />
                  ))}
                </div>
                <p className="text-gray-700">{item.message}</p>
              </div>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}
