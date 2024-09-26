'use client';

import { Content, Header, Item, Root, Trigger } from '@radix-ui/react-accordion';
import { ChevronDown } from 'lucide-react';

import { type ComponentPropsWithoutRef, type ComponentRef, forwardRef } from 'react';
import { cn } from '#utils/cn';

const Accordion = Root;

const AccordionItem = forwardRef<ComponentRef<typeof Item>, ComponentPropsWithoutRef<typeof Item>>(
  ({ className, ...props }, ref) => <Item ref={ref} className={cn('border-b', className)} {...props} />
);
AccordionItem.displayName = 'AccordionItem';

const AccordionTrigger = forwardRef<ComponentRef<typeof Trigger>, ComponentPropsWithoutRef<typeof Trigger>>(
  ({ className, children, ...props }, ref) => (
    <Header className="flex">
      <Trigger
        ref={ref}
        className={cn(
          'flex flex-1 items-center justify-between py-4 font-medium transition-all hover:underline [&[data-state=open]>svg]:rotate-180',
          className
        )}
        {...props}
      >
        {children}
        <ChevronDown className="h-4 w-4 shrink-0 transition-transform duration-200" />
      </Trigger>
    </Header>
  )
);
AccordionTrigger.displayName = Trigger.displayName;

const AccordionContent = forwardRef<ComponentRef<typeof Content>, ComponentPropsWithoutRef<typeof Content>>(
  ({ className, children, ...props }, ref) => (
    <Content
      ref={ref}
      className="overflow-hidden text-sm transition-all data-[state=closed]:animate-accordion-up data-[state=open]:animate-accordion-down"
      {...props}
    >
      <div className={cn('pt-0 pb-4', className)}>{children}</div>
    </Content>
  )
);

AccordionContent.displayName = Content.displayName;

export { Accordion, AccordionItem, AccordionTrigger, AccordionContent };
