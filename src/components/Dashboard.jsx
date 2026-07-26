import React from 'react';
import { useFinance } from '../context/FinanceContext';

export default function Dashboard({ setActiveTab }) {
  const { transactions, members } = useFinance();

  const getMemberName = (id) => {
    const member = members.find(m => m.id === id);
    return member ? member.name : 'Nulo/Anônimo';
  };

  const totalIncome = transactions
    .filter(t => t.type === 'income')
    .reduce((sum, t) => sum + t.amount, 0);

  const totalExpense = transactions
    .filter(t => t.type === 'expense')
    .reduce((sum, t) => sum + t.amount, 0);

  const totalBalance = totalIncome - totalExpense;

  const totalTithes = transactions
    .filter(t => t.type === 'income' && t.category === 'Dízimo')
    .reduce((sum, t) => sum + t.amount, 0);

  const totalDonations = transactions
    .filter(t => t.type === 'income' && (t.category === 'Doação' || t.category === 'Oferta'))
    .reduce((sum, t) => sum + t.amount, 0);

  // Generate simple data for pure CSS chart (last 6 months)
  const getMonthlyData = () => {
    const months = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'];
    const currentYear = new Date().getFullYear();
    const data = [];

    // Let's create an array of the last 6 calendar months
    const today = new Date();
    for (let i = 5; i >= 0; i--) {
      const d = new Date(today.getFullYear(), today.getMonth() - i, 1);
      const monthIndex = d.getMonth();
      const monthYear = d.getFullYear();
      
      const inMonth = transactions
        .filter(t => {
          const tDate = new Date(t.date);
          return tDate.getMonth() === monthIndex && tDate.getFullYear() === monthYear;
        });

      const income = inMonth.filter(t => t.type === 'income').reduce((sum, t) => sum + t.amount, 0);
      const expense = inMonth.filter(t => t.type === 'expense').reduce((sum, t) => sum + t.amount, 0);

      data.push({
        label: `${months[monthIndex]}`,
        income,
        expense
      });
    }

    // Find max value to scale the bars
    const maxVal = Math.max(...data.map(d => Math.max(d.income, d.expense)), 100);

    return data.map(d => ({
      ...d,
      incomeHeight: (d.income / maxVal) * 100,
      expenseHeight: (d.expense / maxVal) * 100
    }));
  };

  const chartData = getMonthlyData();
  const recentTransactions = transactions.slice(0, 4);

  return (
    <div>
      <div className="stats-grid">
        <div className="card stat-card stat-balance">
          <div className="stat-header">
            <span className="stat-title">Saldo Total</span>
            <div className="stat-icon-wrapper">💰</div>
          </div>
          <div className="stat-value">
            R$ {totalBalance.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
          </div>
        </div>

        <div className="card stat-card stat-income">
          <div className="stat-header">
            <span className="stat-title">Total Dízimos</span>
            <div className="stat-icon-wrapper">🙏</div>
          </div>
          <div className="stat-value">
            R$ {totalTithes.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
          </div>
        </div>

        <div className="card stat-card stat-donations">
          <div className="stat-header">
            <span className="stat-title">Ofertas e Doações</span>
            <div className="stat-icon-wrapper">✨</div>
          </div>
          <div className="stat-value">
            R$ {totalDonations.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
          </div>
        </div>

        <div className="card stat-card stat-expense">
          <div className="stat-header">
            <span className="stat-title">Total Despesas</span>
            <div className="stat-icon-wrapper">📉</div>
          </div>
          <div className="stat-value">
            R$ {totalExpense.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
          </div>
        </div>
      </div>

      <div className="dashboard-grid">
        <div className="card">
          <div className="chart-card-header">
            <h2>Fluxo Financeiro (Últimos 6 Meses)</h2>
            <div style={{ display: 'flex', gap: '1rem', fontSize: '0.85rem' }}>
              <span style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                <span style={{ display: 'inline-block', width: '12px', height: '12px', background: 'var(--success)', borderRadius: '3px' }}></span> Entradas
              </span>
              <span style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                <span style={{ display: 'inline-block', width: '12px', height: '12px', background: 'var(--danger)', borderRadius: '3px' }}></span> Saídas
              </span>
            </div>
          </div>

          <div className="chart-container">
            <div className="chart-bars-wrapper">
              {chartData.map((d, index) => (
                <div key={index} className="chart-bar-col">
                  <div className="chart-bar-container">
                    <div 
                      className="chart-bar-in" 
                      style={{ height: `${Math.max(d.incomeHeight, 2)}%` }}
                      title={`Entradas: R$ ${d.income.toFixed(2)}`}
                    ></div>
                    <div 
                      className="chart-bar-out" 
                      style={{ height: `${Math.max(d.expenseHeight, 2)}%` }}
                      title={`Saídas: R$ ${d.expense.toFixed(2)}`}
                    ></div>
                  </div>
                  <span className="chart-bar-label">{d.label}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="card" style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          <h2>Transações Recentes</h2>
          
          <div className="transaction-list">
            {recentTransactions.length === 0 ? (
              <p style={{ color: 'var(--text-secondary)', textAlign: 'center', padding: '2rem 0' }}>
                Nenhuma movimentação registrada.
              </p>
            ) : (
              recentTransactions.map(t => (
                <div key={t.id} className="transaction-item">
                  <div className="transaction-info">
                    <span className="transaction-name">{t.description || t.category}</span>
                    <span className="transaction-meta">
                      <span>{t.date.split('-').reverse().join('/')}</span>
                      {t.type === 'income' && t.memberId && (
                        <span>• {getMemberName(t.memberId)}</span>
                      )}
                    </span>
                  </div>
                  <span className={`transaction-amount ${t.type}`}>
                    {t.type === 'income' ? '+' : '-'} R$ {t.amount.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                  </span>
                </div>
              ))
            )}
          </div>

          <button className="btn btn-primary" onClick={() => setActiveTab('transactions')} style={{ width: '100%', marginTop: 'auto' }}>
            Ver Todas / Lançar Novo
          </button>
        </div>
      </div>
    </div>
  );
}
