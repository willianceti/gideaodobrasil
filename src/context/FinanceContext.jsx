import React, { createContext, useContext, useState, useEffect } from 'react';
import { db } from '../firebase';
import { 
  collection, 
  onSnapshot, 
  addDoc, 
  deleteDoc, 
  doc, 
  query, 
  orderBy,
  writeBatch
} from 'firebase/firestore';

const FinanceContext = createContext(null);

export const FinanceProvider = ({ children }) => {
  const [members, setMembers] = useState([]);
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);

  const isFirebaseEnabled = !!db;

  useEffect(() => {
    // If firebase is not initialized, we don't bind listeners
    if (!isFirebaseEnabled) {
      setLoading(false);
      return;
    }

    // Subscribe to Members
    const qMembers = query(collection(db, 'members'), orderBy('name', 'asc'));
    const unsubscribeMembers = onSnapshot(qMembers, (snapshot) => {
      const list = [];
      snapshot.forEach((doc) => {
        list.push({ id: doc.id, ...doc.data() });
      });
      setMembers(list);
    }, (error) => {
      console.error("Erro ao carregar membros: ", error);
    });

    // Subscribe to Transactions
    const qTransactions = query(collection(db, 'transactions'), orderBy('date', 'desc'));
    const unsubscribeTransactions = onSnapshot(qTransactions, (snapshot) => {
      const list = [];
      snapshot.forEach((doc) => {
        list.push({ id: doc.id, ...doc.data() });
      });
      setTransactions(list);
      setLoading(false);
    }, (error) => {
      console.error("Erro ao carregar transações: ", error);
      setLoading(false);
    });

    return () => {
      unsubscribeMembers();
      unsubscribeTransactions();
    };
  }, [isFirebaseEnabled]);

  const addMember = async (member) => {
    if (!isFirebaseEnabled) return;
    try {
      await addDoc(collection(db, 'members'), member);
    } catch (e) {
      console.error("Erro ao adicionar membro: ", e);
      alert('Erro ao salvar no Firestore. Verifique as Regras do Firestore.');
    }
  };

  const deleteMember = async (id) => {
    if (!isFirebaseEnabled) return;
    try {
      await deleteDoc(doc(db, 'members', id));
      
      // Update connected transactions memberId to empty
      const batch = writeBatch(db);
      transactions.forEach(t => {
        if (t.memberId === id) {
          const tRef = doc(db, 'transactions', t.id);
          batch.update(tRef, { memberId: '' });
        }
      });
      await batch.commit();
    } catch (e) {
      console.error("Erro ao excluir membro: ", e);
    }
  };

  const addTransaction = async (transaction) => {
    if (!isFirebaseEnabled) return;
    try {
      await addDoc(collection(db, 'transactions'), {
        ...transaction,
        amount: parseFloat(transaction.amount)
      });
    } catch (e) {
      console.error("Erro ao registrar transação: ", e);
      alert('Erro ao salvar transação. Verifique as Regras de Segurança do Firebase.');
    }
  };

  const deleteTransaction = async (id) => {
    if (!isFirebaseEnabled) return;
    try {
      await deleteDoc(doc(db, 'transactions', id));
    } catch (e) {
      console.error("Erro ao excluir transação: ", e);
    }
  };

  const importBackup = async (data) => {
    if (!isFirebaseEnabled) return false;
    try {
      const batch = writeBatch(db);
      
      if (data.members) {
        data.members.forEach(m => {
          const mRef = doc(collection(db, 'members'));
          // Exclude id from the fields to generate a new Firestore ID
          const { id, ...memberData } = m;
          batch.set(mRef, memberData);
        });
      }

      if (data.transactions) {
        data.transactions.forEach(t => {
          const tRef = doc(collection(db, 'transactions'));
          const { id, ...transactionData } = t;
          batch.set(tRef, transactionData);
        });
      }

      await batch.commit();
      return true;
    } catch (e) {
      console.error("Erro ao importar backup: ", e);
      return false;
    }
  };

  const exportBackup = () => {
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify({ members, transactions }, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute("href",     dataStr);
    downloadAnchor.setAttribute("download", `gideao_backup_${new Date().toISOString().slice(0,10)}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  return (
    <FinanceContext.Provider value={{
      members,
      transactions,
      loading,
      isFirebaseEnabled,
      addMember,
      deleteMember,
      addTransaction,
      deleteTransaction,
      importBackup,
      exportBackup
    }}>
      {children}
    </FinanceContext.Provider>
  );
};

export const useFinance = () => {
  const context = useContext(FinanceContext);
  if (!context) throw new Error('useFinance must be used within a FinanceProvider');
  return context;
};
