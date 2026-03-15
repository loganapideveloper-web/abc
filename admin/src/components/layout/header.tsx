'use client';
import React from 'react';
import { Menu, Bell } from 'lucide-react';
import { useAuthStore } from '@/store/auth.store';
import { getInitials } from '@/lib/utils';
import { ThemeToggle } from './theme-toggle';

interface HeaderProps {
  onMobileMenuOpen: () => void;
  collapsed: boolean;
}

export function Header({ onMobileMenuOpen, collapsed }: HeaderProps) {
  const { user } = useAuthStore();

  return (
    <header
      className="fixed top-0 right-0 z-20 h-16 bg-background/80 backdrop-blur-sm border-b border-border flex items-center px-4 gap-4 transition-all duration-300"
      style={{ left: collapsed ? '4rem' : '15rem' }}
    >
      <button
        className="lg:hidden p-2 rounded-md text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors"
        onClick={onMobileMenuOpen}
      >
        <Menu className="h-5 w-5" />
      </button>

      <div className="flex-1" />

      {/* Theme toggle */}
      <ThemeToggle />

      {/* Notification bell */}
      <button className="relative p-2 rounded-md text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors">
        <Bell className="h-5 w-5" />
        <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-primary rounded-full" />
      </button>

      {/* User avatar */}
      <div className="flex items-center gap-3">
        <div className="text-right hidden sm:block">
          <p className="text-sm font-semibold text-foreground">{user?.name ?? 'Admin'}</p>
          <p className="text-xs text-muted-foreground">{user?.email ?? ''}</p>
        </div>
        <div className="w-9 h-9 rounded-full bg-primary/20 border border-primary/30 flex items-center justify-center text-sm font-bold text-primary">
          {getInitials(user?.name ?? 'A')}
        </div>
      </div>
    </header>
  );
}
