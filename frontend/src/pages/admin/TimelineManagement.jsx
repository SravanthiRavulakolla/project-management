import { useState, useEffect } from 'react';
import * as api from '../../services/api';

const TARGET_YEARS = ['all', '2nd', '3rd', '4th'];

function TimelineManagement() {
  const [events, setEvents] = useState([]);
  const [batches, setBatches] = useState([]);
  const [submissions, setSubmissions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingEvent, setEditingEvent] = useState(null);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [formData, setFormData] = useState({
    title: '', description: '', deadline: '', maxMarks: '', submissionRequirements: '', targetYear: 'all', order: 0
  });

  // Filters
  const [filterYear, setFilterYear] = useState('');
  const [filterBranch, setFilterBranch] = useState('');
  const [filterSection, setFilterSection] = useState('');

  const fetchEvents = async () => {
    try {
      const [eventsRes, batchesRes, submissionsRes] = await Promise.all([
        api.getAllTimelineEvents(),
        api.getAllBatches(),
        api.getAllSubmissions()
      ]);
      setEvents(eventsRes.data.data);
      setBatches(batchesRes.data.data);
      setSubmissions(submissionsRes.data.data);
    } catch (error) {
      console.error('Failed to fetch data');
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

      {selectedEvent && (
        <div>
          <button className="btn btn-secondary" onClick={() => setSelectedEvent(null)} style={{ marginBottom: '20px' }}>← Back to Timeline</button>
          
          <div className="card" style={{ marginBottom: '20px', borderLeft: '4px solid #667eea' }}>
            <h2>{selectedEvent.title}</h2>
            <p style={{ color: '#666' }}>{selectedEvent.description}</p>
            <div style={{ display: 'flex', gap: '20px', marginTop: '15px' }}>
              <span><strong>📅 Deadline:</strong> {new Date(selectedEvent.deadline).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}</span>
              <span><strong>🎯 Max Marks:</strong> {selectedEvent.maxMarks}</span>
            </div>
          </div>

          {/* Filters */}
          <div className="card" style={{ marginBottom: '20px' }}>
            <h3>🔍 Filters</h3>
            <div style={{ display: 'flex', gap: '15px', alignItems: 'center' }}>
              <div className="form-group" style={{ margin: 0 }}>
                <label>Year</label>
                <select value={filterYear} onChange={(e) => setFilterYear(e.target.value)}>
                  <option value="">All Years</option>
                  <option value="2nd">2nd Year</option>
                  <option value="3rd">3rd Year</option>
                  <option value="4th">4th Year</option>
                </select>
              </div>
              <div className="form-group" style={{ margin: 0 }}>
                <label>Branch</label>
                <select value={filterBranch} onChange={(e) => setFilterBranch(e.target.value)}>
                  <option value="">All Branches</option>
                  <option value="CSE">CSE</option>
                  <option value="IT">IT</option>
                  <option value="ECE">ECE</option>
                  <option value="CSM">CSM</option>
                  <option value="EEE">EEE</option>
                  <option value="CSD">CSD</option>
                  <option value="ETM">ETM</option>
                </select>
              </div>
              <div className="form-group" style={{ margin: 0 }}>
                <label>Section</label>
                <select value={filterSection} onChange={(e) => setFilterSection(e.target.value)}>
                  <option value="">All Sections</option>
                  <option value="A">A</option>
                  <option value="B">B</option>
                  <option value="C">C</option>
                  <option value="D">D</option>
                  <option value="E">E</option>
                </select>
              </div>
              <button className="btn btn-secondary" onClick={() => { setFilterYear(''); setFilterBranch(''); setFilterSection(''); }}>Clear Filters</button>
            </div>
          </div>

          <div className="table-container">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Team</th>
                  <th>Team Details</th>
                  <th>Class</th>
                  <th>COE</th>
                  <th>Status</th>
                  <th>Marks</th>
                  <th>Remarks</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {submissions
                  .filter(sub => sub.timelineEventId._id === selectedEvent._id)
                  .filter(sub => {
                    const batch = batches.find(b => b._id === sub.batchId._id);
                    if (!batch) return false;
                    if (filterYear && batch.year !== filterYear) return false;
                    if (filterBranch && batch.branch !== filterBranch) return false;
                    if (filterSection && batch.section !== filterSection) return false;
                    return true;
                  })
                  .map(sub => {
                    const batch = batches.find(b => b._id === sub.batchId._id);
                    const latestVersion = sub.versions?.[sub.versions.length - 1];
                    return (
                      <tr key={sub._id}>
                        <td><strong>{batch?.teamName}</strong></td>
                        <td>{batch?.teamMembers?.map(m => m.rollNumber).join(', ')}</td>
                        <td>{batch?.year} {batch?.branch}-{batch?.section}</td>
                        <td>{batch?.coeId?.name}</td>
                        <td>{getStatusBadge(sub.status)}</td>
                        <td>{sub.marks !== null ? `${sub.marks}/${selectedEvent.maxMarks}` : '-'}</td>
                        <td>
                          {sub.comments?.length > 0 ? (
                            <div style={{ maxHeight: '60px', overflowY: 'auto', fontSize: '12px' }}>
                              {sub.comments.map((c, idx) => (
                                <div key={idx} style={{ marginBottom: '5px' }}>
                                  <strong>{c.guideId?.name}:</strong> {c.comment}
                                </div>
                              ))}
                            </div>
                          ) : '-'}
                        </td>
                        <td>
                          {latestVersion?.fileUrl && (
                            <a href={latestVersion.fileUrl} target="_blank" rel="noopener noreferrer" className="btn btn-primary btn-sm">📁 View File</a>
                          )}
                        </td>
                      </tr>
                    );
                  })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {!selectedEvent && events.length === 0 ? (
        <div className="card empty-state">
          <h3>No Timeline Events</h3>
          <p>Create timeline events for Abstract Review, PRC-1, PRC-2, etc.</p>
        </div>
      ) : !selectedEvent && (
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
                  <button className="btn btn-primary btn-sm" onClick={() => setSelectedEvent(event)}>👥 View Teams</button>
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

