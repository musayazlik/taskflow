"use client";

import { cn } from "@repo/shadcn-ui/lib/utils";
import { motion, useMotionValue, useSpring, useTransform, type MotionValue } from "framer-motion";
import React, { useRef } from "react";

export interface DockProps {
  children: React.ReactNode;
  className?: string;
  direction?: "left" | "right" | "middle";
  distance?: number;
}

export function Dock({
  children,
  className,
  direction = "middle",
  distance = 150,
}: DockProps) {
  const mouseX = useMotionValue(Infinity);

  return (
    <div
      onMouseMove={(e) => mouseX.set(e.pageX)}
      onMouseLeave={() => mouseX.set(Infinity)}
      className={cn(
        "flex items-end gap-2 rounded-2xl bg-card/80 backdrop-blur-xl border border-border/50 px-4 pb-3 pt-3 shadow-2xl",
        {
          "justify-start": direction === "left",
          "justify-end": direction === "right",
          "justify-center": direction === "middle",
        },
        className
      )}
    >
      {React.Children.map(children, (child) => {
        if (React.isValidElement(child) && child.type === DockIcon) {
          return React.cloneElement(child as React.ReactElement<DockIconProps>, {
            mouseX,
            distance,
          });
        }
        return child;
      })}
    </div>
  );
}

export interface DockIconProps {
  children: React.ReactNode;
  className?: string;
  mouseX?: MotionValue<number>;
  distance?: number;
  onClick?: () => void;
}

export function DockIcon({
  children,
  className,
  mouseX,
  distance = 150,
  onClick,
}: DockIconProps) {
  const ref = useRef<HTMLDivElement>(null);

  const distanceFromMouse = useTransform(mouseX || useMotionValue(Infinity), (val) => {
    if (ref.current) {
      const rect = ref.current.getBoundingClientRect();
      const center = rect.left + rect.width / 2;
      return val - center;
    }
    return Infinity;
  });

  const widthTransform = useTransform(
    distanceFromMouse,
    [-distance, 0, distance],
    [40, 80, 40]
  );
  const heightTransform = useTransform(
    distanceFromMouse,
    [-distance, 0, distance],
    [40, 80, 40]
  );

  const width = useSpring(widthTransform, {
    mass: 0.1,
    stiffness: 150,
    damping: 12,
  });
  const height = useSpring(heightTransform, {
    mass: 0.1,
    stiffness: 150,
    damping: 12,
  });

  return (
    <motion.div
      ref={ref}
      style={{ width, height }}
      onClick={onClick}
      className={cn(
        "flex items-center justify-center rounded-2xl bg-card border border-border/50 hover:border-primary/50 transition-colors cursor-pointer",
        className
      )}
    >
      {children}
    </motion.div>
  );
}
