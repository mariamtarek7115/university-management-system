const mongoose = require('mongoose');

const curriculumRequestSchema = new mongoose.Schema(
  {
    id: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },
    studentName: {
      type: String,
      required: true,
      trim: true,
    },
    studentId: {
      type: String,
      required: true,
      trim: true,
    },
    courseId: {
      type: String,
      required: true,
      trim: true,
    },
    gpa: {
      type: Number,
      required: true,
      min: 0,
      max: 4,
    },
    status: {
      type: String,
      required: true,
      trim: true,
      enum: ['Pending', 'Accept', 'Reject'],
    },
    message: {
      type: String,
      required: true,
      trim: true,
    },
  },
  {
    versionKey: false,
    timestamps: true,
  }
);

module.exports = mongoose.models.CurriculumRequest || mongoose.model('CurriculumRequest', curriculumRequestSchema);