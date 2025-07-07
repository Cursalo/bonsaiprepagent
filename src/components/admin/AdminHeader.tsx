'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from '@/components/ui/avatar';
import {
  Bell,
  Search,
  Settings,
  LogOut,
  User,
  Home,
  AlertCircle,
} from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import type { User } from '@supabase/supabase-js';

interface AdminHeaderProps {
  user: User;
}

export function AdminHeader({ user }: AdminHeaderProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const router = useRouter();
  const supabase = createClient();

  const handleSignOut = async () => {
    try {
      await supabase.auth.signOut();
      router.push('/auth/signin');
      toast.success('Signed out successfully');
    } catch (error) {
      console.error('Sign out error:', error);
      toast.error('Error signing out');
    }
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      // Navigate to search results or implement search functionality
      router.push(`/admin/search?q=${encodeURIComponent(searchQuery)}`);
    }
  };

  const getUserInitials = (email: string) => {
    return email.split('@')[0].slice(0, 2).toUpperCase();
  };

  return (
    <header className="bg-white border-b border-gray-200 px-6 py-4">
      <div className="flex items-center justify-between">
        {/* Search */}
        <div className="flex-1 max-w-md">
          <form onSubmit={handleSearch} className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <Input
              type="search"
              placeholder="Search users, subscriptions, or analytics..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </form>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-4">
          {/* Quick Stats */}
          <div className="hidden md:flex items-center gap-4 text-sm">
            <div className="text-center">
              <div className="text-gray-500">Active Users</div>
              <div className="font-semibold text-green-600">1,234</div>
            </div>
            <div className="text-center">
              <div className="text-gray-500">MRR</div>
              <div className="font-semibold text-blue-600">$12.3k</div>
            </div>
            <div className="text-center">
              <div className="text-gray-500">AI Calls</div>
              <div className="font-semibold text-purple-600">45.2k</div>
            </div>
          </div>

          {/* Notifications */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="sm" className="relative">
                <Bell className="w-4 h-4" />
                <Badge
                  variant="destructive"
                  className="absolute -top-1 -right-1 w-5 h-5 p-0 text-xs flex items-center justify-center"
                >
                  3
                </Badge>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-80">
              <div className="p-3 border-b">
                <h4 className="font-semibold">Notifications</h4>
                <p className="text-sm text-gray-500">3 unread notifications</p>
              </div>
              <div className="max-h-64 overflow-y-auto">
                <DropdownMenuItem className="flex items-start gap-3 p-3">
                  <AlertCircle className="w-4 h-4 text-orange-500 mt-0.5" />
                  <div className="flex-1">
                    <p className="text-sm font-medium">High API Usage Alert</p>
                    <p className="text-xs text-gray-500">OpenAI API usage is at 85% of monthly limit</p>
                    <p className="text-xs text-gray-400">2 minutes ago</p>
                  </div>
                </DropdownMenuItem>
                <DropdownMenuItem className="flex items-start gap-3 p-3">
                  <User className="w-4 h-4 text-blue-500 mt-0.5" />
                  <div className="flex-1">
                    <p className="text-sm font-medium">New Pro Subscription</p>
                    <p className="text-xs text-gray-500">john.doe@example.com upgraded to Pro</p>
                    <p className="text-xs text-gray-400">15 minutes ago</p>
                  </div>
                </DropdownMenuItem>
                <DropdownMenuItem className="flex items-start gap-3 p-3">
                  <AlertCircle className="w-4 h-4 text-red-500 mt-0.5" />
                  <div className="flex-1">
                    <p className="text-sm font-medium">Payment Failed</p>
                    <p className="text-xs text-gray-500">Subscription renewal failed for user #1234</p>
                    <p className="text-xs text-gray-400">1 hour ago</p>
                  </div>
                </DropdownMenuItem>
              </div>
              <div className="p-2 border-t">
                <Button variant="ghost" size="sm" className="w-full">
                  View all notifications
                </Button>
              </div>
            </DropdownMenuContent>
          </DropdownMenu>

          {/* Settings */}
          <Button variant="ghost" size="sm" onClick={() => router.push('/admin/system/config')}>
            <Settings className="w-4 h-4" />
          </Button>

          {/* User Menu */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="relative h-8 w-8 rounded-full">
                <Avatar className="h-8 w-8">
                  <AvatarImage src={user.user_metadata?.avatar_url} alt={user.email || ''} />
                  <AvatarFallback className="bg-green-100 text-green-700">
                    {getUserInitials(user.email || '')}
                  </AvatarFallback>
                </Avatar>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-56" align="end" forceMount>
              <div className="flex flex-col space-y-1 p-2">
                <p className="text-sm font-medium leading-none">{user.user_metadata?.full_name || 'Admin'}</p>
                <p className="text-xs leading-none text-muted-foreground">{user.email}</p>
              </div>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => router.push('/')}>
                <Home className="mr-2 h-4 w-4" />
                <span>Go to App</span>
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => router.push('/admin/profile')}>
                <User className="mr-2 h-4 w-4" />
                <span>Profile</span>
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => router.push('/admin/system/config')}>
                <Settings className="mr-2 h-4 w-4" />
                <span>Settings</span>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={handleSignOut}>
                <LogOut className="mr-2 h-4 w-4" />
                <span>Sign out</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  );
}