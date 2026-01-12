import { motion } from "framer-motion";

const MistOverlay = ({ isPersistent = false }) => {
  return (
    <motion.div
      className="absolute inset-0 z-40 pointer-events-none overflow-hidden"
      initial={{ opacity: 0 }}
      animate={{ opacity: isPersistent ? 0.3 : 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: isPersistent ? 0 : 2 }}
    >
      {/* Primary mist layer */}
      <motion.div
        className="absolute inset-0"
        style={{
          background: "linear-gradient(to top, rgba(220,220,220,0.6), rgba(200,200,200,0.3), transparent)",
        }}
        animate={{
          y: [0, -20, 0],
          opacity: [0.5, 0.7, 0.5]
        }}
        transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
      />

      {/* Secondary mist layer */}
      <motion.div
        className="absolute inset-0"
        style={{
          background: "linear-gradient(180deg, transparent, rgba(210,210,210,0.4), transparent)",
        }}
        animate={{
          y: [0, 15, 0],
          opacity: [0.3, 0.5, 0.3]
        }}
        transition={{ duration: 6, repeat: Infinity, ease: "easeInOut", delay: 0.5 }}
      />
    </motion.div>
  );
};

export default MistOverlay;
