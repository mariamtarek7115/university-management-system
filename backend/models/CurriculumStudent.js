const mongoose = require('mongoose');

const curriculumStudentSchema = new mongoose.Schema(
  {
    id: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },
    name: {
      type: String,
      required: true,
      trim: true,
    },
    program: {
      type: String,
      required: true,
      trim: true,
    },
    level: {
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
    cgpa: {
      type: Number,
      required: true,
      min: 0,
      max: 4,
    },
    completedCourses: {
      type: [String],
      default: [],
    },
    registeredCourseIds: {
      type: [String],
      default: [],
    },
    notifications: {
      type: [String],
      default: [],
    },
    gradebook: {
      type: mongoose.Schema.Types.Mixed,
      default: {},
    },
  },
  {
    versionKey: false,
    timestamps: true,
  }
);

module.exports = mongoose.models.CurriculumStudent || mongoose.model('CurriculumStudent', curriculumStudentSchema);