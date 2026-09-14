import { isAccountSection, type AccountSection } from '@/lib/view-models/account';

export interface AccountQuery {
  readonly section: AccountSection;
}

type SearchParams = Record<string, string | string[] | undefined>;

function first(value: string | string[] | undefined): string | undefined {
  if (Array.isArray(value)) {
    return value[0];
  }
  return value;
}

export function parseAccountQuery(searchParams: SearchParams): AccountQuery {
  const section = first(searchParams.section)?.trim();
  return {
    section: isAccountSection(section) ? section : 'overview',
  };
}
