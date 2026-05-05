const {
  getCurriculumBootstrap,
  createRegistrationRequest,
  updateRegistrationRequestStatus,
  postCourseGrades,
} = require('../data/curriculumStore');

async function getCurriculumModuleBootstrap(req, res) {
  try {
    const curriculumState = await getCurriculumBootstrap();
    return res.json(curriculumState);
  } catch (error) {
    return res.status(500).json({ message: 'Unable to load curriculum module data.', detail: error.message });
  }
}

async function submitRegistrationRequest(req, res) {
  const { studentId, courseId, group, section } = req.body;

  if (!studentId?.trim() || !courseId?.trim() || !group?.trim() || !section?.trim()) {
    return res.status(400).json({ message: 'studentId, courseId, group, and section are required.' });
  }

  try {
    const result = await createRegistrationRequest({ studentId, courseId, group, section });
    if (result.error) {
      return res.status(400).json({ message: result.error });
    }

    return res.status(201).json(result.request);
  } catch (error) {
    return res.status(500).json({ message: 'Unable to submit registration request.', detail: error.message });
  }
}

async function changeRegistrationRequestStatus(req, res) {
  const { requestId } = req.params;
  const { status } = req.body;

  if (!requestId || !status?.trim()) {
    return res.status(400).json({ message: 'requestId and status are required.' });
  }

  try {
    const result = await updateRegistrationRequestStatus(requestId, status);
    if (result.error) {
      return res.status(400).json({ message: result.error });
    }

    return res.json(result);
  } catch (error) {
    return res.status(500).json({ message: 'Unable to update registration request.', detail: error.message });
  }
}

async function saveCourseGrades(req, res) {
  const { studentId, courseId, midterm, participation, final } = req.body;

  if (!studentId?.trim() || !courseId?.trim()) {
    return res.status(400).json({ message: 'studentId and courseId are required.' });
  }

  try {
    const result = await postCourseGrades({ studentId, courseId, midterm, participation, final });
    if (result.error) {
      return res.status(400).json({ message: result.error });
    }

    return res.json(result);
  } catch (error) {
    return res.status(500).json({ message: 'Unable to post grades.', detail: error.message });
  }
}

module.exports = {
  getCurriculumModuleBootstrap,
  submitRegistrationRequest,
  changeRegistrationRequestStatus,
  saveCourseGrades,
};