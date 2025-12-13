import { useState, useEffect } from 'react';
import * as api from '../../services/api';

function GuideTimeline() {
  const [timelineEvents, setTimelineEvents] = useState([]);
  const [batches, setBatches] = useState([]);
  const [submissions, setSubmissions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [selectedBatch, setSelectedBatch] = useState(null);

  const fetchData = async () => {
    try {
      const [eventsRes, batchesRes, submissionsRes] = await Promise.all([
        api.getAllTimelineEvents(),
        api.getMyBatches(),
        api.getGuideSubmissions()
      ]);
      setTimelineEvents(eventsRes.data.data);
      setBatches(batchesRes.data.data);
      setSubmissions(submissionsRes.data.data);
    } catch (error) {
      console.error('Failed to fetch data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchData(); }, []);

  const getSubmissionsForEvent = (eventId) => {
    return submissions.filter(s => s.timelineEventId._id === eventId);
  };

  const getStatusBadge = (status) => {
    const colors = { not_started: 'secondary', submitted: 'info', under_review: 'warning', needs_revision: 'warning', accepted: 'success', rejected: 'danger' };
    const labels = { not_started: 'Not Started', submitted: 'Submitted', under_review: 'Under Review', needs_revision: 'Needs Revision', accepted: 'Accepted', rejected: 'Rejected' };
    return <span className={`badge badge-${colors[status] || 'info'}`}>{labels[status] || status}</span>;
  };

  const getDeadlineStatus = (deadline) => {
    const now = new Date();
    const dl = new Date(deadline);
    const diff = (dl - now) / (1000 * 60 * 60 * 24);
    if (diff < 0) return { text: 'Past Due', color: '#ef4444' };
    if (diff < 3) return { text: `${Math.ceil(diff)} days left`, color: '#f59e0b' };
    return { text: `${Math.ceil(diff)} days left`, color: '#22c55e' };
  };

  if (loading) return <div>Loading timeline...</div>;

  if (selectedBatch) {
    const submission = submissions.find(s => s.batchId._id === selectedBatch && s.timelineEventId._id === selectedEvent._id);
    if (!submission) return <div>No submission found</div>;

    return (
      <div>
        <button className="btn btn-secondary" onClick={() => setSelectedBatch(null)} style={{ marginBottom: '20px' }}>← Back to Batches</button>
        
        <div className="card" style={{ marginBottom: '20px', borderLeft: '4px solid #667eea' }}>
          <h2>{selectedEvent.title} - {batches.find(b => b._id === selectedBatch)?.teamName}</h2>
          <p style={{ color: '#666' }}>{selectedEvent.description}</p>
          <div style={{ display: 'flex', gap: '20px', marginTop: '15px' }}>
            <span><strong>📅 Deadline:</strong> {new Date(selectedEvent.deadline).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}</span>
            <span><strong>🎯 Max Marks:</strong> {selectedEvent.maxMarks}</span>
            {getStatusBadge(submission.status)}
          </div>
          {selectedEvent.submissionRequirements && (
            <div style={{ marginTop: '15px', padding: '10px', background: '#f8fafc', borderRadius: '8px' }}>
              <strong>📋 What to Submit:</strong><br/>
              <span style={{ color: '#666' }}>{selectedEvent.submissionRequirements}</span>
            </div>
          )}
        </div>

        {submission.marks !== null && submission.marks !== undefined && (
          <div className="card" style={{ marginBottom: '20px', background: '#f0fdf4', border: '1px solid #22c55e' }}>
            <h3 style={{ color: '#22c55e' }}>✅ Marks Assigned</h3>
            <p style={{ fontSize: '24px', fontWeight: 'bold', color: '#22c55e' }}>{submission.marks} / {selectedEvent.maxMarks}</p>
          </div>
        )}

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
          <div className="card">
            <h3>📄 Submitted Versions</h3>
            {!submission.versions?.length ? (
              <p style={{ color: '#888' }}>No submissions yet</p>
            ) : (
              <div style={{ maxHeight: '250px', overflowY: 'auto' }}>
                {submission.versions.map((v, idx) => (
                  <div key={idx} style={{ padding: '10px', borderBottom: '1px solid #eee' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                      <strong>Version {v.version}</strong>
                      <small>{new Date(v.submittedAt).toLocaleString()}</small>
                    </div>
                    {v.description && <p style={{ color: '#666', fontSize: '14px', margin: '5px 0' }}>{v.description}</p>}
                    {v.fileUrl && <a href={v.fileUrl} target="_blank" rel="noopener noreferrer" className="btn btn-secondary btn-sm">📁 View File</a>}
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="card">
            <h3>💬 Guide Feedback</h3>
            {!submission.comments?.length ? (
              <p style={{ color: '#888' }}>No feedback yet</p>
            ) : (
              <div style={{ maxHeight: '300px', overflowY: 'auto' }}>
                {submission.comments.map((c, idx) => (
                  <div key={idx} style={{ padding: '10px', background: '#fef3c7', borderRadius: '8px', marginBottom: '10px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                      <strong>👨‍🏫 {c.guideId?.name || 'Guide'}</strong>
                      <small>{new Date(c.createdAt).toLocaleString()}</small>
                    </div>
                    <p style={{ margin: '5px 0 0', color: '#92400e' }}>{c.comment}</p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }

  if (selectedEvent) {
    const eventSubmissions = getSubmissionsForEvent(selectedEvent._id);
    const batchMap = batches.reduce((acc, b) => { acc[b._id] = b; return acc; }, {});

    return (
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

        <h3>Batches with Submissions</h3>
        {eventSubmissions.length === 0 ? (
          <div className="card empty-state"><h3>No Submissions</h3><p>No teams have submitted for this event yet</p></div>
        ) : (
          <div className="grid grid-2">
            {eventSubmissions.map(sub => {
              const batch = batchMap[sub.batchId._id];
              if (!batch) return null;
              return (
                <div key={sub._id} className="card" style={{ cursor: 'pointer' }} onClick={() => setSelectedBatch(sub.batchId._id)}>
                  <div className="batch-icon">👥</div>
                  <h3>{batch.teamName}</h3>
                  <p>{batch.year} Year • {batch.branch} • Section {batch.section}</p>
                  <p><strong>Status:</strong> {getStatusBadge(sub.status)}</p>
                  {sub.marks !== null && <p><strong>Marks:</strong> {sub.marks}/{selectedEvent.maxMarks}</p>}
                  <div className="batch-action">View Submissions →</div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    );
  }

  return (
    <div>
      <h2 className="section-title">📅 Project Timeline</h2>
      <p style={{ color: '#666', marginBottom: '20px' }}>Review submissions from your teams across all timeline events</p>
      
      {timelineEvents.length === 0 ? (
        <div className="card empty-state"><h3>No Timeline Events</h3><p>Timeline events will appear here once admin creates them</p></div>
      ) : (
        <div className="timeline-list">
          {timelineEvents.map((event, idx) => {
            const eventSubs = getSubmissionsForEvent(event._id);
            const acceptedCount = eventSubs.filter(s => s.status === 'accepted').length;
            const totalSubs = eventSubs.length;
            const deadlineStatus = getDeadlineStatus(event.deadline);
            
            return (
              <div key={event._id} className="card" style={{ marginBottom: '15px', borderLeft: `4px solid #667eea`, cursor: 'pointer' }} onClick={() => setSelectedEvent(event)}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start' }}>
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '5px' }}>
                      <span style={{ background: '#667eea', color: 'white', borderRadius: '50%', width: '28px', height: '28px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold', fontSize: '14px' }}>{idx + 1}</span>
                      <h3 style={{ margin: 0 }}>{event.title}</h3>
                    </div>
                    <p style={{ color: '#666', fontSize: '14px', margin: '5px 0' }}>{event.description}</p>
                    <p style={{ color: '#888', fontSize: '14px' }}>Submissions: {acceptedCount}/{totalSubs} accepted</p>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <div style={{ color: deadlineStatus.color, fontWeight: '500' }}>{deadlineStatus.text}</div>
                    <small style={{ color: '#888' }}>{new Date(event.deadline).toLocaleDateString()}</small>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

export default GuideTimeline;