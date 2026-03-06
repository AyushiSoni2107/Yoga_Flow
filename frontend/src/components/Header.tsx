import { Link } from './Link';
import { useAuth } from '../contexts/AuthContext';
import { Menu, X, User } from 'lucide-react';
import { useState } from 'react';

export function Header() {
  const { user, profile } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navigation = user
    ? [
        { name: 'Home', href: '/' },
        { name: 'Classes', href: '/classes' },
        { name: 'Pricing', href: '/pricing' },
        { name: 'Blogs', href: '/blogs' },
        { name: 'Mudra AI', href: '/mudra-recognition' },
        { name: 'Contact', href: '/contact' },
      ]
    : [
        { name: 'Home', href: '/' },
        { name: 'Classes', href: '/classes' },
        { name: 'Pricing', href: '/pricing' },
        { name: 'Blogs', href: '/blogs' },
        { name: 'Mudra AI', href: '/mudra-recognition' },
        { name: 'Contact', href: '/contact' },
      ];

  return (
    <header className="bg-white shadow-sm sticky top-0 z-50">
      <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <Link href="/" className="text-2xl font-bold text-violet-600">
            Yoga Flow
          </Link>

          <div className="hidden md:flex items-center space-x-8">
            {navigation.map((item) => (
              <Link
                key={item.name}
                href={item.href}
                className="text-gray-700 hover:text-violet-600 transition-colors"
              >
                {item.name}
              </Link>
            ))}

            {user ? (
              <div className="flex items-center">
                <Link href="/profile" className="flex items-center space-x-2">
                  {profile?.avatar_url ? (
                    <img
                      src={profile.avatar_url}
                      alt={profile.full_name}
                      className="w-8 h-8 rounded-full object-cover"
                    />
                  ) : (
                    <div className="w-8 h-8 rounded-full bg-violet-100 flex items-center justify-center">
                      <User className="w-5 h-5 text-violet-600" />
                    </div>
                  )}
                  <span className="text-gray-700">{profile?.full_name}</span>
                </Link>
              </div>
            ) : (
              <Link
                href="/login"
                className="bg-violet-600 text-white px-6 py-2 rounded-lg hover:bg-violet-700 transition-colors"
              >
                Login
              </Link>
            )}
          </div>

          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden text-gray-700"
          >
            {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>

        {mobileMenuOpen && (
          <div className="md:hidden py-4 space-y-4">
            {navigation.map((item) => (
              <Link
                key={item.name}
                href={item.href}
                className="block text-gray-700 hover:text-violet-600 transition-colors"
                onClick={() => setMobileMenuOpen(false)}
              >
                {item.name}
              </Link>
            ))}
            {user ? (
              <>
                <Link
                  href="/profile"
                  className="block text-gray-700 hover:text-violet-600 transition-colors"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Profile
                </Link>
              </>
            ) : (
              <Link
                href="/login"
                className="block bg-violet-600 text-white px-6 py-2 rounded-lg hover:bg-violet-700 transition-colors text-center"
                onClick={() => setMobileMenuOpen(false)}
              >
                Login
              </Link>
            )}
          </div>
        )}
      </nav>
    </header>
  );
}
