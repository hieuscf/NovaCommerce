'use client';

import { Search } from 'lucide-react';
import { useMemo, useState } from 'react';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Link, useRouter } from '@/i18n/navigation';
import { searchSuggestions } from '@/lib/mock/catalog';

type SearchAutocompleteProps = {
  initialQuery?: string;
};

export function SearchAutocomplete({
  initialQuery = '',
}: SearchAutocompleteProps) {
  const router = useRouter();
  const [query, setQuery] = useState(initialQuery);
  const [focused, setFocused] = useState(false);

  const suggestions = useMemo(() => searchSuggestions(query), [query]);
  const showDropdown = focused && query.trim().length > 0;

  const submit = () => {
    const nextQuery = query.trim();
    if (!nextQuery) {
      return;
    }
    router.push(`/search?q=${encodeURIComponent(nextQuery)}`);
    setFocused(false);
  };

  return (
    <div className="relative">
      <div className="flex gap-2">
        <Input
          className="h-10"
          onBlur={() => setTimeout(() => setFocused(false), 120)}
          onChange={(event) => setQuery(event.target.value)}
          onFocus={() => setFocused(true)}
          onKeyDown={(event) => {
            if (event.key === 'Enter') {
              event.preventDefault();
              submit();
            }
          }}
          placeholder="Tim san pham, thuong hieu..."
          value={query}
        />
        <Button className="h-10 px-4" onClick={submit}>
          <Search className="mr-1 size-4" /> Tim
        </Button>
      </div>
      {showDropdown && (
        <div className="absolute z-20 mt-2 w-full rounded-lg border bg-popover shadow-lg">
          {suggestions.length === 0 ? (
            <p className="px-3 py-2 text-sm text-muted-foreground">
              Khong tim thay goi y phu hop.
            </p>
          ) : (
            <ul className="max-h-72 overflow-y-auto py-1">
              {suggestions.map((suggestion) => (
                <li key={suggestion.slug}>
                  <Link
                    className="block px-3 py-2 text-sm hover:bg-muted"
                    href={`/products/${suggestion.slug}`}
                  >
                    {suggestion.label}
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
    </div>
  );
}
