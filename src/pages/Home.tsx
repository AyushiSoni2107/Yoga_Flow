import { Link } from '../components/Link';

export function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-violet-50 to-white">
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="grid md:grid-cols-2 gap-12 items-center">
          <div className="space-y-6">
            <h1 className="text-5xl md:text-6xl font-bold text-gray-900 leading-tight">
              Find Your Inner Peace with{' '}
              <span className="text-violet-600">Yoga</span>
            </h1>
            <p className="text-xl text-gray-600">
              Join our yoga classes to improve flexibility, build strength, and achieve mindfulness in everyday life.
            </p>
            <Link
              href="/classes"
              className="inline-block bg-violet-600 text-white px-8 py-4 rounded-lg text-lg font-semibold hover:bg-violet-700 transition-all transform hover:scale-105 shadow-lg"
            >
              Start Now
            </Link>
          </div>
          <div className="relative">
            <img
              src="https://images.pexels.com/photos/3822906/pexels-photo-3822906.jpeg?auto=compress&cs=tinysrgb&w=800"
              alt="Yoga practitioner in nature"
              className="rounded-3xl shadow-2xl w-full h-[500px] object-cover"
            />
          </div>
        </div>
      </section>

      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold text-violet-600 mb-4">Why Choose Yoga Flow?</h2>
          <p className="text-xl text-gray-600">Transform your body, mind, and spirit</p>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          <div className="bg-white p-8 rounded-xl shadow-lg hover:shadow-xl transition-shadow">
            <div className="w-16 h-16 bg-violet-100 rounded-full flex items-center justify-center mb-6">
              <svg className="w-8 h-8 text-violet-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
            </div>
            <h3 className="text-2xl font-semibold text-gray-900 mb-4">Build Strength</h3>
            <p className="text-gray-600">Develop physical and mental strength through our challenging yet accessible yoga practices.</p>
          </div>

          <div className="bg-white p-8 rounded-xl shadow-lg hover:shadow-xl transition-shadow">
            <div className="w-16 h-16 bg-violet-100 rounded-full flex items-center justify-center mb-6">
              <svg className="w-8 h-8 text-violet-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.828 14.828a4 4 0 01-5.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h3 className="text-2xl font-semibold text-gray-900 mb-4">Find Balance</h3>
            <p className="text-gray-600">Achieve harmony between body and mind through meditation and mindful movement.</p>
          </div>

          <div className="bg-white p-8 rounded-xl shadow-lg hover:shadow-xl transition-shadow">
            <div className="w-16 h-16 bg-violet-100 rounded-full flex items-center justify-center mb-6">
              <svg className="w-8 h-8 text-violet-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
            </div>
            <h3 className="text-2xl font-semibold text-gray-900 mb-4">Join Community</h3>
            <p className="text-gray-600">Connect with like-minded practitioners on your wellness journey.</p>
          </div>
        </div>
      </section>

      <section className="bg-violet-50 py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-4xl font-bold text-gray-900 mb-6">Ready to Begin?</h2>
          <p className="text-xl text-gray-600 mb-8">Start your journey to wellness today</p>
          <Link
            href="/pricing"
            className="inline-block bg-violet-600 text-white px-8 py-4 rounded-lg text-lg font-semibold hover:bg-violet-700 transition-all transform hover:scale-105 shadow-lg"
          >
            View Pricing Plans
          </Link>
        </div>
      </section>
    </div>
  );
}
