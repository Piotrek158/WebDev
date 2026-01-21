import React, { useState, useEffect } from 'react';
import { getExams, createExamTerm, getRooms, checkRoomCapacityAndAvailability } from '../services/api';

function ProposeTermForm({ currentUser, onSuccess }) {
  const [exams, setExams] = useState([]);
  const [rooms, setRooms] = useState([]);
  const [formData, setFormData] = useState({
    exam_id: '',
    data: '',
    godzina: '',
    sala: '',
    liczba_osob: 30,
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [validationMessage, setValidationMessage] = useState('');

  useEffect(() => {
    fetchExams();
    fetchRooms();
  }, [currentUser]);

  const fetchExams = async () => {
    if (!currentUser) return;

    try {
      const params = {};

      // Prowadzący widzi tylko swoje egzaminy
      if (currentUser.role === 'prowadzacy') {
        params.prowadzacy_name = currentUser.przedmiot;
      }
      // Starosta widzi egzaminy swojego kierunku
      else if (currentUser.role === 'starosta') {
        params.kierunek = currentUser.kierunek;
        params.typ_studiow = currentUser.typ_studiow;
        params.rok = currentUser.rok;
      }

      const response = await getExams(params);
      setExams(response.data);
    } catch (error) {
      console.error('Błąd pobierania egzaminów:', error);
    }
  };

  const fetchRooms = async () => {
    try {
      const response = await getRooms();
      setRooms(response.data);
    } catch (error) {
      console.error('Błąd pobierania sal:', error);
    }
  };

  const validateRoomAvailability = async () => {
    if (!formData.sala || !formData.data || !formData.godzina || !formData.liczba_osob) {
      return;
    }

    try {
      const response = await checkRoomCapacityAndAvailability({
        sala: formData.sala,
        data: formData.data,
        godzina: formData.godzina,
        liczba_osob: parseInt(formData.liczba_osob),
      });

      if (response.data.available) {
        setValidationMessage(`✓ ${response.data.message}`);
        setError('');
      } else {
        setValidationMessage('');
        setError(response.data.message);
      }
    } catch (error) {
      console.error('Błąd walidacji sali:', error);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      // Walidacja przed wysłaniem
      if (!formData.exam_id || !formData.data || !formData.godzina || !formData.sala) {
        setError('Wszystkie pola są wymagane');
        setLoading(false);
        return;
      }

      await createExamTerm({
        ...formData,
        exam_id: parseInt(formData.exam_id),
        proposed_by_role: currentUser.role,
        proposed_by_name: currentUser.name,
      });

      alert('Propozycja terminu została dodana!');
      setFormData({ exam_id: '', data: '', godzina: '', sala: '' });
      if (onSuccess) onSuccess();
    } catch (error) {
      setError(error.response?.data?.detail || 'Błąd dodawania propozycji');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const newFormData = {
      ...formData,
      [e.target.name]: e.target.value,
    };
    setFormData(newFormData);
  };

  // Walidacja po zmianie formData
  useEffect(() => {
    if (formData.sala && formData.data && formData.godzina && formData.liczba_osob) {
      const timer = setTimeout(() => {
        validateRoomAvailability();
      }, 500);
      return () => clearTimeout(timer);
    }
  }, [formData.sala, formData.data, formData.godzina, formData.liczba_osob]);

  // Tylko prowadzący i starosta mogą proponować terminy
  if (!currentUser || (currentUser.role !== 'prowadzacy' && currentUser.role !== 'starosta')) {
    return null;
  }

  return (
    <div style={styles.container}>
      <h3>Zaproponuj termin egzaminu</h3>
      
      {exams.length === 0 ? (
        <p style={styles.warning}>Brak dostępnych egzaminów do zaproponowania terminu</p>
      ) : (
        <form onSubmit={handleSubmit} style={styles.form}>
          <div style={styles.formGroup}>
            <label style={styles.label}>Egzamin:</label>
            <select 
              name="exam_id"
              value={formData.exam_id}
              onChange={handleChange}
              style={styles.select}
              required
            >
              <option value="">-- Wybierz egzamin --</option>
              {exams.map(exam => (
                <option key={exam.id} value={exam.id}>
                  {exam.subject.nazwa} - {exam.prowadzacy_name} 
                  ({exam.subject.kierunek}, {exam.subject.typ_studiow}, rok {exam.subject.rok})
                </option>
              ))}
            </select>
          </div>

          <div style={styles.formGroup}>
            <label style={styles.label}>Data:</label>
            <input 
              type="date"
              name="data"
              value={formData.data}
              onChange={handleChange}
              style={styles.input}
              required
            />
          </div>

          <div style={styles.formGroup}>
            <label style={styles.label}>Godzina:</label>
            <input 
              type="time"
              name="godzina"
              value={formData.godzina}
              onChange={handleChange}
              style={styles.input}
              required
            />
          </div>

          <div style={styles.formGroup}>
            <label style={styles.label}>Liczba osób:</label>
            <input
              type="number"
              name="liczba_osob"
              value={formData.liczba_osob}
              onChange={handleChange}
              min="1"
              style={styles.input}
              required
            />
          </div>

          <div style={styles.formGroup}>
            <label style={styles.label}>Sala:</label>
            <select
              name="sala"
              value={formData.sala}
              onChange={handleChange}
              style={styles.select}
              required
            >
              <option value="">-- Wybierz salę --</option>
              {rooms.map(room => (
                <option key={room.id} value={room.nazwa}>
                  {room.nazwa} - {room.budynek} (pojemność: {room.pojemnosc}, {room.typ})
                </option>
              ))}
            </select>
          </div>

          {validationMessage && <div style={styles.success}>{validationMessage}</div>}
          {error && <div style={styles.error}>{error}</div>}

          <button 
            type="submit" 
            style={styles.button}
            disabled={loading}
          >
            {loading ? 'Dodawanie...' : 'Zaproponuj termin'}
          </button>
        </form>
      )}
    </div>
  );
}

const styles = {
  container: {
    padding: '20px',
    backgroundColor: 'white',
    borderRadius: '8px',
    boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
    marginBottom: '20px',
  },
  form: {
    display: 'flex',
    flexDirection: 'column',
    gap: '15px',
  },
  formGroup: {
    display: 'flex',
    flexDirection: 'column',
    gap: '5px',
  },
  label: {
    fontWeight: 'bold',
    fontSize: '14px',
  },
  input: {
    padding: '8px',
    border: '1px solid #ccc',
    borderRadius: '4px',
    fontSize: '14px',
  },
  select: {
    padding: '8px',
    border: '1px solid #ccc',
    borderRadius: '4px',
    fontSize: '14px',
  },
  button: {
    padding: '10px 20px',
    backgroundColor: '#007bff',
    color: 'white',
    border: 'none',
    borderRadius: '4px',
    cursor: 'pointer',
    fontSize: '14px',
    fontWeight: 'bold',
  },
  error: {
    padding: '10px',
    backgroundColor: '#f8d7da',
    color: '#721c24',
    borderRadius: '4px',
    fontSize: '14px',
  },
  success: {
    padding: '10px',
    backgroundColor: '#d4edda',
    color: '#155724',
    borderRadius: '4px',
    fontSize: '14px',
  },
  warning: {
    padding: '15px',
    backgroundColor: '#fff3cd',
    color: '#856404',
    borderRadius: '4px',
  },
};

export default ProposeTermForm;
