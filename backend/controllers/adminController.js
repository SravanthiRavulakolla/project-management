const COE = require('../models/COE');
const ProblemStatement = require('../models/ProblemStatement');
const Guide = require('../models/Guide');
const Batch = require('../models/Batch');
const Student = require('../models/Student');
const Admin = require('../models/Admin');

// @desc    Get admin dashboard stats
// @route   GET /api/admin/dashboard
exports.getDashboard = async (req, res) => {
  try {
    const totalCOEs = await COE.countDocuments();
    const totalProblems = await ProblemStatement.countDocuments();
    const totalGuides = await Guide.countDocuments();
    const totalBatches = await Batch.countDocuments();
    const totalStudents = await Student.countDocuments();

    const batchesByStatus = await Batch.aggregate([
      { $group: { _id: '$status', count: { $sum: 1 } } }
    ]);

    res.status(200).json({
      success: true,
      data: {
        totalCOEs,
        totalProblems,
        totalGuides,
        totalBatches,
        totalStudents,
        batchesByStatus
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get all data for admin overview
// @route   GET /api/admin/overview
exports.getOverview = async (req, res) => {
  try {
    const coes = await COE.find();
    
    const problems = await ProblemStatement.find()
      .populate('coeId', 'name')
      .populate('guideId', 'name email assignedBatches maxBatches');
    
    const guides = await Guide.find().select('-password');
    
    const batches = await Batch.find()
      .populate('leaderStudentId', 'name email')
      .populate('problemId', 'title')
      .populate('guideId', 'name email');

    res.status(200).json({
      success: true,
      data: { coes, problems, guides, batches }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Create admin (Initial setup)
// @route   POST /api/admin/create
exports.createAdmin = async (req, res) => {
  try {
    const { name, email, password } = req.body;
    
    const existingAdmin = await Admin.findOne({ email });
    if (existingAdmin) {
      return res.status(400).json({ success: false, message: 'Admin already exists' });
    }

    const admin = await Admin.create({ name, email, password });
    res.status(201).json({ 
      success: true, 
      data: { id: admin._id, name: admin.name, email: admin.email, role: 'admin' }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get batch-guide mapping
// @route   GET /api/admin/batch-guide-mapping
exports.getBatchGuideMapping = async (req, res) => {
  try {
    const batches = await Batch.find({ guideId: { $ne: null } })
      .populate('leaderStudentId', 'name email')
      .populate('problemId', 'title')
      .populate('guideId', 'name email');

    const guides = await Guide.find().select('-password');

    const mapping = guides.map(guide => ({
      guide: { id: guide._id, name: guide.name, email: guide.email },
      assignedBatches: guide.assignedBatches,
      maxBatches: guide.maxBatches,
      batches: batches.filter(b => b.guideId && b.guideId._id.toString() === guide._id.toString())
    }));

    res.status(200).json({ success: true, data: mapping });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

