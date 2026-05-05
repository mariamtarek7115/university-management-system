import { useEffect, useMemo, useState } from 'react';

import {
	getCommunityBootstrap,
	sendCommunityMessage,
	sendCommunityReply,
} from '../services/communityService';

function formatTimestamp(timestamp) {
	return new Intl.DateTimeFormat('en', {
		dateStyle: 'medium',
		timeStyle: 'short',
	}).format(new Date(timestamp));
}

function getThreadPreview(messages, userId) {
	const received = messages.filter((message) => message.recipientId === userId);
	const threadMap = new Map();

	received.forEach((message) => {
		const existing = threadMap.get(message.threadId);
		if (!existing || new Date(message.timestamp) > new Date(existing.timestamp)) {
			threadMap.set(message.threadId, message);
		}
	});

	return [...threadMap.values()].sort(
		(left, right) => new Date(right.timestamp) - new Date(left.timestamp)
	);
}

function CommunityModulePage({ onBack }) {
	const [userOptions, setUserOptions] = useState([]);
	const [professorDirectory, setProfessorDirectory] = useState([]);
	const [activeUserId, setActiveUserId] = useState('');
	const [messages, setMessages] = useState([]);
	const [selectedThreadId, setSelectedThreadId] = useState(null);
	const [replyDraft, setReplyDraft] = useState('');
	const [composeProfessorId, setComposeProfessorId] = useState('');
	const [composeSubject, setComposeSubject] = useState('');
	const [composeContent, setComposeContent] = useState('');
	const [feedback, setFeedback] = useState('');
	const [feedbackTarget, setFeedbackTarget] = useState('');
	const [loadError, setLoadError] = useState('');
	const [isLoading, setIsLoading] = useState(true);

	useEffect(() => {
		let isActive = true;

		const loadCommunityData = async () => {
			setIsLoading(true);
			setLoadError('');

			try {
				const payload = await getCommunityBootstrap();
				if (!isActive) {
					return;
				}

				setUserOptions(payload.users ?? []);
				setProfessorDirectory(payload.professorDirectory ?? []);
				setMessages(payload.messages ?? []);
				setActiveUserId((current) => current || payload.users?.[0]?.id || '');
				setComposeProfessorId((current) => current || payload.professorDirectory?.[0]?.id || '');
			} catch (error) {
				if (isActive) {
					setLoadError(error.message || 'Unable to load community data.');
				}
			} finally {
				if (isActive) {
					setIsLoading(false);
				}
			}
		};

		loadCommunityData();

		return () => {
			isActive = false;
		};
	}, []);

	const activeUser = useMemo(
		() =>
			userOptions.find((user) => user.id === activeUserId) ??
			userOptions[0] ?? {
				id: '',
				name: 'No user selected',
				role: 'Viewer',
			},
		[activeUserId, userOptions]
	);

	const inboxThreads = useMemo(
		() => (activeUserId ? getThreadPreview(messages, activeUserId) : []),
		[activeUserId, messages]
	);

	const selectedThreadMessages = useMemo(() => {
		const defaultThreadId = inboxThreads[0]?.threadId ?? null;
		const effectiveThreadId = selectedThreadId ?? defaultThreadId;

		return messages
			.filter((message) => message.threadId === effectiveThreadId)
			.sort((left, right) => new Date(left.timestamp) - new Date(right.timestamp));
	}, [inboxThreads, messages, selectedThreadId]);

	const activeMessage = selectedThreadMessages[selectedThreadMessages.length - 1] ?? null;
	const canReply = activeUser.role === 'Professor' || activeUser.role === 'Student';
	const canCompose = activeUser.role === 'Professor' || activeUser.role === 'Student';
	const composeRecipients = useMemo(() => {
		if (activeUser.role === 'Student') {
			return professorDirectory;
		}

		if (activeUser.role === 'Professor') {
			return userOptions
				.filter((user) => user.role === 'Student')
				.map((user) => ({
					id: user.id,
					name: user.name,
					department: user.department || 'Student',
				}));
		}

		return [];
	}, [activeUser.role, professorDirectory, userOptions]);
	const composeTitle = activeUser.role === 'Professor' ? 'Send message to student' : 'Send message to professor';
	const composeDescription =
		activeUser.role === 'Professor'
			? 'Available when the current account is a professor'
			: 'Available when the current account is a student';
	const composeRecipientLabel = activeUser.role === 'Professor' ? 'Student' : 'Professor';
	const composePlaceholder =
		activeUser.role === 'Professor' ? 'Write your message to the student' : 'Write your message to the professor';

	useEffect(() => {
		if (!activeUserId) {
			setSelectedThreadId(null);
			return;
		}

		const nextInbox = getThreadPreview(messages, activeUserId);
		if (!nextInbox.some((thread) => thread.threadId === selectedThreadId)) {
			setSelectedThreadId(nextInbox[0]?.threadId ?? null);
		}
	}, [activeUserId, messages, selectedThreadId]);

	useEffect(() => {
		if (!composeRecipients.some((recipient) => recipient.id === composeProfessorId)) {
			setComposeProfessorId(composeRecipients[0]?.id ?? '');
		}
	}, [composeProfessorId, composeRecipients]);

	const replyRecipient = useMemo(() => {
		if (!selectedThreadMessages.length) {
			return null;
		}

		const participantMessage = selectedThreadMessages.find(
			(message) => message.senderId !== activeUser.id
		);

		if (participantMessage) {
			return {
				id: participantMessage.senderId,
				name: participantMessage.senderName,
			};
		}

		const outboundMessage = selectedThreadMessages.find(
			(message) => message.recipientId !== activeUser.id
		);

		if (outboundMessage) {
			return {
				id: outboundMessage.recipientId,
				name: outboundMessage.recipientName,
			};
		}

		return null;
	}, [activeUser.id, selectedThreadMessages]);

	const resetFeedback = (message, target) => {
		setFeedback(message);
		setFeedbackTarget(target);
		window.clearTimeout(window.__communityFeedbackTimeout);
		window.__communityFeedbackTimeout = window.setTimeout(() => {
			setFeedback('');
			setFeedbackTarget('');
		}, 2500);
	};

	const handleUserChange = (event) => {
		setActiveUserId(event.target.value);
		setReplyDraft('');
		setFeedback('');
		setFeedbackTarget('');
		setLoadError('');
	};

	const handleSelectThread = (threadId) => {
		setSelectedThreadId(threadId);
		setReplyDraft('');
	};

	const handleSendReply = async () => {
		if (!canReply || !activeMessage || !replyDraft.trim() || !replyRecipient) {
			return;
		}

		try {
			const reply = await sendCommunityReply(activeMessage.threadId, {
				senderId: activeUser.id,
				content: replyDraft.trim(),
			});

			setMessages((current) => [...current, reply]);
			setReplyDraft('');
			setSelectedThreadId(reply.threadId);
			setLoadError('');
			resetFeedback(`Reply sent to ${replyRecipient.name}.`, 'reply');
		} catch (error) {
			setLoadError(error.message || 'Unable to send reply.');
		}
	};

	const handleSendMessage = async () => {
		if (!canCompose || !composeSubject.trim() || !composeContent.trim()) {
			return;
		}

		const recipient = composeRecipients.find((item) => item.id === composeProfessorId);
		if (!recipient) {
			return;
		}

		try {
			const message = await sendCommunityMessage({
				senderId: activeUser.id,
				recipientId: recipient.id,
				subject: composeSubject.trim(),
				content: composeContent.trim(),
			});

			setMessages((current) => [...current, message]);
			setSelectedThreadId(message.threadId);
			setComposeSubject('');
			setComposeContent('');
			setLoadError('');
			resetFeedback(`Message sent to ${recipient.name}.`, 'compose');
		} catch (error) {
			setLoadError(error.message || 'Unable to send message.');
		}
	};

	return (
		<div className="community-page">
			<header className="community-topbar">
				<div>
					<button type="button" className="community-back" onClick={onBack}>
						Back to dashboard
					</button>
					<p className="eyebrow">Community Module</p>
					<h1>Messages and academic communication</h1>
					<p className="community-intro">
						Read your inbox, open a conversation, and send messages between students and professors.
					</p>
				</div>
				<label className="user-switcher">
					<span>Viewing as</span>
					<select value={activeUserId} onChange={handleUserChange} disabled={isLoading || !userOptions.length}>
						{userOptions.map((user) => (
							<option key={user.id} value={user.id}>
								{user.name} • {user.role}
							</option>
						))}
					</select>
				</label>
			</header>

			{loadError ? <div className="community-feedback">{loadError}</div> : null}

			<section className="community-overview">
				<article className="community-stat-card">
					<span>Inbox threads</span>
					<strong>{inboxThreads.length}</strong>
					<small>Visible only for {activeUser.name}</small>
				</article>
				<article className="community-stat-card">
					<span>Latest activity</span>
					<strong>{activeMessage ? formatTimestamp(activeMessage.timestamp) : 'No messages'}</strong>
					<small>Replies stay linked to the original thread</small>
				</article>
				<article className="community-stat-card">
					<span>Send access</span>
					<strong>{canReply || activeUser.role === 'Student' ? 'Enabled' : 'View only'}</strong>
					<small>Students and professors can continue a conversation thread</small>
				</article>
			</section>

			<section className="community-workspace">
				<aside className="inbox-panel">
					<div className="panel-heading">
						<h2>Inbox</h2>
						<p>Received messages</p>
					</div>
					<div className="thread-list">
						{isLoading ? (
							<div className="empty-state">
								<h3>Loading inbox</h3>
								<p>Fetching community messages from the backend.</p>
							</div>
						) : inboxThreads.length ? (
							inboxThreads.map((thread) => (
								<button
									key={thread.threadId}
									type="button"
									className={`thread-item ${selectedThreadMessages[0]?.threadId === thread.threadId ? 'thread-item--active' : ''}`}
									onClick={() => handleSelectThread(thread.threadId)}
								>
									<div className="thread-item__top">
										<strong>{thread.senderName}</strong>
										<span>{formatTimestamp(thread.timestamp)}</span>
									</div>
									<p>{thread.subject}</p>
									<small>{thread.content}</small>
								</button>
							))
						) : (
							<div className="empty-state">
								<h3>No messages yet</h3>
								<p>Your inbox is empty for the selected account.</p>
							</div>
						)}
					</div>
				</aside>

				<section className="message-panel">
					<div className="panel-heading">
						<h2>Conversation</h2>
						<p>Full message details and replies</p>
					</div>
					{activeMessage ? (
						<>
							<div className="message-detail-header">
								<div>
									<h3>{activeMessage.subject}</h3>
									<p>
										From {activeMessage.senderName} to {activeMessage.recipientName}
									</p>
								</div>
								<span>{formatTimestamp(activeMessage.timestamp)}</span>
							</div>

							<div className="message-thread">
								{selectedThreadMessages.map((message) => (
									<article
										key={message.id}
										className={`message-bubble ${message.senderId === activeUser.id ? 'message-bubble--own' : ''}`}
									>
										<div className="message-bubble__meta">
											<strong>{message.senderName}</strong>
											<span>{formatTimestamp(message.timestamp)}</span>
										</div>
										<p>{message.content}</p>
									</article>
								))}
							</div>

							{canReply ? (
								<div className="reply-panel">
									<label htmlFor="reply-box">
										{replyRecipient ? `Reply to ${replyRecipient.name}` : 'Reply to this thread'}
									</label>
									<textarea
										id="reply-box"
										value={replyDraft}
										onChange={(event) => setReplyDraft(event.target.value)}
										placeholder="Write your reply here"
									/>
									<button type="button" className="community-primary" onClick={handleSendReply} disabled={isLoading}>
										Send reply
									</button>
									{!loadError && feedback && feedbackTarget === 'reply' ? (
										<div className="community-feedback community-inline-feedback">{feedback}</div>
									) : null}
								</div>
							) : (
								<div className="reply-panel reply-panel--readonly">
									<label>Reply status</label>
									<p>
										Replies are available when the page is viewed as a student or professor.
									</p>
								</div>
							)}
						</>
					) : (
						<div className="empty-state empty-state--large">
							<h3>Select a message</h3>
							<p>Open any inbox item to read the full conversation.</p>
						</div>
					)}
				</section>
			</section>

			<section className="compose-panel">
				<div className="panel-heading">
					<h2>{composeTitle}</h2>
					<p>{composeDescription}</p>
				</div>

				<div className="compose-grid">
					<label>
						<span>{composeRecipientLabel}</span>
						<select
							value={composeProfessorId}
							onChange={(event) => setComposeProfessorId(event.target.value)}
							disabled={!canCompose || isLoading || !composeRecipients.length}
						>
							{composeRecipients.map((recipient) => (
								<option key={recipient.id} value={recipient.id}>
									{recipient.name} • {recipient.department}
								</option>
							))}
						</select>
					</label>

					<label>
						<span>Subject</span>
						<input
							type="text"
							value={composeSubject}
							onChange={(event) => setComposeSubject(event.target.value)}
							placeholder="Enter a message subject"
							disabled={!canCompose || isLoading}
						/>
					</label>
				</div>

				<label className="compose-message-field">
					<span>Message</span>
					<textarea
						value={composeContent}
						onChange={(event) => setComposeContent(event.target.value)}
						placeholder={composePlaceholder}
						disabled={!canCompose || isLoading}
					/>
				</label>

				<button
					type="button"
					className="community-primary"
					onClick={handleSendMessage}
					disabled={!canCompose || isLoading}
				>
					Send message
				</button>
				{!loadError && feedback && feedbackTarget === 'compose' ? (
					<div className="community-feedback community-inline-feedback">{feedback}</div>
				) : null}
			</section>
		</div>
	);
}

export default CommunityModulePage;
