import type { ShopHeaderViewModel } from '@/lib/view-models/shop';
import { ShopBreadcrumb } from './shop-breadcrumb';

export function CategoryHeader({ header }: { header: ShopHeaderViewModel }) {
  return (
    <header>
      <ShopBreadcrumb crumbs={header.crumbs} />
    </header>
  );
}
