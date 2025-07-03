import React from 'react';
import { motion } from 'framer-motion';
import { CheckCircle, ArrowRight } from 'lucide-react';
import Link from 'next/link';

const SectionComplete = ({ chapter = 5 }) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="mt-8 bg-emerald-900/20 rounded-lg p-4 border border-emerald-500/30"
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: "spring", stiffness: 200, damping: 10 }}
          >
            <CheckCircle className="w-8 h-8 text-emerald-400" />
          </motion.div>
          <div>
            <h3 className="text-lg font-semibold text-emerald-400">
              Section Complete!
            </h3>
            <p className="text-sm text-neutral-300">
              Great work! Ready to continue learning?
            </p>
          </div>
        </div>
        
        <Link href={`/chapter${chapter}`}>
          <motion.button
            className="px-6 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-medium 
                       rounded-lg transition-colors flex items-center gap-2"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            Back to Chapter {chapter}
            <ArrowRight className="w-4 h-4" />
          </motion.button>
        </Link>
      </div>
    </motion.div>
  );
};

export default SectionComplete;