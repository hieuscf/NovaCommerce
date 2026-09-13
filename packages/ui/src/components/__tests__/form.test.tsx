import { describe, expect, it, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { useForm } from 'react-hook-form';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  FormRootError,
} from '../form';
import { Input } from '../input';
import { Button } from '../button';
import { expectNoA11yViolations } from '../../test/a11y';

interface Values {
  email: string;
}

function EmailForm({
  onValid = vi.fn(),
  serverError,
}: {
  onValid?: (values: Values) => void;
  serverError?: string;
} = {}) {
  const form = useForm<Values>({ defaultValues: { email: '' } });

  const submit = form.handleSubmit((values) => {
    if (serverError) {
      form.setError('root', { message: serverError });
      return;
    }
    onValid(values);
  });

  return (
    <Form {...form}>
      <form onSubmit={submit} noValidate>
        <FormRootError />
        <FormField
          control={form.control}
          name="email"
          rules={{ required: 'Email is required' }}
          render={({ field }) => (
            <FormItem>
              <FormLabel>Email address</FormLabel>
              <FormControl>
                <Input {...field} />
              </FormControl>
              <FormDescription>We only use this for order updates.</FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
        <Button type="submit">Subscribe</Button>
      </form>
    </Form>
  );
}

describe('Form', () => {
  it('associates the label with the control', () => {
    render(<EmailForm />);

    expect(screen.getByLabelText('Email address')).toBeInTheDocument();
  });

  it('exposes the description as the accessible description', () => {
    render(<EmailForm />);

    expect(screen.getByLabelText('Email address')).toHaveAccessibleDescription(
      'We only use this for order updates.',
    );
  });

  it('renders a validation message and links it to the control on invalid submit', async () => {
    render(<EmailForm />);

    await userEvent.click(screen.getByRole('button', { name: 'Subscribe' }));

    const input = screen.getByLabelText('Email address');
    expect(await screen.findByText('Email is required')).toBeInTheDocument();
    expect(input).toHaveAttribute('aria-invalid', 'true');
    expect(input).toHaveAccessibleDescription(
      /We only use this for order updates\. Email is required/,
    );
  });

  it('submits the collected values when valid', async () => {
    const onValid = vi.fn();
    render(<EmailForm onValid={onValid} />);

    await userEvent.type(screen.getByLabelText('Email address'), 'ada@novacommerce.io');
    await userEvent.click(screen.getByRole('button', { name: 'Subscribe' }));

    expect(onValid).toHaveBeenCalledWith({ email: 'ada@novacommerce.io' });
  });

  it('surfaces a form-level server error', async () => {
    render(<EmailForm serverError="Subscription service unavailable" />);

    await userEvent.type(screen.getByLabelText('Email address'), 'ada@novacommerce.io');
    await userEvent.click(screen.getByRole('button', { name: 'Subscribe' }));

    expect(await screen.findByRole('alert')).toHaveTextContent(
      'Subscription service unavailable',
    );
  });

  it('clears the error once the field becomes valid', async () => {
    render(<EmailForm />);

    await userEvent.click(screen.getByRole('button', { name: 'Subscribe' }));
    expect(await screen.findByText('Email is required')).toBeInTheDocument();

    await userEvent.type(screen.getByLabelText('Email address'), 'ada@novacommerce.io');
    await userEvent.click(screen.getByRole('button', { name: 'Subscribe' }));

    expect(screen.queryByText('Email is required')).not.toBeInTheDocument();
  });

  it('has no accessibility violations in the error state', async () => {
    const { container } = render(<EmailForm />);

    await userEvent.click(screen.getByRole('button', { name: 'Subscribe' }));
    await screen.findByText('Email is required');

    await expectNoA11yViolations(container);
  });
});
