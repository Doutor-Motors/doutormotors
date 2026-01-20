import { motion } from "framer-motion";
import expertLogoImg from "@/assets/images/expert-logo.png";

interface ExpertLogoProps {
  size?: "sm" | "md" | "lg";
  className?: string;
}

const sizeMap = {
  sm: { container: "w-12 h-12", glow: 6 },
  md: { container: "w-16 h-16", glow: 8 },
  lg: { container: "w-24 h-24", glow: 12 },
};

const ExpertLogo = ({ size = "md", className = "" }: ExpertLogoProps) => {
  const { container, glow } = sizeMap[size];
  
  return (
    <div className={`relative ${className}`}>
      {/* Outer ring animation */}
      <motion.div
        className={`absolute inset-0 ${container} rounded-full`}
        animate={{
          boxShadow: [
            "0 0 0 0 rgba(220, 38, 38, 0.4)",
            `0 0 0 ${glow}px rgba(220, 38, 38, 0)`,
          ],
        }}
        transition={{
          duration: 2,
          repeat: Infinity,
          ease: "easeOut",
        }}
      />
      
      {/* Secondary pulse */}
      <motion.div
        className={`absolute inset-0 ${container} rounded-full bg-primary/10`}
        animate={{
          scale: [1, 1.2, 1],
          opacity: [0.5, 0, 0.5],
        }}
        transition={{
          duration: 3,
          repeat: Infinity,
          ease: "easeInOut",
        }}
      />
      
      {/* Rotating dots/particles */}
      <motion.div
        className={`absolute inset-0 ${container}`}
        animate={{ rotate: 360 }}
        transition={{
          duration: 15,
          repeat: Infinity,
          ease: "linear",
        }}
      >
        {[...Array(6)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-1.5 h-1.5 rounded-full bg-primary"
            style={{
              top: "50%",
              left: "50%",
              transform: `rotate(${i * 60}deg) translateY(-${glow + 12}px)`,
              transformOrigin: "0 0",
            }}
            animate={{
              scale: [0.5, 1, 0.5],
              opacity: [0.3, 1, 0.3],
            }}
            transition={{
              duration: 2,
              repeat: Infinity,
              delay: i * 0.3,
              ease: "easeInOut",
            }}
          />
        ))}
      </motion.div>
      
      {/* Inner glow ring */}
      <motion.div
        className={`absolute inset-1 rounded-full border-2 border-primary/30`}
        animate={{
          borderColor: [
            "rgba(220, 38, 38, 0.3)",
            "rgba(220, 38, 38, 0.6)",
            "rgba(220, 38, 38, 0.3)",
          ],
        }}
        transition={{
          duration: 2,
          repeat: Infinity,
          ease: "easeInOut",
        }}
      />
      
      {/* Main logo container */}
      <motion.div
        className={`relative ${container} rounded-full overflow-hidden bg-gradient-to-br from-background via-background to-muted flex items-center justify-center shadow-lg`}
        animate={{
          y: [0, -3, 0],
        }}
        transition={{
          duration: 4,
          repeat: Infinity,
          ease: "easeInOut",
        }}
        whileHover={{
          scale: 1.05,
          rotate: [0, -5, 5, 0],
          transition: { duration: 0.5 },
        }}
      >
        {/* Gradient overlay */}
        <motion.div
          className="absolute inset-0 bg-gradient-to-tr from-primary/10 via-transparent to-primary/5"
          animate={{
            opacity: [0.5, 1, 0.5],
          }}
          transition={{
            duration: 3,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />
        
        {/* Logo image */}
        <motion.img
          src={expertLogoImg}
          alt="Especialista Automotivo"
          className="w-full h-full object-contain p-1"
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ 
            scale: 1, 
            opacity: 1,
          }}
          transition={{
            duration: 0.5,
            ease: "easeOut",
          }}
        />
        
        {/* Shine effect */}
        <motion.div
          className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -skew-x-12"
          animate={{
            x: ["-100%", "200%"],
          }}
          transition={{
            duration: 3,
            repeat: Infinity,
            repeatDelay: 4,
            ease: "easeInOut",
          }}
        />
      </motion.div>
      
      {/* Tech circuit lines effect */}
      <svg
        className={`absolute inset-0 ${container} pointer-events-none`}
        viewBox="0 0 100 100"
      >
        <motion.circle
          cx="50"
          cy="50"
          r="48"
          fill="none"
          stroke="currentColor"
          strokeWidth="0.5"
          className="text-primary/20"
          strokeDasharray="10 5"
          animate={{ rotate: 360 }}
          transition={{
            duration: 20,
            repeat: Infinity,
            ease: "linear",
          }}
          style={{ transformOrigin: "center" }}
        />
      </svg>
    </div>
  );
};

export default ExpertLogo;
