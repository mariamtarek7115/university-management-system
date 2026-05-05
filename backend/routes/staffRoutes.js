const express = require('express');
const {
	getStaffModuleBootstrap,
	saveTaProfile,
	createStaffProfile,
	deactivateStaffProfile,
	publishSemesterOffering,
	triggerBulkUpload,
} = require('../controllers/staffController');

const router = express.Router();

router.get('/bootstrap', getStaffModuleBootstrap);
router.patch('/ta-profile/:staffId', saveTaProfile);
router.post('/members', createStaffProfile);
router.patch('/members/:staffId/deactivate', deactivateStaffProfile);
router.post('/course-offerings', publishSemesterOffering);
router.post('/bulk-upload', triggerBulkUpload);

module.exports = router;
