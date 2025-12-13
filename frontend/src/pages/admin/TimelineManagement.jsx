import { useState, useEffect } from 'react';
import * as api from '../../services/api';

const TARGET_YEARS = ['all', '2nd', '3rd', '4th'];

function TimelineManagement() {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingEvent, setEditingEvent] = useState(null);
  const [formData, setFormData] = useState({
    title: '', description: '', deadline: '', maxMarks: '', submissionRequirements: '', targetYear: 'all', order: 0
  });

  const fetchEvents = async () => {
    try {
      const res = await api.getAllTimelineEvents();
      setEvents(res.data.data);
    } catch (error) {
      console.error('Failed to fetch events');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchEvents(); }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingEvent) {
        await api.updateTimelineEvent(editingEvent._id, formData);
      } else {
        await api.createTimelineEvent(formData);
      }
      setShowForm(false);
      setEditingEvent(null);
      setFormData({ title: '', description: '', deadline: '', maxMarks: '', submissionRequirements: '', targetYear: 'all', order: 0 });
      fetchEvents();
    } catch (error) {
      alert(error.response?.data?.message || 'Failed to save event');
    }
  };

  const handleEdit = (event) => {
    setEditingEvent(event);
    setFormData({
      title: event.title,
      description: event.description || '',
      deadline: event.deadline.split('T')[0],
      maxMarks: event.maxMarks,
      submissionRequirements: event.submissionRequirements || '',
      targetYear: event.targetYear,
      order: event.order || 0
    });
    setShowForm(true);
  };

  const handleDelete = async (id) => {
    if (!confirm('Delete this timeline event?')) return;
    try {
      await api.deleteTimelineEvent(id);
      fetchEvents();
    } catch (error) {
      alert('Failed to delete');
    }
  };

  const getStatusBadge = (deadline) => {
    const now = new Date();
    const dl = new Date(deadline);
    const diff = (dl - now) / (1000 * 60 * 60 * 24);
    if (diff < 0) return <span className="badge badge-danger">Past Due</span>;
    if (diff < 3) return <span className="badge badge-warning">Due Soon</span>;
    return <span className="badge badge-success">Upcoming</span>;
  };

  if (loading) return <div>Loading timeline...</div>;

  return (
    <div className="tab-content">
      <div className="flex-between" style={{ marginBottom: '20px' }}>
        <h2>📅 Timeline Management</h2>
        <button className="btn btn-primary" onClick={() => { setShowForm(true); setEditingEvent(null); setFormData({ title: '', description: '', deadline: '', maxMarks: '', submissionRequirements: '', targetYear: 'all', order: 0 }); }}>
          + Add Event
        </button>
      </div>

      {showForm && (
        <div className="card" style={{ marginBottom: '20px' }}>
          <h3>{editingEvent ? 'Edit Event' : 'Create New Timeline Event'}</h3>
          <form onSubmit={handleSubmit}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
              <div className="form-group">
                <label>Event Title *</label>
                <input type="text" value={formData.title} onChange={(e) => setFormData({...formData, title: e.target.value})} placeholder="e.g., Abstract Submission, PRC-1" required />
              </div>
              <div className="form-group">
                <label>Deadline *</label>
                <input type="date" value={formData.deadline} onChange={(e) => setFormData({...formData, deadline: e.target.value})} required />
              </div>
              <div className="form-group">
                <label>Maximum Marks *</label>
                <input type="number" value={formData.maxMarks} onChange={(e) => setFormData({...formData, maxMarks: e.target.value})} min="0" required />
              </div>
              <div className="form-group">
                <label>Target Year</label>
                <select value={formData.targetYear} onChange={(e) => setFormData({...formData, targetYear: e.target.value})}>
                  {TARGET_YEARS.map(y => <option key={y} value={y}>{y === 'all' ? 'All Years' : `${y} Year`}</option>)}
                </select>
              </div>
              <div className="form-group">
                <label>Order (for sorting)</label>
                <input type="number" value={formData.order} onChange={(e) => setFormData({...formData, order: e.target.value})} />
              </div>
            </div>
            <div className="form-group">
              <label>Description</label>
              <textarea value={formData.description} onChange={(e) => setFormData({...formData, description: e.target.value})} rows={2} placeholder="Brief description of this review stage" />
            </div>
            <div className="form-group">
              <label>Submission Requirements</label>
              <textarea value={formData.submissionRequirements} onChange={(e) => setFormData({...formData, submissionRequirements: e.target.value})} rows={3} placeholder="What documents/files need to be submitted" />
            </div>
            <div style={{ display: 'flex', gap: '10px' }}>
              <button type="submit" className="btn btn-primary">{editingEvent ? 'Update' : 'Create'} Event</button>
              <button type="button" className="btn btn-secondary" onClick={() => { setShowForm(false); setEditingEvent(null); }}>Cancel</button>
            </div>
          </form>
        </div>
      )}

      {events.length === 0 ? (
        <div className="card empty-state">
          <h3>No Timeline Events</h3>
          <p>Create timeline events for Abstract Review, PRC-1, PRC-2, etc.</p>
        </div>
      ) : (
        <div className="timeline-container">
          {events.map((event, idx) => (
            <div key={event._id} className="card timeline-event" style={{ borderLeft: '4px solid #667eea', marginBottom: '15px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start' }}>
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '10px' }}>
                    <span style={{ background: '#667eea', color: 'white', borderRadius: '50%', width: '30px', height: '30px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold' }}>{idx + 1}</span>
                    <h3 style={{ margin: 0 }}>{event.title}</h3>
                    {getStatusBadge(event.deadline)}
                    <span className="badge badge-info">{event.targetYear === 'all' ? 'All Years' : `${event.targetYear} Year`}</span>
                  </div>
                  <p style={{ color: '#666', margin: '5px 0' }}>{event.description}</p>
                </div>
                <div style={{ display: 'flex', gap: '5px' }}>
                  <button className="btn btn-secondary btn-sm" onClick={() => handleEdit(event)}>✏️</button>
                  <button className="btn btn-danger btn-sm" onClick={() => handleDelete(event._id)}>🗑️</button>
                </div>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '15px', marginTop: '15px', padding: '15px', background: '#f8fafc', borderRadius: '8px' }}>
                <div><strong>📅 Deadline:</strong><br/>{new Date(event.deadline).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}</div>
                <div><strong>🎯 Max Marks:</strong><br/>{event.maxMarks}</div>
                <div><strong>📋 Requirements:</strong><br/><span style={{ fontSize: '13px', color: '#666' }}>{event.submissionRequirements || 'Not specified'}</span></div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default TimelineManagement;

