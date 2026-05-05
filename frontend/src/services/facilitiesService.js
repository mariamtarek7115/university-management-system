const FACILITIES_API_BASE = `${process.env.REACT_APP_API_BASE_URL || 'http://localhost:5000'}/api/facilities`;

async function handleResponse(response) {
  if (!response.ok) {
    let errorMessage = 'Facilities request failed.';

    try {
      const payload = await response.json();
      errorMessage = payload.message || errorMessage;
    } catch (error) {
      errorMessage = errorMessage;
    }

    throw new Error(errorMessage);
  }

  return response.json();
}

async function getFacilitiesBootstrap() {
  const response = await fetch(`${FACILITIES_API_BASE}/bootstrap`);
  return handleResponse(response);
}

async function createFacilityBooking(payload) {
  const response = await fetch(`${FACILITIES_API_BASE}/bookings`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(payload),
  });

  return handleResponse(response);
}

async function updateFacilityBooking(bookingId, payload) {
  const response = await fetch(`${FACILITIES_API_BASE}/bookings/${bookingId}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(payload),
  });

  return handleResponse(response);
}

async function deleteFacilityBooking(bookingId) {
  const response = await fetch(`${FACILITIES_API_BASE}/bookings/${bookingId}`, {
    method: 'DELETE',
  });

  return handleResponse(response);
}

async function assignFacilityEquipment(payload) {
  const response = await fetch(`${FACILITIES_API_BASE}/equipment/assign`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(payload),
  });

  return handleResponse(response);
}

async function createFacilityStudent(payload) {
  const response = await fetch(`${FACILITIES_API_BASE}/students`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(payload),
  });

  return handleResponse(response);
}

async function updateFacilityStudent(studentId, payload) {
  const response = await fetch(`${FACILITIES_API_BASE}/students/${studentId}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(payload),
  });

  return handleResponse(response);
}

async function deleteFacilityStudent(studentId) {
  const response = await fetch(`${FACILITIES_API_BASE}/students/${studentId}`, {
    method: 'DELETE',
  });

  return handleResponse(response);
}

export {
  getFacilitiesBootstrap,
  createFacilityBooking,
  updateFacilityBooking,
  deleteFacilityBooking,
  assignFacilityEquipment,
  createFacilityStudent,
  updateFacilityStudent,
  deleteFacilityStudent,
};