import type { SVGProps } from 'react';

function FlagSvg({ children, title, ...props }: SVGProps<SVGSVGElement> & { title: string }) {
  return (
    <svg viewBox="0 0 24 16" className="h-3.5 w-5 shrink-0 rounded-[2px]" aria-hidden="true" {...props}>
      <title>{title}</title>
      {children}
    </svg>
  );
}

export function SellerFlag({ code }: { code: string }) {
  switch (code) {
    case 'US':
      return (
        <FlagSvg title="United States">
          <rect width="24" height="16" fill="#3C3B6E" />
          <rect y="2" width="24" height="2" fill="#fff" />
          <rect y="6" width="24" height="2" fill="#fff" />
          <rect y="10" width="24" height="2" fill="#fff" />
          <rect y="14" width="24" height="2" fill="#fff" />
          <rect y="1" width="24" height="2" fill="#B22234" />
          <rect y="5" width="24" height="2" fill="#B22234" />
          <rect y="9" width="24" height="2" fill="#B22234" />
          <rect y="13" width="24" height="2" fill="#B22234" />
          <rect width="10" height="9" fill="#3C3B6E" />
        </FlagSvg>
      );
    case 'SG':
      return (
        <FlagSvg title="Singapore">
          <rect width="24" height="8" fill="#EF3340" />
          <rect y="8" width="24" height="8" fill="#fff" />
          <circle cx="6" cy="4.2" r="2.4" fill="#fff" />
          <circle cx="5.2" cy="4.2" r="2.1" fill="#EF3340" />
        </FlagSvg>
      );
    default:
      return (
        <FlagSvg title="Vietnam">
          <rect width="24" height="16" fill="#DA251D" />
          <polygon
            fill="#FF0"
            points="12,3.1 13.1,6.6 16.8,6.6 13.8,8.8 15,12.3 12,10.1 9,12.3 10.2,8.8 7.2,6.6 10.9,6.6"
          />
        </FlagSvg>
      );
  }
}
