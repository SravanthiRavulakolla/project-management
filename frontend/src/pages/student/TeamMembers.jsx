import { useState, useEffect } from 'react';
import * as api from '../../services/api';

function TeamMembers({ batchId }) {
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({ name: '', rollNo: '', branch: '' });
  const [saving, setSaving] = useState(false);

  const fetchMembers = async () => {
    try {
      const res = await api.getTeamMembers(batchId);
      setMembers(res.data.data);
    } catch (error) {
      console.error('Failed to fetch team members');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMembers();
  }, [batchId]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      await api.addTeamMember(formData);
      setFormData({ name: '', rollNo: '', branch: '' });
      setShowForm(false);
      fetchMembers();
    } catch (error) {
      alert(error.response?.data?.message || 'Failed to add member');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('Remove this team member?')) return;
    try {
      await api.deleteTeamMember(id);
      fetchMembers();
    } catch (error) {
      alert('Failed to remove member');
    }
  };

  if (loading) return <div>Loading team members...</div>;

  return (
    <div>
      <div className="flex-between" style={{ marginBottom: '20px' }}>
        <h2 className="section-title">👥 Team Members</h2>
        <button className="btn btn-primary" onClick={() => setShowForm(!showForm)}>
          {showForm ? 'Cancel' : '+ Add Member'}
        </button>
      </div>

      {showForm && (
        <div className="card" style={{ marginBottom: '20px', background: '#f7fafc' }}>
          <form onSubmit={handleSubmit}>
            <div className="grid grid-3">
              <div className="form-group">
                <label>Name</label>
                <input type="text" value={formData.name} onChange={(e) => setFormData({...formData, name: e.target.value})} required />
              </div>
              <div className="form-group">
                <label>Roll Number</label>
                <input type="text" value={formData.rollNo} onChange={(e) => setFormData({...formData, rollNo: e.target.value})} required />
              </div>
              <div className="form-group">
                <label>Branch</label>
                <input type="text" value={formData.branch} onChange={(e) => setFormData({...formData, branch: e.target.value})} required />
              </div>
            </div>
            <button type="submit" className="btn btn-success" disabled={saving}>
              {saving ? 'Adding...' : 'Add Member'}
            </button>
          </form>
        </div>
      )}

      {members.length === 0 ? (
        <div className="empty-state">
          <div className="empty-state-icon">👥</div>
          <h3>No Team Members Yet</h3>
          <p>Add your team members to get started</p>
        </div>
      ) : (
        <div className="grid grid-3">
          {members.map((member) => (
            <div key={member._id} className="card" style={{ position: 'relative' }}>
              <button 
                onClick={() => handleDelete(member._id)}
                style={{ position: 'absolute', top: '10px', right: '10px', background: 'none', border: 'none', cursor: 'pointer', fontSize: '18px' }}
              >
                ❌
              </button>
              <div style={{ fontSize: '40px', marginBottom: '12px' }}>👤</div>
              <h3 style={{ color: '#2d3748', marginBottom: '8px' }}>{member.name}</h3>
              <p style={{ color: '#718096', fontSize: '14px' }}>Roll No: {member.rollNo}</p>
              <p style={{ color: '#718096', fontSize: '14px' }}>Branch: {member.branch}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default TeamMembers;

