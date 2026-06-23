import { notFound } from 'next/navigation';

import { Breadcrumbs } from '@/components/store/breadcrumbs';
import { CategoryProductGrid } from '@/components/store/category-product-grid';
import { getCategoryBySlug } from '@/lib/mock/catalog';

type CategoryPageProps = {
  params: {
    slug: string;
  };
};

export default function CategoryPage({ params }: CategoryPageProps) {
  const category = getCategoryBySlug(params.slug);
  if (!category) {
    notFound();
  }

  return (
    <div className="space-y-4">
      <Breadcrumbs
        items={[{ href: '/', label: 'Trang chu' }, { label: category.name }]}
      />
      <div>
        <h1 className="text-2xl font-semibold">{category.name}</h1>
        <p className="text-sm text-muted-foreground">
          Danh sach san pham theo category voi bo loc, sap xep va infinite
          scroll.
        </p>
      </div>
      <CategoryProductGrid categorySlug={category.slug} />
    </div>
  );
}
