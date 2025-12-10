const Batch = require('../models/Batch');
const ProblemStatement = require('../models/ProblemStatement');
const Guide = require('../models/Guide');
const TeamMember = require('../models/TeamMember');

// @desc    Get all batches
// @route   GET /api/batches
exports.getAllBatches = async (req, res) => {
  try {
    const batches = await Batch.find()
      .populate('leaderStudentId', 'name email')
      .populate('problemId', 'title description')
      .populate('optedProblemId', 'title description')
      .populate('coeId', 'name')
      .populate('guideId', 'name email');
    res.status(200).json({ success: true, data: batches });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get student's batch
// @route   GET /api/batches/my-batch
exports.getMyBatch = async (req, res) => {
  try {
    const batch = await Batch.findOne({ leaderStudentId: req.user._id })
      .populate('leaderStudentId', 'name email')
      .populate('problemId', 'title description coeId datasetUrl')
      .populate('optedProblemId', 'title description')
      .populate('coeId', 'name')
      .populate('guideId', 'name email');

    if (!batch) {
      return res.status(404).json({ success: false, message: 'No batch found', data: null });
    }

    const teamMembers = await TeamMember.find({ batchId: batch._id });
    res.status(200).json({ success: true, data: { ...batch.toObject(), teamMembers } });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Create batch (Student only)
// @route   POST /api/batches
exports.createBatch = async (req, res) => {
  try {
    const { teamName } = req.body;
    
    // Check if student already has a batch
    const existingBatch = await Batch.findOne({ leaderStudentId: req.user._id });
    if (existingBatch) {
      return res.status(400).json({ success: false, message: 'You already have a batch' });
    }

    const batch = await Batch.create({
      leaderStudentId: req.user._id,
      teamName
    });

    res.status(201).json({ success: true, data: batch });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Opt for a problem statement (Student selects - pending guide approval)
// @route   POST /api/batches/select-problem
exports.selectProblem = async (req, res) => {
  try {
    const { problemId } = req.body;

    // Get student's batch
    const batch = await Batch.findOne({ leaderStudentId: req.user._id });
    if (!batch) {
      return res.status(404).json({ success: false, message: 'Create a batch first' });
    }

    // Rule 1: Check if batch already opted for a problem
    if (batch.optedProblemId) {
      return res.status(400).json({ success: false, message: 'Batch already opted for a problem' });
    }

    // Get problem statement
    const problem = await ProblemStatement.findById(problemId).populate('coeId');
    if (!problem) {
      return res.status(404).json({ success: false, message: 'Problem statement not found' });
    }

    // Update batch with opted problem (pending approval)
    batch.optedProblemId = problemId;
    batch.coeId = problem.coeId._id;
    batch.allotmentStatus = 'pending';
    await batch.save();

    const updatedBatch = await Batch.findById(batch._id)
      .populate('leaderStudentId', 'name email')
      .populate('optedProblemId', 'title description')
      .populate('coeId', 'name');

    res.status(200).json({ success: true, data: updatedBatch, message: 'Problem opted successfully. Waiting for guide approval.' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get teams that opted for guide's problem statements
// @route   GET /api/batches/opted-teams
exports.getOptedTeams = async (req, res) => {
  try {
    // Get all problem statements created by this guide
    const myProblems = await ProblemStatement.find({ guideId: req.user._id });
    const problemIds = myProblems.map(p => p._id);

    // Get all batches that opted for these problems
    const batches = await Batch.find({
      optedProblemId: { $in: problemIds },
      allotmentStatus: 'pending'
    })
      .populate('leaderStudentId', 'name email')
      .populate('optedProblemId', 'title description')
      .populate('coeId', 'name');

    res.status(200).json({ success: true, data: batches });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Allot problem to a team (Guide approves)
// @route   POST /api/batches/:id/allot
exports.allotProblem = async (req, res) => {
  try {
    const batch = await Batch.findById(req.params.id);
    if (!batch) {
      return res.status(404).json({ success: false, message: 'Batch not found' });
    }

    // Get the problem they opted for
    const problem = await ProblemStatement.findById(batch.optedProblemId);
    if (!problem) {
      return res.status(404).json({ success: false, message: 'Problem not found' });
    }

    // Check if guide owns this problem
    if (problem.guideId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: 'Not authorized' });
    }

    // Check max batches for guide
    const guide = await Guide.findById(req.user._id);
    if (guide.assignedBatches >= guide.maxBatches) {
      return res.status(400).json({ success: false, message: 'You have reached max batch limit' });
    }

    // Allot the problem
    batch.problemId = batch.optedProblemId;
    batch.guideId = req.user._id;
    batch.allotmentStatus = 'allotted';
    batch.status = 'In Progress';
    await batch.save();

    // Update problem count
    problem.selectedBatchCount += 1;
    await problem.save();

    // Update guide's assigned batches
    guide.assignedBatches += 1;
    await guide.save();

    const updatedBatch = await Batch.findById(batch._id)
      .populate('leaderStudentId', 'name email')
      .populate('problemId', 'title description')
      .populate('coeId', 'name')
      .populate('guideId', 'name email');

    res.status(200).json({ success: true, data: updatedBatch, message: 'Team allotted successfully!' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Reject team's problem request
// @route   POST /api/batches/:id/reject
exports.rejectProblem = async (req, res) => {
  try {
    const batch = await Batch.findById(req.params.id);
    if (!batch) {
      return res.status(404).json({ success: false, message: 'Batch not found' });
    }

    const problem = await ProblemStatement.findById(batch.optedProblemId);
    if (problem.guideId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: 'Not authorized' });
    }

    // Reset the batch's opted problem
    batch.optedProblemId = null;
    batch.coeId = null;
    batch.allotmentStatus = 'pending';
    await batch.save();

    res.status(200).json({ success: true, message: 'Request rejected. Team can opt for another problem.' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Update batch status (Guide only)
// @route   PUT /api/batches/:id/status
exports.updateBatchStatus = async (req, res) => {
  try {
    const { status } = req.body;
    const batch = await Batch.findById(req.params.id);
    
    if (!batch) {
      return res.status(404).json({ success: false, message: 'Batch not found' });
    }

    // Check if guide is assigned to this batch
    if (batch.guideId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: 'Not authorized' });
    }

    batch.status = status;
    await batch.save();

    const updatedBatch = await Batch.findById(batch._id)
      .populate('leaderStudentId', 'name email')
      .populate('problemId', 'title description')
      .populate('guideId', 'name email');

    res.status(200).json({ success: true, data: updatedBatch });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get batch details with team members
// @route   GET /api/batches/:id
exports.getBatch = async (req, res) => {
  try {
    const batch = await Batch.findById(req.params.id)
      .populate('leaderStudentId', 'name email')
      .populate('problemId', 'title description coeId datasetUrl')
      .populate('guideId', 'name email');
    
    if (!batch) {
      return res.status(404).json({ success: false, message: 'Batch not found' });
    }

    const teamMembers = await TeamMember.find({ batchId: batch._id });
    res.status(200).json({ success: true, data: { ...batch.toObject(), teamMembers } });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

