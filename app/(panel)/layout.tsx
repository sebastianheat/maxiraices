import { redirect } from "next/navigation";
import Sidebar from "@/components/Sidebar";
import { getSessionUser } from "@/lib/auth";

export default async function PanelLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await getSessionUser();
  if (!user) redirect("/login");

  return (
    <div className="flex min-h-screen">
      <Sidebar nombre={user.nombre} email={user.email} rol={user.rol} />
      <main className="flex-1 px-6 py-8 md:px-10 max-w-[1400px]">{children}</main>
    </div>
  );
}
