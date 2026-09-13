import * as React from 'react';
import { ErrorState, type ErrorStateProps } from './error-state';

export type PermissionDeniedStateProps = Omit<ErrorStateProps, 'tone' | 'title'> & {
  title?: string;
};

function PermissionDeniedState({
  title = 'You do not have access',
  description = 'This page is restricted. If you believe this is a mistake, contact an administrator.',
  ...props
}: PermissionDeniedStateProps) {
  return <ErrorState tone="neutral" title={title} description={description} {...props} />;
}

export { PermissionDeniedState };
