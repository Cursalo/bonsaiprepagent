'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import {
  BarChart3,
  Users,
  CreditCard,
  Settings,
  MessageSquare,
  Award,
  Activity,
  Database,
  Menu,
  X,
  ChevronDown,
  TreePine
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';

interface NavItem {
  title: string;
  href?: string;
  icon: React.ComponentType<{ className?: string }>;
  children?: NavItem[];
}

const navItems: NavItem[] = [
  {
    title: 'Dashboard',
    href: '/admin',
    icon: BarChart3,
  },
  {
    title: 'Users',
    icon: Users,
    children: [
      { title: 'All Users', href: '/admin/users', icon: Users },
      { title: 'User Analytics', href: '/admin/users/analytics', icon: BarChart3 },
      { title: 'User Support', href: '/admin/users/support', icon: MessageSquare },
    ]
  },
  {
    title: 'Subscriptions',
    icon: CreditCard,
    children: [
      { title: 'Active Subscriptions', href: '/admin/subscriptions', icon: CreditCard },
      { title: 'Revenue Analytics', href: '/admin/subscriptions/revenue', icon: BarChart3 },
      { title: 'Billing Issues', href: '/admin/subscriptions/issues', icon: Activity },
    ]
  },
  {
    title: 'AI & Content',
    icon: MessageSquare,
    children: [
      { title: 'AI Interactions', href: '/admin/ai/interactions', icon: MessageSquare },
      { title: 'AI Performance', href: '/admin/ai/performance', icon: Activity },
      { title: 'Content Moderation', href: '/admin/ai/moderation', icon: Settings },
    ]
  },
  {
    title: 'Bonsai System',
    icon: TreePine,
    children: [
      { title: 'Achievements', href: '/admin/bonsai/achievements', icon: Award },
      { title: 'Progress Tracking', href: '/admin/bonsai/progress', icon: BarChart3 },
      { title: 'Gamification', href: '/admin/bonsai/gamification', icon: Award },
    ]
  },
  {
    title: 'System',
    icon: Database,
    children: [
      { title: 'System Health', href: '/admin/system/health', icon: Activity },
      { title: 'Database', href: '/admin/system/database', icon: Database },
      { title: 'Configuration', href: '/admin/system/config', icon: Settings },
    ]
  },
];

export function AdminSidebar() {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [openSections, setOpenSections] = useState<string[]>(['Dashboard']);
  const pathname = usePathname();

  const toggleSection = (title: string) => {
    setOpenSections(prev =>
      prev.includes(title)
        ? prev.filter(t => t !== title)
        : [...prev, title]
    );
  };

  const isActive = (href?: string) => {
    if (!href) return false;
    return pathname === href || (href !== '/admin' && pathname.startsWith(href));
  };

  const isSectionActive = (item: NavItem) => {
    if (item.href) return isActive(item.href);
    return item.children?.some(child => isActive(child.href)) || false;
  };

  return (
    <>
      {/* Mobile overlay */}
      {!isCollapsed && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-40 md:hidden"
          onClick={() => setIsCollapsed(true)}
        />
      )}

      {/* Sidebar */}
      <div
        className={cn(
          'fixed inset-y-0 left-0 z-50 flex flex-col bg-white border-r border-gray-200 transition-all duration-300 md:relative md:translate-x-0',
          isCollapsed ? '-translate-x-full md:w-16' : 'w-64'
        )}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200">
          {!isCollapsed && (
            <div className="flex items-center gap-2">
              <TreePine className="w-8 h-8 text-green-600" />
              <div>
                <h2 className="font-bold text-gray-900">Bonsai Admin</h2>
                <p className="text-xs text-gray-500">SAT Tutor Platform</p>
              </div>
            </div>
          )}
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setIsCollapsed(!isCollapsed)}
            className="md:hidden"
          >
            {isCollapsed ? <Menu className="w-4 h-4" /> : <X className="w-4 h-4" />}
          </Button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto p-4">
          <ul className="space-y-2">
            {navItems.map((item) => (
              <li key={item.title}>
                {item.children ? (
                  <Collapsible
                    open={openSections.includes(item.title) && !isCollapsed}
                    onOpenChange={() => !isCollapsed && toggleSection(item.title)}
                  >
                    <CollapsibleTrigger asChild>
                      <Button
                        variant="ghost"
                        className={cn(
                          'w-full justify-start gap-2 text-left',
                          isSectionActive(item) && 'bg-green-50 text-green-700',
                          isCollapsed && 'justify-center'
                        )}
                        onClick={() => isCollapsed && setIsCollapsed(false)}
                      >
                        <item.icon className="w-4 h-4 flex-shrink-0" />
                        {!isCollapsed && (
                          <>
                            <span className="flex-1">{item.title}</span>
                            <ChevronDown
                              className={cn(
                                'w-4 h-4 transition-transform',
                                openSections.includes(item.title) && 'rotate-180'
                              )}
                            />
                          </>
                        )}
                      </Button>
                    </CollapsibleTrigger>
                    <CollapsibleContent className="mt-1">
                      <ul className="space-y-1 ml-6">
                        {item.children.map((child) => (
                          <li key={child.title}>
                            <Link href={child.href || '#'}>
                              <Button
                                variant="ghost"
                                size="sm"
                                className={cn(
                                  'w-full justify-start gap-2 text-sm',
                                  isActive(child.href) &&
                                    'bg-green-100 text-green-800 font-medium'
                                )}
                              >
                                <child.icon className="w-3 h-3" />
                                {child.title}
                              </Button>
                            </Link>
                          </li>
                        ))}
                      </ul>
                    </CollapsibleContent>
                  </Collapsible>
                ) : (
                  <Link href={item.href || '#'}>
                    <Button
                      variant="ghost"
                      className={cn(
                        'w-full justify-start gap-2',
                        isActive(item.href) && 'bg-green-50 text-green-700 font-medium',
                        isCollapsed && 'justify-center'
                      )}
                    >
                      <item.icon className="w-4 h-4 flex-shrink-0" />
                      {!isCollapsed && <span>{item.title}</span>}
                    </Button>
                  </Link>
                )}
              </li>
            ))}
          </ul>
        </nav>

        {/* Footer */}
        <div className="p-4 border-t border-gray-200">
          {!isCollapsed && (
            <div className="text-xs text-gray-500">
              <p>Build: v{process.env.NEXT_PUBLIC_APP_VERSION || '1.0.0'}</p>
              <p>Environment: {process.env.NODE_ENV}</p>
            </div>
          )}
        </div>
      </div>
    </>
  );
}