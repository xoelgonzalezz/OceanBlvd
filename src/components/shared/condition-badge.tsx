import { Badge } from "@/components/ui/badge";
import { CONDITION_LABELS } from "@/lib/constants";
import { cn } from "@/lib/utils";

interface ConditionBadgeProps {
  condition: string;
  grade?: string | null;
  className?: string;
  showGrade?: boolean;
}

export function ConditionBadge({
  condition,
  grade,
  className,
  showGrade = false,
}: ConditionBadgeProps) {
  const isNew = condition === "NEW";
  return (
    <Badge
      variant={isNew ? "default" : "secondary"}
      className={cn("backdrop-blur-sm", className)}
    >
      {CONDITION_LABELS[condition] ?? condition}
      {showGrade && grade && !isNew ? ` · ${grade}` : ""}
    </Badge>
  );
}
