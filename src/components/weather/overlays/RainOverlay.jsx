import { motion } from "framer-motion";

const RainOverlay = ({ isPersistent = false }) => {
  const raindrops = [...Array(50)].map(() => ({
    id: Math.random(),
    left: Math.random() * 100,
    delay: Math.random() * 0.5,
    duration: 0.5 + Math.random() * 0.3
  }));

  return (
    <motion.div 
      className="absolute inset-0 z-40 pointer-events-none overflow-hidden"
      initial={{ opacity: 0 }}
      animate={{ opacity: isPersistent ? 0.4 : 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: isPersistent ? 0 : 1.5 }}
    >
      {/* Dark cloud background */}
      <div className="absolute inset-0 bg-gradient-to-b from-gray-700/50 via-gray-600/30 to-transparent" />

      {/* Raindrops */}
      {raindrops.map((drop) => (
        <motion.div
          key={drop.id}
          className="absolute w-0.5 h-8 bg-gradient-to-b from-blue-300 to-blue-500/0"
          style={{
            left: `${drop.left}%`,
            top: "-30px"
          }}
          animate={{
            y: [0, window.innerHeight + 60],
            opacity: [1, 0]
          }}
          transition={{
            duration: drop.duration,
            delay: drop.delay,
            repeat: Infinity,
            repeatDelay: 0.2
          }}
        />
      ))}
    </motion.div>
  );
};

export default RainOverlay;