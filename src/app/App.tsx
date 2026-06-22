import React from 'react';
import { QueryProvider } from './providers/QueryProvider.tsx';
import { AuthProvider, useAuth } from './providers/AuthProvider.tsx';
import { TenantProvider, useTenant } from './providers/TenantProvider.tsx';
import { Trophy, Users, Award, LogOut, CheckCircle, Activity, Calendar } from 'lucide-react';

const DashboardContent: React.FC = () => {
  const { tenant, loading, subdomain } = useTenant();
  const { user, login, logout } = useAuth();

  // Handle mock login for demonstration purposes
  const handleMockLogin = () => {
    login('mock-jwt-token-xyz', {
      id: 'usr-100',
      username: 'pedro_cto',
      email: 'pedro.francisco@bolayetu.ao',
      role: 'org_admin',
      tenant_id: tenant?.id || null
    });
  };

  // Mock data representing what the API selectors and views return:
  const mockMatches = [
    { id: '1', home: 'Petro de Luanda', away: '1º de Agosto', homeScore: 2, awayScore: 1, status: 'finished', time: 'FT', round: 'Jornada 12' },
    { id: '2', home: 'Sagrada Esperança', away: 'Kabuscorp', homeScore: 0, awayScore: 0, status: 'live', time: '67\'', round: 'Jornada 12' },
    { id: '3', home: 'Desportivo da Huíla', away: 'Wiliete de Benguela', homeScore: 0, awayScore: 0, status: 'scheduled', time: 'Amanhã 15:30', round: 'Jornada 12' },
  ];

  const mockClubs = [
    { name: 'Petro de Luanda', code: 'APL', founded: 1980, capacity: 50000, color1: '#FFCC00', color2: '#003399' },
    { name: '1º de Agosto', code: 'PRI', founded: 1977, capacity: 20000, color1: '#FF0000', color2: '#000000' },
    { name: 'Sagrada Esperança', code: 'SAG', founded: 1976, capacity: 8000, color1: '#008000', color2: '#FFFFFF' },
    { name: 'Kabuscorp SCP', code: 'KAB', founded: 1994, capacity: 15000, color1: '#FF0000', color2: '#FFFFFF' },
  ];

  if (loading) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '100vh', gap: '1rem' }}>
        <div style={{ width: '40px', height: '40px', border: '3px solid var(--color-secondary)', borderTopColor: 'transparent', borderRadius: '50%', animation: 'spin 1s linear infinite' }} />
        <p style={{ color: 'var(--text-muted)', fontFamily: 'var(--font-sans)', fontWeight: 500 }}>A resolver organização...</p>
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      </div>
    );
  }

  return (
    <div className="animate-fade-in">
      {/* Background glowing particles */}
      <div className="glow-bg">
        <div className="glow-circle glow-1"></div>
        <div className="glow-circle glow-2"></div>
      </div>

      {/* Top Banner indicating Resolved Tenant */}
      <header className="glass-card" style={{ borderRadius: '0 0 var(--radius-md) var(--radius-md)', padding: '1rem 2.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2.5rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          {tenant?.logoUrl ? (
            <img src={tenant.logoUrl} alt="Logo" style={{ height: '45px', objectFit: 'contain' }} />
          ) : (
            <div style={{ width: '45px', height: '45px', borderRadius: '50%', backgroundColor: 'rgba(var(--color-primary-rgb), 0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '1px solid var(--color-primary)' }}>
              <Trophy size={20} color="var(--color-primary)" />
            </div>
          )}
          <div>
            <h1 style={{ fontSize: '1.4rem', color: 'var(--text-main)' }}>
              {tenant ? tenant.name : 'BolaYetu Hub'}
            </h1>
            <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
              {tenant ? (
                <>
                  <CheckCircle size={12} color="var(--color-secondary)" /> Subdomínio: {tenant.slug}.bolayetu.com
                </>
              ) : (
                'Plataforma Central do Ecossistema'
              )}
            </p>
          </div>
        </div>

        {/* Authentication Context details */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '1.25rem' }}>
          {user ? (
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
              <div style={{ textAlign: 'right' }}>
                <p style={{ fontSize: '0.85rem', fontWeight: 600 }}>{user.username}</p>
                <span className="badge badge-success" style={{ fontSize: '0.65rem' }}>
                  {user.role === 'org_admin' ? 'Administrador FAF/Liga' : user.role}
                </span>
              </div>
              <button 
                onClick={logout} 
                className="btn-secondary" 
                style={{ padding: '0.5rem 1rem', display: 'flex', alignItems: 'center', gap: '0.25rem', fontSize: '0.8rem' }}
                id="btn-logout"
              >
                <LogOut size={14} /> Sair
              </button>
            </div>
          ) : (
            <button 
              onClick={handleMockLogin} 
              className="btn-primary" 
              style={{ padding: '0.5rem 1.25rem', fontSize: '0.85rem' }}
              id="btn-login-demo"
            >
              Iniciar Sessão Demo
            </button>
          )}
        </div>
      </header>

      {/* Main Container */}
      <main className="main-content">
        
        {/* Dynamic Tenant Selector Toolbar for Easy Review */}
        <div className="glass-card" style={{ marginBottom: '2.5rem', background: 'rgba(var(--color-primary-rgb), 0.03)' }}>
          <h3 style={{ fontSize: '0.95rem', color: 'var(--text-main)', marginBottom: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Activity size={16} color="var(--color-secondary)" /> Selector de Organizações (Simulação Multi-Tenant Local)
          </h3>
          <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '1rem' }}>
            Clique nas opções abaixo para carregar as configurações de branding e dados de cada organização via query string:
          </p>
          <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
            <a href="?tenant=girabola" className="btn-secondary" style={{ borderColor: subdomain === 'girabola' ? 'var(--color-primary)' : 'var(--text-muted)' }}>
              Girabola (Verde & Ouro)
            </a>
            <a href="?tenant=faf" className="btn-secondary" style={{ borderColor: subdomain === 'faf' ? 'var(--color-primary)' : 'var(--text-muted)' }}>
              FAF (Vermelho & Amarelo)
            </a>
            <a href="?tenant=apf-luanda" className="btn-secondary" style={{ borderColor: subdomain === 'apf-luanda' ? 'var(--color-primary)' : 'var(--text-muted)' }}>
              APF Luanda (Azul & Ouro)
            </a>
            <a href="/" className="btn-secondary" style={{ opacity: !subdomain ? 1 : 0.6 }}>
              Sem Tenant (Padrão Central)
            </a>
          </div>
        </div>

        {tenant && (
          <div className="tenant-indicator animate-fade-in">
            <Award size={16} color="var(--color-secondary)" /> Organização Ativa: <strong>{tenant.name}</strong> ({tenant.type.toUpperCase()})
          </div>
        )}

        {/* Dashboard Title */}
        <h2 style={{ fontSize: '2rem', marginBottom: '2rem', fontFamily: 'var(--font-display)', fontWeight: 800 }}>
          Painel de Controlo
        </h2>

        {/* KPI Metrics Dashboard Grid */}
        <div className="kpi-grid">
          <div className="glass-card" style={{ display: 'flex', alignItems: 'center', gap: '1.25rem', background: 'linear-gradient(135deg, rgba(var(--color-primary-rgb), 0.05) 0%, transparent 100%)' }}>
            <div style={{ padding: '0.75rem', borderRadius: '12px', backgroundColor: 'rgba(var(--color-primary-rgb), 0.1)' }}>
              <Trophy size={24} color="var(--color-primary)" />
            </div>
            <div>
              <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', fontWeight: 500 }}>Competições</p>
              <h3 style={{ fontSize: '1.6rem', fontWeight: 800 }}>{tenant ? '3 Activas' : '15 Totais'}</h3>
            </div>
          </div>

          <div className="glass-card" style={{ display: 'flex', alignItems: 'center', gap: '1.25rem', background: 'linear-gradient(135deg, rgba(var(--color-secondary-rgb), 0.05) 0%, transparent 100%)' }}>
            <div style={{ padding: '0.75rem', borderRadius: '12px', backgroundColor: 'rgba(var(--color-secondary-rgb), 0.1)' }}>
              <Users size={24} color="var(--color-secondary)" />
            </div>
            <div>
              <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', fontWeight: 500 }}>Clubes Filiados</p>
              <h3 style={{ fontSize: '1.6rem', fontWeight: 800 }}>{tenant ? '16 Clubes' : '82 Clubes'}</h3>
            </div>
          </div>

          <div className="glass-card" style={{ display: 'flex', alignItems: 'center', gap: '1.25rem', background: 'linear-gradient(135deg, rgba(var(--color-primary-rgb), 0.05) 0%, transparent 100%)' }}>
            <div style={{ padding: '0.75rem', borderRadius: '12px', backgroundColor: 'rgba(var(--color-primary-rgb), 0.1)' }}>
              <Activity size={24} color="var(--color-primary)" />
            </div>
            <div>
              <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', fontWeight: 500 }}>Jogos Disputados</p>
              <h3 style={{ fontSize: '1.6rem', fontWeight: 800 }}>{tenant ? '138 Jogos' : '1,492 Jogos'}</h3>
            </div>
          </div>

          <div className="glass-card" style={{ display: 'flex', alignItems: 'center', gap: '1.25rem', background: 'linear-gradient(135deg, rgba(var(--color-accent-rgb), 0.05) 0%, transparent 100%)' }}>
            <div style={{ padding: '0.75rem', borderRadius: '12px', backgroundColor: 'rgba(var(--color-accent-rgb), 0.1)' }}>
              <Award size={24} color="var(--color-accent)" />
            </div>
            <div>
              <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', fontWeight: 500 }}>Subscritores Adeptos</p>
              <h3 style={{ fontSize: '1.6rem', fontWeight: 800 }}>{tenant ? '12.4k' : '150k+'}</h3>
            </div>
          </div>
        </div>

        {/* Dashboard Sections Grid */}
        <div className="dashboard-grid">
          
          {/* Matches Feed Card */}
          <div className="glass-card" style={{ gridColumn: 'span 2' }}>
            <h3 style={{ fontSize: '1.25rem', marginBottom: '1.25rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Calendar size={18} color="var(--color-primary)" /> Partidas e Resultados Recentes
            </h3>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {mockMatches.map((match) => (
                <div 
                  key={match.id} 
                  style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '1rem', border: '1px solid var(--bg-card-border)', borderRadius: 'var(--radius-sm)', background: 'rgba(255,255,255,0.02)' }}
                >
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
                    <span className="badge badge-info" style={{ alignSelf: 'flex-start', fontSize: '0.6rem', padding: '0.15rem 0.5rem' }}>
                      {match.round}
                    </span>
                    <div style={{ display: 'flex', gap: '1rem', alignItems: 'center', marginTop: '0.25rem' }}>
                      <span style={{ fontWeight: 600 }}>{match.home}</span>
                      <span style={{ color: 'var(--text-muted)' }}>vs</span>
                      <span style={{ fontWeight: 600 }}>{match.away}</span>
                    </div>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                    {match.status === 'finished' && (
                      <div style={{ fontSize: '1.1rem', fontWeight: 700, letterSpacing: '0.2em' }}>
                        {match.homeScore} - {match.awayScore}
                      </div>
                    )}
                    {match.status === 'live' && (
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <span style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: 'var(--color-accent)', display: 'inline-block', animation: 'pulse 1s infinite' }} />
                        <span style={{ fontSize: '0.9rem', color: 'var(--color-accent)', fontWeight: 600 }}>{match.time}</span>
                        <div style={{ fontSize: '1.1rem', fontWeight: 700, letterSpacing: '0.2em', marginLeft: '0.25rem' }}>
                          {match.homeScore} - {match.awayScore}
                        </div>
                      </div>
                    )}
                    {match.status === 'scheduled' && (
                      <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>{match.time}</span>
                    )}
                  </div>
                </div>
              ))}
            </div>
            
            <style>{`
              @keyframes pulse {
                0% { transform: scale(0.95); opacity: 0.5; }
                50% { transform: scale(1.15); opacity: 1; }
                100% { transform: scale(0.95); opacity: 0.5; }
              }
            `}</style>
          </div>

          {/* Clubs Grid List Card */}
          <div className="glass-card">
            <h3 style={{ fontSize: '1.25rem', marginBottom: '1.25rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Trophy size={18} color="var(--color-secondary)" /> Clubes Registados
            </h3>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              {mockClubs.map((club, idx) => (
                <div 
                  key={idx} 
                  style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0.75rem 1rem', border: '1px solid var(--bg-card-border)', borderRadius: 'var(--radius-sm)' }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                    <div style={{ width: '28px', height: '28px', borderRadius: '6px', background: `linear-gradient(135deg, ${club.color1}, ${club.color2})`, border: '1px solid rgba(255,255,255,0.1)' }} />
                    <div>
                      <p style={{ fontWeight: 600, fontSize: '0.9rem' }}>{club.name}</p>
                      <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>Fundado: {club.founded}</span>
                    </div>
                  </div>
                  <span className="badge badge-info" style={{ fontSize: '0.65rem' }}>{club.code}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export const App: React.FC = () => {
  return (
    <QueryProvider>
      <AuthProvider>
        <TenantProvider>
          <DashboardContent />
        </TenantProvider>
      </AuthProvider>
    </QueryProvider>
  );
};

export default App;
