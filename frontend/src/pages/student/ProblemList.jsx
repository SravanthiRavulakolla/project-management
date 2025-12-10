import { useState, useEffect } from 'react';
import * as api from '../../services/api';

function ProblemList({ coeId, coeName, onBack, onProblemSelected }) {
  const [problems, setProblems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selecting, setSelecting] = useState(null);

  useEffect(() => {
    const fetchProblems = async () => {
      try {
        const res = await api.getProblemsByCOE(coeId);
        setProblems(res.data.data);
      } catch (error) {
        console.error('Failed to fetch problems');
      } finally {
        setLoading(false);
      }
    };
    fetchProblems();
  }, [coeId]);

  const handleSelect = async (problemId) => {
    if (!confirm('Are you sure you want to select this problem? This action cannot be undone.')) return;
    setSelecting(problemId);
    try {
      await api.selectProblem(problemId);
      alert('Problem selected successfully!');
      onProblemSelected();
    } catch (error) {
      alert(error.response?.data?.message || 'Failed to select problem');
    } finally {
      setSelecting(null);
    }
  };

  if (loading) return <div>Loading problems...</div>;

  return (
    <div>
      <button onClick={onBack} className="btn btn-secondary" style={{ marginBottom: '20px' }}>
        ← Back to Domains
      </button>

      <h2 className="section-title">📋 Problems in {coeName}</h2>

      {problems.length === 0 ? (
        <div className="empty-state">
          <div className="empty-state-icon">📭</div>
          <h3>No Problems Available</h3>
          <p>No problem statements in this domain yet</p>
        </div>
      ) : (
        <div className="grid grid-2">
          {problems.map((problem) => {
            const isFull = problem.selectedBatchCount >= problem.maxBatches;
            const guideFull = problem.guideId?.assignedBatches >= problem.guideId?.maxBatches;
            const disabled = isFull || guideFull;

            return (
              <div key={problem._id} className="card" style={{ opacity: disabled ? 0.6 : 1 }}>
                <div className="flex-between" style={{ marginBottom: '12px' }}>
                  <h3 style={{ color: '#2d3748' }}>{problem.title}</h3>
                  <span className={`badge ${isFull ? 'badge-danger' : 'badge-success'}`}>
                    {problem.selectedBatchCount}/{problem.maxBatches}
                  </span>
                </div>
                
                <p style={{ color: '#718096', fontSize: '14px', marginBottom: '16px' }}>
                  {problem.description || 'No description available'}
                </p>

                <div style={{ marginBottom: '16px' }}>
                  <p style={{ fontSize: '14px', marginBottom: '4px' }}>
                    <strong>Guide:</strong> {problem.guideId?.name || 'Not assigned'}
                  </p>
                  <p style={{ fontSize: '14px', marginBottom: '4px' }}>
                    <strong>Year:</strong> {problem.year}
                  </p>
                  {guideFull && (
                    <p style={{ fontSize: '12px', color: '#e53e3e' }}>⚠️ Guide has max batches</p>
                  )}
                </div>

                <div className="flex gap-10">
                  {problem.datasetUrl && (
                    <a href={problem.datasetUrl} target="_blank" rel="noopener noreferrer" className="btn btn-secondary" style={{ fontSize: '12px', padding: '8px 16px' }}>
                      📁 Dataset
                    </a>
                  )}
                  <button
                    className="btn btn-primary"
                    style={{ fontSize: '12px', padding: '8px 16px' }}
                    onClick={() => handleSelect(problem._id)}
                    disabled={disabled || selecting === problem._id}
                  >
                    {selecting === problem._id ? 'Selecting...' : disabled ? 'Unavailable' : 'Select Problem'}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

export default ProblemList;

