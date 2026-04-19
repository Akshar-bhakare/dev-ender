declare module 'lucide-react' {
  import { FC, SVGProps } from 'react';

  export interface IconProps extends SVGProps<SVGSVGElement> {
    size?: string | number;
    color?: string;
    strokeWidth?: string | number;
    absoluteStrokeWidth?: boolean;
  }

  export type Icon = FC<IconProps>;

  export const ShieldCheck: Icon;
  export const Zap: Icon;
  export const Star: Icon;
  export const Briefcase: Icon;
  export const MapPin: Icon;
  export const Users: Icon;
  export const Calendar: Icon;
  export const ArrowRight: Icon;
  export const Ticket: Icon;
  export const Check: Icon;
  export const Search: Icon;
  export const Filter: Icon;
  export const SlidersHorizontal: Icon;
  export const ChevronDown: Icon;
  export const Plus: Icon;
  export const Loader2: Icon;
  export const ExternalLink: Icon;
  export const MoreHorizontal: Icon;
  export const Heart: Icon;
  export const MessageSquare: Icon;
  export const Send: Icon;
  export const Sparkles: Icon;
  export const TrendingUp: Icon;
  export const Clock: Icon;
  export const DollarSign: Icon;
  export const Building2: Icon;
  export const Image: Icon;
  export const X: Icon;
  export const Bookmark: Icon;
  export const Settings: Icon;
  export const Bell: Icon;
  export const FileText: Icon;
  export const ChevronRight: Icon;
  export const Target: Icon;
  export const Layout: Icon;
  export const Trash2: Icon;
  export const Save: Icon;
  export const Award: Icon;
  export const BookOpen: Icon;
  export const Globe: Icon;
  export const Wallet: Icon;
  export const CheckCircle2: Icon;
  export const Link: Icon;
  export const Edit3: Icon;
}
