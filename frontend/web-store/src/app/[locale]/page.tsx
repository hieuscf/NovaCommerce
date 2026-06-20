import { getTranslations } from 'next-intl/server';

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';

export default async function HomePage() {
  const t = await getTranslations('common');

  return (
    <section className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>{t('welcome')}</CardTitle>
          <CardDescription>{t('search')}</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            FE-WEB-001 scaffold da san sang cho cac task tiep theo.
          </p>
        </CardContent>
      </Card>
    </section>
  );
}
