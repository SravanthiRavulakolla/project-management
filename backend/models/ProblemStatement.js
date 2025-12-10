const mongoose = require('mongoose');

const ProblemStatementSchema = new mongoose.Schema({
  coeId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'COE',
    required: [true, 'COE is required']
  },
  title: {
    type: String,
    required: [true, 'Title is required'],
    trim: true
  },
  description: {
    type: String,
    trim: true
  },
  year: {
    type: Number,
    required: [true, 'Year is required']
  },
  guideId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Guide',
    required: [true, 'Guide is required']
  },
  maxBatches: {
    type: Number,
    default: 10
  },
  selectedBatchCount: {
    type: Number,
    default: 0
  },
  datasetUrl: {
    type: String,
    trim: true
  }
}, { timestamps: true });

module.exports = mongoose.model('ProblemStatement', ProblemStatementSchema);

