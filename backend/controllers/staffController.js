const {
	getStaffBootstrap,
	updateTaProfile,
	createStaffMember,
	deactivateStaffMember,
	publishCourseOffering,
	mockBulkUpload,
} = require('../data/staffStore');

async function getStaffModuleBootstrap(req, res) {
	try {
		const staffState = await getStaffBootstrap();
		return res.json(staffState);
	} catch (error) {
		return res.status(500).json({ message: 'Unable to load staff module data.', detail: error.message });
	}
}

async function saveTaProfile(req, res) {
	const { staffId } = req.params;
	const { email, phone, officeHours, officeLocation } = req.body;

	if (!staffId || !email?.trim() || !phone?.trim() || !officeHours?.trim() || !officeLocation?.trim()) {
		return res.status(400).json({ message: 'staffId, email, phone, officeHours, and officeLocation are required.' });
	}

	try {
		const result = await updateTaProfile(staffId, { email, phone, officeHours, officeLocation });
		if (result.error) {
			return res.status(404).json({ message: result.error });
		}

		return res.json(result.staffMember);
	} catch (error) {
		return res.status(500).json({ message: 'Unable to update TA profile.', detail: error.message });
	}
}

async function createStaffProfile(req, res) {
	const { name, role, email, department } = req.body;

	if (!name?.trim() || !role?.trim() || !email?.trim() || !department?.trim()) {
		return res.status(400).json({ message: 'name, role, email, and department are required.' });
	}

	try {
		const result = await createStaffMember(req.body);
		return res.status(201).json(result.staffMember);
	} catch (error) {
		return res.status(500).json({ message: 'Unable to create staff profile.', detail: error.message });
	}
}

async function deactivateStaffProfile(req, res) {
	const { staffId } = req.params;

	if (!staffId) {
		return res.status(400).json({ message: 'staffId is required.' });
	}

	try {
		const result = await deactivateStaffMember(staffId);
		if (result.error) {
			return res.status(404).json({ message: result.error });
		}

		return res.json(result.staffMember);
	} catch (error) {
		return res.status(500).json({ message: 'Unable to deactivate staff profile.', detail: error.message });
	}
}

async function triggerBulkUpload(req, res) {
	const result = await mockBulkUpload();
	return res.json(result);
}

async function publishSemesterOffering(req, res) {
	const { sourceCourseId, code, title, program, level, leadProfessorId, taIds } = req.body;

	if (!code?.trim() || !title?.trim() || !program?.trim() || !level?.trim() || !leadProfessorId?.trim()) {
		return res.status(400).json({
			message: 'code, title, program, level, and leadProfessorId are required.',
		});
	}

	try {
		const result = await publishCourseOffering({
			sourceCourseId,
			code,
			title,
			program,
			level,
			leadProfessorId,
			taIds,
			description: req.body.description,
		});

		if (result.error) {
			return res.status(400).json({ message: result.error });
		}

		return res.status(201).json(result.offering);
	} catch (error) {
		return res.status(500).json({ message: 'Unable to publish semester offering.', detail: error.message });
	}
}

module.exports = {
	getStaffModuleBootstrap,
	saveTaProfile,
	createStaffProfile,
	deactivateStaffProfile,
	publishSemesterOffering,
	triggerBulkUpload,
};
