import React, { useEffect, useState } from 'react';
import { motion, useSpring, useTransform } from 'framer-motion';

const AnimatedCounter = ({ value, duration = 2 }) => {
  const [hasInView, setHasInView] = useState(false);
  const springValue = useSpring(0, {
    stiffness: 50,
    damping: 20,
    duration: duration * 1000
  });

  useEffect(() => {
    if (hasInView) {
      springValue.set(value || 0);
    }
  }, [value, springValue, hasInView]);

  const display = useTransform(springValue, (current) => {
    return Math.floor(current).toLocaleString('en-IN');
  });

  return (
    <motion.span
      onViewportEnter={() => setHasInView(true)}
      viewport={{ once: true }}
    >
      {display}
    </motion.span>
  );
};

export default AnimatedCounter;
