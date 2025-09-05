import { motion } from 'framer-motion';

interface FXLogoProps {
  className?: string;
  size?: number;
}

export const FXLogo = ({ className = "", size = 40 }: FXLogoProps) => {
  return (
    <motion.div 
      className={className}
      whileHover={{ scale: 1.05 }}
      transition={{ duration: 0.2 }}
    >
      <svg 
        width={size} 
        height={size} 
        viewBox="0 0 100 100" 
        className="text-primary"
      >
        <defs>
          <linearGradient id="fx-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="hsl(var(--primary))" />
            <stop offset="100%" stopColor="hsl(var(--primary-variant))" />
          </linearGradient>
        </defs>
        
        {/* Rounded square background */}
        <rect 
          x="10" 
          y="10" 
          width="80" 
          height="80" 
          rx="16" 
          ry="16" 
          fill="url(#fx-gradient)"
          className="drop-shadow-sm"
        />
        
        {/* Letter F */}
        <path 
          d="M25 25 L25 75 M25 25 L55 25 M25 50 L50 50" 
          stroke="white" 
          strokeWidth="6" 
          strokeLinecap="round" 
          strokeLinejoin="round"
          fill="none"
        />
        
        {/* Letter X - interlocked with F */}
        <path 
          d="M45 35 L75 65 M75 35 L45 65" 
          stroke="white" 
          strokeWidth="6" 
          strokeLinecap="round" 
          strokeLinejoin="round"
          fill="none"
        />
      </svg>
    </motion.div>
  );
};