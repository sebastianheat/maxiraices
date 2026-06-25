import { redirect } from "next/navigation";
import PageHeader from "@/components/PageHeader";
import EquipoClient from "@/components/EquipoClient";
import { getSessionUser } from "@/lib/auth";
import { listUsers } from "@/lib/users";

export const dynamic = "force-dynamic";

export default async function EquipoPage() {
  const user = await getSessionUser();
  if (!user) redirect("/login");
  if (user.rol !== "admin") redirect("/");

  const users = await listUsers();

  return (
    <>
      <PageHeader
        titulo="Equipo"
        subtitulo="Crea y administra los usuarios del panel y sus roles"
        origen="neon"
      />
      <EquipoClient usuariosIniciales={users} miId={user.uid} />
    </>
  );
}
