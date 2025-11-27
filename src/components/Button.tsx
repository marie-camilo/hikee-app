import React from "react";
import { ArrowUpRight } from "lucide-react";

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  children: React.ReactNode;
  variant?: "forest" | "sage" | "terracotta" | "sky" | "sunset" | "moss";
  arrow?: boolean;
  size?: "sm" | "md" | "lg";
}

export default function Button({
                                 children,
                                 variant = "forest",
                                 arrow = false,
                                 size = "md",
                                 type = "button",
                                 className = "",
                                 ...props
                               }: ButtonProps) {
  const baseClasses =
    "group inline-flex items-center justify-center gap-2 font-medium rounded-full transition-all duration-300 cursor-pointer active:scale-95 hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:shadow-none";

  const sizeClasses = {
    sm: "text-xs px-4 py-2",
    md: "text-sm px-6 py-3",
    lg: "text-base px-8 py-4"
  };

  const variantClasses = {
    forest: "bg-[#2C3E2E] hover:bg-[#3d5440] text-white shadow-[0_4px_14px_rgba(44,62,46,0.3)]",
    sage: "bg-[#7A9B76] hover:bg-[#8aab86] text-white shadow-[0_4px_14px_rgba(122,155,118,0.3)]",
    terracotta: "bg-[#D87855] hover:bg-[#e08b6a] text-white shadow-[0_4px_14px_rgba(216,120,85,0.3)]",
    sky: "bg-[#8BB4C9] hover:bg-[#9dc2d4] text-white shadow-[0_4px_14px_rgba(139,180,201,0.3)]",
    sunset: "bg-[#E8A87C] hover:bg-[#edb68f] text-white shadow-[0_4px_14px_rgba(232,168,124,0.3)]",
    moss: "bg-[#A8B99C] hover:bg-[#b5c5aa] text-[#2C3E2E] shadow-[0_4px_14px_rgba(168,185,156,0.3)]"
  };

  return (
    <button
      type={type}
      className={`${baseClasses} ${sizeClasses[size]} ${variantClasses[variant]} ${className}`}
      {...props}
    >
      <span className="relative">
        {children}
      </span>
      {arrow && (
        <ArrowUpRight
          className="w-4 h-4 transition-transform duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
          strokeWidth={2.5}
        />
      )}
    </button>
  );
}