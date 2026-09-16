import type { ShopHeaderViewModel } from '@/lib/view-models/shop';
import { ShopBreadcrumb } from './shop-breadcrumb';

export function CategoryHeader({ header }: { header: ShopHeaderViewModel }) {
  return (
    <header>
      <h1 className="sr-only">{header.title}</h1>
      <ShopBreadcrumb crumbs={header.crumbs} />
    </header>
  );
}
