import { ReactNode } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface AuthLayoutProps {
  title: string;
  subtitle?: string;
  children: ReactNode;
  footer?: ReactNode;
}

export function AuthLayout({
  title,
  subtitle,
  children,
  footer,
}: AuthLayoutProps) {
  return (
    <div className="min-h-screen flex items-center justify-center bg-background px-4 py-8">
      <div className="w-full max-w-md space-y-6">
        <div className="text-center space-y-2">
          <div className="w-20 h-20 mx-auto rounded-2xl bg-gradient-primary flex items-center justify-center shadow-neon-intense animate-float">
            <span className="text-4xl font-bold">S</span>
          </div>
          <h1 className="text-4xl font-bold text-foreground">Santas Club</h1>
          <p className="text-muted-foreground">
            {subtitle ?? "Sistema de gestión administrativa"}
          </p>
        </div>

        <Card className="bg-gradient-card border-border/50 shadow-card">
          <CardHeader>
            <CardTitle className="text-center text-foreground">
              {title}
            </CardTitle>
          </CardHeader>
          <CardContent>{children}</CardContent>
        </Card>

        {footer}

        <p className="text-center text-xs text-muted-foreground">
          © {new Date().getFullYear()} Santas Club. Todos los derechos
          reservados.
        </p>
      </div>
    </div>
  );
}
