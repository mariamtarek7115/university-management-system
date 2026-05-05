const {
  allocateEquipment,
  createStudent,
  deleteBooking,
  deleteStudent,
  getFacilitiesBootstrap,
  saveBooking,
  updateStudent,
} = require('../data/facilitiesStore');

async function getFacilitiesModuleBootstrap(req, res) {
  try {
    const facilitiesState = await getFacilitiesBootstrap();
    return res.json(facilitiesState);
  } catch (error) {
    return res.status(500).json({ message: 'Unable to load facilities module data.', detail: error.message });
  }
}

async function upsertBooking(req, res) {
  const { bookingId } = req.params;
  const { roomId, date, startTime, endTime, title, bookedBy } = req.body;

  if (!roomId || !date || !startTime || !endTime || !title?.trim() || !bookedBy?.trim()) {
    return res.status(400).json({ message: 'roomId, date, startTime, endTime, title, and bookedBy are required.' });
  }

  try {
    const result = await saveBooking({ roomId, date, startTime, endTime, title, bookedBy }, bookingId);
    if (result.error) {
      return res.status(404).json({ message: result.error });
    }

    return res.status(result.created ? 201 : 200).json(result.booking);
  } catch (error) {
    return res.status(500).json({ message: 'Unable to save booking.', detail: error.message });
  }
}

async function removeBooking(req, res) {
  try {
    const result = await deleteBooking(req.params.bookingId);
    if (result.error) {
      return res.status(404).json({ message: result.error });
    }

    return res.json(result.booking);
  } catch (error) {
    return res.status(500).json({ message: 'Unable to delete booking.', detail: error.message });
  }
}

async function assignEquipment(req, res) {
  const { equipmentId, department } = req.body;
  if (!equipmentId || !department?.trim()) {
    return res.status(400).json({ message: 'equipmentId and department are required.' });
  }

  try {
    const result = await allocateEquipment(equipmentId, department);
    if (result.error) {
      return res.status(404).json({ message: result.error });
    }

    return res.json(result.equipment);
  } catch (error) {
    return res.status(500).json({ message: 'Unable to assign equipment.', detail: error.message });
  }
}

async function addStudent(req, res) {
  const { name, matricNo, email, department } = req.body;
  if (!name?.trim() || !matricNo?.trim() || !email?.trim() || !department?.trim()) {
    return res.status(400).json({ message: 'name, matricNo, email, and department are required.' });
  }

  try {
    const result = await createStudent(req.body);
    if (result.error) {
      return res.status(400).json({ message: result.error });
    }

    return res.status(201).json(result.student);
  } catch (error) {
    return res.status(500).json({ message: 'Unable to create student record.', detail: error.message });
  }
}

async function editStudent(req, res) {
  const { name, matricNo, email, department } = req.body;
  if (!name?.trim() || !matricNo?.trim() || !email?.trim() || !department?.trim()) {
    return res.status(400).json({ message: 'name, matricNo, email, and department are required.' });
  }

  try {
    const result = await updateStudent(req.params.studentId, req.body);
    if (result.error) {
      return res.status(result.error.includes('already exists') ? 400 : 404).json({ message: result.error });
    }

    return res.json(result.student);
  } catch (error) {
    return res.status(500).json({ message: 'Unable to update student record.', detail: error.message });
  }
}

async function removeStudent(req, res) {
  try {
    const result = await deleteStudent(req.params.studentId);
    if (result.error) {
      return res.status(404).json({ message: result.error });
    }

    return res.json(result.student);
  } catch (error) {
    return res.status(500).json({ message: 'Unable to delete student record.', detail: error.message });
  }
}

module.exports = {
  getFacilitiesModuleBootstrap,
  upsertBooking,
  removeBooking,
  assignEquipment,
  addStudent,
  editStudent,
  removeStudent,
};