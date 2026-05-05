const FacilityBooking = require('../models/FacilityBooking');
const FacilityEquipment = require('../models/FacilityEquipment');
const FacilityRoom = require('../models/FacilityRoom');
const FacilityStudent = require('../models/FacilityStudent');
const CurriculumStudent = require('../models/CurriculumStudent');
const CommunityUser = require('../models/CommunityUser');

const defaultRooms = [
  {
    id: 'room-a101',
    name: 'A101',
    building: 'Science Block',
    capacity: 80,
    type: 'Classroom',
    facilities: ['Projector', 'Air conditioning', 'Smart board'],
  },
  {
    id: 'room-b204',
    name: 'B204',
    building: 'Main Hall',
    capacity: 45,
    type: 'Seminar Room',
    facilities: ['Video conference', 'Whiteboard'],
  },
  {
    id: 'room-c301',
    name: 'C301',
    building: 'Engineering Annex',
    capacity: 30,
    type: 'Lab',
    facilities: ['Computers', 'Projector', 'Lab benches'],
  },
  {
    id: 'room-d105',
    name: 'D105',
    building: 'Library Wing',
    capacity: 20,
    type: 'Tutorial Room',
    facilities: ['Quiet zone', 'Display screen'],
  },
];

const defaultBookings = [
  {
    id: 'booking-001',
    roomId: 'room-a101',
    date: '2026-05-05',
    startTime: '09:00',
    endTime: '11:00',
    title: 'CSC 201 Lecture',
    bookedBy: 'Academic Affairs',
  },
  {
    id: 'booking-002',
    roomId: 'room-a101',
    date: '2026-05-05',
    startTime: '13:00',
    endTime: '15:00',
    title: 'Project presentation',
    bookedBy: 'Student Affairs',
  },
  {
    id: 'booking-003',
    roomId: 'room-b204',
    date: '2026-05-05',
    startTime: '10:00',
    endTime: '12:00',
    title: 'BUS 310 Seminar',
    bookedBy: 'Business Faculty',
  },
  {
    id: 'booking-004',
    roomId: 'room-c301',
    date: '2026-05-05',
    startTime: '14:00',
    endTime: '17:00',
    title: 'Embedded systems lab',
    bookedBy: 'Engineering Department',
  },
];

const defaultEquipment = [
  {
    id: 'eq-001',
    name: 'Projector Unit P-12',
    category: 'Projection',
    status: 'available',
    department: 'Unassigned',
    location: 'Central Store',
  },
  {
    id: 'eq-002',
    name: 'Robotics Kit R-3',
    category: 'Lab Equipment',
    status: 'assigned',
    department: 'Engineering',
    location: 'Innovation Workshop',
  },
  {
    id: 'eq-003',
    name: 'Portable PA System',
    category: 'Audio',
    status: 'available',
    department: 'Unassigned',
    location: 'Events Office',
  },
];

const defaultStudents = [
  {
    id: 'std-001',
    name: 'Amina Yusuf',
    matricNo: 'UMS/CSC/23/014',
    email: 'amina.yusuf@student.ums.edu',
    department: 'Computer Science',
    level: '300',
  },
  {
    id: 'std-002',
    name: 'Daniel Mwangi',
    matricNo: 'UMS/ENG/22/021',
    email: 'daniel.mwangi@student.ums.edu',
    department: 'Engineering',
    level: '400',
  },
  {
    id: 'std-003',
    name: 'Grace Njeri',
    matricNo: 'UMS/BUS/23/018',
    email: 'grace.njeri@student.ums.edu',
    department: 'Business Administration',
    level: '300',
  },
  {
    id: 'std-004',
    name: 'Brian Mwangi',
    matricNo: 'UMS/CSC/24/011',
    email: 'brian.mwangi@student.ums.edu',
    department: 'Computer Science',
    level: '200',
  },
];

