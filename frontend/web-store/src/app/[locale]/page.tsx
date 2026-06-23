import { ProductCard } from '@/components/store/product-card';
import { SearchAutocomplete } from '@/components/store/search-autocomplete';
import { Link } from '@/i18n/navigation';
import {
  getFeaturedCategories,
  getRecommendedProducts,
  getTrendingProducts,
} from '@/lib/mock/catalog';

export default async function HomePage() {
  const featuredCategories = getFeaturedCategories();
  const trendingProducts = getTrendingProducts();
  const recommendedProducts = getRecommendedProducts();

  return (
    <div className="space-y-10">
      <section className="rounded-2xl border bg-gradient-to-r from-slate-900 to-slate-700 px-6 py-10 text-white">
        <p className="mb-2 text-sm uppercase tracking-wide text-slate-200">
          NovaCommerce
        </p>
        <h1 className="mb-3 max-w-3xl text-3xl font-bold leading-tight">
          San pham chat luong cao voi uu dai moi ngay
        </h1>
        <p className="mb-6 max-w-2xl text-sm text-slate-200">
          Kham pha bo suu tap trend, danh muc noi bat va de xuat phu hop so
          thich cua ban.
        </p>
        <div className="max-w-2xl">
          <SearchAutocomplete />
        </div>
      </section>

      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-semibold">Danh muc noi bat</h2>
          <Link className="text-sm text-primary hover:underline" href="/search">
            Xem tat ca
          </Link>
        </div>
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {featuredCategories.map((category) => (
            <Link
              className="rounded-xl border p-4 transition-colors hover:bg-muted"
              href={`/category/${category.slug}`}
              key={category.id}
            >
              <p className="font-medium">{category.name}</p>
              <p className="text-sm text-muted-foreground">Kham pha san pham</p>
            </Link>
          ))}
        </div>
      </section>

      <section className="space-y-4">
        <h2 className="text-xl font-semibold">Trending products</h2>
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {trendingProducts.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      </section>

      <section className="space-y-4">
        <h2 className="text-xl font-semibold">Recommended for you</h2>
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {recommendedProducts.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      </section>
      <p className="text-xs text-muted-foreground">
        Ca nhan hoa hien dang su dung mock recommendation profile.
      </p>
      <section className="sr-only">
        <p>
          Homepage co hero banner, featured categories, trending products,
          personalized recommendations.
        </p>
      </section>
    </div>
  );
}
