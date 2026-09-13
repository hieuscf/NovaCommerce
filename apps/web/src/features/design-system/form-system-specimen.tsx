'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@novacommerce/ui/components/button';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  FormRootError,
} from '@novacommerce/ui/components/form';
import { Input } from '@novacommerce/ui/components/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@novacommerce/ui/components/select';
import { Textarea } from '@novacommerce/ui/components/textarea';
import { toast } from '@novacommerce/ui/components/toast';

const schema = z.object({
  email: z.string().min(1, 'Email is required').email('Enter a valid email address'),
  warehouse: z.string().min(1, 'Choose a warehouse'),
  notes: z.string().max(200, 'Keep notes under 200 characters'),
});

type Values = z.infer<typeof schema>;

/**
 * Demonstrates the full validation → error → submit loop, including a
 * simulated server failure surfaced through `FormRootError`.
 */
export function FormSystemSpecimen() {
  const form = useForm<Values>({
    resolver: zodResolver(schema),
    defaultValues: { email: '', warehouse: '', notes: '' },
  });

  const onSubmit = form.handleSubmit(async (values) => {
    if (values.email.endsWith('@example.com')) {
      form.setError('root', {
        message: 'That address is already subscribed. Try a different one.',
      });
      return;
    }
    toast.success('Preferences saved', { description: values.email });
  });

  return (
    <form onSubmit={onSubmit} noValidate className="grid max-w-xl gap-5">
      <Form {...form}>
        <FormRootError />

        <FormField
          control={form.control}
          name="email"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Email address</FormLabel>
              <FormControl>
                <Input type="email" placeholder="you@novacommerce.io" {...field} />
              </FormControl>
              <FormDescription>
                Submit an <code>@example.com</code> address to see a server error.
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="warehouse"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Preferred warehouse</FormLabel>
              <Select value={field.value} onValueChange={field.onChange}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Choose a warehouse" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="eu">EU · Rotterdam</SelectItem>
                  <SelectItem value="us">US · Newark</SelectItem>
                  <SelectItem value="apac">APAC · Singapore</SelectItem>
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="notes"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Delivery notes</FormLabel>
              <FormControl>
                <Textarea placeholder="Leave at the front desk…" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="flex gap-3">
          <Button type="submit" loading={form.formState.isSubmitting}>
            Save preferences
          </Button>
          <Button type="button" variant="ghost" onClick={() => form.reset()}>
            Reset
          </Button>
        </div>
      </Form>
    </form>
  );
}