function generateId(prefix) {
  return `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

function normalizeEmail(email) {
  return email.trim().toLowerCase();
}

function toRoomPayload(room) {
  return {
    id: room.id,
    name: room.name,
    building: room.building,
    capacity: room.capacity,
    type: room.type,
    facilities: room.facilities,
  };
}

function toBookingPayload(booking) {
  return {
    id: booking.id,
    roomId: booking.roomId,
    date: booking.date,
    startTime: booking.startTime,
    endTime: booking.endTime,
    title: booking.title,
    bookedBy: booking.bookedBy,
  };
}

function toEquipmentPayload(item) {
  return {
    id: item.id,
    name: item.name,
    category: item.category,
    status: item.status,
    department: item.department,
    location: item.location,
  };
}

function toStudentPayload(student) {
  return {
    id: student.id,
    name: student.name,
    matricNo: student.matricNo,
    email: student.email,
    department: student.department,
    level: student.level,
  };
}

async function ensureFacilitiesSeedData() {
  const [roomCount, bookingCount, equipmentCount, existingStudentIds] = await Promise.all([
    FacilityRoom.countDocuments(),
    FacilityBooking.countDocuments(),
    FacilityEquipment.countDocuments(),
    FacilityStudent.find().select({ _id: 0, id: 1 }).lean(),
  ]);

  if (roomCount === 0) {
    await FacilityRoom.insertMany(defaultRooms);
  }

  if (bookingCount === 0) {
    await FacilityBooking.insertMany(defaultBookings);
  }

  if (equipmentCount === 0) {
    await FacilityEquipment.insertMany(defaultEquipment);
  }

  const knownStudentIds = new Set(existingStudentIds.map((student) => student.id));
  const missingStudents = defaultStudents.filter((student) => !knownStudentIds.has(student.id));

  if (missingStudents.length) {
    await FacilityStudent.insertMany(missingStudents);
  }
}

async function getFacilitiesBootstrap() {
  const [rooms, bookings, equipmentItems, students] = await Promise.all([
    FacilityRoom.find().sort({ building: 1, name: 1 }).select({ _id: 0 }).lean(),
    FacilityBooking.find().sort({ date: 1, startTime: 1 }).select({ _id: 0 }).lean(),
    FacilityEquipment.find().sort({ name: 1 }).select({ _id: 0 }).lean(),
    FacilityStudent.find().sort({ name: 1 }).select({ _id: 0 }).lean(),
  ]);

  return {
    rooms: rooms.map(toRoomPayload),
    bookings: bookings.map(toBookingPayload),
    equipmentItems: equipmentItems.map(toEquipmentPayload),
    students: students.map(toStudentPayload),
  };
}

async function saveBooking(payload, bookingId) {
  const room = await FacilityRoom.findOne({ id: payload.roomId }).select({ _id: 0, id: 1 }).lean();
  if (!room) {
    return { error: 'Selected room could not be found.' };
  }

  if (payload.startTime >= payload.endTime) {
    return { error: 'Booking end time must be later than the start time.' };
  }

  if (bookingId) {
    const existingBooking = await FacilityBooking.findOne({ id: bookingId });
    if (!existingBooking) {
      return { error: 'Booking could not be found.' };
    }

    existingBooking.roomId = payload.roomId;
    existingBooking.date = payload.date;
    existingBooking.startTime = payload.startTime;
    existingBooking.endTime = payload.endTime;
    existingBooking.title = payload.title.trim();
    existingBooking.bookedBy = payload.bookedBy.trim();
    await existingBooking.save();
    return { booking: toBookingPayload(existingBooking), created: false };
  }

  const booking = await FacilityBooking.create({
    id: generateId('booking'),
    roomId: payload.roomId,
    date: payload.date,
    startTime: payload.startTime,
    endTime: payload.endTime,
    title: payload.title.trim(),
    bookedBy: payload.bookedBy.trim(),
  });

  return { booking: toBookingPayload(booking), created: true };
}

async function deleteBooking(bookingId) {
  const deletedBooking = await FacilityBooking.findOneAndDelete({ id: bookingId }).select({ _id: 0 }).lean();
  if (!deletedBooking) {
    return { error: 'Booking could not be found.' };
  }

  return { booking: toBookingPayload(deletedBooking) };
}

async function allocateEquipment(equipmentId, department) {
  const item = await FacilityEquipment.findOne({ id: equipmentId });
  if (!item) {
    return { error: 'Equipment item could not be found.' };
  }

  item.department = department.trim();
  item.status = 'assigned';
  await item.save();

  return { equipment: toEquipmentPayload(item) };
}

async function syncStudentAcrossModules(student) {
  const [curriculumStudent, communityUser] = await Promise.all([
    CurriculumStudent.findOne({ id: student.id }),
    CommunityUser.findOne({ id: student.id }),
  ]);

  if (curriculumStudent) {
    curriculumStudent.name = student.name;
    curriculumStudent.program = student.department;
    curriculumStudent.level = student.level;
    await curriculumStudent.save();
  } else {
    await CurriculumStudent.create({
      id: student.id,
      name: student.name,
      program: student.department,
      level: student.level,
      gpa: 0,
      cgpa: 0,
      completedCourses: [],
      registeredCourseIds: [],
      notifications: ['Student profile created from Facilities module.'],
      gradebook: {},
    });
  }

  if (communityUser) {
    communityUser.name = student.name;
    communityUser.role = 'Student';
    communityUser.department = student.department;
    await communityUser.save();
  } else {
    await CommunityUser.create({
      id: student.id,
      name: student.name,
      role: 'Student',
      department: student.department,
    });
  }
}

async function removeStudentFromLinkedModules(studentId) {
  await Promise.all([
    CurriculumStudent.deleteOne({ id: studentId }),
    CommunityUser.deleteOne({ id: studentId, role: 'Student' }),
  ]);
}

async function createStudent(payload) {
  const email = normalizeEmail(payload.email);
  const existingStudent = await FacilityStudent.findOne({ email }).select({ _id: 0, id: 1, name: 1 }).lean();
  if (existingStudent) {
    return { error: `A student with email ${email} already exists. Use a different email address.` };
  }

  const student = await FacilityStudent.create({
    id: generateId('std'),
    name: payload.name.trim(),
    matricNo: payload.matricNo.trim(),
    email,
    department: payload.department.trim(),
    level: payload.level?.trim() || '',
  });

  await syncStudentAcrossModules(student);

  return { student: toStudentPayload(student) };
}

async function updateStudent(studentId, payload) {
  const student = await FacilityStudent.findOne({ id: studentId });
  if (!student) {
    return { error: 'Student could not be found.' };
  }

  const email = normalizeEmail(payload.email);
  const duplicateStudent = await FacilityStudent.findOne({ id: { $ne: studentId }, email }).select({ _id: 0, id: 1 }).lean();
  if (duplicateStudent) {
    return { error: `A student with email ${email} already exists. Use a different email address.` };
  }

  student.name = payload.name.trim();
  student.matricNo = payload.matricNo.trim();
  student.email = email;
  student.department = payload.department.trim();
  student.level = payload.level?.trim() || '';
  await student.save();

  await syncStudentAcrossModules(student);

  return { student: toStudentPayload(student) };
}

async function deleteStudent(studentId) {
  const deletedStudent = await FacilityStudent.findOneAndDelete({ id: studentId }).select({ _id: 0 }).lean();
  if (!deletedStudent) {
    return { error: 'Student could not be found.' };
  }

  await removeStudentFromLinkedModules(studentId);

  return { student: toStudentPayload(deletedStudent) };
}

module.exports = {
  ensureFacilitiesSeedData,
  getFacilitiesBootstrap,
  saveBooking,
  deleteBooking,
  allocateEquipment,
  createStudent,
  updateStudent,
  deleteStudent,
};