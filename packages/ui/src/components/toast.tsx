'use client';

import * as React from 'react';
import {
  Bounce,
  ToastContainer,
  toast as notify,
  type Id,
  type ToastPosition,
  type ToastTransitionProps,
} from 'react-toastify';
import { cn } from '../lib/utils';

import 'react-toastify/dist/ReactToastify.css';

export interface ToastAction {
  readonly label: string;
  readonly onClick: () => void;
}

export interface AppToastOptions {
  readonly description?: string;
  readonly action?: ToastAction;
}

function InstantToastTransition({
  children,
  done,
  isIn,
  nodeRef,
  playToast,
}: ToastTransitionProps) {
  React.useLayoutEffect(() => {
    if (isIn) {
      playToast();
      return;
    }
    done();
  }, [done, isIn, playToast]);

  return <div ref={nodeRef as React.RefObject<HTMLDivElement>}>{children}</div>;
}

const toastTransition = process.env.NODE_ENV === 'test' ? InstantToastTransition : Bounce;

function ToastMessage({
  title,
  description,
  action,
}: {
  title: string;
  description?: string;
  action?: ToastAction;
}) {
  return (
    <div className="flex min-w-0 flex-col gap-1">
      <p className="text-body-sm font-semibold tracking-tight">{title}</p>
      {description ? <p className="text-caption text-muted-foreground">{description}</p> : null}
      {action ? (
        <button
          type="button"
          className="mt-1 self-start rounded-lg bg-primary px-3 py-1.5 text-caption font-medium text-primary-foreground transition-colors duration-fast hover:bg-primary-strong focus-ring"
          onClick={action.onClick}
        >
          {action.label}
        </button>
      ) : null}
    </div>
  );
}

function show(
  type: 'default' | 'success' | 'info' | 'warning' | 'error',
  title: string,
  options?: AppToastOptions,
): Id {
  const content = (
    <ToastMessage title={title} description={options?.description} action={options?.action} />
  );

  switch (type) {
    case 'success':
      return notify.success(content);
    case 'info':
      return notify.info(content);
    case 'warning':
      return notify.warn(content);
    case 'error':
      return notify.error(content);
    default:
      return notify(content);
  }
}

type ToastApi = {
  (title: string, options?: AppToastOptions): Id;
  success: (title: string, options?: AppToastOptions) => Id;
  info: (title: string, options?: AppToastOptions) => Id;
  warning: (title: string, options?: AppToastOptions) => Id;
  error: (title: string, options?: AppToastOptions) => Id;
  dismiss: (id?: Id) => void;
};

const toast = ((title: string, options?: AppToastOptions) =>
  show('default', title, options)) as ToastApi;

toast.success = (title, options) => show('success', title, options);
toast.info = (title, options) => show('info', title, options);
toast.warning = (title, options) => show('warning', title, options);
toast.error = (title, options) => show('error', title, options);
toast.dismiss = (id) => {
  notify.dismiss(id);
};

export interface ToasterProps {
  readonly position?: ToastPosition;
  readonly className?: string;
}

/**
 * Transient feedback surface. Mount once per application, near the root.
 * Use `Alert` for messages that should persist in the page.
 *
 * Call sites use `toast`, `toast.success`, `toast.info`, `toast.warning`,
 * and `toast.error`.
 */
function Toaster({ position = 'bottom-right', className }: ToasterProps) {
  return (
    <div data-slot="toaster" className={cn(className)}>
      <ToastContainer
        position={position}
        autoClose={4000}
        newestOnTop
        closeOnClick={false}
        pauseOnHover
        pauseOnFocusLoss
        draggable
        theme="light"
        hideProgressBar={false}
        transition={toastTransition}
        role="status"
      />
    </div>
  );
}

export { Toaster, toast };
