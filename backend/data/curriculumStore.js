const CurriculumCourse = require('../models/CurriculumCourse');
const CurriculumStudent = require('../models/CurriculumStudent');
const CurriculumRequest = require('../models/CurriculumRequest');

const defaultCourses = [
  {
    id: 'csc201',
    code: 'CSC 201',
    title: 'Database Systems',
    credits: 3,
    program: 'Computer Science',
    level: '200',
    prerequisites: ['CSC 102'],
    capacity: 40,
    enrolled: 34,
    group: 'Group A',
    section: 'Section 1',
    leadProfessorId: 'staff-001',
    taIds: ['staff-002'],
    resources: [
      { label: 'Lecture slides', type: 'Microsoft 365', url: 'https://m365.example.com/csc201/slides' },
      { label: 'Lab sheet', type: 'Download', url: 'https://m365.example.com/csc201/lab-sheet' },
    ],
  },
  {
    id: 'csc245',
    code: 'CSC 245',
    title: 'Software Engineering Fundamentals',
    credits: 2,
    program: 'Computer Science',
    level: '200',
    prerequisites: ['CSC 201'],
    capacity: 35,
    enrolled: 24,
    group: 'Group B',
    section: 'Section 2',
    leadProfessorId: 'staff-001',
    taIds: ['staff-002'],
    resources: [
      { label: 'Agile playbook', type: 'Microsoft 365', url: 'https://m365.example.com/csc245/playbook' },
    ],
  },
  {
    id: 'csc302',
    code: 'CSC 302',
    title: 'Computer Networks',
    credits: 3,
    program: 'Computer Science',
    level: '300',
    prerequisites: ['CSC 201'],
    capacity: 45,
    enrolled: 26,
    group: 'Group A',
    section: 'Section 1',
    leadProfessorId: 'staff-001',
    taIds: ['staff-004'],
    resources: [
      { label: 'Network lab manual', type: 'Download', url: 'https://example.com/csc302/labs' },
    ],
  },
  {
    id: 'csc315',
    code: 'CSC 315',
    title: 'Operating Systems',
    credits: 2,
    program: 'Computer Science',
    level: '300',
    prerequisites: ['CSC 201'],
    capacity: 38,
    enrolled: 17,
    group: 'Group C',
    section: 'Section 2',
    leadProfessorId: 'staff-003',
    taIds: ['staff-002'],
    resources: [
      { label: 'Kernel notes', type: 'Microsoft 365', url: 'https://example.com/csc315/notes' },
    ],
  },
  {
    id: 'bus310',
    code: 'BUS 310',
    title: 'Strategic Management',
    credits: 3,
    program: 'Business Administration',
    level: '300',
    prerequisites: ['BUS 210'],
    capacity: 50,
    enrolled: 29,
    group: 'Group C',
    section: 'Section 1',
    leadProfessorId: 'staff-003',
    taIds: [],
    resources: [
      { label: 'Case study folder', type: 'External link', url: 'https://example.com/bus310/cases' },
    ],
  },
  {
    id: 'eng330',
    code: 'ENG 330',
    title: 'Control Systems',
    credits: 2,
    program: 'Engineering',
    level: '300',
    prerequisites: ['ENG 305'],
    capacity: 32,
    enrolled: 20,
    group: 'Group B',
    section: 'Section 1',
    leadProfessorId: 'staff-003',
    taIds: ['staff-004'],
    resources: [
      { label: 'Controller workbook', type: 'Download', url: 'https://example.com/eng330/workbook' },
    ],
  },
  {
    id: 'eng410',
    code: 'ENG 410',
    title: 'Embedded Systems Workshop',
    credits: 3,
    program: 'Engineering',
    level: '400',
    prerequisites: ['ENG 305'],
    capacity: 25,
    enrolled: 18,
    group: 'Group D',
    section: 'Section 3',
    leadProfessorId: 'staff-003',
    taIds: ['staff-004'],
    resources: [
      { label: 'Hardware checklist', type: 'Download', url: 'https://example.com/eng410/checklist' },
    ],
  },
  {
    id: 'eng420',
    code: 'ENG 420',
    title: 'Industrial Automation',
    credits: 2,
    program: 'Engineering',
    level: '400',
    prerequisites: ['ENG 305'],
    capacity: 24,
    enrolled: 11,
    group: 'Group D',
    section: 'Section 2',
    leadProfessorId: 'staff-003',
    taIds: ['staff-004'],
    resources: [
      { label: 'Automation sandbox', type: 'External link', url: 'https://example.com/eng420/sandbox' },
    ],
  },
];

