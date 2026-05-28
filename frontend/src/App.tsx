import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { MainLayout } from './components/Layout/MainLayout';
import { Home } from './pages/Home';
import { Login } from './pages/Login';
import { Record } from './pages/Record';
import { Analyze } from './pages/Analyze';
import { Timeline } from './pages/Timeline';
import { Insights } from './pages/Insights';
import { Gallery } from './pages/Gallery';
import { Profile } from './pages/Profile';
import { Pricing } from './pages/Pricing';
import { PaymentSuccess } from './pages/PaymentSuccess';
import { NotFound } from './pages/NotFound';
import { DreamDetail } from './components/Dream/DreamDetail';

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/pricing" element={<Pricing />} />
        <Route path="/payment-success" element={<PaymentSuccess />} />
        <Route element={<MainLayout />}>
          <Route path="/" element={<Home />} />
          <Route path="/record" element={<Record />} />
          <Route path="/analyze" element={<Analyze />} />
          <Route path="/analyze/:sessionId" element={<Analyze />} />
          <Route path="/timeline" element={<Timeline />} />
          <Route path="/insights" element={<Insights />} />
          <Route path="/gallery" element={<Gallery />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/dream/:id" element={<DreamDetail />} />
        </Route>
        <Route path="*" element={<NotFound />} />
      </Routes>
    </BrowserRouter>
  );
}
