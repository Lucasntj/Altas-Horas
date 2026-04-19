export default function OwnerUsersPage() {
  return (
    <section className="owner-page">
      <header className="owner-hero">
        <h1>Usuarios</h1>
        <p>Gerencie acessos da operacao (fase inicial).</p>
      </header>

      <section className="owner-panel">
        <h2 className="owner-panel-title">Usuarios do sistema</h2>
        <div className="owner-card-grid">
          <article className="owner-data-card">
            <h3>Administrador</h3>
            <p>Perfil: dono</p>
            <p>Acesso completo ao painel</p>
          </article>
          <article className="owner-data-card">
            <h3>Atendente</h3>
            <p>Perfil: colaborador</p>
            <p>Acesso a pedidos e clientes</p>
          </article>
        </div>
      </section>
    </section>
  );
}
