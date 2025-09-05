import { motion } from 'framer-motion';

interface ExplainabilityIllustrationProps {
  className?: string;
  size?: number;
}

export const ExplainabilityIllustration = ({ className = "", size = 200 }: ExplainabilityIllustrationProps) => {
  return (
    <motion.div 
      className={className}
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.6 }}
    >
      <svg 
        width={size} 
        height={size} 
        viewBox="0 0 200 200" 
        className="text-primary"
      >
        <defs>
          <linearGradient id="pos-gradient" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="hsl(var(--success))" />
            <stop offset="100%" stopColor="hsl(var(--success))" stopOpacity="0.8" />
          </linearGradient>
          <linearGradient id="neg-gradient" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="hsl(var(--destructive))" />
            <stop offset="100%" stopColor="hsl(var(--destructive))" stopOpacity="0.8" />
          </linearGradient>
        </defs>
        
        {/* Chart background */}
        <rect x="20" y="20" width="160" height="160" rx="8" fill="white" stroke="hsl(var(--border))" strokeWidth="2" />
        
        {/* Chart title */}
        <text x="100" y="40" textAnchor="middle" className="text-xs font-semibold fill-current">SHAP Values</text>
        
        {/* Positive bars */}
        <motion.rect 
          x="100" 
          y="60" 
          width="60" 
          height="12" 
          rx="6" 
          fill="url(#pos-gradient)"
          initial={{ width: 0 }}
          animate={{ width: 60 }}
          transition={{ duration: 0.8, delay: 0.5 }}
        />
        <text x="95" y="70" textAnchor="end" className="text-xs fill-current">Income</text>
        
        <motion.rect 
          x="100" 
          y="80" 
          width="45" 
          height="12" 
          rx="6" 
          fill="url(#pos-gradient)"
          initial={{ width: 0 }}
          animate={{ width: 45 }}
          transition={{ duration: 0.8, delay: 0.7 }}
        />
        <text x="95" y="90" textAnchor="end" className="text-xs fill-current">History</text>
        
        <motion.rect 
          x="100" 
          y="100" 
          width="35" 
          height="12" 
          rx="6" 
          fill="url(#pos-gradient)"
          initial={{ width: 0 }}
          animate={{ width: 35 }}
          transition={{ duration: 0.8, delay: 0.9 }}
        />
        <text x="95" y="110" textAnchor="end" className="text-xs fill-current">Stability</text>
        
        {/* Negative bars */}
        <motion.rect 
          x="60" 
          y="130" 
          width="40" 
          height="12" 
          rx="6" 
          fill="url(#neg-gradient)"
          initial={{ width: 0 }}
          animate={{ width: 40 }}
          transition={{ duration: 0.8, delay: 1.1 }}
        />
        <text x="105" y="140" textAnchor="start" className="text-xs fill-current">Inquiries</text>
        
        <motion.rect 
          x="75" 
          y="150" 
          width="25" 
          height="12" 
          rx="6" 
          fill="url(#neg-gradient)"
          initial={{ width: 0 }}
          animate={{ width: 25 }}
          transition={{ duration: 0.8, delay: 1.3 }}
        />
        <text x="105" y="160" textAnchor="start" className="text-xs fill-current">Debt Ratio</text>
        
        {/* Center line */}
        <line x1="100" y1="50" x2="100" y2="170" stroke="hsl(var(--border))" strokeWidth="2" />
        
        {/* Floating explanation bubble */}
        <motion.g
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 1.8 }}
        >
          <rect x="130" y="25" width="45" height="20" rx="10" fill="hsl(var(--primary))" fillOpacity="0.1" />
          <text x="152.5" y="37" textAnchor="middle" className="text-xs fill-primary font-medium">+32 pts</text>
        </motion.g>
      </svg>
    </motion.div>
  );
};