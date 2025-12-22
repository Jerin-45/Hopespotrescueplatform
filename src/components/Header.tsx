import { Heart } from 'lucide-react';

interface HeaderProps {
  variant?: 'light' | 'dark' | 'gradient' | 'blue';
}

export function Header({ variant = 'light' }: HeaderProps) {
  const getHeaderStyles = () => {
    switch (variant) {
      case 'dark':
        return 'bg-gray-900 text-white border-gray-800';
      case 'gradient':
        return 'bg-gradient-to-r from-red-600 to-orange-600 text-white border-red-700';
      case 'blue':
        return 'bg-gradient-to-r from-blue-600 to-blue-700 text-white border-blue-700';
      case 'light':
      default:
        return 'bg-white text-gray-900 border-gray-200';
    }
  };

  const getLogoStyles = () => {
    switch (variant) {
      case 'dark':
        return 'bg-red-600 text-white';
      case 'gradient':
      case 'blue':
        return 'bg-white/20 text-white backdrop-blur-sm';
      case 'light':
      default:
        return 'bg-red-600 text-white';
    }
  };

  return (
    <header className={`${getHeaderStyles()} border-b shadow-sm`}>
      <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className={`${getLogoStyles()} w-10 h-10 rounded-full flex items-center justify-center`}>
            <Heart className="w-6 h-6 fill-current" />
          </div>
          <h1 className="text-2xl">Hope Spot</h1>
        </div>
        
        <div className={`${getLogoStyles()} px-4 py-2 rounded-full flex items-center gap-2`}>
          <Heart className="w-5 h-5 fill-current animate-pulse" />
          <span className="text-sm hidden sm:inline">Every Life Matters</span>
        </div>
      </div>
    </header>
  );
}
