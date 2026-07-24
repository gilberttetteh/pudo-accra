import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Truck } from 'lucide-react';

export default function Intro({ onComplete }) {
  const [phase, setPhase] = useState(0);

  useEffect(() => {
    // Sequence timing
    const t1 = setTimeout(() => setPhase(1), 1500); // Van 1 stops in center
    const t2 = setTimeout(() => setPhase(2), 3000); // Van 1 leaves, text stays
    const t3 = setTimeout(() => setPhase(3), 4500); // Van 2 arrives
    const t4 = setTimeout(() => setPhase(4), 6000); // Van 2 leaves with text
    const t5 = setTimeout(() => onComplete(), 7500); // End Intro
    
    return () => {
      clearTimeout(t1); clearTimeout(t2); clearTimeout(t3); clearTimeout(t4); clearTimeout(t5);
    };
  }, [onComplete]);

  return (
    <div className="intro-screen">
      {/* The Welcome Text */}
      <motion.div
        className="intro-text"
        initial={{ opacity: 0, y: -20 }}
        animate={{ 
          opacity: (phase >= 1 && phase < 4) ? 1 : 0, 
          y: phase === 4 ? -100 : 0 
        }}
        transition={{ duration: 0.5 }}
      >
        Welcome to PUDO - Accra
      </motion.div>

      {/* Van 1 (The Dropper) */}
      {phase < 3 && (
        <motion.div
          className="van-container"
          initial={{ x: '-100vw' }}
          animate={{ x: phase === 0 ? 0 : '100vw' }}
          transition={{ duration: 1.5, ease: 'easeInOut' }}
        >
          <Truck size={80} color="#FF6B35" />
        </motion.div>
      )}

      {/* Van 2 (The Picker-Upper) */}
      {phase >= 3 && (
        <motion.div
          className="van-container"
          initial={{ x: '-100vw' }}
          animate={{ x: phase === 3 ? 0 : '100vw' }}
          transition={{ duration: 1.5, ease: 'easeInOut' }}
        >
          <Truck size={80} color="#004E89" />
        </motion.div>
      )}
    </div>
  );
}