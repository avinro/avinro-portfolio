import { cn } from "@/lib/utils";

interface WorkDetailProps {
  children: React.ReactNode;
  className?: string;
}

export function WorkDetail({ children, className }: WorkDetailProps) {
  return <article className={cn("mx-auto max-w-3xl", className)}>{children}</article>;
}
