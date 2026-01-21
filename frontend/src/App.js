import React, { useState } from 'react';
import UserSelector from './components/UserSelector';
import ExamList from './components/ExamList';
import ProposeTermForm from './components/ProposeTermForm';
import GanttChart from './components/GanttChart';

function App() {
  const [currentUser, setCurrentUser] = useState(null);
  const [refreshKey, setRefreshKey] = useState(0);
  const [activeView, setActiveView] = useState('list'); // 'list' or 'gantt'

  const handleUserChange = (user) => {
    setCurrentUser(user);
  };

  const handleProposeSuccess = () => {
    setRefreshKey(prev => prev + 1); // Trigger refresh
  };

  return (
    <div style={styles.app}>
      <header style={styles.header}>
        <h1 style={styles.title}>System Organizacji Egzaminów</h1>
      </header>

      <UserSelector
        currentUser={currentUser}
        onUserChange={handleUserChange}
      />

      {currentUser && (
        <>
          {/* Navigation Tabs */}
          <div style={styles.tabsContainer}>
            <button
              style={activeView === 'list' ? styles.tabActive : styles.tab}
              onClick={() => setActiveView('list')}
            >
              📋 Lista egzaminów
            </button>
            <button
              style={activeView === 'gantt' ? styles.tabActive : styles.tab}
              onClick={() => setActiveView('gantt')}
            >
              📊 Wykres Gantta
            </button>
          </div>

          {activeView === 'list' ? (
            <div style={styles.content}>
              <div style={styles.sidebar}>
                <ProposeTermForm
                  currentUser={currentUser}
                  onSuccess={handleProposeSuccess}
                />
              </div>

              <div style={styles.main}>
                <ExamList
                  currentUser={currentUser}
                  onRefresh={refreshKey}
                />
              </div>
            </div>
          ) : (
            <div style={styles.ganttContent}>
              <GanttChart currentUser={currentUser} />
            </div>
          )}
        </>
      )}

      {!currentUser && (
        <div style={styles.loading}>
          <p>Wybierz użytkownika, aby kontynuować</p>
        </div>
      )}
    </div>
  );
}

const styles = {
  app: {
    minHeight: '100vh',
    backgroundColor: '#f0f2f5',
  },
  header: {
    backgroundColor: '#2c3e50',
    color: 'white',
    padding: '20px',
    textAlign: 'center',
  },
  title: {
    margin: 0,
    fontSize: '28px',
  },
  tabsContainer: {
    display: 'flex',
    gap: '10px',
    padding: '20px 20px 0 20px',
    maxWidth: '1400px',
    margin: '0 auto',
    borderBottom: '2px solid #ddd',
  },
  tab: {
    padding: '12px 24px',
    border: 'none',
    backgroundColor: 'transparent',
    cursor: 'pointer',
    fontSize: '16px',
    borderBottom: '3px solid transparent',
    transition: 'all 0.3s',
    color: '#666',
  },
  tabActive: {
    padding: '12px 24px',
    border: 'none',
    backgroundColor: 'transparent',
    cursor: 'pointer',
    fontSize: '16px',
    borderBottom: '3px solid #2c3e50',
    color: '#2c3e50',
    fontWeight: 'bold',
  },
  content: {
    display: 'grid',
    gridTemplateColumns: '400px 1fr',
    gap: '20px',
    padding: '20px',
    maxWidth: '1400px',
    margin: '0 auto',
  },
  ganttContent: {
    padding: '20px',
    maxWidth: '1400px',
    margin: '0 auto',
  },
  sidebar: {
    display: 'flex',
    flexDirection: 'column',
    gap: '20px',
  },
  main: {
    minHeight: '500px',
  },
  loading: {
    textAlign: 'center',
    padding: '60px 20px',
    fontSize: '18px',
    color: '#666',
  },
};

export default App;
