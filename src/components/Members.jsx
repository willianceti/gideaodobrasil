import React, { useState } from 'react';
import { useFinance } from '../context/FinanceContext';

export default function Members() {
  const { members, transactions, addMember, deleteMember } = useFinance();

  // Form State
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');

  // Selected member for contribution detail
  const [selectedMemberId, setSelectedMemberId] = useState(null);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!name.trim()) return;

    addMember({ name, phone, email });
    setName('');
    setPhone('');
    setEmail('');
  };

  const getMemberContributions = (id) => {
    return transactions.filter(t => t.memberId === id);
  };

  const selectedMember = members.find(m => m.id === selectedMemberId);
  const selectedContributions = selectedMemberId ? getMemberContributions(selectedMemberId) : [];
  const totalContributed = selectedContributions.reduce((sum, t) => sum + t.amount, 0);

  return (
    <div className="members-grid">
      
      {/* List and Registration */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
        
        {/* Register Member */}
        <div className="card">
          <h2 style={{ marginBottom: '1.25rem' }}>Cadastrar Novo Membro</h2>
          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <div className="form-group" style={{ marginBottom: 0 }}>
              <label>Nome Completo</label>
              <input 
                type="text" 
                className="form-control" 
                placeholder="Ex: João da Silva" 
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />
            </div>
            
            <div className="form-row">
              <div className="form-group" style={{ marginBottom: 0 }}>
                <label>Telefone / WhatsApp</label>
                <input 
                  type="text" 
                  className="form-control" 
                  placeholder="(00) 00000-0000" 
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                />
              </div>
              <div className="form-group" style={{ marginBottom: 0 }}>
                <label>E-mail</label>
                <input 
                  type="email" 
                  className="form-control" 
                  placeholder="membro@email.com" 
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>
            </div>

            <button type="submit" className="btn btn-primary" style={{ marginTop: '0.5rem' }}>
              Adicionar Membro
            </button>
          </form>
        </div>

        {/* Members List */}
        <div className="card">
          <h2 style={{ marginBottom: '1rem' }}>Lista de Membros ({members.length})</h2>
          
          {members.length === 0 ? (
            <p style={{ color: 'var(--text-secondary)', textAlign: 'center', padding: '2rem 0' }}>
              Nenhum membro cadastrado.
            </p>
          ) : (
            <div className="table-wrapper" style={{ maxHeight: '350px', overflowY: 'auto' }}>
              <table className="table">
                <thead>
                  <tr>
                    <th>Nome</th>
                    <th>Contato</th>
                    <th style={{ textAlign: 'center' }}>Ações</th>
                  </tr>
                </thead>
                <tbody>
                  {members.map(m => (
                    <tr 
                      key={m.id} 
                      onClick={() => setSelectedMemberId(m.id)}
                      style={{ cursor: 'pointer', background: selectedMemberId === m.id ? 'rgba(99, 102, 241, 0.08)' : 'transparent' }}
                    >
                      <td data-label="Nome" style={{ fontWeight: 600 }}>{m.name}</td>
                      <td data-label="Contato" style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                        <div>{m.phone || 'Sem telefone'}</div>
                        <div style={{ color: 'var(--text-muted)' }}>{m.email}</div>
                      </td>
                      <td data-label="Ações" style={{ textAlign: 'center' }} onClick={(e) => e.stopPropagation()}>
                        <button 
                          className="btn btn-secondary"
                          onClick={() => {
                            if (confirm(`Deseja remover ${m.name}? O histórico financeiro não será excluído, mas o nome do membro ficará como Anônimo.`)) {
                              deleteMember(m.id);
                              if (selectedMemberId === m.id) setSelectedMemberId(null);
                            }
                          }}
                          style={{ padding: '0.3rem 0.6rem', fontSize: '0.75rem', border: '1px solid var(--danger)', color: 'var(--danger)', background: 'transparent' }}
                        >
                          Remover
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

      </div>

      {/* Contribution Details for Selected Member */}
      <div className="card" style={{ display: 'flex', flexDirection: 'column' }}>
        {selectedMemberId ? (
          <>
            <div style={{ borderBottom: '1px solid var(--border-color)', paddingBottom: '1rem', marginBottom: '1.5rem' }}>
              <h2 style={{ color: 'var(--accent)' }}>Detalhamento: {selectedMember.name}</h2>
              <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', marginTop: '0.25rem' }}>
                Total de contribuições registradas: <strong>R$ {totalContributed.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</strong>
              </p>
            </div>

            <h3 style={{ fontSize: '1.1rem', marginBottom: '1rem' }}>Histórico de Dízimos e Ofertas</h3>

            {selectedContributions.length === 0 ? (
              <p style={{ color: 'var(--text-secondary)', textAlign: 'center', padding: '3rem 0' }}>
                Nenhuma contribuição registrada para este membro.
              </p>
            ) : (
              <div className="table-wrapper" style={{ flex: 1, overflowY: 'auto' }}>
                <table className="table">
                  <thead>
                    <tr>
                      <th>Data</th>
                      <th>Categoria</th>
                      <th>Método</th>
                      <th style={{ textAlign: 'right' }}>Valor</th>
                    </tr>
                  </thead>
                  <tbody>
                    {selectedContributions.map(c => (
                      <tr key={c.id}>
                        <td data-label="Data">{c.date.split('-').reverse().join('/')}</td>
                        <td data-label="Categoria">{c.category}</td>
                        <td data-label="Método">{c.paymentMethod}</td>
                        <td data-label="Valor" style={{ textAlign: 'right', fontWeight: 700, color: 'var(--success)' }}>
                          R$ {c.amount.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%', color: 'var(--text-secondary)', padding: '3rem' }}>
            <span style={{ fontSize: '3rem', marginBottom: '1rem' }}>👤</span>
            <p style={{ textAlign: 'center' }}>Selecione um membro da lista ao lado para ver o histórico individualizado de contribuições e dízimos.</p>
          </div>
        )}
      </div>

    </div>
  );
}
