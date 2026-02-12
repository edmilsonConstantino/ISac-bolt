import * as React from "react"
import { cn } from "@/lib/utils"

type AvatarShape = "circle" | "rounded";
type AvatarSize = "sm" | "md" | "lg";
type StatusColor = "active" | "inactive" | "completed";

const sizeMap: Record<AvatarSize, { container: string; text: string; status: string }> = {
  sm: { container: "h-8 w-8",   text: "text-xs",   status: "h-2.5 w-2.5" },
  md: { container: "h-11 w-11", text: "text-base",  status: "h-3 w-3" },
  lg: { container: "h-12 w-12", text: "text-base",  status: "h-3.5 w-3.5" },
};

const statusColorMap: Record<StatusColor, string> = {
  active:    "bg-emerald-500",
  inactive:  "bg-slate-300",
  completed: "bg-blue-500",
};

interface AvatarInitialsProps {
  name?: string;
  icon?: React.ReactNode;
  size?: AvatarSize;
  shape?: AvatarShape;
  status?: StatusColor;
  className?: string;
}

function AvatarInitials({ name, icon, size = "lg", shape = "rounded", status, className }: AvatarInitialsProps) {
  const sizes = sizeMap[size];
  const initial = name && name.length > 0 ? name.charAt(0).toUpperCase() : '?';

  return (
    <div className="relative flex-shrink-0">
      <div className={cn(
        "bg-gradient-to-br from-[#004B87] to-[#0066B3] flex items-center justify-center shadow-md",
        sizes.container,
        shape === "circle" ? "rounded-full" : "rounded-xl",
        className
      )}>
        {icon ? (
          <span className="text-white">{icon}</span>
        ) : (
          <span className={cn("text-white font-bold", sizes.text)}>{initial}</span>
        )}
      </div>
      {status && (
        <div className={cn(
          "absolute -bottom-0.5 -right-0.5 rounded-full border-2 border-white shadow-sm",
          sizes.status,
          statusColorMap[status]
        )} />
      )}
    </div>
  )
}

export { AvatarInitials }
export type { AvatarSize, AvatarShape, StatusColor }
