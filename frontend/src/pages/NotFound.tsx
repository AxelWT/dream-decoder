import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Button } from '../components/UI/Button';

export function NotFound() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-night-950 flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center"
      >
        <div className="text-8xl mb-6 opacity-30">🌙</div>
        <h1 className="text-6xl font-bold text-gradient mb-4">404</h1>
        <p className="text-xl text-gray-400 mb-2">迷失在梦境中</p>
        <p className="text-sm text-gray-500 mb-8">你寻找的页面似乎已经消散在潜意识深处</p>
        <div className="flex gap-3 justify-center">
          <Button onClick={() => navigate('/')} size="lg">
            回到首页
          </Button>
          <Button variant="secondary" onClick={() => navigate(-1)} size="lg">
            返回上页
          </Button>
        </div>
      </motion.div>
    </div>
  );
}
