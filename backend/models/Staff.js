const mongoose = require('mongoose');

const staffSchema = new mongoose.Schema(
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
		email: {
			type: String,
			required: true,
			trim: true,
		},
		department: {
			type: String,
			required: true,
			trim: true,
		},
		phone: {
			type: String,
			default: 'Not added yet',
			trim: true,
		},
		officeHours: {
			type: String,
			default: 'Not added yet',
			trim: true,
		},
		officeLocation: {
			type: String,
			default: 'Not added yet',
			trim: true,
		},
		active: {
			type: Boolean,
			default: true,
		},
		courses: {
			type: [String],
			default: [],
		},
		duties: {
			type: [String],
			default: [],
		},
		bio: {
			type: String,
			default: 'Staff profile created by HR.',
			trim: true,
		},
	},
	{
		versionKey: false,
		timestamps: true,
	}
);

module.exports = mongoose.models.Staff || mongoose.model('Staff', staffSchema);
