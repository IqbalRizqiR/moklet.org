import { cva, type VariantProps } from "class-variance-authority";
import Link, { LinkProps as NextLinkProps } from "next/link";
import {
  ComponentPropsWithoutRef,
  HTMLAttributeAnchorTarget,
  MouseEventHandler,
  ReactNode,
} from "react";

import cn from "@/lib/clsx";

const buttonVariants = cva(
  "inline-flex items-center justify-center rounded-full transition-all duration-300",
  {
    variants: {
      variant: {
        primary:
          "bg-primary-400 px-6 py-3 text-base text-white shadow-glass hover:-translate-y-0.5 hover:bg-primary-300 disabled:cursor-not-allowed disabled:text-neutral-500 disabled:bg-neutral-300 disabled:shadow-none",
        secondary:
          "border border-primary-300 bg-white/75 px-6 py-3 text-base text-primary-500 backdrop-blur-xs hover:border-primary-400 hover:bg-primary-50 disabled:cursor-not-allowed disabled:border-neutral-400 disabled:bg-neutral-300 disabled:text-neutral-500",
        tertiary:
          "text-base text-black hover:text-primary-400 disabled:cursor-not-allowed disabled:text-neutral-500",
        quartiary:
          "border border-white/60 bg-glass-white px-6 py-3 text-base text-primary-500 shadow-glass-soft backdrop-blur-sm hover:bg-surface-100 disabled:cursor-not-allowed disabled:bg-neutral-400 disabled:text-white",
      },
    },
  },
);

interface LinkButtonProps
  extends NextLinkProps,
    VariantProps<typeof buttonVariants> {
  children?: ReactNode;
  href: string;
  scroll?: boolean;
  target?: HTMLAttributeAnchorTarget;
  className?: string;
  download?: boolean;
  disabledProgressBar?: boolean;
}

interface ButtonProps
  extends ComponentPropsWithoutRef<"button">,
    VariantProps<typeof buttonVariants> {
  children?: ReactNode;
  type?: "button" | "reset" | "submit";
  onClick?: MouseEventHandler<HTMLButtonElement>;
  isDisabled?: boolean;
  className?: string;
}

export default function LinkButton({
  children,
  href,
  variant,
  className,
  target,
  scroll,
  download,
  disabledProgressBar,
  prefetch,
}: Readonly<LinkButtonProps>) {
  return (
    <Link
      href={href}
      className={cn(buttonVariants({ variant }), className)}
      target={target}
      scroll={scroll}
      download={download}
      data-disable-nprogress={disabledProgressBar}
      prefetch={prefetch}
    >
      {children}
    </Link>
  );
}

export function Button({
  children,
  type,
  onClick,
  isDisabled,
  className,
  variant,
}: Readonly<ButtonProps>) {
  return (
    <button
      type={type}
      onClick={onClick}
      disabled={isDisabled}
      className={cn(buttonVariants({ variant }), className)}
    >
      {children}
    </button>
  );
}
