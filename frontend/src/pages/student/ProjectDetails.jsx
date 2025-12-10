function ProjectDetails({ batch, isPending, isAllotted }) {
  const hasOptedProblem = batch.optedProblemId;
  const hasAllottedProblem = batch.problemId;

  return (
    <div>
      <h2 className="section-title">📊 Project Overview</h2>

      <div className="grid grid-2">
        <div className="card" style={{ background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', color: 'white' }}>
          <h3 style={{ marginBottom: '16px', opacity: 0.9 }}>🏷️ Team Information</h3>
          <div style={{ fontSize: '24px', fontWeight: '700', marginBottom: '8px' }}>{batch.teamName}</div>
          <p style={{ opacity: 0.8 }}>Team Leader: {batch.leaderStudentId?.name}</p>
          <p style={{ opacity: 0.8 }}>Email: {batch.leaderStudentId?.email}</p>
          {batch.coeId && <p style={{ opacity: 0.8, marginTop: '8px' }}>COE: {batch.coeId?.name || batch.coeId}</p>}
        </div>

        <div className="card">
          <h3 style={{ marginBottom: '16px', color: '#2d3748' }}>📈 Status</h3>
          <div style={{ fontSize: '32px', marginBottom: '8px' }}>
            {isPending && '⏳'}
            {isAllotted && batch.status === 'Not Started' && '📝'}
            {isAllotted && batch.status === 'In Progress' && '🔄'}
            {isAllotted && batch.status === 'Completed' && '✅'}
            {!isPending && !isAllotted && '🔍'}
          </div>
          <span className={`badge badge-${isAllotted && batch.status === 'Completed' ? 'success' : isAllotted && batch.status === 'In Progress' ? 'warning' : isPending ? 'pending' : 'info'}`} style={{ fontSize: '16px', padding: '8px 16px' }}>
            {isPending ? 'Waiting for Approval' : isAllotted ? batch.status : 'Select Problem'}
          </span>
        </div>
      </div>

      {isPending && hasOptedProblem && (
        <div className="card" style={{ marginTop: '20px', background: '#fffbeb', border: '2px solid #f59e0b' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            <div style={{ fontSize: '48px' }}>⏳</div>
            <div>
              <h3 style={{ color: '#b45309', marginBottom: '8px' }}>Waiting for Guide Approval</h3>
              <p style={{ color: '#92400e' }}>You have opted for: <strong>{batch.optedProblemId?.title}</strong></p>
              <p style={{ color: '#92400e', fontSize: '14px' }}>The guide will review your request and allot the problem to your team.</p>
            </div>
          </div>
        </div>
      )}

      {isAllotted && hasAllottedProblem && (
        <div className="grid grid-2" style={{ marginTop: '20px' }}>
          <div className="card">
            <h3 style={{ marginBottom: '16px', color: '#2d3748' }}>📋 Allotted Problem</h3>
            <h4 style={{ color: '#667eea', marginBottom: '12px' }}>{batch.problemId?.title}</h4>
            <p style={{ color: '#718096', fontSize: '14px', marginBottom: '16px' }}>
              {batch.problemId?.description || 'No description'}
            </p>
            {batch.problemId?.datasetUrl && (
              <a href={batch.problemId.datasetUrl} target="_blank" rel="noopener noreferrer" className="btn btn-secondary" style={{ fontSize: '12px' }}>
                📁 View Dataset
              </a>
            )}
          </div>

          <div className="card">
            <h3 style={{ marginBottom: '16px', color: '#2d3748' }}>👨‍🏫 Your Guide</h3>
            <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
              <div style={{ fontSize: '48px' }}>👤</div>
              <div>
                <h4 style={{ color: '#2d3748', marginBottom: '4px' }}>{batch.guideId?.name}</h4>
                <p style={{ color: '#718096', fontSize: '14px' }}>{batch.guideId?.email}</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {!hasOptedProblem && !hasAllottedProblem && (
        <div className="card" style={{ marginTop: '20px', textAlign: 'center', padding: '40px' }}>
          <div style={{ fontSize: '64px', marginBottom: '16px' }}>🔍</div>
          <h3 style={{ color: '#2d3748', marginBottom: '8px' }}>No Problem Selected Yet</h3>
          <p style={{ color: '#718096' }}>Go to the "Select Problem" tab to choose a problem statement for your project.</p>
        </div>
      )}
    </div>
  );
}

export default ProjectDetails;

