import { useState, useEffect } from 'react';
import { AuthProvider } from './contexts/AuthContext';
import { Layout } from './components/Layout';
import { AIChatbot } from './components/AIChatbot';
import { Home } from './pages/Home';
import { Classes } from './pages/Classes';
import { Pricing } from './pages/Pricing';
import { Blogs } from './pages/Blogs';
// import { BlogDetails } from "./pages/BlogDetails";
import { Contact } from './pages/Contact';
import { Login } from './pages/Login';
import { Register } from './pages/Register';
import { Profile } from './pages/Profile';
import { MudraRecognition } from './pages/MudraRecognition';

function App() {
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
      // case '/blogs/details':
      //   return <BlogDetails />;
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
      default:
        return <Home />;
    }
  };

  return (
    <AuthProvider>
      <Layout>{renderPage()}</Layout>
      <AIChatbot />
    </AuthProvider>
  );
}

export default App;
