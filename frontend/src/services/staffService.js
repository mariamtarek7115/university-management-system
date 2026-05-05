const STAFF_API_BASE = `${process.env.REACT_APP_API_BASE_URL || 'http://localhost:5000'}/api/staff`;

async function handleResponse(response) {
  if (!response.ok) {
    let errorMessage = 'Staff request failed.';

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

async function getStaffBootstrap() {
  const response = await fetch(`${STAFF_API_BASE}/bootstrap`);
  return handleResponse(response);
}

async function updateStaffTaProfile(staffId, payload) {
  const response = await fetch(`${STAFF_API_BASE}/ta-profile/${staffId}`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(payload),
  });

  return handleResponse(response);
}

async function createStaffMember(payload) {
  const response = await fetch(`${STAFF_API_BASE}/members`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(payload),
  });

  return handleResponse(response);
}

async function deactivateStaffMember(staffId) {
  const response = await fetch(`${STAFF_API_BASE}/members/${staffId}/deactivate`, {
    method: 'PATCH',
  });

  return handleResponse(response);
}

async function triggerStaffBulkUpload() {
  const response = await fetch(`${STAFF_API_BASE}/bulk-upload`, {
    method: 'POST',
  });

  return handleResponse(response);
}

async function publishStaffCourseOffering(payload) {
  const response = await fetch(`${STAFF_API_BASE}/course-offerings`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(payload),
  });

  return handleResponse(response);
}

export {
  getStaffBootstrap,
  updateStaffTaProfile,
  createStaffMember,
  deactivateStaffMember,
  publishStaffCourseOffering,
  triggerStaffBulkUpload,
};