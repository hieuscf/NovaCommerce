import * as React from 'react';
import { ErrorState, type ErrorStateProps } from './error-state';

export type NotFoundStateProps = Omit<ErrorStateProps, 'tone' | 'title'> & {
  title?: string;
};

function NotFoundState({
  title = 'Page not found',
  description = 'The page you are looking for does not exist or has been moved.',
  ...props
}: NotFoundStateProps) {
  return <ErrorState tone="neutral" title={title} description={description} {...props} />;
}

export { NotFoundState };
