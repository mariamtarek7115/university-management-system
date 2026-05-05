const express = require('express');
const {
  getCurriculumModuleBootstrap,
  submitRegistrationRequest,
  changeRegistrationRequestStatus,
  saveCourseGrades,
} = require('../controllers/curriculumController');

const router = express.Router();

router.get('/bootstrap', getCurriculumModuleBootstrap);
router.post('/requests', submitRegistrationRequest);
router.patch('/requests/:requestId/status', changeRegistrationRequestStatus);
router.patch('/grades', saveCourseGrades);

module.exports = router;