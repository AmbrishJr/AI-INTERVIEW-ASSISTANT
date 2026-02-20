import { motion } from 'framer-motion';
import { useState } from 'react';

const Dock = ({ items, spring, magnification, distance, panelHeight, dockHeight, baseItemSize }) => {
  const [hoveredIndex, setHoveredIndex] = useState(null);

  const springConfig = {
    mass: 0.1,
    stiffness: 1000,
    damping: 15,
    ...spring
  };

  return (
    <motion.div
      className="fixed bottom-4 left-1/2 transform -translate-x-1/2 flex items-end gap-2 px-4 py-2 rounded-full bg-black/20 backdrop-blur-md border border-white/10"
      style={{
        height: `${panelHeight}px`,
      }}
      initial={{ y: 100 }}
      animate={{ y: 0 }}
      transition={{
        type: "spring",
        ...springConfig
      }}
    >
      {items.map((item, index) => (
        <motion.button
          key={index}
          className="p-2 rounded-full bg-white/10 hover:bg-white/20 border border-white/20 transition-all duration-200 flex items-center justify-center"
          style={{
            width: `${baseItemSize}px`,
            height: `${baseItemSize}px`,
          }}
          whileHover={{
            scale: 1 + magnification,
          }}
          onHoverStart={() => setHoveredIndex(index)}
          onHoverEnd={() => setHoveredIndex(null)}
          onClick={item.onClick}
        >
          <div className="w-5 h-5 flex items-center justify-center">
            {item.icon}
          </div>
        </motion.button>
      ))}
    </motion.div>
  );
};

export default Dock;
