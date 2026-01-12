import { motion } from "framer-motion";

const SnowOverlay = ({ isPersistent = false }) => {
  const snowflakes = [...Array(40)].map(() => ({
    id: Math.random(),
    left: Math.random() * 100,
    delay: Math.random() * 0.8,
    duration: 3 + Math.random() * 2
  }));

  return (
    <motion.div 
      className="absolute inset-0 z-40 pointer-events-none overflow-hidden"
      initial={{ opacity: 0 }}
      animate={{ opacity: isPersistent ? 0.5 : 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: isPersistent ? 0 : 2 }}
    >
      {/* Snowy background */}
      <div className="absolute inset-0 bg-gradient-to-b from-blue-200/40 via-blue-100/20 to-transparent" />

      {/* Snowflakes */}
      {snowflakes.map((flake) => (
        <motion.div
          key={flake.id}
          className="absolute w-2 h-2 bg-white rounded-full shadow-lg"
          style={{
            left: `${flake.left}%`,
            top: "-10px",
            boxShadow: "0 0 10px rgba(255, 255, 255, 0.8)"
          }}
          animate={{
            y: [0, window.innerHeight + 20],
            x: [-10, 20, -10],
            opacity: [1, 0.8, 0]
          }}
          transition={{
            duration: flake.duration,
            delay: flake.delay,
            repeat: Infinity,
            repeatDelay: 0.3
          }}
        />
      ))}
    </motion.div>
  );
};

export default SnowOverlay;