import React, { useRef } from 'react';
import { useFinance } from '../context/FinanceContext';
import { clearFirebaseConfig } from '../firebase';

export default function Settings() {
  const { exportBackup, importBackup, isFirebaseEnabled } = useFinance();
  const fileInputRef = useRef(null);

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const json = JSON.parse(event.target.result);
        const success = importBackup(json);
        if (success) {
          alert('Backup importado com sucesso no Firebase!');
        } else {
          alert('Erro ao importar backup: Arquivo inválido.');
        }
      } catch (err) {
        alert('Erro ao processar o arquivo. Verifique se é um arquivo JSON válido.');
      }
    };
    reader.readAsText(file);
  };

  const handleDisconnect = () => {
    if (confirm('Deseja realmente desconectar e remover as chaves de acesso ao Firebase deste navegador?')) {
      clearFirebaseConfig();
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
      
      <div className="card">
        <h2 style={{ marginBottom: '1rem' }}>Sincronização e Banco de Dados Cloud</h2>
        <p style={{ color: 'var(--text-secondary)', marginBottom: '1.5rem', fontSize: '0.95rem', lineHeight: '1.6' }}>
          O sistema está sincronizado com o **Firebase Firestore**. As alterações feitas aqui serão propagadas em tempo real para todos os outros dispositivos conectados.
        </p>

        <div style={{ display: 'flex', gap: '1rem' }}>
          <button className="btn btn-secondary" onClick={handleDisconnect} style={{ border: '1px solid var(--danger)', color: 'var(--danger)' }}>
            🔌 Desconectar Firebase deste Navegador
          </button>
        </div>
      </div>

      <div className="card">
        <h2 style={{ marginBottom: '1rem' }}>Backup de Segurança</h2>
        <p style={{ color: 'var(--text-secondary)', marginBottom: '1.5rem', fontSize: '0.95rem', lineHeight: '1.6' }}>
          Mesmo utilizando o Firebase na nuvem, você pode exportar backups completos ou restaurar dados a qualquer momento.
        </p>

        <div className="backup-card-grid">
          <div className="backup-box">
            <span style={{ fontSize: '2.5rem' }}>📤</span>
            <span className="backup-box-title">Exportar Dados</span>
            <p className="backup-box-desc">Baixe todas as informações do Firestore (Membros e Lançamentos) em arquivo JSON.</p>
            <button className="btn btn-primary" onClick={exportBackup} style={{ width: '100%' }}>
              Download de Backup
            </button>
          </div>

          <div className="backup-box">
            <span style={{ fontSize: '2.5rem' }}>📥</span>
            <span className="backup-box-title">Importar Backup</span>
            <p className="backup-box-desc">Carregue um arquivo JSON para preencher seu banco de dados Firebase.</p>
            
            <div className="file-input-wrapper" style={{ width: '100%' }}>
              <button className="btn btn-secondary" style={{ width: '100%' }}>
                Carregar Backup (.json)
              </button>
              <input 
                type="file" 
                ref={fileInputRef} 
                accept=".json" 
                onChange={handleFileChange}
              />
            </div>
          </div>
        </div>
      </div>

      <div className="card">
        <h2 style={{ marginBottom: '1rem' }}>Sobre o Gideão do Brasil</h2>
        <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem', lineHeight: '1.6' }}>
          <strong>Gideão do Brasil - Gestão Financeira Eclesiástica</strong><br />
          Conexão: <span style={{ color: 'var(--success)', fontWeight: '600' }}>Firebase Cloud</span> (Ativo).
        </p>
      </div>

    </div>
  );
}
