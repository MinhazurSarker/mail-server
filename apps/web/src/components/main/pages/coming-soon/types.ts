export interface ComingSoonProps {
  targetDate?: Date;
  title?: string;
  description?: string;
  subscribeText?: string;
  className?: string;
  onSubscribe?: (email: string) => void;
}

export interface SocialLinkItem {
  id: string;
  name: string;
  href: string;
  icon: React.ReactNode;
}
