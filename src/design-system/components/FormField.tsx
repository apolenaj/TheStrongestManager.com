import {
  Children,
  cloneElement,
  forwardRef,
  isValidElement,
  type InputHTMLAttributes,
  type ReactElement,
  type ReactNode,
  type SelectHTMLAttributes,
  type TextareaHTMLAttributes,
} from "react";
import { cn } from "@/design-system/utils/cn";

const fieldControlClass =
  "w-full rounded-[var(--radius-sm)] border border-[var(--color-border-strong)] bg-[var(--color-surface-elevated)] px-3 py-2 text-sm text-[var(--color-foreground)] placeholder:text-[var(--color-subtle)] transition-colors focus-visible:border-[var(--color-accent)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--color-focus)] disabled:cursor-not-allowed disabled:opacity-50";

export type LabelProps = {
  htmlFor: string;
  children: ReactNode;
  optional?: boolean;
  className?: string;
};

export function Label({ htmlFor, children, optional, className }: LabelProps) {
  return (
    <label
      htmlFor={htmlFor}
      className={cn(
        "mb-1.5 block text-sm font-medium text-[var(--color-foreground)]",
        className,
      )}
    >
      {children}
      {optional ? (
        <span className="ml-1 font-normal text-[var(--color-subtle)]">
          (optional)
        </span>
      ) : null}
    </label>
  );
}

export function HelperText({
  id,
  children,
  className,
}: {
  id?: string;
  children: ReactNode;
  className?: string;
}) {
  return (
    <p
      id={id}
      className={cn("mt-1.5 text-xs text-[var(--color-muted)]", className)}
    >
      {children}
    </p>
  );
}

export function FieldError({
  id,
  children,
  className,
}: {
  id?: string;
  children: ReactNode;
  className?: string;
}) {
  if (!children) return null;
  return (
    <p
      id={id}
      role="alert"
      className={cn("mt-1.5 text-xs text-[var(--color-danger)]", className)}
    >
      {children}
    </p>
  );
}

export type FormFieldProps = {
  id: string;
  label: string;
  optional?: boolean;
  helperText?: string;
  error?: string;
  children: ReactNode;
  className?: string;
};

export function FormField({
  id,
  label,
  optional,
  helperText,
  error,
  children,
  className,
}: FormFieldProps) {
  const describedBy = [
    helperText && !error ? `${id}-helper` : null,
    error ? `${id}-error` : null,
  ]
    .filter(Boolean)
    .join(" ") || undefined;

  const control = Children.map(children, (child) => {
    if (!isValidElement(child)) return child;
    const el = child as ReactElement<Record<string, unknown>>;
    return cloneElement(el, {
      id: (el.props.id as string | undefined) ?? id,
      "aria-describedby":
        describedBy ?? (el.props["aria-describedby"] as string | undefined),
      "aria-invalid": error ? true : el.props["aria-invalid"],
    });
  });

  return (
    <div className={cn("w-full", className)}>
      <Label htmlFor={id} optional={optional}>
        {label}
      </Label>
      {control}
      {helperText && !error ? (
        <HelperText id={`${id}-helper`}>{helperText}</HelperText>
      ) : null}
      <FieldError id={error ? `${id}-error` : undefined}>{error}</FieldError>
    </div>
  );
}

export type InputProps = InputHTMLAttributes<HTMLInputElement> & {
  invalid?: boolean;
};

export const Input = forwardRef<HTMLInputElement, InputProps>(
  function Input({ className, invalid, ...props }, ref) {
    return (
      <input
        ref={ref}
        className={cn(
          fieldControlClass,
          invalid && "border-[var(--color-danger)]",
          className,
        )}
        aria-invalid={invalid || undefined}
        {...props}
      />
    );
  },
);

export type TextareaProps = TextareaHTMLAttributes<HTMLTextAreaElement> & {
  invalid?: boolean;
};

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(
  function Textarea({ className, invalid, ...props }, ref) {
    return (
      <textarea
        ref={ref}
        className={cn(
          fieldControlClass,
          "min-h-[6rem] resize-y",
          invalid && "border-[var(--color-danger)]",
          className,
        )}
        aria-invalid={invalid || undefined}
        {...props}
      />
    );
  },
);

export type SelectProps = SelectHTMLAttributes<HTMLSelectElement> & {
  invalid?: boolean;
};

export const Select = forwardRef<HTMLSelectElement, SelectProps>(
  function Select({ className, invalid, children, ...props }, ref) {
    return (
      <select
        ref={ref}
        className={cn(
          fieldControlClass,
          invalid && "border-[var(--color-danger)]",
          className,
        )}
        aria-invalid={invalid || undefined}
        {...props}
      >
        {children}
      </select>
    );
  },
);

export type CheckboxProps = Omit<
  InputHTMLAttributes<HTMLInputElement>,
  "type"
> & {
  label: string;
};

export const Checkbox = forwardRef<HTMLInputElement, CheckboxProps>(
  function Checkbox({ className, id, label, ...props }, ref) {
    const inputId = id ?? props.name;
    return (
      <label
        htmlFor={inputId}
        className={cn(
          "inline-flex cursor-pointer items-center gap-2 text-sm text-[var(--color-foreground)]",
          className,
        )}
      >
        <input
          ref={ref}
          id={inputId}
          type="checkbox"
          className="h-4 w-4 rounded-[var(--radius-sm)] border-[var(--color-border-strong)] accent-[var(--color-accent)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--color-focus)]"
          {...props}
        />
        {label}
      </label>
    );
  },
);
