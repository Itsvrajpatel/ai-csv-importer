"use client";

import React from "react";
import { motion } from "framer-motion";

export function SkeletonTable() {
  return (
    <div className="w-full bg-white rounded-lg border border-zinc-200 overflow-hidden shadow-sm">
      {/* Header Skeleton */}
      <div className="flex items-center px-4 py-3 bg-zinc-50 border-b border-zinc-200">
        {[1, 2, 3, 4, 5].map((i) => (
          <div key={i} className="flex-1 mr-4 last:mr-0">
            <div className="h-4 bg-zinc-200 rounded animate-pulse w-24"></div>
          </div>
        ))}
      </div>
      
      {/* Rows Skeleton */}
      <div className="divide-y divide-zinc-100">
        {[1, 2, 3, 4, 5, 6].map((row) => (
          <div key={row} className="flex items-center px-4 py-3">
            {[1, 2, 3, 4, 5].map((col) => (
              <div key={col} className="flex-1 mr-4 last:mr-0">
                <div 
                  className="h-4 bg-zinc-100 rounded animate-pulse"
                  style={{ width: `${Math.random() * 40 + 40}%` }}
                ></div>
              </div>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}
