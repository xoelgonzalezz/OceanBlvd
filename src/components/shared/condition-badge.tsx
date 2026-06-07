import { Badge } from "@/components/ui/badge";
import { getDict } from "@/i18n/server";
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
  const t = getDict();
  const isNew = condition === "NEW";
  return (
    <Badge
      variant={isNew ? "default" : "secondary"}
      className={cn("backdrop-blur-sm", className)}
    >
      {isNew ? t.card.new : t.card.used}
      {showGrade && grade && !isNew ? ` · ${grade}` : ""}
    </Badge>
  );
}
