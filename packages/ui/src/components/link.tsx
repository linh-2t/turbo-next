// biome-ignore lint/nursery/noRestrictedImports: <explanation>
import NextLink from 'next/link';

import type { VariantProps } from 'class-variance-authority';
// biome-ignore lint/nursery/noRestrictedImports: <explanation>
import type { LinkProps as NextLinkProps } from 'next/link';
import type { AnchorHTMLAttributes, FC, ReactNode } from 'react';
import { buttonVariants } from '#shadcn/button';
import { cn } from '#utils/cn';

type AnchorProps = AnchorHTMLAttributes<HTMLAnchorElement>;

export interface CustomLinkProps
  extends Omit<NextLinkProps, 'href'>,
    Omit<AnchorProps, 'href'>,
    VariantProps<typeof buttonVariants> {
  href: string;
  isExternal?: boolean;
  children: ReactNode;
}

const Link: FC<CustomLinkProps> = ({
  href,
  children,
  isExternal = false,
  variant = 'link',
  size = 'default',
  className,
  ...props
}) => {
  if (isExternal) {
    return (
      <a
        href={href}
        rel="noopener noreferrer"
        className={cn(buttonVariants({ variant, size, className }))}
        {...(props as AnchorProps)}
      >
        {children}
      </a>
    );
  }

  return (
    <NextLink href={href} className={cn(buttonVariants({ variant, size, className }))} {...props}>
      {children}
    </NextLink>
  );
};

export default Link;
