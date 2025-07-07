'use client';

import React, { useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { BonsaiState, BonsaiGrowthStage } from '@/types/bonsai';
import { cn } from '@/lib/utils';

interface BonsaiTreeProps {
  state: BonsaiState;
  size?: 'small' | 'medium' | 'large';
  animated?: boolean;
  interactive?: boolean;
  className?: string;
  onInteraction?: (interaction: string) => void;
}

export function BonsaiTree({
  state,
  size = 'medium',
  animated = true,
  interactive = false,
  className,
  onInteraction
}: BonsaiTreeProps) {
  const svgRef = useRef<SVGSVGElement>(null);
  const [isHovered, setIsHovered] = useState(false);
  const [showParticles, setShowParticles] = useState(false);

  // Size configurations
  const sizeConfig = {
    small: { width: 60, height: 60, scale: 0.5 },
    medium: { width: 120, height: 120, scale: 0.75 },
    large: { width: 240, height: 240, scale: 1 }
  };

  const config = sizeConfig[size];

  // Growth stage configurations
  const getStageConfig = (stage: BonsaiGrowthStage) => {
    const configs = {
      seed: {
        trunkHeight: 10,
        trunkWidth: 2,
        branches: 0,
        leaves: 0,
        flowers: 0,
        opacity: 0.7
      },
      sprout: {
        trunkHeight: 25,
        trunkWidth: 3,
        branches: 2,
        leaves: 3,
        flowers: 0,
        opacity: 0.8
      },
      sapling: {
        trunkHeight: 40,
        trunkWidth: 4,
        branches: 5,
        leaves: 8,
        flowers: 0,
        opacity: 0.9
      },
      young_tree: {
        trunkHeight: 55,
        trunkWidth: 6,
        branches: 8,
        leaves: 15,
        flowers: 2,
        opacity: 1
      },
      mature_tree: {
        trunkHeight: 70,
        trunkWidth: 8,
        branches: 12,
        leaves: 25,
        flowers: 5,
        opacity: 1
      },
      ancient_tree: {
        trunkHeight: 80,
        trunkWidth: 10,
        branches: 18,
        leaves: 35,
        flowers: 8,
        opacity: 1
      },
      wisdom_tree: {
        trunkHeight: 90,
        trunkWidth: 12,
        branches: 25,
        leaves: 50,
        flowers: 12,
        opacity: 1
      }
    };
    
    return configs[stage] || configs.seed;
  };

  const stageConfig = getStageConfig(state.growthStage);

  // Generate branch paths based on stage
  const generateBranches = () => {
    const branches = [];
    const baseX = 120;
    const baseY = 200 - stageConfig.trunkHeight;
    
    for (let i = 0; i < stageConfig.branches; i++) {
      const angle = (i / stageConfig.branches) * Math.PI * 2;
      const length = 20 + Math.random() * 30;
      const startY = baseY + (i / stageConfig.branches) * stageConfig.trunkHeight * 0.7;
      
      const endX = baseX + Math.cos(angle) * length;
      const endY = startY - Math.abs(Math.sin(angle)) * length;
      
      // Control points for smooth curves
      const cp1X = baseX + Math.cos(angle) * length * 0.3;
      const cp1Y = startY - Math.abs(Math.sin(angle)) * length * 0.2;
      const cp2X = baseX + Math.cos(angle) * length * 0.7;
      const cp2Y = startY - Math.abs(Math.sin(angle)) * length * 0.6;
      
      branches.push({
        id: i,
        path: `M ${baseX} ${startY} C ${cp1X} ${cp1Y}, ${cp2X} ${cp2Y}, ${endX} ${endY}`,
        endX,
        endY,
        strokeWidth: Math.max(1, 4 - i * 0.2)
      });
    }
    
    return branches;
  };

  // Generate leaves positions
  const generateLeaves = (branches: any[]) => {
    const leaves = [];
    
    branches.forEach((branch, branchIndex) => {
      const leavesOnBranch = Math.ceil(stageConfig.leaves / Math.max(stageConfig.branches, 1));
      
      for (let i = 0; i < leavesOnBranch && leaves.length < stageConfig.leaves; i++) {
        const progress = (i + 1) / (leavesOnBranch + 1);
        const x = 120 + (branch.endX - 120) * progress;
        const y = (200 - stageConfig.trunkHeight) + (branch.endY - (200 - stageConfig.trunkHeight)) * progress;
        
        leaves.push({
          id: `${branchIndex}-${i}`,
          x: x + (Math.random() - 0.5) * 10,
          y: y + (Math.random() - 0.5) * 10,
          size: 3 + Math.random() * 2,
          rotation: Math.random() * 360
        });
      }
    });
    
    return leaves;
  };

  // Generate flowers positions
  const generateFlowers = (branches: any[]) => {
    const flowers = [];
    
    for (let i = 0; i < stageConfig.flowers && i < branches.length; i++) {
      const branch = branches[i];
      flowers.push({
        id: i,
        x: branch.endX + (Math.random() - 0.5) * 5,
        y: branch.endY + (Math.random() - 0.5) * 5,
        size: 2 + Math.random(),
        hue: Math.random() * 60 + 300 // Purple to pink range
      });
    }
    
    return flowers;
  };

  const branches = generateBranches();
  const leaves = generateLeaves(branches);
  const flowers = generateFlowers(branches);

  // Particle effect for leveling up
  useEffect(() => {
    if (animated && state.experience > 0) {
      setShowParticles(true);
      const timer = setTimeout(() => setShowParticles(false), 2000);
      return () => clearTimeout(timer);
    }
    return undefined;
  }, [state.level, animated]);

  // Interactive handlers
  const handleTreeClick = () => {
    if (interactive && onInteraction) {
      onInteraction('tree_clicked');
    }
  };

  const handleLeafClick = (leafId: string) => {
    if (interactive && onInteraction) {
      onInteraction(`leaf_clicked_${leafId}`);
    }
  };

  return (
    <div className={cn("relative", className)}>
      <motion.svg
        ref={svgRef}
        width={config.width}
        height={config.height}
        viewBox="0 0 240 240"
        className={cn(
          "transition-all duration-300",
          interactive && "cursor-pointer",
          isHovered && "drop-shadow-lg"
        )}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        onClick={handleTreeClick}
        initial={{ scale: 0, opacity: 0 }}
        animate={{ 
          scale: config.scale, 
          opacity: stageConfig.opacity 
        }}
        transition={{ duration: 0.8, type: "spring", damping: 20 }}
      >
        {/* Background glow effect */}
        {animated && (
          <defs>
            <radialGradient id="bonsaiGlow" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor={state.visualStyle.leafColor} stopOpacity="0.3" />
              <stop offset="100%" stopColor={state.visualStyle.leafColor} stopOpacity="0" />
            </radialGradient>
            
            <filter id="glow">
              <feGaussianBlur stdDeviation="3" result="coloredBlur"/>
              <feMerge> 
                <feMergeNode in="coloredBlur"/>
                <feMergeNode in="SourceGraphic"/>
              </feMerge>
            </filter>
          </defs>
        )}

        {/* Glowing background circle */}
        {animated && (
          <motion.circle
            cx="120"
            cy="120"
            r="80"
            fill="url(#bonsaiGlow)"
            initial={{ scale: 0 }}
            animate={{ scale: isHovered ? 1.2 : 1 }}
            transition={{ duration: 0.3 }}
          />
        )}

        {/* Trunk */}
        <motion.rect
          x={120 - stageConfig.trunkWidth / 2}
          y={200 - stageConfig.trunkHeight}
          width={stageConfig.trunkWidth}
          height={stageConfig.trunkHeight}
          fill={state.visualStyle.trunkColor}
          rx={stageConfig.trunkWidth / 2}
          initial={{ height: 0, y: 200 }}
          animate={{ 
            height: stageConfig.trunkHeight, 
            y: 200 - stageConfig.trunkHeight 
          }}
          transition={{ duration: 1, delay: 0.2 }}
        />

        {/* Branches */}
        <AnimatePresence>
          {branches.map((branch, index) => (
            <motion.path
              key={branch.id}
              d={branch.path}
              stroke={state.visualStyle.trunkColor}
              strokeWidth={branch.strokeWidth}
              fill="none"
              strokeLinecap="round"
              initial={{ pathLength: 0, opacity: 0 }}
              animate={{ pathLength: 1, opacity: 1 }}
              transition={{ 
                duration: 0.8, 
                delay: 0.5 + index * 0.1,
                ease: "easeOut"
              }}
            />
          ))}
        </AnimatePresence>

        {/* Leaves */}
        <AnimatePresence>
          {leaves.map((leaf, index) => (
            <motion.circle
              key={leaf.id}
              cx={leaf.x}
              cy={leaf.y}
              r={leaf.size}
              fill={state.visualStyle.leafColor}
              className={interactive ? "cursor-pointer hover:opacity-80" : ""}
              onClick={(e) => {
                e.stopPropagation();
                handleLeafClick(leaf.id);
              }}
              initial={{ scale: 0, opacity: 0 }}
              animate={{ 
                scale: 1, 
                opacity: 0.8,
                rotate: animated ? [0, 5, -5, 0] : 0
              }}
              transition={{ 
                duration: 0.5, 
                delay: 0.8 + index * 0.05,
                rotate: {
                  duration: 3,
                  repeat: Infinity,
                  ease: "easeInOut"
                }
              }}
              filter={animated ? "url(#glow)" : "none"}
            />
          ))}
        </AnimatePresence>

        {/* Flowers */}
        <AnimatePresence>
          {flowers.map((flower, index) => (
            <motion.g key={flower.id}>
              {/* Flower petals */}
              {[0, 1, 2, 3, 4].map((petal) => (
                <motion.ellipse
                  key={petal}
                  cx={flower.x}
                  cy={flower.y}
                  rx={flower.size}
                  ry={flower.size * 1.5}
                  fill={state.visualStyle.flowerColor || `hsl(${flower.hue}, 70%, 70%)`}
                  transform={`rotate(${petal * 72} ${flower.x} ${flower.y})`}
                  initial={{ scale: 0, opacity: 0 }}
                  animate={{ scale: 1, opacity: 0.9 }}
                  transition={{ 
                    duration: 0.6, 
                    delay: 1.2 + index * 0.1 + petal * 0.02 
                  }}
                />
              ))}
              {/* Flower center */}
              <motion.circle
                cx={flower.x}
                cy={flower.y}
                r={flower.size * 0.5}
                fill="#FEF3C7"
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ duration: 0.3, delay: 1.5 + index * 0.1 }}
              />
            </motion.g>
          ))}
        </AnimatePresence>

        {/* Particle effects */}
        <AnimatePresence>
          {showParticles && (
            <g>
              {Array.from({ length: 12 }, (_, i) => (
                <motion.circle
                  key={i}
                  cx={120}
                  cy={120}
                  r={2}
                  fill={state.visualStyle.leafColor}
                  initial={{ 
                    scale: 0, 
                    x: 0, 
                    y: 0, 
                    opacity: 1 
                  }}
                  animate={{ 
                    scale: [0, 1, 0], 
                    x: Math.cos(i * 30 * Math.PI / 180) * 40,
                    y: Math.sin(i * 30 * Math.PI / 180) * 40,
                    opacity: [1, 1, 0] 
                  }}
                  transition={{ 
                    duration: 1.5, 
                    delay: i * 0.1,
                    ease: "easeOut" 
                  }}
                />
              ))}
            </g>
          )}
        </AnimatePresence>
      </motion.svg>

      {/* Growth stage indicator */}
      {size === 'large' && (
        <motion.div
          className="absolute -bottom-6 left-1/2 transform -translate-x-1/2"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.5 }}
        >
          <div className="text-center">
            <p className="text-xs text-white/70 capitalize">
              {state.growthStage.replace('_', ' ')}
            </p>
            <p className="text-2xs text-white/50">
              Level {state.level}
            </p>
          </div>
        </motion.div>
      )}

      {/* Hover tooltip for interactive mode */}
      {interactive && isHovered && (
        <motion.div
          className="absolute -top-12 left-1/2 transform -translate-x-1/2 bg-black/80 text-white text-xs px-2 py-1 rounded pointer-events-none whitespace-nowrap"
          initial={{ opacity: 0, y: 5 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 5 }}
        >
          {state.experience}/{state.experienceToNext} XP
          <div className="absolute top-full left-1/2 transform -translate-x-1/2 border-4 border-transparent border-t-black/80" />
        </motion.div>
      )}
    </div>
  );
}

export default BonsaiTree;