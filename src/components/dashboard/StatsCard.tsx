import { cn } from "@/lib/utils";
import { LucideIcon } from "lucide-react";

interface StatsCardProps {
  title: string;
  value: string | number;
  change?: string;
  changeType?: "positive" | "negative" | "neutral";
  icon: LucideIcon;
  className?: string;
}

export function StatsCard({ 
  title, 
  value, 
  change, 
  changeType = "neutral", 
  icon: Icon,
  className 
}: StatsCardProps) {
  return (
    <div className={cn(
      "group relative overflow-hidden rounded-2xl p-6",
      "bg-gradient-to-br from-card via-primary/5 to-accent/10",
      "border-2 border-primary/10 shadow-soft",
      "transition-all duration-500 hover:shadow-glow hover:border-primary/30",
      "hover:-translate-y-2 hover:scale-[1.02]",
      className
    )}>
      {/* Efeito de brilho animado no fundo */}
      <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent opacity-0 
                      group-hover:opacity-100 transition-opacity duration-500" />
      
      <div className="relative z-10 flex items-center justify-between">
        <div className="flex-1">
          <p className="text-sm font-semibold text-muted-foreground mb-2 
                        group-hover:text-primary transition-colors">{title}</p>
          <p className="text-4xl font-bold bg-gradient-to-r from-foreground to-primary 
                        bg-clip-text text-transparent mb-3">{value}</p>
          {change && (
            <div className={cn(
              "inline-flex items-center gap-1 px-3 py-1 rounded-full text-sm font-medium",
              "transition-all duration-300 hover:scale-105",
              changeType === "positive" && "bg-success/10 text-success",
              changeType === "negative" && "bg-destructive/10 text-destructive",
              changeType === "neutral" && "bg-muted text-muted-foreground"
            )}>
              {change}
            </div>
          )}
        </div>
        <div className={cn(
          "w-16 h-16 rounded-2xl flex items-center justify-center",
          "transition-all duration-500 group-hover:scale-110 group-hover:rotate-6",
          changeType === "positive" && "bg-gradient-to-br from-success to-success/70 shadow-glow-accent",
          changeType === "negative" && "bg-gradient-to-br from-destructive to-destructive/70",
          changeType === "neutral" && "gradient-primary shadow-glow"
        )}>
          <Icon className="w-8 h-8 text-white" />
        </div>
      </div>
    </div>
  );
}