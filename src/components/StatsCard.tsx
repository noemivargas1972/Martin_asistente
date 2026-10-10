import React from "react";
import { LucideIcon } from "lucide-react";
import { motion } from "motion/react";

interface StatsCardProps {
  id: string;
  title: string;
  value: string;
  diff: number;
  diffLabel: string;
  icon: LucideIcon;
  color: "blue" | "green" | "purple" | "orange" | "cyan";
}

export default function StatsCard({ id, title, value, diff, diffLabel, icon: Icon, color }: StatsCardProps) {
  const isPositive = diff >= 0;

  const colorStyles = {
    blue: {
      bg: "bg-blue-50/50 border-blue-100",
      iconBg: "bg-blue-100 text-blue-600",
      text: "text-blue-700"
    },
    green: {
      bg: "bg-emerald-50/50 border-emerald-100",
      iconBg: "bg-emerald-100 text-emerald-600",
      text: "text-emerald-700"
    },
    purple: {
      bg: "bg-purple-50/50 border-purple-100",
      iconBg: "bg-purple-100 text-purple-600",
      text: "text-purple-700"
    },
    orange: {
      bg: "bg-orange-50/50 border-orange-100",
      iconBg: "bg-orange-100 text-orange-600",
      text: "text-orange-700"
    },
    cyan: {
      bg: "bg-cyan-50/50 border-cyan-100",
      iconBg: "bg-cyan-100 text-cyan-600",
      text: "text-cyan-700"
    }
  };

  return (
    <motion.div
      id={`stats-card-${id}`}
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className={`p-4 rounded-xl border bg-white shadow-sm flex items-start justify-between hover:shadow-md transition-shadow duration-200`}
    >
      <div className="space-y-2">
        <span className="text-[11px] font-medium text-slate-500 uppercase tracking-wider block">
          {title}
        </span>
        <h3 className="text-2xl font-display font-bold text-slate-900 tracking-tight font-mono">
          {value}
        </h3>
        <div className="flex items-center gap-1.5">
          <span className={`text-xs font-semibold px-1.5 py-0.5 rounded-md ${
            isPositive ? "bg-emerald-100 text-emerald-800" : "bg-rose-100 text-rose-800"
          }`}>
            {isPositive ? "↑" : "↓"} {Math.abs(diff).toFixed(1)}%
          </span>
          <span className="text-[10px] text-slate-400 font-medium">
            {diffLabel}
          </span>
        </div>
      </div>

      <div className={`p-2.5 rounded-lg ${colorStyles[color].iconBg} shadow-sm`}>
        <Icon className="w-5 h-5" />
      </div>
    </motion.div>
  );
}
