import React, { useState, useEffect } from 'react';
import { getExamTerms } from '../services/api';

function GanttChart({ currentUser }) {
  const [terms, setTerms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [dates, setDates] = useState([]);
  const [timeSlots, setTimeSlots] = useState([]);

  useEffect(() => {
    fetchTerms();
  }, [currentUser]);

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

      const response = await getExamTerms(params);
      const fetchedTerms = response.data;
      setTerms(fetchedTerms);

      // Generuj unikalne daty i godziny
      const uniqueDates = [...new Set(fetchedTerms.map(t => t.data))].sort();
      const uniqueHours = [...new Set(fetchedTerms.map(t => t.godzina))].sort();

      setDates(uniqueDates);
      setTimeSlots(uniqueHours);
    } catch (error) {
      console.error('Błąd pobierania terminów:', error);
    } finally {
      setLoading(false);
    }
  };

  const getTermAtDateTime = (date, time) => {
    return terms.find(t => t.data === date && t.godzina === time);
  };

  const getStatusColor = (status) => {
    if (status === 'approved') return '#28a745';
    if (status === 'rejected') return '#dc3545';
    return '#ffc107';
  };

  const formatDate = (dateStr) => {
    const [year, month, day] = dateStr.split('-');
    return `${day}.${month}`;
  };

  if (loading) return <div style={styles.loading}>Ładowanie...</div>;

  if (terms.length === 0) {
    return (
      <div style={styles.container}>
        <h2>Wykres Gantta - Harmonogram Egzaminów</h2>
        <p style={styles.empty}>Brak egzaminów do wyświetlenia</p>
      </div>
    );
  }

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <h2>Wykres Gantta - Harmonogram Egzaminów</h2>
        <div style={styles.legend}>
          <div style={styles.legendItem}>
            <div style={{...styles.legendBox, backgroundColor: '#28a745'}}></div>
            <span>Zatwierdzone</span>
          </div>
          <div style={styles.legendItem}>
            <div style={{...styles.legendBox, backgroundColor: '#ffc107'}}></div>
            <span>Oczekujące</span>
          </div>
          <div style={styles.legendItem}>
            <div style={{...styles.legendBox, backgroundColor: '#dc3545'}}></div>
            <span>Odrzucone</span>
          </div>
        </div>
      </div>

      <div style={styles.chartWrapper}>
        <div style={styles.chartContainer}>
          {/* Nagłówek z datami */}
          <div style={styles.headerRow}>
            <div style={styles.timeColumn}>Godzina</div>
            {dates.map(date => (
              <div key={date} style={styles.dateColumn}>
                {formatDate(date)}
              </div>
            ))}
          </div>

          {/* Wiersze z godzinami */}
          {timeSlots.map(time => (
            <div key={time} style={styles.row}>
              <div style={styles.timeCell}>{time}</div>
              {dates.map(date => {
                const term = getTermAtDateTime(date, time);
                return (
                  <div key={`${date}-${time}`} style={styles.cell}>
                    {term ? (
                      <div
                        style={{
                          ...styles.examTile,
                          backgroundColor: getStatusColor(term.status),
                        }}
                        title={`${term.exam.subject.nazwa} - ${term.sala} - ${term.proposed_by_name}`}
                      >
                        <div style={styles.tileName}>{term.exam.subject.nazwa}</div>
                        <div style={styles.tileRoom}>Sala: {term.sala}</div>
                        <div style={styles.tileProf}>{term.exam.prowadzacy_name}</div>
                      </div>
                    ) : null}
                  </div>
                );
              })}
            </div>
          ))}
        </div>
      </div>

      {/* Lista egzaminów poniżej wykresu */}
      <div style={styles.detailsSection}>
        <h3>Szczegóły egzaminów</h3>
        <div style={styles.detailsList}>
          {terms.map(term => (
            <div key={term.id} style={styles.detailItem}>
              <div
                style={{
                  ...styles.statusDot,
                  backgroundColor: getStatusColor(term.status)
                }}
              ></div>
              <div style={styles.detailContent}>
                <strong>{term.exam.subject.nazwa}</strong>
                <span> - {term.data} {term.godzina}</span>
                <span> - Sala {term.sala}</span>
                <span> - {term.exam.prowadzacy_name}</span>
                <span style={styles.detailStatus}>
                  ({term.status === 'approved' ? 'Zatwierdzone' :
                    term.status === 'rejected' ? 'Odrzucone' : 'Oczekujące'})
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

const styles = {
  container: {
    padding: '20px',
    backgroundColor: 'white',
    borderRadius: '8px',
    boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
  },
  header: {
    marginBottom: '20px',
  },
  legend: {
    display: 'flex',
    gap: '20px',
    marginTop: '10px',
  },
  legendItem: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
  },
  legendBox: {
    width: '20px',
    height: '20px',
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
  chartWrapper: {
    overflowX: 'auto',
    marginBottom: '30px',
  },
  chartContainer: {
    minWidth: '800px',
    border: '1px solid #ddd',
    borderRadius: '8px',
    overflow: 'hidden',
  },
  headerRow: {
    display: 'flex',
    backgroundColor: '#2c3e50',
    color: 'white',
    fontWeight: 'bold',
  },
  timeColumn: {
    width: '100px',
    padding: '12px',
    borderRight: '1px solid #34495e',
    flexShrink: 0,
  },
  dateColumn: {
    flex: 1,
    minWidth: '150px',
    padding: '12px',
    borderRight: '1px solid #34495e',
    textAlign: 'center',
  },
  row: {
    display: 'flex',
    borderBottom: '1px solid #ddd',
    minHeight: '80px',
  },
  timeCell: {
    width: '100px',
    padding: '12px',
    borderRight: '1px solid #ddd',
    backgroundColor: '#f8f9fa',
    fontWeight: 'bold',
    display: 'flex',
    alignItems: 'center',
    flexShrink: 0,
  },
  cell: {
    flex: 1,
    minWidth: '150px',
    padding: '8px',
    borderRight: '1px solid #ddd',
    position: 'relative',
  },
  examTile: {
    padding: '8px',
    borderRadius: '6px',
    color: 'white',
    fontSize: '12px',
    height: '100%',
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
    boxShadow: '0 2px 4px rgba(0,0,0,0.2)',
    cursor: 'pointer',
    transition: 'transform 0.2s',
  },
  tileName: {
    fontWeight: 'bold',
    marginBottom: '4px',
    fontSize: '13px',
  },
  tileRoom: {
    fontSize: '11px',
    opacity: 0.9,
  },
  tileProf: {
    fontSize: '11px',
    opacity: 0.9,
    marginTop: '2px',
  },
  detailsSection: {
    marginTop: '30px',
    paddingTop: '20px',
    borderTop: '2px solid #eee',
  },
  detailsList: {
    display: 'flex',
    flexDirection: 'column',
    gap: '10px',
    marginTop: '15px',
  },
  detailItem: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    padding: '10px',
    backgroundColor: '#f8f9fa',
    borderRadius: '6px',
  },
  statusDot: {
    width: '12px',
    height: '12px',
    borderRadius: '50%',
    flexShrink: 0,
  },
  detailContent: {
    fontSize: '14px',
    lineHeight: '1.5',
  },
  detailStatus: {
    color: '#666',
    marginLeft: '8px',
  },
};

export default GanttChart;
