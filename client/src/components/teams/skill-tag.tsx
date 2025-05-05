import { Badge } from "@/components/ui/badge";
import { X } from "lucide-react";
import { cn } from "@/lib/utils";

interface SkillTagProps {
  skill: string;
  onRemove?: () => void;
  size?: "default" | "sm";
  className?: string;
  type?: "user" | "team" | "match" | "required";
}

export function SkillTag({ 
  skill, 
  onRemove, 
  size = "default", 
  className,
  type = "user" 
}: SkillTagProps) {
  // Different styling for different tag types
  const tagStyles = {
    user: "bg-primary-100 text-primary-800 hover:bg-primary-200",
    team: "bg-secondary-100 text-secondary-800 hover:bg-secondary-200",
    match: "bg-green-100 text-green-800 hover:bg-green-200",
    required: "bg-orange-100 text-orange-800 hover:bg-orange-200",
  };

  return (
    <Badge 
      variant="outline"
      className={cn(
        "font-normal border-0",
        tagStyles[type],
        size === "sm" ? "text-xs py-0.5 px-1.5" : "text-sm py-1 px-2",
        className
      )}
    >
      {skill}
      {onRemove && (
        <button 
          onClick={onRemove} 
          className="ml-1.5 rounded-full"
        >
          <X className={cn(
            "text-gray-500 hover:text-gray-700",
            size === "sm" ? "h-3 w-3" : "h-4 w-4"
          )} />
        </button>
      )}
    </Badge>
  );
}

export default SkillTag;
