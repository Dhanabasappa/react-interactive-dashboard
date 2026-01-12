import { motion } from "framer-motion";

const CloudOverlay = ({ isPersistent = false }) => {
  const cloudVariants = {
    animate: {
      x: [0, 30, 0],
      transition: { duration: 6, repeat: Infinity, ease: "easeInOut" }
    }
  };

  return (
    <motion.div 
      className="absolute inset-0 z-40 pointer-events-none overflow-hidden"
      initial={{ opacity: 0 }}
      animate={{ opacity: isPersistent ? 0.5 : 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: isPersistent ? 0 : 1.5 }}
    >
      {/* Sky background */}
      <div className="absolute inset-0 bg-gradient-to-b from-gray-300/50 via-gray-200/30 to-transparent" />

      {/* Animated clouds */}
      {[...Array(5)].map((_, i) => (
        <motion.div
          key={i}
          className="absolute bg-white/70 rounded-full blur-xl"
          style={{
            width: `${100 + i * 50}px`,
            height: `${50 + i * 20}px`,
            top: `${10 + i * 15}%`,
            left: `${-10 + i * 20}%`,
          }}
          variants={cloudVariants}
          animate="animate"
          transition={{
            duration: 8 + i * 2,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        />
      ))}
    </motion.div>
  );
};

export default CloudOverlay;
