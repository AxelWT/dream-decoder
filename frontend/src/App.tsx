import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { MainLayout } from './components/Layout/MainLayout';
import { Home } from './pages/Home';
import { Login } from './pages/Login';
import { Record } from './pages/Record';
import { Analyze } from './pages/Analyze';
import { Timeline } from './pages/Timeline';
import { DreamDetail } from './components/Dream/DreamDetail';

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route element={<MainLayout />}>
          <Route path="/" element={<Home />} />
          <Route path="/record" element={<Record />} />
          <Route path="/analyze" element={<Analyze />} />
          <Route path="/analyze/:sessionId" element={<Analyze />} />
          <Route path="/timeline" element={<Timeline />} />
          <Route path="/dream/:id" element={<DreamDetail />} />
        </Route>
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}
