const express = require('express');
const {
  addStudent,
  assignEquipment,
  editStudent,
  getFacilitiesModuleBootstrap,
  removeBooking,
  removeStudent,
  upsertBooking,
} = require('../controllers/facilitiesController');

const router = express.Router();

router.get('/bootstrap', getFacilitiesModuleBootstrap);
router.post('/bookings', upsertBooking);
router.put('/bookings/:bookingId', upsertBooking);
router.delete('/bookings/:bookingId', removeBooking);
router.patch('/equipment/assign', assignEquipment);
router.post('/students', addStudent);
router.put('/students/:studentId', editStudent);
router.delete('/students/:studentId', removeStudent);

module.exports = router;