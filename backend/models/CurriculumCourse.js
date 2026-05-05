const mongoose = require('mongoose');

const curriculumResourceSchema = new mongoose.Schema(
  {
    label: {
      type: String,
      required: true,
      trim: true,
    },
    type: {
      type: String,
      required: true,
      trim: true,
    },
    url: {
      type: String,
      required: true,
      trim: true,
    },
  },
  {
    _id: false,
  }
);

const curriculumCourseSchema = new mongoose.Schema(
  {
    id: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },
    code: {
      type: String,
      required: true,
      trim: true,
    },
    title: {
      type: String,
      required: true,
      trim: true,
    },
    credits: {
      type: Number,
      required: true,
      min: 0,
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
    prerequisites: {
      type: [String],
      default: [],
    },
    capacity: {
      type: Number,
      required: true,
      min: 0,
    },
    enrolled: {
      type: Number,
      required: true,
      min: 0,
    },
    group: {
      type: String,
      required: true,
      trim: true,
    },
    section: {
      type: String,
      required: true,
      trim: true,
    },
    leadProfessorId: {
      type: String,
      required: true,
      trim: true,
    },
    taIds: {
      type: [String],
      default: [],
    },
    resources: {
      type: [curriculumResourceSchema],
      default: [],
    },
  },
  {
    versionKey: false,
    timestamps: true,
  }
);

module.exports = mongoose.models.CurriculumCourse || mongoose.model('CurriculumCourse', curriculumCourseSchema);