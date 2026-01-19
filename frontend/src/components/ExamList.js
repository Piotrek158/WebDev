import React, { useState, useEffect } from 'react';
import { getExamTerms, approveExamTerm } from '../services/api';

function ExamList({ currentUser, onRefresh }) {
  const [terms, setTerms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all'); // all, proposed, approved

  useEffect(() => {
    fetchTerms();
  }, [currentUser, filter, onRefresh]);

  const fetchTerms = async () => {
    if (!currentUser) return;
    
    setLoading(true);
    try {
      const params = {};
      
      // Filtrowanie wg roli
      if (currentUser.role !== 'admin' && currentUser.role !== 'prowadzacy') {
        params.kierunek = currentUser.kierunek;
        params.typ_studiow = currentUser.typ_studiow;
        params.rok = currentUser.rok;
      }
      
      if (filter !== 'all') {
        params.status = filter;
      }

      const response = await getExamTerms(params);
      setTerms(response.data);
    } catch (error) {
      console.error('Błąd pobierania terminów:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (termId, status) => {
    try {
      await approveExamTerm(termId, {
        approved_by_role: currentUser.role,
        approved_by_name: currentUser.name,
        status: status,
      });
      fetchTerms(); // Odśwież listę
    } catch (error) {
      alert('Błąd zatwierdzania: ' + error.response?.data?.detail);
    }
  };

  const canApprove = (term) => {
    if (currentUser.role === 'admin') return true;
    if (currentUser.role === 'starosta' && term.proposed_by_role === 'prowadzacy') return true;
    if (currentUser.role === 'prowadzacy' && term.proposed_by_role === 'starosta') return true;
    return false;
  };

  if (loading) return <div style={styles.loading}>Ładowanie...</div>;

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <h2>Lista Egzaminów</h2>
        <div style={styles.filters}>
          <button 
            style={filter === 'all' ? styles.filterButtonActive : styles.filterButton}
            onClick={() => setFilter('all')}
          >
            Wszystkie
          </button>
          <button 
            style={filter === 'proposed' ? styles.filterButtonActive : styles.filterButton}
            onClick={() => setFilter('proposed')}
          >
            Oczekujące
          </button>
          <button 
            style={filter === 'approved' ? styles.filterButtonActive : styles.filterButton}
            onClick={() => setFilter('approved')}
          >
            Zatwierdzone
          </button>
        </div>
      </div>

      {terms.length === 0 ? (
        <p style={styles.empty}>Brak egzaminów do wyświetlenia</p>
      ) : (
        <table style={styles.table}>
          <thead>
            <tr>
              <th style={styles.th}>Przedmiot</th>
              <th style={styles.th}>Prowadzący</th>
              <th style={styles.th}>Data</th>
              <th style={styles.th}>Godzina</th>
              <th style={styles.th}>Sala</th>
              <th style={styles.th}>Zaproponował</th>
              <th style={styles.th}>Status</th>
              <th style={styles.th}>Akcje</th>
            </tr>
          </thead>
          <tbody>
            {terms.map(term => (
              <tr key={term.id} style={styles.tr}>
                <td style={styles.td}>
                  {term.exam.subject.nazwa}<br/>
                  <small>{term.exam.subject.kierunek}, {term.exam.subject.typ_studiow}, rok {term.exam.subject.rok}</small>
                </td>
                <td style={styles.td}>{term.exam.prowadzacy_name}</td>
                <td style={styles.td}>{term.data}</td>
                <td style={styles.td}>{term.godzina}</td>
                <td style={styles.td}>{term.sala}</td>
                <td style={styles.td}>{term.proposed_by_name}</td>
                <td style={styles.td}>
                  <span style={getStatusStyle(term.status)}>{getStatusText(term.status)}</span>
                </td>
                <td style={styles.td}>
                  {term.status === 'proposed' && canApprove(term) && (
                    <div style={styles.actions}>
                      <button 
                        style={styles.approveButton}
                        onClick={() => handleApprove(term.id, 'approved')}
                      >
                        ✓ Zatwierdź
                      </button>
                      <button 
                        style={styles.rejectButton}
                        onClick={() => handleApprove(term.id, 'rejected')}
                      >
                        ✗ Odrzuć
                      </button>
                    </div>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}

const getStatusText = (status) => {
  const map = {
    'proposed': 'Oczekujące',
    'approved': 'Zatwierdzone',
    'rejected': 'Odrzucone',
  };
  return map[status] || status;
};

const getStatusStyle = (status) => {
  const baseStyle = { padding: '4px 8px', borderRadius: '4px', fontSize: '12px' };
  if (status === 'approved') return { ...baseStyle, backgroundColor: '#d4edda', color: '#155724' };
  if (status === 'rejected') return { ...baseStyle, backgroundColor: '#f8d7da', color: '#721c24' };
  return { ...baseStyle, backgroundColor: '#fff3cd', color: '#856404' };
};

const styles = {
  container: {
    padding: '20px',
  },
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '20px',
  },
  filters: {
    display: 'flex',
    gap: '10px',
  },
  filterButton: {
    padding: '8px 16px',
    border: '1px solid #ccc',
    backgroundColor: 'white',
    cursor: 'pointer',
    borderRadius: '4px',
  },
  filterButtonActive: {
    padding: '8px 16px',
    border: '1px solid #007bff',
    backgroundColor: '#007bff',
    color: 'white',
    cursor: 'pointer',
    borderRadius: '4px',
  },
  loading: {
    textAlign: 'center',
    padding: '40px',
  },
  empty: {
    textAlign: 'center',
    color: '#666',
    padding: '40px',
  },
  table: {
    width: '100%',
    borderCollapse: 'collapse',
    backgroundColor: 'white',
    boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
  },
  th: {
    padding: '12px',
    textAlign: 'left',
    borderBottom: '2px solid #ddd',
    backgroundColor: '#f8f9fa',
    fontWeight: 'bold',
  },
  tr: {
    borderBottom: '1px solid #eee',
  },
  td: {
    padding: '12px',
  },
  actions: {
    display: 'flex',
    gap: '5px',
  },
  approveButton: {
    padding: '6px 12px',
    backgroundColor: '#28a745',
    color: 'white',
    border: 'none',
    borderRadius: '4px',
    cursor: 'pointer',
    fontSize: '12px',
  },
  rejectButton: {
    padding: '6px 12px',
    backgroundColor: '#dc3545',
    color: 'white',
    border: 'none',
    borderRadius: '4px',
    cursor: 'pointer',
    fontSize: '12px',
  },
};

export default ExamList;
