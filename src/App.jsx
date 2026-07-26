import React, { useState } from 'react';
import { FinanceProvider, useFinance } from './context/FinanceContext';
import Dashboard from './components/Dashboard';
import Transactions from './components/Transactions';
import Members from './components/Members';
import Settings from './components/Settings';
import FirebaseSetupWizard from './components/FirebaseSetupWizard';

function AppContent() {
  const { isFirebaseEnabled, loading } = useFinance();
  const [activeTab, setActiveTab] = useState('dashboard');
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // If Firebase is not configured, show wizard
  if (!isFirebaseEnabled) {
    return <FirebaseSetupWizard />;
  }

  // If loading data from Firebase, show beautiful loading spinner
  if (loading) {
    return (
      <div style={{ display: 'flex', minHeight: '100vh', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', background: '#0b0f19', color: 'var(--text-primary)' }}>
        <span style={{ fontSize: '3rem', animation: 'spin 1.5s linear infinite', display: 'inline-block' }}>⛪</span>
        <h2 style={{ marginTop: '1.5rem', fontWeight: '600' }}>Sincronizando com o Firebase...</h2>
        <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginTop: '0.5rem' }}>Carregando membros e lançamentos em tempo real</p>
        <style>{`
          @keyframes spin {
            0% { transform: scale(1); opacity: 0.5; }
            50% { transform: scale(1.2); opacity: 1; }
            100% { transform: scale(1); opacity: 0.5; }
          }
        `}</style>
      </div>
    );
  }

  const renderContent = () => {
    switch (activeTab) {
      case 'dashboard':
        return <Dashboard setActiveTab={setActiveTab} />;
      case 'transactions':
        return <Transactions />;
      case 'members':
        return <Members />;
      case 'settings':
        return <Settings />;
      default:
        return <Dashboard setActiveTab={setActiveTab} />;
    }
  };

  const getTabTitle = () => {
    switch (activeTab) {
      case 'dashboard':
        return { main: 'Painel Geral', sub: 'Resumo financeiro e fluxo de caixa da igreja' };
      case 'transactions':
        return { main: 'Dízimos e Lançamentos', sub: 'Gerencie entradas, dízimos e despesas diárias' };
      case 'members':
        return { main: 'Cadastro de Membros', sub: 'Gestão de membros e histórico individual de dízimos' };
      case 'settings':
        return { main: 'Configurações e Banco', sub: 'Exportação, sincronização e credenciais do Firebase' };
      default:
        return { main: 'Painel Geral', sub: 'Resumo financeiro e fluxo de caixa da igreja' };
    }
  };

  const title = getTabTitle();

  return (
    <div className="app-container">
      
      {/* Sidebar Nav (Desktop) */}
      <aside className={`sidebar ${sidebarOpen ? 'open' : ''}`}>
        <div className="sidebar-logo">
          <span className="sidebar-logo-icon">⛪</span>
          <span className="sidebar-logo-text">GIDEÃO</span>
        </div>

        <ul className="sidebar-menu">
          <li 
            className={`sidebar-item ${activeTab === 'dashboard' ? 'active' : ''}`}
            onClick={() => { setActiveTab('dashboard'); setSidebarOpen(false); }}
          >
            <span className="sidebar-icon">📊</span>
            <span>Painel Geral</span>
          </li>
          
          <li 
            className={`sidebar-item ${activeTab === 'transactions' ? 'active' : ''}`}
            onClick={() => { setActiveTab('transactions'); setSidebarOpen(false); }}
          >
            <span className="sidebar-icon">💸</span>
            <span>Lançamentos</span>
          </li>

          <li 
            className={`sidebar-item ${activeTab === 'members' ? 'active' : ''}`}
            onClick={() => { setActiveTab('members'); setSidebarOpen(false); }}
          >
            <span className="sidebar-icon">👥</span>
            <span>Membros</span>
          </li>

          <li 
            className={`sidebar-item ${activeTab === 'settings' ? 'active' : ''}`}
            onClick={() => { setActiveTab('settings'); setSidebarOpen(false); }}
          >
            <span className="sidebar-icon">⚙️</span>
            <span>Configurações</span>
          </li>
        </ul>

        <div className="sidebar-footer">
          <p>Gideão do Brasil v1.0.0</p>
          <p>Sincronizado com Nuvem</p>
        </div>
      </aside>

      {/* Bottom Nav (Mobile) */}
      <nav className="bottom-nav">
        <div 
          className={`bottom-nav-item ${activeTab === 'dashboard' ? 'active' : ''}`}
          onClick={() => setActiveTab('dashboard')}
        >
          <span className="bottom-nav-icon">📊</span>
          <span>Painel</span>
        </div>
        <div 
          className={`bottom-nav-item ${activeTab === 'transactions' ? 'active' : ''}`}
          onClick={() => setActiveTab('transactions')}
        >
          <span className="bottom-nav-icon">💸</span>
          <span>Lançar</span>
        </div>
        <div 
          className={`bottom-nav-item ${activeTab === 'members' ? 'active' : ''}`}
          onClick={() => setActiveTab('members')}
        >
          <span className="bottom-nav-icon">👥</span>
          <span>Membros</span>
        </div>
        <div 
          className={`bottom-nav-item ${activeTab === 'settings' ? 'active' : ''}`}
          onClick={() => setActiveTab('settings')}
        >
          <span className="bottom-nav-icon">⚙️</span>
          <span>Ajustes</span>
        </div>
      </nav>

      {/* Overlay for mobile sidebar (Legacy / Safety fallback) */}
      {sidebarOpen && (
        <div className="modal-overlay" onClick={() => setSidebarOpen(false)} style={{ zIndex: 90 }}></div>
      )}

      {/* Main Content Pane */}
      <main className="main-content">
        <header className="header">
          <div className="header-title">
            <h1>{title.main}</h1>
            <p>{title.sub}</p>
          </div>
          <div className="header-actions">
            <span style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>
              {new Date().toLocaleDateString('pt-BR', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
            </span>
          </div>
        </header>

        <section>
          {renderContent()}
        </section>
      </main>

    </div>
  );
}

export default function App() {
  return (
    <FinanceProvider>
      <AppContent />
    </FinanceProvider>
  );
}
