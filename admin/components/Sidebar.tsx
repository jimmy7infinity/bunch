'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { 
  LayoutDashboard, 
  MessageSquare, 
  Image, 
  Users, 
  AlertTriangle, 
  Megaphone,
  MessagesSquare,
  UserCircle,
  LogOut
} from 'lucide-react';
import { cn } from '@/lib/utils';

const navigation = [
  { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
  { name: 'Messages', href: '/messages', icon: MessageSquare },
  { name: 'Media', href: '/media', icon: Image },
  { name: 'Users', href: '/users', icon: Users },
  { name: 'Reports', href: '/reports', icon: AlertTriangle },
  { name: 'Chatrooms', href: '/chatrooms', icon: MessagesSquare },
  { name: 'Actions', href: '/actions', icon: Megaphone },
  { name: 'Profile', href: '/profile', icon: UserCircle },
];

export function Sidebar() {
  const pathname = usePathname();

  const handleLogout = () => {
    localStorage.removeItem('admin_token');
    window.location.href = '/login';
  };

  return (
    <div className="flex h-screen w-64 flex-col border-r bg-card/50 backdrop-blur-sm">
      <div className="flex h-16 items-center gap-3 border-b px-6">
        <img src="/logo.png" alt="Bunch" className="w-8 h-8" />
        <h1 className="text-xl font-bold bg-gradient-to-r from-[#FFD655] to-[#FFB200] bg-clip-text text-transparent">
          Bunch Admin
        </h1>
      </div>
      
      <nav className="flex-1 space-y-1 p-4">
        {navigation.map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.name}
              href={item.href}
              className={cn(
                'flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all duration-200',
                isActive
                  ? 'bg-primary text-primary-foreground shadow-lg shadow-primary/20'
                  : 'text-muted-foreground hover:bg-accent hover:text-foreground'
              )}
            >
              <item.icon className="h-5 w-5" />
              {item.name}
            </Link>
          );
        })}
      </nav>

      <div className="border-t p-4">
        <button
          onClick={handleLogout}
          className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-muted-foreground transition-all duration-200 hover:bg-destructive/10 hover:text-destructive"
        >
          <LogOut className="h-5 w-5" />
          Logout
        </button>
      </div>
    </div>
  );
}
