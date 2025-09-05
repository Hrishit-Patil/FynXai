import { motion } from "framer-motion";

interface UploadIllustrationProps {
  className?: string;
  size?: number;
}

export const UploadIllustration = ({
  className = "",
  size = 200,
}: UploadIllustrationProps) => {
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
          <linearGradient
            id="upload-gradient"
            x1="0%"
            y1="0%"
            x2="100%"
            y2="100%"
          >
            <stop
              offset="0%"
              stopColor="hsl(var(--primary))"
              stopOpacity="0.8"
            />
            <stop
              offset="100%"
              stopColor="hsl(var(--primary-variant))"
              stopOpacity="0.6"
            />
          </linearGradient>
        </defs>

        {/* PDF Document */}
        <motion.rect
          x="50"
          y="0"
          width="100"
          height="120"
          rx="8"
          fill="white"
          stroke="hsl(var(--border))"
          strokeWidth="2"
          initial={{ y: 80, opacity: 0 }}
          animate={{ y: 60, opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        />

        {/* PDF Icon */}
        <text
          x="100"
          y="80"
          textAnchor="middle"
          dominantBaseline="middle"
          fontSize="12"
          fontWeight="bold"
          fill="hsl(var(--destructive))"
        >
          PDF
        </text>

        {/* Document lines */}
        <rect
          x="65"
          y="95"
          width="70"
          height="4"
          rx="2"
          fill="hsl(var(--muted-foreground))"
        />
        <rect
          x="65"
          y="110"
          width="55"
          height="4"
          rx="2"
          fill="hsl(var(--muted-foreground))"
        />
        <rect
          x="65"
          y="125"
          width="65"
          height="4"
          rx="2"
          fill="hsl(var(--muted-foreground))"
        />
        <rect
          x="65"
          y="140"
          width="50"
          height="4"
          rx="2"
          fill="hsl(var(--muted-foreground))"
        />

        {/* Scanning line animation */}
        <motion.rect
          x="50"
          y="0"
          width="100"
          height="3"
          fill="url(#upload-gradient)"
          initial={{ y: 60 }}
          animate={{ y: 177 }}
          transition={{
            duration: 2,
            repeat: Infinity,
            ease: "linear",
            delay: 0.5,
          }}
        />

        {/* Extracted text particles */}
        <motion.g
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.3, delay: 1 }}
        >
          <motion.circle
            cx="150"
            cy="40"
            r="2.5"
            fill="hsl(var(--success))"
            animate={{ y: [0, -10, 0] }}
            transition={{ duration: 1, repeat: Infinity, delay: 0 }}
          />
          <motion.circle
            cx="160"
            cy="55"
            r="2.5"
            fill="hsl(var(--success))"
            animate={{ y: [0, -10, 0] }}
            transition={{ duration: 1, repeat: Infinity, delay: 0.2 }}
          />
          <motion.circle
            cx="170"
            cy="70"
            r="2.5"
            fill="hsl(var(--success))"
            animate={{ y: [0, -10, 0] }}
            transition={{ duration: 1, repeat: Infinity, delay: 0.4 }}
          />
        </motion.g>

        {/* Upload arrow (centered at top) */}
        <motion.path
          d="M100 50 L100 25 M90 35 L100 20 L110 35"
          stroke="hsl(var(--primary))"
          strokeWidth="3"
          fill="none"
          strokeLinecap="round"
          strokeLinejoin="round"
          initial={{ pathLength: 0, opacity: 0 }}
          animate={{ pathLength: 1, opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.8 }}
        />
      </svg>
    </motion.div>
  );
};
