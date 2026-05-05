const Staff = require('../models/Staff');
const StaffCourse = require('../models/StaffCourse');

const defaultStaffMembers = [
  {
    id: 'staff-001',
    name: 'Dr. James Okoro',
    role: 'Professor',
    email: 'j.okoro@ums.edu',
    department: 'Computer Science',
    phone: '+234 801 200 3001',
    officeHours: 'Mon & Wed, 2:00 PM - 4:00 PM',
    officeLocation: 'Science Block, Room 214',
    active: true,
    courses: ['course-201', 'course-245'],
    duties: [],
    bio: 'Leads database systems, project supervision, and academic advising.',
  },
  {
    id: 'staff-002',
    name: 'Fatima Bello',
    role: 'Teaching Assistant',
    email: 'f.bello@ums.edu',
    department: 'Computer Science',
    phone: '+234 801 200 3002',
    officeHours: 'Tue & Thu, 11:00 AM - 1:00 PM',
    officeLocation: 'Innovation Lab, Desk 4',
    active: true,
    courses: ['course-201', 'course-330'],
    duties: ['Lab supervision', 'Recitation support', 'Weekly grading review'],
    bio: 'Supports programming labs, reviews coursework, and helps students during recitations.',
  },
  {
    id: 'staff-003',
    name: 'Prof. Lillian Mensah',
    role: 'Professor',
    email: 'l.mensah@ums.edu',
    department: 'Business Administration',
    phone: '+234 801 200 3003',
    officeHours: 'Fri, 9:00 AM - 12:00 PM',
    officeLocation: 'Management Building, Room 108',
    active: true,
    courses: ['course-310'],
    duties: [],
    bio: 'Heads strategic management teaching and faculty mentoring.',
  },
  {
    id: 'staff-004',
    name: 'Daniel Otieno',
    role: 'Teaching Assistant',
    email: 'd.otieno@ums.edu',
    department: 'Engineering',
    phone: '+234 801 200 3004',
    officeHours: 'Wed, 1:00 PM - 3:00 PM',
    officeLocation: 'Engineering Annex, Lab 2',
    active: true,
    courses: ['course-410'],
    duties: ['Workshop preparation', 'Equipment setup'],
    bio: 'Coordinates workshop logistics and student lab access.',
  },
];

const defaultCourses = [
  {
    id: 'course-201',
    sourceCourseId: 'csc201',
    code: 'CSC 201',
    title: 'Database Systems',
    description: 'Covers relational design, SQL, normalization, and transaction fundamentals.',
    program: 'Computer Science',
    level: '200',
    leadProfessorId: 'staff-001',
    assignedTAIds: ['staff-002'],
    published: true,
  },
  {
    id: 'course-245',
    sourceCourseId: 'csc245',
    code: 'CSC 245',
    title: 'Software Engineering Fundamentals',
    description: 'Introduces team delivery, software lifecycle, agile methods, and testing.',
    program: 'Computer Science',
    level: '200',
    leadProfessorId: 'staff-001',
    assignedTAIds: [],
    published: true,
  },
  {
    id: 'course-310',
    sourceCourseId: 'bus310',
    code: 'BUS 310',
    title: 'Strategic Management',
    description: 'Explores business strategy, market positioning, and organizational planning.',
    program: 'Business Administration',
    level: '300',
    leadProfessorId: 'staff-003',
    assignedTAIds: [],
    published: true,
  },
  {
    id: 'course-330',
    sourceCourseId: 'csc330',
    code: 'CSC 330',
    title: 'Data Structures Lab',
    description: 'Hands-on lab sessions focused on implementation, debugging, and performance.',
    program: 'Computer Science',
    level: '300',
    leadProfessorId: 'staff-001',
    assignedTAIds: ['staff-002'],
    published: true,
  },
  {
    id: 'course-410',
    sourceCourseId: 'eng410',
    code: 'ENG 410',
    title: 'Embedded Systems Workshop',
    description: 'Practical design of embedded prototypes, testing, and systems integration.',
    program: 'Engineering',
    level: '400',
    leadProfessorId: 'staff-003',
    assignedTAIds: ['staff-004'],
    published: true,
  },
];

