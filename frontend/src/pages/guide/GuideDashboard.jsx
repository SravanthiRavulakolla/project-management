import { useState, useEffect } from 'react';
import * as api from '../../services/api';
import BatchDetails from './BatchDetails';
import './GuideDashboard.css';

function GuideDashboard() {
  const [activeTab, setActiveTab] = useState('problems');
  const [problems, setProblems] = useState([]);
  const [coes, setCoes] = useState([]);
  const [batches, setBatches] = useState([]);
  const [optedTeams, setOptedTeams] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedBatch, setSelectedBatch] = useState(null);
  const [showAddProblem, setShowAddProblem] = useState(false);
  const [newProblem, setNewProblem] = useState({ title: '', description: '', coeId: '', year: new Date().getFullYear(), datasetUrl: '' });

  const fetchData = async () => {
    try {
      const [problemsRes, coesRes, batchesRes, optedRes] = await Promise.all([
        api.getMyProblems(),
        api.getAllCOEs(),
        api.getMyBatches(),
        api.getOptedTeams()
      ]);
      setProblems(problemsRes.data.data);
      setCoes(coesRes.data.data);
      setBatches(batchesRes.data.data);
      setOptedTeams(optedRes.data.data);
    } catch (error) {
      console.error('Failed to fetch data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchData(); }, []);

  const handleAddProblem = async (e) => {
    e.preventDefault();
    try {
      await api.createProblem(newProblem);
      setNewProblem({ title: '', description: '', coeId: '', year: new Date().getFullYear(), datasetUrl: '' });
      setShowAddProblem(false);
      fetchData();
    } catch (error) {
      alert(error.response?.data?.message || 'Failed to add problem');
    }
  };

  const handleDeleteProblem = async (id) => {
    if (window.confirm('Delete this problem statement?')) {
      try {
        await api.deleteProblem(id);
        fetchData();
      } catch (error) {
        alert('Failed to delete');
      }
    }
  };

  const handleAllot = async (batchId) => {
    try {
      await api.allotProblem(batchId);
      alert('Team allotted successfully!');
      fetchData();
    } catch (error) {
      alert(error.response?.data?.message || 'Failed to allot');
    }
  };

  const handleReject = async (batchId) => {
    if (window.confirm('Reject this team request?')) {
      try {
        await api.rejectProblem(batchId);
        fetchData();
      } catch (error) {
        alert('Failed to reject');
      }
    }
  };

  if (loading) return <div className="loading">Loading...</div>;
  if (selectedBatch) return <BatchDetails batchId={selectedBatch} onBack={() => { setSelectedBatch(null); fetchData(); }} />;

  return (
    <div className="guide-dashboard">
      <div className="dashboard-header">
        <h1>👨‍🏫 Guide Dashboard</h1>
        <p>Manage your problem statements and teams</p>
      </div>

      <div className="stats-row">
        <div className="stat-card"><div className="stat-icon">📋</div><div className="stat-value">{problems.length}</div><div className="stat-label">My Problems</div></div>
        <div className="stat-card"><div className="stat-icon">⏳</div><div className="stat-value">{optedTeams.length}</div><div className="stat-label">Pending Requests</div></div>
        <div className="stat-card"><div className="stat-icon">👥</div><div className="stat-value">{batches.length}</div><div className="stat-label">Allotted Teams</div></div>
        <div className="stat-card"><div className="stat-icon">✅</div><div className="stat-value">{batches.filter(b => b.status === 'Completed').length}</div><div className="stat-label">Completed</div></div>
      </div>

      <div className="tabs">
        <button className={`tab ${activeTab === 'problems' ? 'active' : ''}`} onClick={() => setActiveTab('problems')}>📋 My Problem Statements</button>
        <button className={`tab ${activeTab === 'requests' ? 'active' : ''}`} onClick={() => setActiveTab('requests')}>⏳ Pending Requests ({optedTeams.length})</button>
        <button className={`tab ${activeTab === 'teams' ? 'active' : ''}`} onClick={() => setActiveTab('teams')}>👥 My Teams</button>
      </div>

      {activeTab === 'problems' && (
        <div className="tab-content">
          <div className="section-header">
            <h2>📋 My Problem Statements</h2>
            <button className="btn btn-primary" onClick={() => setShowAddProblem(true)}>+ Add Problem</button>
          </div>
          {showAddProblem && (
            <div className="card" style={{ marginBottom: '20px' }}>
              <form onSubmit={handleAddProblem}>
                <div className="form-group"><label>COE</label>
                  <select value={newProblem.coeId} onChange={(e) => setNewProblem({...newProblem, coeId: e.target.value})} required>
                    <option value="">Select COE</option>
                    {coes.map(c => <option key={c._id} value={c._id}>{c.name}</option>)}
                  </select>
                </div>
                <div className="form-group"><label>Title</label><input type="text" value={newProblem.title} onChange={(e) => setNewProblem({...newProblem, title: e.target.value})} required /></div>
                <div className="form-group"><label>Description</label><textarea value={newProblem.description} onChange={(e) => setNewProblem({...newProblem, description: e.target.value})} rows={3} /></div>
                <div className="form-group"><label>Year</label><input type="number" value={newProblem.year} onChange={(e) => setNewProblem({...newProblem, year: e.target.value})} required /></div>
                <div className="form-group"><label>Dataset URL</label><input type="url" value={newProblem.datasetUrl} onChange={(e) => setNewProblem({...newProblem, datasetUrl: e.target.value})} /></div>
                <div style={{ display: 'flex', gap: '10px' }}><button type="submit" className="btn btn-primary">Save</button><button type="button" className="btn btn-secondary" onClick={() => setShowAddProblem(false)}>Cancel</button></div>
              </form>
            </div>
          )}
          {problems.length === 0 ? <div className="card empty-state"><h3>No Problem Statements Yet</h3><p>Add your first problem statement to get started</p></div> : (
            <div className="grid grid-2">
              {problems.map(p => (
                <div key={p._id} className="card">
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start' }}>
                    <div><h3>{p.title}</h3><span className="badge badge-info">{p.coeId?.name}</span></div>
                    <button className="btn btn-danger btn-sm" onClick={() => handleDeleteProblem(p._id)}>🗑️</button>
                  </div>
                  <p style={{ color: '#666', margin: '10px 0' }}>{p.description}</p>
                  <div style={{ fontSize: '14px', color: '#888' }}>Year: {p.year} | Teams: {p.selectedBatchCount}/{p.maxBatches}</div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {activeTab === 'requests' && (
        <div className="tab-content">
          <h2>⏳ Pending Team Requests</h2>
          {optedTeams.length === 0 ? <div className="card empty-state"><h3>No Pending Requests</h3><p>Teams that opt for your problems will appear here</p></div> : (
            <div className="grid grid-2">
              {optedTeams.map(t => (
                <div key={t._id} className="card">
                  <div className="batch-icon">👥</div>
                  <h3>{t.teamName}</h3>
                  <p><strong>Leader:</strong> {t.leaderStudentId?.name} ({t.leaderStudentId?.email})</p>
                  <p><strong>Opted Problem:</strong> {t.optedProblemId?.title}</p>
                  <p><strong>COE:</strong> {t.coeId?.name}</p>
                  <div style={{ display: 'flex', gap: '10px', marginTop: '15px' }}>
                    <button className="btn btn-primary" onClick={() => handleAllot(t._id)}>✅ Allot</button>
                    <button className="btn btn-danger" onClick={() => handleReject(t._id)}>❌ Reject</button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {activeTab === 'teams' && (
        <div className="tab-content">
          <h2>👥 My Allotted Teams</h2>
          {batches.length === 0 ? <div className="card empty-state"><h3>No Teams Allotted Yet</h3><p>Allot teams from pending requests</p></div> : (
            <div className="grid grid-3">
              {batches.map(b => (
                <div key={b._id} className="batch-card" onClick={() => setSelectedBatch(b._id)}>
                  <div className="batch-status"><span className={`badge badge-${b.status === 'Completed' ? 'success' : b.status === 'In Progress' ? 'warning' : 'info'}`}>{b.status}</span></div>
                  <div className="batch-icon">👥</div>
                  <h3>{b.teamName}</h3>
                  <p className="batch-leader">Leader: {b.leaderStudentId?.name}</p>
                  <p className="batch-problem">📋 {b.problemId?.title}</p>
                  <div className="batch-action">View Details →</div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default GuideDashboard;

