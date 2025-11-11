import React from "react";
import { motion } from "framer-motion";

const Hero = () => {
  return (
    <div className="relative flex flex-col items-center justify-center min-h-screen text-center overflow-hidden">
      {/* Background Gradient */}
      <div className="absolute inset-0 bg-gradient-to-br from-black via-fuchsia-900/20 to-cyan-900/20" />

      {/* Floating Orbs */}
      <motion.div
        className="absolute w-72 h-72 bg-fuchsia-500/20 blur-3xl rounded-full"
        animate={{ x: [0, 100, -100, 0], y: [0, 80, -80, 0] }}
        transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
      />
      <motion.div
        className="absolute w-64 h-64 bg-cyan-400/20 blur-3xl rounded-full"
        animate={{ x: [50, -50, 50], y: [-50, 50, -50] }}
        transition={{ duration: 12, repeat: Infinity, ease: "easeInOut" }}
      />

      {/* Main Content */}
      <motion.h1
        className="text-6xl md:text-8xl font-bold mb-4 text-transparent bg-clip-text bg-gradient-to-r from-fuchsia-500 to-cyan-400 drop-shadow-[0_0_20px_rgba(255,0,255,0.3)]"
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 1 }}
      >
        VYNCE
      </motion.h1>

      <motion.p
        className="text-lg md:text-2xl text-gray-300 mb-10"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3, duration: 1 }}
      >
        The Next-Gen Social Experience
      </motion.p>

      <div className="flex gap-6">
        <motion.button
          className="px-8 py-3 rounded-full bg-gradient-to-r from-fuchsia-500 to-cyan-400 text-black font-semibold shadow-lg shadow-fuchsia-500/30 hover:scale-105 transition"
          whileHover={{ scale: 1.1 }}
        >
          Launch App
        </motion.button>

        <motion.button
          className="px-8 py-3 rounded-full border border-cyan-400 text-cyan-400 hover:bg-cyan-400 hover:text-black transition"
          whileHover={{ scale: 1.1 }}
        >
          Learn More
        </motion.button>
      </div>
    </div>
  );
};

export default Hero;
