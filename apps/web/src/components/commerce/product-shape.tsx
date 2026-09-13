import { cn } from '@/lib/utils';

export type ProductShapeName =
  | 'laptop'
  | 'hoodie'
  | 'chair'
  | 'bottle'
  | 'shoe'
  | 'sneaker'
  | 'bear'
  | 'headphones'
  | 'watch'
  | 'backpack';

const center = 'absolute left-1/2 -translate-x-1/2';

export function ProductShape({ shape }: { shape: ProductShapeName }) {
  switch (shape) {
    case 'laptop':
      return (
        <>
          <div
            className={cn(center, 'bottom-[26%] h-[46%] w-[62%] rounded-t-[6px] p-1')}
            style={{ backgroundImage: 'linear-gradient(160deg,#9ca3af,#374151)' }}
          >
            <div
              className="h-full w-full rounded-[3px]"
              style={{
                backgroundImage:
                  'conic-gradient(from 150deg at 45% 55%,#0ea5e9,#6366f1,#1e293b,#0ea5e9)',
              }}
            />
          </div>
          <div
            className={cn(center, 'bottom-[21%] h-[5%] w-[74%] rounded-b-[5px]')}
            style={{ backgroundImage: 'linear-gradient(180deg,#d1d5db,#6b7280)' }}
          />
        </>
      );
    case 'hoodie':
      return (
        <div
          className={cn(center, 'bottom-[22%] h-[56%] w-[58%] rounded-[18px_18px_10px_10px]')}
          style={{ backgroundImage: 'linear-gradient(160deg,#fbe0e2,#edc5c9)' }}
        >
          <div className="absolute top-[6%] left-1/2 h-[22%] w-[42%] -translate-x-1/2 rounded-b-full bg-black/5" />
        </div>
      );
    case 'chair':
      return (
        <>
          <div
            className={cn(center, 'bottom-[36%] h-[34%] w-[50%] rounded-t-[16px]')}
            style={{ backgroundImage: 'linear-gradient(160deg,#e8dcc9,#cdbca3)' }}
          />
          <div className={cn(center, 'bottom-[26%] h-[12%] w-[62%] rounded-lg')} style={{ backgroundColor: '#d9c9b1' }} />
          <div className={cn(center, 'bottom-[20%] h-[8%] w-[52%]')}>
            <span className="absolute left-2 h-full w-1.5 rounded-sm bg-[#a1846a]" />
            <span className="absolute right-2 h-full w-1.5 rounded-sm bg-[#a1846a]" />
          </div>
        </>
      );
    case 'bottle':
      return (
        <>
          <div
            className={cn(center, 'bottom-[24%] h-[44%] w-[24%] rounded-[10px]')}
            style={{ backgroundImage: 'linear-gradient(160deg,#fde7e4,#f6c8c0)' }}
          />
          <div className={cn(center, 'bottom-[66%] h-[10%] w-[10%] rounded-t-sm bg-[#f3b8ae]')} />
        </>
      );
    case 'shoe':
    case 'sneaker':
      return (
        <>
          <div
            className={cn(center, 'bottom-[28%] h-[26%] w-[62%] rounded-[26px_18px_6px_20px] border border-[#cbd5e1]')}
            style={{ backgroundImage: 'linear-gradient(160deg,#ffffff,#dfe4ec)' }}
          />
          <div
            className={cn(center, 'bottom-[22%] h-[8%] w-[66%] rounded-full')}
            style={{ backgroundColor: shape === 'shoe' ? '#1e3a8a' : '#94a3b8' }}
          />
        </>
      );
    case 'bear':
      return (
        <>
          <div
            className={cn(center, 'bottom-[26%] h-[34%] w-[42%] rounded-[24px]')}
            style={{ backgroundImage: 'linear-gradient(160deg,#d8b58a,#b98f63)' }}
          />
          <div
            className={cn(center, 'bottom-[54%] size-[30%] rounded-full')}
            style={{ backgroundImage: 'linear-gradient(160deg,#e2c39b,#c09a70)' }}
          >
            <span className="absolute -top-1 -left-1 size-[38%] rounded-full bg-[#c09a70]" />
            <span className="absolute -top-1 -right-1 size-[38%] rounded-full bg-[#c09a70]" />
          </div>
        </>
      );
    case 'headphones':
      return (
        <>
          <div className={cn(center, 'bottom-[30%] size-[46%] rounded-full border-[10px] border-[#d8d2c7]')} />
          <div
            className={cn(center, 'bottom-[24%] h-[22%] w-[20%] rounded-[12px]')}
            style={{ backgroundImage: 'linear-gradient(160deg,#efeae0,#cfc7b8)' }}
          />
        </>
      );
    case 'watch':
      return (
        <div
          className={cn(center, 'bottom-[28%] h-[46%] w-[28%] rounded-[14px]')}
          style={{ backgroundImage: 'linear-gradient(160deg,#374151,#111827)' }}
        >
          <div
            className="absolute inset-[5px] rounded-[9px]"
            style={{ backgroundImage: 'linear-gradient(160deg,#3b2f6b,#0f1730)' }}
          />
        </div>
      );
    case 'backpack':
      return (
        <div
          className={cn(center, 'bottom-[24%] h-[52%] w-[40%] rounded-[16px_16px_12px_12px]')}
          style={{ backgroundImage: 'linear-gradient(160deg,#374151,#111827)' }}
        >
          <div className="absolute top-[14%] left-1/2 h-0.5 w-[60%] -translate-x-1/2 bg-white/15" />
          <div className="absolute bottom-[18%] left-1/2 h-[22%] w-[54%] -translate-x-1/2 rounded-md bg-white/10" />
        </div>
      );
    default:
      return null;
  }
}

export const categoryShapeBySlug: Record<string, ProductShapeName> = {
  electronics: 'laptop',
  fashion: 'hoodie',
  'home-living': 'chair',
  'beauty-health': 'bottle',
  'sports-outdoors': 'shoe',
  'toys-games': 'bear',
};

export const productShapeBySlug: Record<string, ProductShapeName> = {
  'macbook-air-m2': 'laptop',
  'sony-wh1000xm5': 'headphones',
  'apple-watch-series-10': 'watch',
  'nike-air-force-1': 'sneaker',
  'north-face-backpack': 'backpack',
};
