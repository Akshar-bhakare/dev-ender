"use client";

import { cn } from "@/lib/utils";

interface CompanyLogoProps {
  src?: string;
  name: string;
  className?: string;
}

export function CompanyLogo({ src, name, className }: CompanyLogoProps) {
  const initials = name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  // Simple hash for consistent colors
  const colors = [
    "bg-blue-500",
    "bg-emerald-500",
    "bg-violet-500",
    "bg-amber-500",
    "bg-rose-500",
    "bg-cyan-500",
    "bg-indigo-500",
  ];
  
  const colorIndex = name.split("").reduce((acc, char) => acc + char.charCodeAt(0), 0) % colors.length;
  const bgColor = colors[colorIndex];

  return (
    <div className={cn("flex-shrink-0 flex items-center justify-center overflow-hidden", className)}>
      {src ? (
        <img 
          src={src} 
          alt={name} 
          className="w-full h-full object-cover" 
          onError={(e) => {
            (e.target as HTMLImageElement).style.display = 'none';
            (e.target as HTMLImageElement).parentElement!.classList.add(bgColor);
            (e.target as HTMLImageElement).parentElement!.innerHTML = `<span class="text-white font-bold">${initials}</span>`;
          }}
        />
      ) : (
        <div className={cn("w-full h-full flex items-center justify-center text-white font-bold", bgColor)}>
          {initials}
        </div>
      )}
    </div>
  );
}