function generateStaffId() {
  return `staff-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

function toStaffPayload(staffMember) {
  return {
    id: staffMember.id,
    name: staffMember.name,
    role: staffMember.role,
    email: staffMember.email,
    department: staffMember.department,
    phone: staffMember.phone,
    officeHours: staffMember.officeHours,
    officeLocation: staffMember.officeLocation,
    active: staffMember.active,
    courses: staffMember.courses,
    duties: staffMember.duties,
    bio: staffMember.bio,
  };
}

function toCoursePayload(course) {
  return {
    id: course.id,
    sourceCourseId: course.sourceCourseId,
    code: course.code,
    title: course.title,
    description: course.description,
    program: course.program,
    level: course.level,
    leadProfessorId: course.leadProfessorId,
    assignedTAIds: course.assignedTAIds,
    published: course.published,
  };
}

function toOfferingPayload(course) {
  return {
    id: `offering-${course.id}`,
    staffCourseId: course.id,
    courseId: course.sourceCourseId || course.id,
    code: course.code,
    title: course.title,
    program: course.program,
    level: course.level,
    leadProfessorId: course.leadProfessorId,
    taIds: course.assignedTAIds,
    published: course.published,
  };
}

function generateCourseId(code) {
  return `course-${code.toLowerCase().replace(/[^a-z0-9]+/g, '-')}`;
}

async function ensureStaffSeedData() {
  const [staffCount, courseCount] = await Promise.all([
    Staff.countDocuments(),
    StaffCourse.countDocuments(),
  ]);

  if (staffCount === 0) {
    await Staff.insertMany(defaultStaffMembers);
  }

  if (courseCount === 0) {
    await StaffCourse.insertMany(defaultCourses);
  }
}

async function listSemesterOfferings() {
  const courses = await StaffCourse.find({ published: true })
    .sort({ updatedAt: -1, code: 1 })
    .select({ _id: 0, id: 1, sourceCourseId: 1, code: 1, title: 1, program: 1, level: 1, leadProfessorId: 1, assignedTAIds: 1, published: 1 })
    .lean();

  return courses.map(toOfferingPayload);
}

async function listStaffMembers() {
  const staffMembers = await Staff.find()
    .sort({ name: 1 })
    .select({ _id: 0, id: 1, name: 1, role: 1, email: 1, department: 1, phone: 1, officeHours: 1, officeLocation: 1, active: 1, courses: 1, duties: 1, bio: 1 })
    .lean();

  return staffMembers.map(toStaffPayload);
}

async function getCourseCatalog() {
  const courses = await StaffCourse.find()
    .sort({ code: 1 })
    .select({ _id: 0, id: 1, code: 1, title: 1, description: 1, leadProfessorId: 1, assignedTAIds: 1 })
    .lean();

  return courses.reduce((catalog, course) => {
    catalog[course.id] = toCoursePayload(course);
    return catalog;
  }, {});
}

async function getStaffMemberById(staffId) {
  const staffMember = await Staff.findOne({ id: staffId })
    .select({ _id: 0, id: 1, name: 1, role: 1, email: 1, department: 1, phone: 1, officeHours: 1, officeLocation: 1, active: 1, courses: 1, duties: 1, bio: 1 })
    .lean();

  return staffMember ? toStaffPayload(staffMember) : null;
}

async function getStaffBootstrap() {
  const [staffMembers, courseCatalog, semesterOfferings] = await Promise.all([
    listStaffMembers(),
    getCourseCatalog(),
    listSemesterOfferings(),
  ]);

  return {
    staffMembers,
    courseCatalog,
    semesterOfferings,
  };
}

async function publishCourseOffering(payload) {
  const courseCode = payload.code?.trim();
  const courseTitle = payload.title?.trim();
  const sourceCourseId = payload.sourceCourseId?.trim() || payload.courseId?.trim() || '';
  const professorId = payload.leadProfessorId?.trim();
  const taIds = Array.isArray(payload.taIds) ? [...new Set(payload.taIds.filter(Boolean))] : [];

  const [professor, teachingAssistants] = await Promise.all([
    Staff.findOne({ id: professorId, active: true }),
    Staff.find({ id: { $in: taIds }, active: true }),
  ]);

  if (!professor || professor.role !== 'Professor') {
    return { error: 'A valid active professor must be selected for the course offering.' };
  }

  if (teachingAssistants.length !== taIds.length || teachingAssistants.some((staff) => staff.role !== 'Teaching Assistant')) {
    return { error: 'All assigned TAs must be active teaching assistant profiles.' };
  }

  let course = null;

  if (sourceCourseId) {
    course = await StaffCourse.findOne({ $or: [{ sourceCourseId }, { code: courseCode }] });
  } else if (courseCode) {
    course = await StaffCourse.findOne({ code: courseCode });
  }

  if (course && course.published && course.leadProfessorId && course.leadProfessorId !== professorId) {
    return {
      error: `Course ${course.code} is already assigned to professor ${course.leadProfessorId}. Unassign it first before choosing another professor.`,
    };
  }

  if (!course) {
    course = new StaffCourse({
      id: generateCourseId(courseCode || courseTitle || Date.now().toString()),
      sourceCourseId,
      code: courseCode,
      title: courseTitle,
      description: payload.description?.trim() || `${courseTitle} published from the curriculum semester offering workflow.`,
      program: payload.program?.trim() || '',
      level: payload.level?.trim() || '',
      leadProfessorId: professorId,
      assignedTAIds: taIds,
      published: true,
    });
  } else {
    course.sourceCourseId = sourceCourseId || course.sourceCourseId || '';
    course.code = courseCode || course.code;
    course.title = courseTitle || course.title;
    course.description = payload.description?.trim() || course.description;
    course.program = payload.program?.trim() || course.program || '';
    course.level = payload.level?.trim() || course.level || '';
    course.leadProfessorId = professorId;
    course.assignedTAIds = taIds;
    course.published = true;
  }

  await course.save();

  const assignedStaffIds = new Set([professorId, ...taIds]);

  await Staff.updateMany(
    { id: { $in: Array.from(assignedStaffIds) } },
    { $addToSet: { courses: course.id } }
  );

  await Staff.updateMany(
    { id: { $nin: Array.from(assignedStaffIds) }, courses: course.id },
    { $pull: { courses: course.id } }
  );

  return {
    offering: toOfferingPayload(course),
    course: toCoursePayload(course),
  };
}

async function updateTaProfile(staffId, updates) {
  const staffMember = await Staff.findOne({ id: staffId });
  if (!staffMember) {
    return { error: 'Staff member could not be found.' };
  }

  if (staffMember.role !== 'Teaching Assistant') {
    return { error: 'Only teaching assistant profiles can be updated from the TA dashboard.' };
  }

  staffMember.email = updates.email?.trim() || staffMember.email;
  staffMember.phone = updates.phone?.trim() || staffMember.phone;
  staffMember.officeHours = updates.officeHours?.trim() || staffMember.officeHours;
  staffMember.officeLocation = updates.officeLocation?.trim() || staffMember.officeLocation;

  await staffMember.save();
  return { staffMember: toStaffPayload(staffMember) };
}

async function createStaffMember(payload) {
  const staffMember = await Staff.create({
    id: generateStaffId(),
    name: payload.name.trim(),
    role: payload.role.trim(),
    email: payload.email.trim(),
    department: payload.department.trim(),
    phone: payload.phone?.trim() || 'Not added yet',
    officeHours: payload.officeHours?.trim() || 'Not added yet',
    officeLocation: payload.officeLocation?.trim() || 'Not added yet',
    bio: payload.bio?.trim() || 'Staff profile created by HR.',
    courses: [],
    duties: payload.role === 'Teaching Assistant' ? ['Duty assignment pending'] : [],
    active: true,
  });

  return { staffMember: toStaffPayload(staffMember) };
}

async function deactivateStaffMember(staffId) {
  const staffMember = await Staff.findOne({ id: staffId });
  if (!staffMember) {
    return { error: 'Staff member could not be found.' };
  }

  staffMember.active = false;
  await staffMember.save();

  return { staffMember: toStaffPayload(staffMember) };
}

async function mockBulkUpload() {
  return {
    message: 'CSV upload panel opened. HR integrations can be connected in the next backend sprint.',
  };
}

module.exports = {
  ensureStaffSeedData,
  getStaffBootstrap,
  updateTaProfile,
  createStaffMember,
  deactivateStaffMember,
  publishCourseOffering,
  mockBulkUpload,
};