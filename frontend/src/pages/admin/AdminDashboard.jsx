import { useState, useEffect } from 'react';
import * as api from '../../services/api';
import COEManagement from './COEManagement';
import './AdminDashboard.css';

function AdminDashboard() {
  const [stats, setStats] = useState(null);
  const [coes, setCoes] = useState([]);
  const [batches, setBatches] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedCOE, setSelectedCOE] = useState(null);
  const [activeTab, setActiveTab] = useState('coes');

  const fetchData = async () => {
    try {
      const [statsRes, coesRes, batchesRes] = await Promise.all([
        api.getAdminDashboard(),
        api.getAllCOEs(),
        api.getAllBatches()
      ]);
      setStats(statsRes.data.data);
      setCoes(coesRes.data.data);
      setBatches(batchesRes.data.data);
    } catch (error) {
      console.error('Failed to fetch data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchData(); }, []);

  const getBatchesForCOE = (coeId) => batches.filter(b => b.coeId?._id === coeId || b.coeId === coeId);
  const getStatusColor = (status) => status === 'Completed' ? 'success' : status === 'In Progress' ? 'warning' : 'info';

  if (loading) return <div className="loading">Loading...</div>;

  return (
    <div className="admin-dashboard">
      <div className="dashboard-header">
        <h1>👑 Admin Dashboard</h1>
        <p>Project Coordinator - Monitor all COEs, teams, and progress</p>
      </div>

      <div className="stats-row">
        <div className="stat-card"><div className="stat-icon">🏛️</div><div className="stat-value">{stats?.totalCOEs || 0}</div><div className="stat-label">COEs</div></div>
        <div className="stat-card"><div className="stat-icon">📋</div><div className="stat-value">{stats?.totalProblems || 0}</div><div className="stat-label">Problems</div></div>
        <div className="stat-card"><div className="stat-icon">👨‍🏫</div><div className="stat-value">{stats?.totalGuides || 0}</div><div className="stat-label">Guides</div></div>
        <div className="stat-card"><div className="stat-icon">👥</div><div className="stat-value">{stats?.totalBatches || 0}</div><div className="stat-label">Teams</div></div>
        <div className="stat-card"><div className="stat-icon">✅</div><div className="stat-value">{batches.filter(b => b.status === 'Completed').length}</div><div className="stat-label">Completed</div></div>
      </div>

      <div className="tabs">
        <button className={`tab ${activeTab === 'coes' ? 'active' : ''}`} onClick={() => { setActiveTab('coes'); setSelectedCOE(null); }}>🏛️ COE Overview</button>
        <button className={`tab ${activeTab === 'manage' ? 'active' : ''}`} onClick={() => setActiveTab('manage')}>⚙️ Manage COEs</button>
      </div>

      {activeTab === 'coes' && !selectedCOE && (
        <div className="tab-content">
          <h2>🏛️ Centers of Excellence</h2>
          <p style={{ color: '#666', marginBottom: '20px' }}>Click on a COE to view teams and their progress</p>
          <div className="grid grid-3">
            {coes.map(coe => {
              const coeBatches = getBatchesForCOE(coe._id);
              const completed = coeBatches.filter(b => b.status === 'Completed').length;
              const inProgress = coeBatches.filter(b => b.status === 'In Progress').length;
              return (
                <div key={coe._id} className="coe-card" onClick={() => setSelectedCOE(coe)}>
                  <div className="coe-icon">🏛️</div>
                  <h3>{coe.name}</h3>
                  <p style={{ color: '#666', fontSize: '14px' }}>{coe.description || 'No description'}</p>
                  <div className="coe-stats">
                    <div><strong>{coeBatches.length}</strong> Teams</div>
                    <div><strong>{inProgress}</strong> In Progress</div>
                    <div><strong>{completed}</strong> Completed</div>
                  </div>
                  <div className="coe-action">View Teams →</div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {activeTab === 'coes' && selectedCOE && (
        <div className="tab-content">
          <button className="btn btn-secondary" onClick={() => setSelectedCOE(null)} style={{ marginBottom: '20px' }}>← Back to COEs</button>
          <h2>🏛️ {selectedCOE.name}</h2>
          <p style={{ color: '#666', marginBottom: '20px' }}>{selectedCOE.description}</p>

          {getBatchesForCOE(selectedCOE._id).length === 0 ? (
            <div className="card empty-state"><h3>No Teams Yet</h3><p>No teams have been assigned to this COE</p></div>
          ) : (
            <div className="table-container">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Team Name</th>
                    <th>Leader</th>
                    <th>Problem Statement</th>
                    <th>Guide/Mentor</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {getBatchesForCOE(selectedCOE._id).map(batch => (
                    <tr key={batch._id}>
                      <td><strong>{batch.teamName}</strong></td>
                      <td>{batch.leaderStudentId?.name}<br/><small style={{ color: '#888' }}>{batch.leaderStudentId?.email}</small></td>
                      <td>{batch.problemId?.title || batch.optedProblemId?.title || '-'}</td>
                      <td>{batch.guideId?.name || <span style={{ color: '#f59e0b' }}>Pending</span>}<br/><small style={{ color: '#888' }}>{batch.guideId?.email}</small></td>
                      <td><span className={`badge badge-${getStatusColor(batch.status)}`}>{batch.status}</span></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {activeTab === 'manage' && <COEManagement onUpdate={fetchData} />}
    </div>
  );
}

export default AdminDashboard;

