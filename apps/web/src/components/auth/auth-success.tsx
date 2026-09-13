import { CheckCircle2 } from 'lucide-react';
import {
  Alert,
  AlertContent,
  AlertDescription,
  AlertTitle,
} from '@novacommerce/ui/components/alert';

export interface AuthSuccessMessageProps {
  title: string;
  message: string;
}

export function AuthSuccessMessage({ title, message }: AuthSuccessMessageProps) {
  return (
    <Alert variant="success" aria-live="polite">
      <CheckCircle2 aria-hidden="true" />
      <AlertContent>
        <AlertTitle>{title}</AlertTitle>
        <AlertDescription>
          <p>{message}</p>
        </AlertDescription>
      </AlertContent>
    </Alert>
  );
}
