const CommunityMessage = require('../models/CommunityMessage');
const CommunityUser = require('../models/CommunityUser');

const defaultAccounts = [
  { id: 'student-1', name: 'Amina Yusuf', role: 'Student', department: 'Computer Science' },
  { id: 'student-2', name: 'Samuel Kariuki', role: 'Student', department: 'Engineering' },
  { id: 'student-3', name: 'Neema Wanjiku', role: 'Student', department: 'Business Administration' },
  { id: 'professor-1', name: 'Dr. James Okoro', role: 'Professor', department: 'Computer Science' },
  { id: 'professor-2', name: 'Prof. Lillian Mensah', role: 'Professor', department: 'Business Administration' },
  { id: 'professor-3', name: 'Dr. David Otieno', role: 'Professor', department: 'Engineering' },
  { id: 'parent-1', name: 'Mrs. Grace Yusuf', role: 'Parent', department: '' },
  { id: 'parent-2', name: 'Mr. Peter Kariuki', role: 'Parent', department: '' },
  { id: 'community-office', name: 'Community Office', role: 'Office', department: 'Administration' },
];

const defaultMessages = [
  {
    id: 'msg-001',
    threadId: 'thread-001',
    senderId: 'student-1',
    senderName: 'Amina Yusuf',
    recipientId: 'professor-1',
    recipientName: 'Dr. James Okoro',
    subject: 'Question about database assignment',
    content: 'Good afternoon, Professor. Could you clarify the normalization part of the assignment?',
    timestamp: new Date('2026-05-05T09:15:00'),
  },
  {
    id: 'msg-002',
    threadId: 'thread-002',
    senderId: 'professor-1',
    senderName: 'Dr. James Okoro',
    recipientId: 'student-1',
    recipientName: 'Amina Yusuf',
    subject: 'Office hour update',
    content: 'I will be available from 2:00 PM to 4:00 PM tomorrow for project consultations.',
    timestamp: new Date('2026-05-05T08:00:00'),
  },
  {
    id: 'msg-003',
    threadId: 'thread-003',
    senderId: 'community-office',
    senderName: 'Community Office',
    recipientId: 'parent-1',
    recipientName: 'Mrs. Grace Yusuf',
    subject: 'Parent forum invitation',
    content: 'You are invited to the faculty parent forum on Friday at 10:00 AM in the main auditorium.',
    timestamp: new Date('2026-05-04T14:20:00'),
  },
  {
    id: 'msg-004',
    threadId: 'thread-001',
    senderId: 'professor-1',
    senderName: 'Dr. James Okoro',
    recipientId: 'student-1',
    recipientName: 'Amina Yusuf',
    subject: 'Re: Question about database assignment',
    content: 'Focus on third normal form for the main tables, and include your assumptions in the report.',
    timestamp: new Date('2026-05-05T10:05:00'),
  },
  {
    id: 'msg-005',
    threadId: 'thread-004',
    senderId: 'student-2',
    senderName: 'Samuel Kariuki',
    recipientId: 'professor-3',
    recipientName: 'Dr. David Otieno',
    subject: 'Lab access request',
    content: 'Could I get access to the embedded systems lab this afternoon for project testing?',
    timestamp: new Date('2026-05-05T11:30:00'),
  },
  {
    id: 'msg-006',
    threadId: 'thread-004',
    senderId: 'professor-3',
    senderName: 'Dr. David Otieno',
    recipientId: 'student-2',
    recipientName: 'Samuel Kariuki',
    subject: 'Re: Lab access request',
    content: 'Yes, the lab is available after 3:00 PM. Please sign in with the technician first.',
    timestamp: new Date('2026-05-05T12:10:00'),
  },
  {
    id: 'msg-007',
    threadId: 'thread-005',
    senderId: 'professor-2',
    senderName: 'Prof. Lillian Mensah',
    recipientId: 'student-3',
    recipientName: 'Neema Wanjiku',
    subject: 'Case study presentation schedule',
    content: 'Your group is scheduled to present on Thursday at 9:00 AM in Room B12.',
    timestamp: new Date('2026-05-05T07:45:00'),
  },
];

