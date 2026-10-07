import { GLOSSARY } from "@/lib/scanner/constants";
import { cn } from "@/lib/utils";

export function meaningOf(term: string) {
  const hit = GLOSSARY.find((g) => g.term.toLowerCase().includes(term.toLowerCase()));
  return hit?.meaning;
}

export function Term({
  children,
  of,
  className,
}: {
  children: string;
  of?: string;
  className?: string;
}) {
  const meaning = meaningOf(of ?? children);
  if (!meaning) return <span className={className}>{children}</span>;
  return (
    <abbr
      title={meaning}
      className={cn(
        "cursor-help decoration-dotted underline underline-offset-2 decoration-subtle",
        className,
      )}
    >
      {children}
    </abbr>
  );
}
