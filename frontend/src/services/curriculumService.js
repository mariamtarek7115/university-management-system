const CURRICULUM_API_BASE = `${process.env.REACT_APP_API_BASE_URL || 'http://localhost:5000'}/api/curriculum`;

async function handleResponse(response) {
  if (!response.ok) {
    let errorMessage = 'Curriculum request failed.';

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

async function getCurriculumBootstrap() {
  const response = await fetch(`${CURRICULUM_API_BASE}/bootstrap`);
  return handleResponse(response);
}

async function createCurriculumRegistrationRequest(payload) {
  const response = await fetch(`${CURRICULUM_API_BASE}/requests`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(payload),
  });

  return handleResponse(response);
}

async function updateCurriculumRequestStatus(requestId, payload) {
  const response = await fetch(`${CURRICULUM_API_BASE}/requests/${requestId}/status`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(payload),
  });

  return handleResponse(response);
}

async function postCurriculumGrades(payload) {
  const response = await fetch(`${CURRICULUM_API_BASE}/grades`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(payload),
  });

  return handleResponse(response);
}

export {
  getCurriculumBootstrap,
  createCurriculumRegistrationRequest,
  updateCurriculumRequestStatus,
  postCurriculumGrades,
};