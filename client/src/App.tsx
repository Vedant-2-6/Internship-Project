import './App.css';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import AuthForm from './components/AuthForm';
import Dashboard from './components/Dashboard';
import Archived from './components/Archived';
import SharedPage from './components/SharedPage';

function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          <Route path="/auth" element={<AuthForm />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/archived" element={<Archived />} />
          <Route path="/shared-notes" element={<SharedPage />} />
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;
