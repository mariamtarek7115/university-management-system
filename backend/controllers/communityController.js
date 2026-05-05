const { createMessage, createReply, getCommunityState } = require('../data/communityStore');

async function getCommunityBootstrap(req, res) {
  try {
    const communityState = await getCommunityState();
    return res.json(communityState);
  } catch (error) {
    return res.status(500).json({ message: 'Unable to load community data.', detail: error.message });
  }
}

async function postMessage(req, res) {
  const { senderId, recipientId, subject, content } = req.body;

  if (!senderId || !recipientId || !subject?.trim() || !content?.trim()) {
    return res.status(400).json({ message: 'senderId, recipientId, subject, and content are required.' });
  }

  try {
    const result = await createMessage({ senderId, recipientId, subject, content });
    if (result.error) {
      return res.status(404).json({ message: result.error });
    }

    return res.status(201).json(result.message);
  } catch (error) {
    return res.status(500).json({ message: 'Unable to create community message.', detail: error.message });
  }
}

async function postReply(req, res) {
  const { threadId } = req.params;
  const { senderId, content } = req.body;

  if (!threadId || !senderId || !content?.trim()) {
    return res.status(400).json({ message: 'threadId, senderId, and content are required.' });
  }

  try {
    const result = await createReply({ threadId, senderId, content });
    if (result.error) {
      return res.status(404).json({ message: result.error });
    }

    return res.status(201).json(result.message);
  } catch (error) {
    return res.status(500).json({ message: 'Unable to create community reply.', detail: error.message });
  }
}

module.exports = {
  getCommunityBootstrap,
  postMessage,
  postReply,
};