const defaultStudents = [
  {
    id: 'student-1',
    name: 'Amina Yusuf',
    program: 'Computer Science',
    level: '300',
    gpa: 3.2,
    cgpa: 3.18,
    completedCourses: ['CSC 102', 'CSC 201', 'BUS 210'],
    registeredCourseIds: ['csc201', 'csc302'],
    notifications: ['Your previous registration request for CSC 201 was approved.'],
    gradebook: {
      csc201: { midterm: 16, participation: 8, final: 58, posted: true },
      csc302: { midterm: 0, participation: 0, final: 0, posted: false },
    },
  },
  {
    id: 'student-2',
    name: 'Samuel Kariuki',
    program: 'Engineering',
    level: '400',
    gpa: 1.9,
    cgpa: 2.05,
    completedCourses: ['ENG 305'],
    registeredCourseIds: ['eng330', 'eng410'],
    notifications: ['Advisor meeting recommended before finalizing registration.'],
    gradebook: {
      eng330: { midterm: 12, participation: 8, final: 0, posted: false },
      eng410: { midterm: 11, participation: 7, final: 44, posted: false },
    },
  },
  {
    id: 'student-3',
    name: 'Grace Njeri',
    program: 'Business Administration',
    level: '300',
    gpa: 3.45,
    cgpa: 3.33,
    completedCourses: ['BUS 210'],
    registeredCourseIds: ['bus310'],
    notifications: ['Your course plan is ready for advisor review.'],
    gradebook: {
      bus310: { midterm: 15, participation: 9, final: 0, posted: false },
    },
  },
  {
    id: 'student-4',
    name: 'Brian Mwangi',
    program: 'Computer Science',
    level: '200',
    gpa: 2.76,
    cgpa: 2.81,
    completedCourses: ['CSC 102'],
    registeredCourseIds: ['csc201'],
    notifications: ['Lab access for CSC 201 has been enabled.'],
    gradebook: {
      csc201: { midterm: 14, participation: 7, final: 0, posted: false },
    },
  },
];

const defaultRequests = [
  {
    id: 'req-001',
    studentName: 'Amina Yusuf',
    studentId: 'student-1',
    courseId: 'csc315',
    gpa: 3.2,
    status: 'Pending',
    message: 'Requesting CSC 315 with Group C / Section 2',
  },
  {
    id: 'req-002',
    studentName: 'Samuel Kariuki',
    studentId: 'student-2',
    courseId: 'eng420',
    gpa: 1.9,
    status: 'Pending',
    message: 'Needs approval due to GPA threshold review.',
  },
];

function getGpaLimits(gpa) {
  if (gpa < 2) {
    return { maxCreditHours: 15 };
  }

  if (gpa <= 3) {
    return { maxCreditHours: 18 };
  }

  return { maxCreditHours: 21 };
}

function clampScore(value, min, max) {
  if (Number.isNaN(value)) {
    return min;
  }

  return Math.min(Math.max(value, min), max);
}

function toCoursePayload(course) {
  return {
    id: course.id,
    code: course.code,
    title: course.title,
    credits: course.credits,
    program: course.program,
    level: course.level,
    prerequisites: course.prerequisites,
    capacity: course.capacity,
    enrolled: course.enrolled,
    group: course.group,
    section: course.section,
    leadProfessorId: course.leadProfessorId,
    taIds: course.taIds,
    resources: course.resources,
  };
}

function toStudentPayload(student) {
  return {
    id: student.id,
    name: student.name,
    program: student.program,
    level: student.level,
    gpa: student.gpa,
    cgpa: student.cgpa,
    completedCourses: student.completedCourses,
    registeredCourseIds: student.registeredCourseIds,
    notifications: student.notifications,
    gradebook: student.gradebook || {},
  };
}

function toRequestPayload(request) {
  return {
    id: request.id,
    studentName: request.studentName,
    studentId: request.studentId,
    courseId: request.courseId,
    gpa: request.gpa,
    status: request.status,
    message: request.message,
  };
}

async function ensureCurriculumSeedData() {
  const [existingCourseIds, existingStudentIds, requestCount] = await Promise.all([
    CurriculumCourse.find().select({ _id: 0, id: 1 }).lean(),
    CurriculumStudent.find().select({ _id: 0, id: 1 }).lean(),
    CurriculumRequest.countDocuments(),
  ]);

  const knownCourseIds = new Set(existingCourseIds.map((item) => item.id));
  const knownStudentIds = new Set(existingStudentIds.map((item) => item.id));
  const missingCourses = defaultCourses.filter((course) => !knownCourseIds.has(course.id));
  const missingStudents = defaultStudents.filter((student) => !knownStudentIds.has(student.id));

  if (missingCourses.length) {
    await CurriculumCourse.insertMany(missingCourses);
  }

  if (missingStudents.length) {
    await CurriculumStudent.insertMany(missingStudents);
  }

  if (requestCount === 0) {
    await CurriculumRequest.insertMany(defaultRequests);
  }
}

async function getCurriculumBootstrap() {
  const [courses, students, requests] = await Promise.all([
    CurriculumCourse.find().sort({ code: 1 }).select({ _id: 0 }).lean(),
    CurriculumStudent.find().sort({ name: 1 }).select({ _id: 0 }).lean(),
    CurriculumRequest.find().sort({ createdAt: -1 }).select({ _id: 0 }).lean(),
  ]);

  return {
    courseCatalog: courses.map(toCoursePayload),
    studentProfiles: students.map(toStudentPayload),
    registrationRequests: requests.map(toRequestPayload),
  };
}

