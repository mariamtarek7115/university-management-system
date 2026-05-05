const mongoose = require('mongoose');

const communityUserSchema = new mongoose.Schema(
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
    role: {
      type: String,
      required: true,
      trim: true,
    },
    department: {
      type: String,
      trim: true,
      default: '',
    },
  },
  {
    versionKey: false,
    timestamps: true,
  }
);

module.exports = mongoose.models.CommunityUser || mongoose.model('CommunityUser', communityUserSchema);
