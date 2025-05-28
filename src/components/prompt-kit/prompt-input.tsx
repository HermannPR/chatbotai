import * as React from "react";
import { cn } from "@/lib/utils";

export function PromptInput({
  value,
  onValueChange,
  isLoading = false,
  onSubmit,
  maxHeight = 240,
  children,
  className,
}: {
  value: string;
  onValueChange: (value: string) => void;
  isLoading?: boolean;
  onSubmit?: () => void;
  maxHeight?: number | string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <form
      className={cn("border-input bg-background rounded-3xl border p-2 shadow-xs", className)}
      onSubmit={e => {
        e.preventDefault();
        onSubmit?.();
      }}
    >
      {children}
    </form>
  );
}

export function PromptInputTextarea({
  className,
  onKeyDown,
  disableAutosize = false,
  value,
  onChange,
  onSubmit,
  ...props
}: {
  className?: string;
  onKeyDown?: (e: React.KeyboardEvent<HTMLTextAreaElement>) => void;
  disableAutosize?: boolean;
  value?: string;
  onChange?: (e: React.ChangeEvent<HTMLTextAreaElement>) => void;
  onSubmit?: () => void;
} & React.ComponentProps<"textarea">) {
  const textareaRef = React.useRef<HTMLTextAreaElement>(null);
  
  React.useEffect(() => {
    if (disableAutosize) return;
    if (!textareaRef.current) return;
    textareaRef.current.style.height = "auto";
    textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`;
  }, [value, disableAutosize]);
  
  return (
    <textarea
      ref={textareaRef}
      value={value}
      onChange={onChange}
      className={cn(
        "text-foreground min-h-[44px] w-full resize-none border-none bg-transparent shadow-none outline-none focus-visible:ring-0 focus-visible:ring-offset-0 placeholder:text-muted-foreground",
        className
      )}
      rows={1}
      onKeyDown={e => {
        if (e.key === "Enter" && !e.shiftKey) {
          e.preventDefault();
          onSubmit?.();
        }
        onKeyDown?.(e);
      }}
      {...props}
    />
  );
}

export function PromptInputActions({ children, className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div className={cn("flex items-center gap-2", className)} {...props}>
      {children}
    </div>
  );
}

export function PromptInputAction({ tooltip, children, className, side = "top", ...props }: {
  tooltip: React.ReactNode;
  children: React.ReactNode;
  className?: string;
  side?: "top" | "bottom" | "left" | "right";
} & React.ComponentProps<"div">) {
  // Tooltip is not implemented here, but you can add your own or use shadcn/ui Tooltip
  return (
    <div className={className} {...props} title={typeof tooltip === 'string' ? tooltip : undefined}>
      {children}
    </div>
  );
}
