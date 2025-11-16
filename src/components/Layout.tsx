import { Outlet } from "react-router-dom";
import { Sidebar } from "@/components/Sidebar";

export function Layout() {
  return (
    <div className="flex min-h-screen w-full bg-background">
      <Sidebar />
      <main className="flex-1 ml-20 lg:ml-64 p-6 lg:p-8">
        <Outlet />
      </main>
    </div>
  );
}
