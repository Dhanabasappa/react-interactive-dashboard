import { motion } from "framer-motion";

const SunnyOverlay = ({ onComplete, isPersistent = false }) => {
  const sunVariants = {
    initial: { opacity: 0, scale: 0.8 },
    animate: { 
      opacity: isPersistent ? 0.6 : 1, 
      scale: 1,
      transition: { duration: 1.5 }
    },
    exit: { opacity: 0, scale: 0.8, transition: { duration: 1 } }
  };

  const rayVariants = {
    animate: {
      rotate: 360,
      transition: { duration: 20, repeat: Infinity, ease: "linear" }
    }
  };

  return (
    <motion.div
      className="absolute inset-0 z-40 pointer-events-none overflow-hidden"
      initial={{ opacity: 0 }}
      animate={{ opacity: isPersistent ? 0.4 : 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: isPersistent ? 0 : 2 }}
      onAnimationComplete={!isPersistent ? onComplete : undefined}
    >
      {/* Background gradient */}
      <div className="absolute inset-0 bg-gradient-to-b from-yellow-200/40 via-orange-100/20 to-transparent" />

      {/* Sun */}
      <motion.div
        className="absolute top-20 right-20 w-32 h-32 rounded-full bg-yellow-400 shadow-2xl"
        variants={sunVariants}
        initial="initial"
        animate="animate"
        exit="exit"
      >
        {/* Sun glow */}
        <motion.div
          className="absolute inset-0 rounded-full bg-yellow-300"
          animate={{
            scale: [1, 1.2, 1],
            opacity: [0.3, 0.5, 0.3]
          }}
          transition={{ duration: 3, repeat: Infinity }}
        />
      </motion.div>

      {/* Light rays */}
      <motion.div
        className="absolute top-16 right-16 w-48 h-48"
        variants={rayVariants}
        animate="animate"
      >
        {[...Array(8)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute top-1/2 left-1/2 w-1 h-20 bg-gradient-to-t from-yellow-300 to-transparent origin-bottom"
            style={{
              transform: `translateX(-50%) rotate(${i * 45}deg) translateY(-60px)`,
            }}
            animate={{
              opacity: [0.3, 0.8, 0.3],
            }}
            transition={{ duration: 2, delay: i * 0.1, repeat: Infinity }}
          />
        ))}
      </motion.div>
    </motion.div>
  );
};

export default SunnyOverlay;
