import Sidebar from "@/components/layout/Sidebar";
import AdminHeader from "@/components/layout/AdminHeader";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getServerSession(authOptions);
  const userRole = (session?.user as any)?.role;

  // Wajib memiliki sesi login
  if (!session) {
    redirect("/admin/login");
  }

  // Wajib memiliki hak akses staf/admin (tolak akun donatur publik)
  if (userRole !== "admin" && userRole !== "super_admin") {
    redirect("/admin/login?error=UnauthorizedRole");
  }

  return (
    <div className="flex min-h-screen bg-zinc-50 dark:bg-zinc-900">
      {/* Sidebar for Desktop */}
      <div className="hidden md:block">
        <Sidebar />
      </div>

      <div className="flex flex-1 flex-col md:pl-64">
        <AdminHeader />
        <main className="flex-1 p-6 sm:p-8">
          {children}
        </main>
      </div>
    </div>
  );
}
