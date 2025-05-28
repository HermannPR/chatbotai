import * as React from "react";
import { cn } from "@/lib/utils";

export function Message({ className, children, ...props }: React.HTMLProps<HTMLDivElement>) {
  return (
    <div className={cn("flex gap-3 w-full", className)} {...props}>
      {children}
    </div>
  );
}

export function MessageAvatar({ src, alt, fallback, className, ...props }: {
  src?: string;
  alt?: string;
  fallback?: string;
  className?: string;
  delayMs?: number;
}) {
  // Simple avatar with fallback
  return src ? (
    <img
      src={src}
      alt={alt}
      className={cn("w-8 h-8 rounded-full object-cover bg-muted", className)}
      {...props}
    />
  ) : (
    <div className={cn("w-8 h-8 rounded-full flex items-center justify-center bg-muted text-xs font-bold", className)}>
      {fallback || "?"}
    </div>
  );
}

export function MessageContent({ children, markdown, className, ...props }: {
  children: React.ReactNode;
  markdown?: boolean;
  className?: string;
} & React.HTMLProps<HTMLDivElement>) {
  // If markdown, use a markdown renderer (here fallback to <div> for demo)
  // You can swap this for a real markdown renderer like react-markdown
  if (markdown) {
    // Simple markdown: bold, italics, code, lists, links
    // For production, use a library like react-markdown
    let content = String(children)
      .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
      .replace(/_(.*?)_/g, '<em>$1</em>')
      .replace(/`([^`]+)`/g, '<code class="bg-muted px-1 py-0.5 rounded text-sm">$1</code>');
    // Lists and links are not fully supported in this fallback
    return (
      <div
        className={cn("prose prose-sm dark:prose-invert max-w-none bg-muted/50 rounded-lg px-3 py-2", className)}
        dangerouslySetInnerHTML={{ __html: content }}
        {...props}
      />
    );
  }
  return (
    <div className={cn("bg-primary text-primary-foreground rounded-lg px-3 py-2 max-w-xs", className)} {...props}>
      {children}
    </div>
  );
}
