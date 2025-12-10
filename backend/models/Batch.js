const mongoose = require('mongoose');

const BatchSchema = new mongoose.Schema({
  leaderStudentId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Student',
    required: [true, 'Leader student is required']
  },
  teamName: {
    type: String,
    required: [true, 'Team name is required'],
    trim: true
  },
  optedProblemId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'ProblemStatement',
    default: null
  },
  problemId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'ProblemStatement',
    default: null
  },
  guideId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Guide',
    default: null
  },
  coeId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'COE',
    default: null
  },
  allotmentStatus: {
    type: String,
    enum: ['pending', 'allotted', 'rejected'],
    default: 'pending'
  },
  status: {
    type: String,
    enum: ['Not Started', 'In Progress', 'Completed'],
    default: 'Not Started'
  }
}, { timestamps: true });

module.exports = mongoose.model('Batch', BatchSchema);

