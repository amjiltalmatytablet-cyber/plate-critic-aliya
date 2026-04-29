import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import StudentPage from './pages/StudentPage';
import AdminPage from './pages/AdminPage';

export default function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Navigate to="/student" replace />} />
        <Route path="/student" element={<StudentPage />} />
        <Route path="/admin" element={<AdminPage />} />
      </Routes>
    </Router>
  );
}
