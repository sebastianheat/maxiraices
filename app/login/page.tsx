import LoginForm from "@/components/LoginForm";

export const dynamic = "force-dynamic";

export default function LoginPage() {
  return (
    <div className="min-h-screen flex items-center justify-center px-4 bg-[var(--color-ink-900)]">
      <div className="w-full max-w-sm">
        <div className="text-center mb-6 text-white">
          <div className="text-xs uppercase tracking-widest text-brand-100/70">Agrícola</div>
          <div className="text-2xl font-semibold">Valles del Maule</div>
          <div className="text-sm text-white/50 mt-1">Dashboard Gerencial</div>
        </div>
        <div className="card p-6">
          <h1 className="text-lg font-semibold mb-1">Iniciar sesión</h1>
          <p className="text-sm text-[var(--muted)] mb-5">Acceso privado al panel.</p>
          <LoginForm />
        </div>
        <p className="text-center text-xs text-white/30 mt-6">
          Acceso restringido · solo usuarios autorizados
        </p>
      </div>
    </div>
  );
}
