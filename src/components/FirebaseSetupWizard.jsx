import React, { useState } from 'react';
import { saveFirebaseConfig } from '../firebase';

export default function FirebaseSetupWizard() {
  const [apiKey, setApiKey] = useState('');
  const [authDomain, setAuthDomain] = useState('');
  const [projectId, setProjectId] = useState('');
  const [storageBucket, setStorageBucket] = useState('');
  const [messagingSenderId, setMessagingSenderId] = useState('');
  const [appId, setAppId] = useState('');
  const [rawJson, setRawJson] = useState('');
  const [pasteMode, setPasteMode] = useState('fields'); // 'fields' or 'json'

  const handleJsonSubmit = (e) => {
    e.preventDefault();
    try {
      // Clean string if copied as object
      let cleaned = rawJson.trim();
      if (cleaned.startsWith('const firebaseConfig =')) {
        cleaned = cleaned.replace('const firebaseConfig =', '');
      }
      if (cleaned.endsWith(';')) {
        cleaned = cleaned.slice(0, -1);
      }
      
      // Basic JS Object parser wrapper for JSON.parse
      // If it has unquoted keys, JSON.parse fails. Let's try to extract key values using regex
      const extractField = (key) => {
        const regex = new RegExp(`["']?${key}["']?\\s*:\\s*["']([^"']+)["']`);
        const match = cleaned.match(regex);
        return match ? match[1] : '';
      };

      const parsedConfig = {
        apiKey: extractField('apiKey'),
        authDomain: extractField('authDomain'),
        projectId: extractField('projectId'),
        storageBucket: extractField('storageBucket'),
        messagingSenderId: extractField('messagingSenderId'),
        appId: extractField('appId')
      };

      if (!parsedConfig.apiKey || !parsedConfig.projectId) {
        // Fallback to strict JSON parse if regex fails
        const strictParsed = JSON.parse(cleaned);
        if (strictParsed.apiKey && strictParsed.projectId) {
          saveFirebaseConfig(strictParsed);
          return;
        }
        throw new Error();
      }

      saveFirebaseConfig(parsedConfig);
    } catch (err) {
      alert('Formato inválido. Certifique-se de copiar o objeto "firebaseConfig" completo do Console do Firebase.');
    }
  };

  const handleFieldsSubmit = (e) => {
    e.preventDefault();
    if (!apiKey || !projectId || !appId) {
      alert('Por favor, preencha os campos obrigatórios (API Key, Project ID e App ID).');
      return;
    }

    saveFirebaseConfig({
      apiKey,
      authDomain,
      projectId,
      storageBucket,
      messagingSenderId,
      appId
    });
  };

  return (
    <div style={{ display: 'flex', minHeight: '100vh', alignItems: 'center', justifyContent: 'center', padding: '2rem', background: '#0b0f19' }}>
      <div className="card" style={{ maxWidth: '650px', width: '100%', boxShadow: '0 0 50px rgba(99, 102, 241, 0.15)', border: '1px solid rgba(99, 102, 241, 0.2)' }}>
        
        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <span style={{ fontSize: '3.5rem' }}>⛪</span>
          <h1 style={{ fontSize: '1.75rem', marginTop: '1rem', fontWeight: '800', letterSpacing: '-0.5px' }}>Conectar Banco de Dados Cloud</h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginTop: '0.5rem' }}>
            Para sincronizar os lançamentos e membros em tempo real, conecte o sistema ao seu banco de dados Firebase Firestore (Grátis).
          </p>
        </div>

        <div style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-md)', padding: '1.25rem', marginBottom: '2rem', fontSize: '0.85rem', lineHeight: '1.6' }}>
          <h3 style={{ color: 'var(--accent)', marginBottom: '0.5rem' }}>📝 Como pegar suas credenciais:</h3>
          <ol style={{ paddingLeft: '1.25rem', color: 'var(--text-secondary)' }}>
            <li>Acesse o <a href="https://console.firebase.google.com/" target="_blank" rel="noreferrer" style={{ color: 'var(--primary)', fontWeight: '600' }}>Console do Firebase</a> e crie um projeto gratuito.</li>
            <li>Ative o <strong>Firestore Database</strong> no menu lateral e selecione o servidor da América do Sul.</li>
            <li>Adicione um "Aplicativo Web" nas configurações do projeto para obter o código de configuração.</li>
            <li>Copie as credenciais e cole-as abaixo.</li>
          </ol>
        </div>

        <div style={{ display: 'flex', gap: '1rem', marginBottom: '1.5rem' }}>
          <button 
            type="button" 
            className={`btn ${pasteMode === 'fields' ? 'btn-primary' : 'btn-secondary'}`}
            style={{ flex: 1, padding: '0.6rem' }}
            onClick={() => setPasteMode('fields')}
          >
            Preencher Campos
          </button>
          <button 
            type="button" 
            className={`btn ${pasteMode === 'json' ? 'btn-primary' : 'btn-secondary'}`}
            style={{ flex: 1, padding: '0.6rem' }}
            onClick={() => setPasteMode('json')}
          >
            Colar Código Completo
          </button>
        </div>

        {pasteMode === 'json' ? (
          <form onSubmit={handleJsonSubmit}>
            <div className="form-group">
              <label>Objeto firebaseConfig (JSON ou código)</label>
              <textarea 
                className="form-control" 
                rows="8" 
                placeholder={`const firebaseConfig = {\n  apiKey: "AIzaSy...",\n  authDomain: "gideao...",\n  projectId: "gideao...",\n  ...\n};`}
                value={rawJson}
                onChange={(e) => setRawJson(e.target.value)}
                style={{ fontFamily: 'monospace', fontSize: '0.85rem' }}
                required
              />
            </div>
            <button type="submit" className="btn btn-accent" style={{ width: '100%', marginTop: '1rem' }}>
              Salvar e Conectar
            </button>
          </form>
        ) : (
          <form onSubmit={handleFieldsSubmit}>
            <div className="form-row">
              <div className="form-group">
                <label>API Key *</label>
                <input 
                  type="text" 
                  className="form-control" 
                  value={apiKey} 
                  onChange={(e) => setApiKey(e.target.value)} 
                  required
                />
              </div>
              <div className="form-group">
                <label>Project ID *</label>
                <input 
                  type="text" 
                  className="form-control" 
                  value={projectId} 
                  onChange={(e) => setProjectId(e.target.value)} 
                  required
                />
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label>App ID *</label>
                <input 
                  type="text" 
                  className="form-control" 
                  value={appId} 
                  onChange={(e) => setAppId(e.target.value)} 
                  required
                />
              </div>
              <div className="form-group">
                <label>Auth Domain</label>
                <input 
                  type="text" 
                  className="form-control" 
                  value={authDomain} 
                  onChange={(e) => setAuthDomain(e.target.value)} 
                />
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label>Storage Bucket</label>
                <input 
                  type="text" 
                  className="form-control" 
                  value={storageBucket} 
                  onChange={(e) => setStorageBucket(e.target.value)} 
                />
              </div>
              <div className="form-group">
                <label>Messaging Sender ID</label>
                <input 
                  type="text" 
                  className="form-control" 
                  value={messagingSenderId} 
                  onChange={(e) => setMessagingSenderId(e.target.value)} 
                />
              </div>
            </div>

            <button type="submit" className="btn btn-accent" style={{ width: '100%', marginTop: '1rem' }}>
              Salvar e Conectar
            </button>
          </form>
        )}

      </div>
    </div>
  );
}
