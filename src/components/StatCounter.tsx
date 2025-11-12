import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { useMemo } from "react";

interface StatCounterProps {
  title: string;
  subtitle?: string;
  count: number;
  variant?: "default" | "primary" | "accent" | "success";
  maxCount?: number;
  actionLabel?: string;
  onAction?: () => void;
  disabled?: boolean;
}

export function StatCounter({
  title,
  subtitle,
  count,
  variant = "default",
  maxCount,
  actionLabel,
  onAction,
  disabled = false,
}: StatCounterProps) {
  const variantStyles = {
    default: "border-border",
    primary: "border-primary/50 bg-primary/5",
    accent: "border-accent/50 bg-accent/5",
    success: "border-success/50 bg-success/5",
  };

  const safeCount = Number.isFinite(count) ? count : 0;
  const safeMax = Number.isFinite(maxCount ?? 0) ? maxCount ?? 0 : 0;

  const formatter = useMemo(
    () => new Intl.NumberFormat("es-AR", { maximumFractionDigits: 0 }),
    []
  );

  const formattedCount = formatter.format(safeCount);
  const formattedMax = safeMax ? formatter.format(safeMax) : null;

  const percentage =
    safeMax > 0 ? Math.min(Math.round((safeCount / safeMax) * 100), 100) : 0;

  const showProgress = safeMax > 0;

  return (
    <Card className={cn("transition-all duration-300", variantStyles[variant])}>
      <CardHeader className="space-y-1">
        <CardTitle className="text-lg font-semibold text-foreground">
          {title}
        </CardTitle>
        {subtitle && (
          <p className="text-sm text-muted-foreground font-normal">
            {subtitle}
          </p>
        )}
      </CardHeader>

      <CardContent className="space-y-4">
        <div className="text-center">
          <div className="text-6xl font-bold text-primary mb-2 leading-none">
            {formattedCount}
          </div>

          {showProgress && formattedMax && (
            <div className="flex items-center justify-center gap-2">
              <div className="text-sm text-muted-foreground">
                de {formattedMax}
              </div>
              <div className="text-sm font-semibold px-2 py-1 rounded bg-success/20 text-success">
                {percentage}%
              </div>
            </div>
          )}
        </div>

        {actionLabel && (
          <Button
            onClick={onAction}
            size="lg"
            className="w-full h-14 text-lg font-semibold bg-gradient-primary hover:opacity-90"
            disabled={disabled}
          >
            {actionLabel}
          </Button>
        )}
      </CardContent>
    </Card>
  );
}
