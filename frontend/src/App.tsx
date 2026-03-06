import { useState, useEffect } from 'react';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { Layout } from './components/Layout';
import { AIChatbot } from './components/AIChatbot';
import { Home } from './pages/Home';
import { Classes } from './pages/Classes';
import { Pricing } from './pages/Pricing';
import { Blogs } from './pages/Blogs';
import { BlogDetails } from './pages/BlogDetails';
import { Contact } from './pages/Contact';
import { Login } from './pages/Login';
import { Register } from './pages/Register';
import { Profile } from './pages/Profile';
import { MudraRecognition } from './pages/MudraRecognition';
import { InstructorDashboard } from './pages/InstructorDashboard';
import { LearnerDashboard } from './pages/LearnerDashboard';
import { AdminDashboard } from './pages/AdminDashboard';

function AppContent() {
  const { loading } = useAuth();
  const [currentPath, setCurrentPath] = useState(window.location.pathname);

  useEffect(() => {
    const handlePopState = () => {
      setCurrentPath(window.location.pathname);
    };

    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  const renderPage = () => {
    switch (currentPath) {
      case '/':
        return <Home />;
      case '/classes':
        return <Classes />;
      case '/pricing':
        return <Pricing />;
      case '/blogs':
        return <Blogs />;
      case '/blogs/details':
        return <BlogDetails />;
      case '/contact':
        return <Contact />;
      case '/login':
        return <Login />;
      case '/register':
        return <Register />;
      case '/profile':
        return <Profile />;
      case '/mudra-recognition':
        return <MudraRecognition />;
      case '/instructor-dashboard':
        return <InstructorDashboard />;
      case '/learner-dashboard':
        return <LearnerDashboard />;
      case '/admin-dashboard':
        return <AdminDashboard />;
      default:
        return <Home />;
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-gray-600">Loading...</p>
      </div>
    );
  }

  return (
    <>
      <Layout>{renderPage()}</Layout>
      <AIChatbot />
    </>
  );
}

function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}

export default App;