function generateEntityId(prefix) {
  return `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

function toUserPayload(user) {
  return {
    id: user.id,
    name: user.name,
    role: user.role,
    department: user.department || '',
  };
}

function toMessagePayload(message) {
  return {
    id: message.id,
    threadId: message.threadId,
    senderId: message.senderId,
    senderName: message.senderName,
    recipientId: message.recipientId,
    recipientName: message.recipientName,
    subject: message.subject,
    content: message.content,
    timestamp: message.timestamp,
  };
}

async function ensureCommunitySeedData() {
  const [userCount, messageCount] = await Promise.all([
    CommunityUser.countDocuments(),
    CommunityMessage.countDocuments(),
  ]);

  if (userCount === 0) {
    await CommunityUser.insertMany(defaultAccounts);
  }

  if (messageCount === 0) {
    await CommunityMessage.insertMany(defaultMessages);
  }
}

async function listAccounts() {
  const accounts = await CommunityUser.find({ role: { $ne: 'Office' } })
    .sort({ role: 1, name: 1 })
    .select({ _id: 0, id: 1, name: 1, role: 1, department: 1 })
    .lean();

  return accounts.map(toUserPayload);
}

async function listProfessorDirectory() {
  const professors = await CommunityUser.find({ role: 'Professor' })
    .sort({ name: 1 })
    .select({ _id: 0, id: 1, name: 1, department: 1 })
    .lean();

  return professors.map((professor) => ({
    id: professor.id,
    name: professor.name,
    department: professor.department || 'General Studies',
  }));
}

async function listMessages() {
  const messages = await CommunityMessage.find()
    .sort({ timestamp: 1 })
    .select({ _id: 0, id: 1, threadId: 1, senderId: 1, senderName: 1, recipientId: 1, recipientName: 1, subject: 1, content: 1, timestamp: 1 })
    .lean();

  return messages.map(toMessagePayload);
}

async function getAccountById(accountId) {
  const account = await CommunityUser.findOne({ id: accountId })
    .select({ _id: 0, id: 1, name: 1, role: 1, department: 1 })
    .lean();

  return account ? toUserPayload(account) : null;
}

async function getThreadMessages(threadId) {
  const messages = await CommunityMessage.find({ threadId })
    .sort({ timestamp: 1 })
    .select({ _id: 0, id: 1, threadId: 1, senderId: 1, senderName: 1, recipientId: 1, recipientName: 1, subject: 1, content: 1, timestamp: 1 })
    .lean();

  return messages.map(toMessagePayload);
}

async function createMessage({ senderId, recipientId, subject, content }) {
  const [sender, recipient] = await Promise.all([
    getAccountById(senderId),
    getAccountById(recipientId),
  ]);

  if (!sender || !recipient) {
    return { error: 'Sender or recipient could not be found.' };
  }

  const nextMessage = await CommunityMessage.create({
    id: generateEntityId('msg'),
    threadId: generateEntityId('thread'),
    senderId: sender.id,
    senderName: sender.name,
    recipientId: recipient.id,
    recipientName: recipient.name,
    subject: subject.trim(),
    content: content.trim(),
    timestamp: new Date(),
  });

  return { message: toMessagePayload(nextMessage) };
}

async function createReply({ threadId, senderId, content }) {
  const [sender, threadMessages] = await Promise.all([
    getAccountById(senderId),
    getThreadMessages(threadId),
  ]);

  if (!sender || !threadMessages.length) {
    return { error: 'Reply target could not be resolved.' };
  }

  const participantMessage = threadMessages.find((message) => message.senderId !== senderId);
  const outboundMessage = threadMessages.find((message) => message.recipientId !== senderId);
  const recipientSource = participantMessage
    ? { id: participantMessage.senderId, name: participantMessage.senderName }
    : outboundMessage
      ? { id: outboundMessage.recipientId, name: outboundMessage.recipientName }
      : null;

  if (!recipientSource) {
    return { error: 'Reply recipient could not be resolved.' };
  }

  const latestMessage = threadMessages[threadMessages.length - 1];
  const nextMessage = await CommunityMessage.create({
    id: generateEntityId('msg'),
    threadId,
    senderId: sender.id,
    senderName: sender.name,
    recipientId: recipientSource.id,
    recipientName: recipientSource.name,
    subject: latestMessage.subject.startsWith('Re:') ? latestMessage.subject : `Re: ${latestMessage.subject}`,
    content: content.trim(),
    timestamp: new Date(),
  });

  return { message: toMessagePayload(nextMessage) };
}

async function getCommunityState() {
  const [users, professorDirectory, messages] = await Promise.all([
    listAccounts(),
    listProfessorDirectory(),
    listMessages(),
  ]);

  return {
    users,
    professorDirectory,
    messages,
  };
}

module.exports = {
  ensureCommunitySeedData,
  getCommunityState,
  createMessage,
  createReply,
};
