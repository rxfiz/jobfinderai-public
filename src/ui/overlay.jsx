import React, { useEffect, useState } from 'react';
import * as DialogPrimitive from '@radix-ui/react-dialog';
import * as TabsPrimitive from '@radix-ui/react-tabs';
import './foundation.css';

let openDialogCount = 0;
export function Dialog({ open, onOpenChange, children }) {
  const [internalOpen, setInternalOpen] = useState(false);
  const isOpen = open ?? internalOpen;
  useEffect(() => {
    if (!isOpen) return;
    openDialogCount += 1;
    document.documentElement.classList.add('ui-dialog-is-open');
    return () => {
      openDialogCount -= 1;
      if (openDialogCount === 0) document.documentElement.classList.remove('ui-dialog-is-open');
    };
  }, [isOpen]);
  return <DialogPrimitive.Root open={isOpen} onOpenChange={next => { setInternalOpen(next); onOpenChange?.(next); }}>{children}</DialogPrimitive.Root>;
}
export const DialogTrigger = DialogPrimitive.Trigger;
export function DialogContent({ title, description, children, className = '' }) {
  // A CSS overlay avoids react-remove-scroll's injected stylesheet under strict CSP.
  // Radix Content still owns modal focus, outside dismissal, and Escape handling.
  return <DialogPrimitive.Portal><div className="ui-dialog-overlay" aria-hidden="true" /><DialogPrimitive.Content className={`ui-dialog-content ${className}`.trim()}><DialogPrimitive.Title className="ui-dialog-title">{title}</DialogPrimitive.Title>{description && <DialogPrimitive.Description className="ui-dialog-description">{description}</DialogPrimitive.Description>}{children}<DialogPrimitive.Close className="ui-dialog-close" aria-label="Close dialog">×</DialogPrimitive.Close></DialogPrimitive.Content></DialogPrimitive.Portal>;
}
export function Tabs({ value, onValueChange, tabs, children, className = '', ariaLabel = 'Sections', orientation = 'horizontal' }) {
  return <TabsPrimitive.Root value={value} onValueChange={onValueChange} orientation={orientation} className={`ui-tabs ${className}`.trim()}><TabsPrimitive.List className="ui-tabs-list" aria-label={ariaLabel}>{tabs.map(tab => <TabsPrimitive.Trigger key={tab.value} value={tab.value} className="ui-tabs-trigger">{tab.label}</TabsPrimitive.Trigger>)}</TabsPrimitive.List>{children}</TabsPrimitive.Root>;
}
export const TabPanel = TabsPrimitive.Content;
