import React, { useState, useEffect } from 'react';
import { getDemoUsers } from '../services/api';

function UserSelector({ onUserChange, currentUser }) {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      const response = await getDemoUsers();
      setUsers(response.data);
      if (response.data.length > 0 && !currentUser) {
        onUserChange(response.data[0]);
      }
    } catch (error) {
      console.error('Błąd pobierania użytkowników:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div>Ładowanie...</div>;

  return (
    <div style={styles.container}>
      <label style={styles.label}>Zalogowany jako:</label>
      <select 
        style={styles.select}
        value={currentUser?.id || ''}
        onChange={(e) => {
          const user = users.find(u => u.id === parseInt(e.target.value));
          onUserChange(user);
        }}
      >
        {users.map(user => (
          <option key={user.id} value={user.id}>
            {user.name}
          </option>
        ))}
      </select>
    </div>
  );
}

const styles = {
  container: {
    padding: '15px',
    backgroundColor: '#f5f5f5',
    borderBottom: '2px solid #ddd',
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
  },
  label: {
    fontWeight: 'bold',
    fontSize: '14px',
  },
  select: {
    padding: '8px 12px',
    fontSize: '14px',
    border: '1px solid #ccc',
    borderRadius: '4px',
    minWidth: '300px',
  },
};

export default UserSelector;
