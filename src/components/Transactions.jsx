import React, { useState } from 'react';
import { useFinance } from '../context/FinanceContext';

export default function Transactions() {
  const { transactions, members, addTransaction, deleteTransaction } = useFinance();

  // Form State
  const [type, setType] = useState('income'); // income or expense
  const [category, setCategory] = useState('Dízimo');
  const [amount, setAmount] = useState('');
  const [date, setDate] = useState(new Date().toISOString().slice(0, 10));
  const [description, setDescription] = useState('');
  const [memberId, setMemberId] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('PIX');

  // Filters State
  const [search, setSearch] = useState('');
  const [filterType, setFilterType] = useState('all');
  const [filterCategory, setFilterCategory] = useState('all');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  const handleTypeChange = (newType) => {
    setType(newType);
    if (newType === 'income') {
      setCategory('Dízimo');
    } else {
      setCategory('Aluguel');
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!amount || parseFloat(amount) <= 0) {
      alert('Por favor, insira um valor válido.');
      return;
    }

    addTransaction({
      type,
      category,
      amount: parseFloat(amount),
      date,
      description,
      memberId: type === 'income' ? memberId : '',
      paymentMethod
    });

    // Reset Form
    setAmount('');
    setDescription('');
    setMemberId('');
  };

  const getMemberName = (id) => {
    const member = members.find(m => m.id === id);
    return member ? member.name : 'Nulo/Anônimo';
  };

  // Categories list
  const incomeCategories = ['Dízimo', 'Oferta', 'Doação', 'Outros'];
  const expenseCategories = ['Aluguel', 'Água', 'Luz', 'Internet', 'Manutenção', 'Eventos', 'Ação Social', 'Outros'];

  // Filtered transactions
  const filteredTransactions = transactions.filter(t => {
    const memberName = getMemberName(t.memberId).toLowerCase();
    const desc = (t.description || '').toLowerCase();
    const cat = t.category.toLowerCase();
    const query = search.toLowerCase();

    const matchesSearch = desc.includes(query) || cat.includes(query) || memberName.includes(query);
    const matchesType = filterType === 'all' || t.type === filterType;
    const matchesCategory = filterCategory === 'all' || t.category === filterCategory;
    const matchesStartDate = !startDate || t.date >= startDate;
    const matchesEndDate = !endDate || t.date <= endDate;

    return matchesSearch && matchesType && matchesCategory && matchesStartDate && matchesEndDate;
  });

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
      
      {/* Form Card */}
      <div className="card">
        <h2 style={{ marginBottom: '1.5rem' }}>Lançar Nova Movimentação</h2>
        <form onSubmit={handleSubmit}>
          
          <div className="type-toggle">
            <div 
              className={`type-toggle-btn ${type === 'income' ? 'active income' : ''}`}
              onClick={() => handleTypeChange('income')}
            >
              📈 Entrada (Receita)
            </div>
            <div 
              className={`type-toggle-btn ${type === 'expense' ? 'active expense' : ''}`}
              onClick={() => handleTypeChange('expense')}
            >
              📉 Saída (Despesa)
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label>Categoria</label>
              <select 
                className="form-control" 
                value={category} 
                onChange={(e) => setCategory(e.target.value)}
              >
                {type === 'income' 
                  ? incomeCategories.map(c => <option key={c} value={c}>{c}</option>)
                  : expenseCategories.map(c => <option key={c} value={c}>{c}</option>)
                }
              </select>
            </div>

            <div className="form-group">
              <label>Valor (R$)</label>
              <input 
                type="number" 
                step="0.01" 
                className="form-control" 
                placeholder="0,00" 
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                required
              />
            </div>

            <div className="form-group">
              <label>Data</label>
              <input 
                type="date" 
                className="form-control" 
                value={date}
                onChange={(e) => setDate(e.target.value)}
                required
              />
            </div>
          </div>

          <div className="form-row">
            {type === 'income' && (
              <div className="form-group">
                <label>Membro / Dizimista</label>
                <select 
                  className="form-control" 
                  value={memberId} 
                  onChange={(e) => setMemberId(e.target.value)}
                >
                  <option value="">Anônimo / Visitante</option>
                  {members.map(m => (
                    <option key={m.id} value={m.id}>{m.name}</option>
                  ))}
                </select>
              </div>
            )}

            <div className="form-group">
              <label>Forma de Pagamento</label>
              <select 
                className="form-control" 
                value={paymentMethod} 
                onChange={(e) => setPaymentMethod(e.target.value)}
              >
                <option value="PIX">PIX</option>
                <option value="Dinheiro">Dinheiro</option>
                <option value="Cartão Débito">Cartão Débito</option>
                <option value="Cartão Crédito">Cartão Crédito</option>
                <option value="Transferência">Transferência Bancária</option>
              </select>
            </div>
          </div>

          <div className="form-group">
            <label>Descrição / Observação</label>
            <input 
              type="text" 
              className="form-control" 
              placeholder="Ex: Mensalidade, Oferta de Altar, Pagamento de Água..." 
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
          </div>

          <button type="submit" className={`btn ${type === 'income' ? 'btn-primary' : 'btn-accent'}`} style={{ width: '100%', marginTop: '0.5rem' }}>
            Salvar Lançamento
          </button>
        </form>
      </div>

      {/* History and Filters Card */}
      <div className="card">
        <h2 style={{ marginBottom: '1.5rem' }}>Histórico Financeiro</h2>

        {/* Filters */}
        <div className="filters-bar">
          <div className="filter-item">
            <input 
              type="text" 
              className="form-control" 
              placeholder="Buscar descrição ou membro..." 
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>

          <div className="filter-item">
            <select 
              className="form-control" 
              value={filterType} 
              onChange={(e) => setFilterType(e.target.value)}
            >
              <option value="all">Todos os Fluxos</option>
              <option value="income">Entradas (Receitas)</option>
              <option value="expense">Saídas (Despesas)</option>
            </select>
          </div>

          <div className="filter-item">
            <select 
              className="form-control" 
              value={filterCategory} 
              onChange={(e) => setFilterCategory(e.target.value)}
            >
              <option value="all">Todas Categorias</option>
              {[...incomeCategories, ...expenseCategories].map(c => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
          </div>

          <div className="filter-item">
            <input 
              type="date" 
              className="form-control" 
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              title="Data Inicial"
            />
          </div>

          <div className="filter-item">
            <input 
              type="date" 
              className="form-control" 
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              title="Data Final"
            />
          </div>
        </div>

        {/* Transactions Table */}
        {filteredTransactions.length === 0 ? (
          <p style={{ color: 'var(--text-secondary)', textAlign: 'center', padding: '3rem 0' }}>
            Nenhum lançamento encontrado com os filtros atuais.
          </p>
        ) : (
          <div className="table-wrapper">
            <table className="table">
              <thead>
                <tr>
                  <th>Data</th>
                  <th>Fluxo</th>
                  <th>Categoria</th>
                  <th>Membro / Descrição</th>
                  <th>Método</th>
                  <th>Valor</th>
                  <th style={{ textAlign: 'center' }}>Ações</th>
                </tr>
              </thead>
              <tbody>
                {filteredTransactions.map(t => (
                  <tr key={t.id}>
                    <td data-label="Data">{t.date.split('-').reverse().join('/')}</td>
                    <td data-label="Fluxo">
                      <span className={`badge badge-${t.type}`}>
                        {t.type === 'income' ? 'Entrada' : 'Saída'}
                      </span>
                    </td>
                    <td data-label="Categoria">{t.category}</td>
                    <td data-label="Membro / Descrição">
                      <div style={{ fontWeight: 600 }}>{t.description || t.category}</div>
                      {t.type === 'income' && t.memberId && (
                        <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                          Dizimista: {getMemberName(t.memberId)}
                        </div>
                      )}
                    </td>
                    <td data-label="Método">{t.paymentMethod}</td>
                    <td data-label="Valor" className={`transaction-amount ${t.type}`} style={{ fontWeight: 700 }}>
                      R$ {t.amount.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                    </td>
                    <td data-label="Ações" style={{ textAlign: 'center' }}>
                      <button 
                        className="btn btn-secondary" 
                        onClick={() => {
                          if (confirm('Deseja realmente deletar esta transação?')) {
                            deleteTransaction(t.id);
                          }
                        }}
                        style={{ padding: '0.35rem 0.75rem', fontSize: '0.8rem', border: '1px solid var(--danger)', color: 'var(--danger)', background: 'transparent' }}
                      >
                        Excluir
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
  );
}
