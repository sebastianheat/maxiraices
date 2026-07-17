import { redirect } from "next/navigation";
import Sidebar from "@/components/Sidebar";
import SyncBar from "@/components/SyncBar";
import { getSessionUser } from "@/lib/auth";
import { ultimaSync } from "@/lib/sync";

export default async function PanelLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await getSessionUser();
  if (!user) redirect("/login");
  const ultima = await ultimaSync();

  return (
    <div className="flex min-h-screen">
      <Sidebar nombre={user.nombre} email={user.email} rol={user.rol} />
      <main className="flex-1 px-6 py-8 md:px-10 max-w-[1400px] w-full">
        <SyncBar isAdmin={user.rol === "admin"} ultima={ultima} />
        {children}
      </main>
    </div>
  );
}
