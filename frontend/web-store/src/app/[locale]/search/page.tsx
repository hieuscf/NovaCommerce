import { Breadcrumbs } from '@/components/store/breadcrumbs';
import { ProductCard } from '@/components/store/product-card';
import { SearchAutocomplete } from '@/components/store/search-autocomplete';
import { searchProducts, sortProducts } from '@/lib/mock/catalog';

type SearchPageProps = {
  searchParams: {
    q?: string;
    sort?: string;
  };
};

export default function SearchPage({ searchParams }: SearchPageProps) {
  const query = searchParams.q?.trim() ?? '';
  const sortBy = searchParams.sort ?? 'popular';
  const results = query ? sortProducts(searchProducts(query), sortBy) : [];

  return (
    <div className="space-y-5">
      <Breadcrumbs
        items={[{ href: '/', label: 'Trang chu' }, { label: 'Tim kiem' }]}
      />
      <h1 className="text-2xl font-semibold">Tim kiem san pham</h1>
      <SearchAutocomplete initialQuery={query} />

      {query ? (
        <p className="text-sm text-muted-foreground">
          Tim thay {results.length} ket qua cho &quot;{query}&quot;.
        </p>
      ) : (
        <p className="text-sm text-muted-foreground">
          Nhap tu khoa de bat dau tim kiem.
        </p>
      )}

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {results.map((product) => (
          <ProductCard key={product.id} product={product} />
        ))}
      </div>
    </div>
  );
}
