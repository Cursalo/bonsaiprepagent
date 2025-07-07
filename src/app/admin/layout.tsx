import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { AdminSidebar } from '@/components/admin/AdminSidebar';
import { AdminHeader } from '@/components/admin/AdminHeader';
import { Toaster } from 'sonner';

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = createClient();
  
  // Check if user is authenticated and is admin
  const { data: { user }, error } = await supabase.auth.getUser();
  
  if (error || !user) {
    redirect('/auth/signin?redirect=/admin');
  }
  
  // Check if user has admin role
  const { data: profile } = await supabase
    .from('user_profiles')
    .select('role')
    .eq('id', user.id)
    .single();
  
  if (!profile || profile.role !== 'admin') {
    redirect('/');
  }
  
  return (
    <div className="flex h-screen bg-gray-50">
      <AdminSidebar />
      <div className="flex-1 flex flex-col overflow-hidden">
        <AdminHeader user={user} />
        <main className="flex-1 overflow-y-auto p-6">
          {children}
        </main>
      </div>
      <Toaster position="top-right" />
    </div>
  );
}