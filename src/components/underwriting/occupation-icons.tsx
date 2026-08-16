import type { Occupation } from "@/lib/underwriting/types";

const shared = {
  fill: "none",
  stroke: "currentColor",
  strokeWidth: 1.6,
  strokeLinecap: "round" as const,
  strokeLinejoin: "round" as const,
};

function ScooterIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 48 48" {...shared} {...props}>
      <circle cx="12" cy="35" r="5" />
      <circle cx="37" cy="35" r="5" />
      <path d="M12 35 H20 L26 22 H31" />
      <path d="M31 22 L36 14" />
      <path d="M36 10 L36 18" />
      <rect x="6" y="16" width="10" height="9" rx="1.5" />
      <path d="M16 22 L20 22" />
    </svg>
  );
}

function SpoolIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 48 48" {...shared} {...props}>
      <ellipse cx="18" cy="14" rx="8" ry="3.5" />
      <ellipse cx="18" cy="30" rx="8" ry="3.5" />
      <path d="M10 14 V30 M26 14 V30" />
      <path d="M18 30 Q30 34 34 24" />
      <path d="M34 24 L40 18 M34 24 L40 28" />
      <circle cx="34" cy="24" r="1.4" fill="currentColor" stroke="none" />
    </svg>
  );
}

function CartIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 48 48" {...shared} {...props}>
      <path d="M8 40 H40" />
      <circle cx="16" cy="36" r="3.2" />
      <circle cx="32" cy="36" r="3.2" />
      <path d="M10 33 H38 V22 H10 Z" />
      <path d="M24 22 V10" />
      <path d="M12 10 Q24 2 36 10" />
      <path d="M15 27 H33 M15 30 H33" />
    </svg>
  );
}

function HouseBroomIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 48 48" {...shared} {...props}>
      <path d="M8 22 L22 10 L36 22" />
      <path d="M11 20 V38 H33 V20" />
      <path d="M20 38 V27 H26 V38" />
      <path d="M38 14 L34 32" />
      <path d="M34 32 L30 36 M34 32 L38 35 M34 32 L32.5 37" />
    </svg>
  );
}

const ICONS: Record<Occupation, (props: React.SVGProps<SVGSVGElement>) => React.JSX.Element> = {
  "delivery-rider": ScooterIcon,
  tailor: SpoolIcon,
  "street-vendor": CartIcon,
  "domestic-worker": HouseBroomIcon,
};

export function OccupationIcon({
  occupation,
  className,
}: {
  occupation: Occupation;
  className?: string;
}) {
  const Icon = ICONS[occupation];
  return <Icon className={className} />;
}
