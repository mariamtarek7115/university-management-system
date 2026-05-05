const mongoose = require('mongoose');

const staffCourseSchema = new mongoose.Schema(
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
    description: {
      type: String,
      required: true,
      trim: true,
    },
    sourceCourseId: {
      type: String,
      trim: true,
      default: '',
    },
    program: {
      type: String,
      trim: true,
      default: '',
    },
    level: {
      type: String,
      trim: true,
      default: '',
    },
    leadProfessorId: {
      type: String,
      required: true,
      trim: true,
    },
    assignedTAIds: {
      type: [String],
      default: [],
    },
    published: {
      type: Boolean,
      default: false,
    },
  },
  {
    versionKey: false,
    timestamps: true,
  }
);

module.exports = mongoose.models.StaffCourse || mongoose.model('StaffCourse', staffCourseSchema);