async function createRegistrationRequest(payload) {
  const student = await CurriculumStudent.findOne({ id: payload.studentId });
  if (!student) {
    return { error: 'Student profile could not be found.' };
  }

  const course = await CurriculumCourse.findOne({ id: payload.courseId });
  if (!course) {
    return { error: 'Course could not be found.' };
  }

  if (student.registeredCourseIds.includes(course.id)) {
    return { error: `You are already registered for ${course.code}.` };
  }

  const existingRequest = await CurriculumRequest.findOne({
    studentId: payload.studentId,
    courseId: payload.courseId,
    status: 'Pending',
  });

  if (existingRequest) {
    return { error: `A registration request for ${course.code} is already pending review.` };
  }

  const prerequisitesMet = course.prerequisites.every((prerequisite) => student.completedCourses.includes(prerequisite));
  if (!prerequisitesMet) {
    return { error: 'Registration blocked: prerequisite courses are not complete.' };
  }

  if (course.enrolled >= course.capacity) {
    return { error: 'Registration blocked: selected group or section is already full.' };
  }

  const registeredCourses = await CurriculumCourse.find({ id: { $in: student.registeredCourseIds } }).select({ credits: 1, _id: 0 }).lean();
  const currentCredits = registeredCourses.reduce((sum, item) => sum + item.credits, 0);
  const nextCredits = currentCredits + course.credits;
  const limits = getGpaLimits(student.gpa);

  if (nextCredits > limits.maxCreditHours) {
    return { error: 'Registration blocked: GPA-based credit-hour limit exceeded.' };
  }

  const request = await CurriculumRequest.create({
    id: `req-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    studentName: student.name,
    studentId: student.id,
    courseId: course.id,
    gpa: student.gpa,
    status: 'Pending',
    message: `Requested ${course.code} with ${payload.group} / ${payload.section}`,
  });

  return { request: toRequestPayload(request) };
}

async function updateRegistrationRequestStatus(requestId, status) {
  const request = await CurriculumRequest.findOne({ id: requestId });
  if (!request) {
    return { error: 'Registration request could not be found.' };
  }

  const [student, course] = await Promise.all([
    CurriculumStudent.findOne({ id: request.studentId }),
    CurriculumCourse.findOne({ id: request.courseId }),
  ]);

  if (!student || !course) {
    return { error: 'Unable to resolve the student or course for this registration request.' };
  }

  request.status = status;
  await request.save();

  if (status === 'Accept' && !student.registeredCourseIds.includes(course.id)) {
    student.registeredCourseIds = [...student.registeredCourseIds, course.id];
    course.enrolled += 1;
  }

  student.notifications = [
    status === 'Accept'
      ? `Registration request for ${course.code} accepted and synced to LMS, Attendance, and Staff modules.`
      : `Registration request for ${course.code} was rejected by the instructor.`,
    ...student.notifications,
  ];

  await Promise.all([student.save(), course.save()]);

  return {
    request: toRequestPayload(request),
    student: toStudentPayload(student),
    course: toCoursePayload(course),
  };
}

async function postCourseGrades(payload) {
  const student = await CurriculumStudent.findOne({ id: payload.studentId });
  if (!student) {
    return { error: 'Student profile could not be found.' };
  }

  const course = await CurriculumCourse.findOne({ id: payload.courseId });
  if (!course) {
    return { error: 'Course could not be found.' };
  }

  const midterm = clampScore(Number(payload.midterm), 0, 20);
  const participation = clampScore(Number(payload.participation), 0, 10);
  const final = clampScore(Number(payload.final), 0, 70);
  const weightedScore = midterm + participation + final;
  const projectedSemesterGpa = Number((Math.min(weightedScore / 25, 4)).toFixed(2));
  const projectedCgpa = Number((Math.min((student.cgpa + projectedSemesterGpa) / 2, 4)).toFixed(2));
  const academicStanding = projectedSemesterGpa < 2 ? 'Academic Probation' : projectedSemesterGpa > 3.6 ? 'Honors' : 'Good Standing';

  student.gpa = projectedSemesterGpa;
  student.cgpa = projectedCgpa;
  student.gradebook = {
    ...(student.gradebook || {}),
    [course.id]: {
      midterm,
      participation,
      final,
      posted: true,
    },
  };
  student.notifications = [
    `Grades for ${course.code} have been posted. Current standing: ${academicStanding}.`,
    ...student.notifications,
  ];

  await student.save();

  return {
    student: toStudentPayload(student),
    postedGrade: student.gradebook[course.id],
  };
}

module.exports = {
  ensureCurriculumSeedData,
  getCurriculumBootstrap,
  createRegistrationRequest,
  updateRegistrationRequestStatus,
  postCourseGrades,
};