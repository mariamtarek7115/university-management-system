const COMMUNITY_API_BASE = `${process.env.REACT_APP_API_BASE_URL || 'http://localhost:5000'}/api/community`;

async function handleResponse(response) {
  if (!response.ok) {
    let errorMessage = 'Community request failed.';

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

async function getCommunityBootstrap() {
  const response = await fetch(COMMUNITY_API_BASE);
  return handleResponse(response);
}

async function sendCommunityMessage(payload) {
  const response = await fetch(`${COMMUNITY_API_BASE}/messages`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(payload),
  });

  return handleResponse(response);
}

async function sendCommunityReply(threadId, payload) {
  const response = await fetch(`${COMMUNITY_API_BASE}/threads/${threadId}/replies`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(payload),
  });

  return handleResponse(response);
}

export {
  getCommunityBootstrap,
  sendCommunityMessage,
  sendCommunityReply,
};
