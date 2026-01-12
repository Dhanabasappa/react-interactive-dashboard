import { motion } from "framer-motion";

const FogOverlay = ({ onComplete, isPersistent = false }) => {
  return (
    <motion.div
      className="absolute inset-0 z-40 pointer-events-none overflow-hidden"
      initial={{ opacity: 0 }}
      animate={{ opacity: isPersistent ? 0.4 : 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: isPersistent ? 0 : 2.5 }}
      onAnimationComplete={!isPersistent ? onComplete : undefined}
    >
      {/* Fog layers */}
      <motion.div
        className="absolute inset-0 backdrop-blur-md"
        animate={{
          opacity: [0.4, 0.6, 0.4]
        }}
        transition={{ duration: 4, repeat: Infinity }}
        style={{ background: "rgba(200, 200, 200, 0.3)" }}
      />
      
      {/* Additional fog swirls */}
      {[...Array(3)].map((_, i) => (
        <motion.div
          key={i}
          className="absolute w-full h-full"
          style={{ 
            background: `linear-gradient(90deg, transparent, rgba(220,220,220,0.2), transparent)`,
            top: `${i * 30}%`
          }}
          animate={{
            x: [-100, 100],
            opacity: [0.2, 0.5, 0.2]
          }}
          transition={{
            duration: 6 + i * 2,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        />
      ))}
    </motion.div>
  );
};

export default FogOverlay;
