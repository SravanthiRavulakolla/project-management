import { useState, useEffect } from 'react';
import * as api from '../../services/api';

function ProblemList({ coeId, coeName, onBack, onProblemSelected, batch }) {
  const [problems, setProblems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selecting, setSelecting] = useState(null);

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

  useEffect(() => {
    fetchProblems();
  }, [coeId]);

  // Get list of problem IDs already opted by this batch
  const optedProblemIds = batch?.optedProblems?.map(o => o.problemId?._id || o.problemId) || [];

  const handleSelect = async (problemId) => {
    if (!confirm('Are you sure you want to select this problem?')) return;
    setSelecting(problemId);
    try {
      await api.selectProblem(problemId);
      alert('Problem selected successfully! You can select up to 3 problems.');
      onProblemSelected();
      fetchProblems(); // Refresh list
    } catch (error) {
      alert(error.response?.data?.message || 'Failed to select problem');
    } finally {
      setSelecting(null);
    }
  };

  if (loading) return <div>Loading problems...</div>;

  // Filter out already allotted problems (selectedBatchCount >= 1 means already assigned)
  const availableProblems = problems.filter(p => p.selectedBatchCount < 1);

  return (
    <div>
      <button onClick={onBack} className="btn btn-secondary" style={{ marginBottom: '20px' }}>
        ← Back to Domains
      </button>

      <h2 className="section-title">📋 Problems in {coeName}</h2>

      {batch?.optedProblems?.filter(o => o.status === 'pending').length > 0 && (
        <div className="card" style={{ marginBottom: '20px', background: '#ebf8ff', border: '1px solid #90cdf4' }}>
          <p style={{ margin: 0, color: '#2b6cb0' }}>
            ℹ️ You have {batch.optedProblems.filter(o => o.status === 'pending').length} pending request(s).
            You can select up to {3 - batch.optedProblems.filter(o => o.status === 'pending').length} more problem(s).
          </p>
        </div>
      )}

      {availableProblems.length === 0 ? (
        <div className="empty-state">
          <div className="empty-state-icon">📭</div>
          <h3>No Problems Available</h3>
          <p>All problem statements in this domain are already assigned</p>
        </div>
      ) : (
        <div className="grid grid-2">
          {availableProblems.map((problem) => {
            const guideFull = problem.guideId?.assignedBatches >= problem.guideId?.maxBatches;
            const alreadyOpted = optedProblemIds.some(id => id?.toString() === problem._id?.toString());
            const disabled = guideFull || alreadyOpted;

            return (
              <div key={problem._id} className="card" style={{ opacity: disabled ? 0.6 : 1 }}>
                <div className="flex-between" style={{ marginBottom: '12px' }}>
                  <h3 style={{ color: '#2d3748' }}>{problem.title}</h3>
                  {alreadyOpted && (
                    <span className="badge badge-warning">Already Opted</span>
                  )}
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
                    {selecting === problem._id ? 'Selecting...' : alreadyOpted ? 'Already Opted' : guideFull ? 'Unavailable' : 'Select Problem'}
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

