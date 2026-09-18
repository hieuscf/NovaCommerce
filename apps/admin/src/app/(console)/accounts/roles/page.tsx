import type { Metadata } from 'next';
import { RolesPageContainer } from '@/components/roles/roles-page-container';
import { parseRolesQuery } from '@/lib/url/roles-query';

export const metadata: Metadata = {
  title: 'Roles & Permissions',
};

type RolesRouteProps = {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

export default async function RolesRoute({ searchParams }: RolesRouteProps) {
  const params = await searchParams;
  const query = parseRolesQuery(params);
  return <RolesPageContainer query={query} />;
}
