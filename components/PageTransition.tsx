import React from 'react';
import { motion } from 'framer-motion';

export const PageTransition = ({ children, className }: { children: React.ReactNode, className?: string }) => (
    <motion.div
        initial={{ opacity: 0, y: 15, scale: 0.98 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: -15, scale: 0.98 }}
        transition={{ type: "spring", stiffness: 300, damping: 30 }}
        className={`w-full h-full ${className}`}
    >
        {children}
    </motion.div>
);

export default PageTransition;
