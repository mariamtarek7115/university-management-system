import { useEffect, useMemo, useState } from 'react';

import {
	createStaffMember,
	deactivateStaffMember,
	getStaffBootstrap,
	triggerStaffBulkUpload,
	updateStaffTaProfile,
} from '../services/staffService';

const viewerOptions = [
	{ id: 'student', label: 'Student view', description: 'Browse the directory and staff profiles.' },
	{ id: 'ta', label: 'Teaching Assistant view', description: 'Manage your duties and public contact details.' },
	{ id: 'admin', label: 'HR Administrator view', description: 'Maintain staff records and upload directory data.' },
];

const emptyStaffForm = {
	name: '',
	role: 'Professor',
	email: '',
	department: '',
	phone: '',
	officeHours: '',
	officeLocation: '',
	bio: '',
};

const emptyTaDraft = {
	email: '',
	phone: '',
	officeLocation: '',
	officeHours: '',
};

function StaffModulePage({ onBack }) {
	const [viewer, setViewer] = useState('student');
	const [staffMembers, setStaffMembers] = useState([]);
	const [courseCatalog, setCourseCatalog] = useState({});
	const [selectedStaffId, setSelectedStaffId] = useState('');
	const [selectedCourseId, setSelectedCourseId] = useState('');
	const [selectedTaId, setSelectedTaId] = useState('');
	const [feedback, setFeedback] = useState('');
	const [feedbackTarget, setFeedbackTarget] = useState('');
	const [pageError, setPageError] = useState('');
	const [isLoading, setIsLoading] = useState(true);
	const [taDraft, setTaDraft] = useState(emptyTaDraft);
	const [staffForm, setStaffForm] = useState(emptyStaffForm);

	useEffect(() => {
		let isActive = true;

		const loadStaffData = async () => {
			setIsLoading(true);
			setPageError('');

			try {
				const payload = await getStaffBootstrap();
				if (!isActive) {
					return;
				}

				const nextStaffMembers = payload.staffMembers ?? [];
				const nextCourseCatalog = payload.courseCatalog ?? {};
				const taProfile = nextStaffMembers.find((staff) => staff.role === 'Teaching Assistant' && staff.active);
				const firstVisible = nextStaffMembers.find((staff) => staff.active);

				setStaffMembers(nextStaffMembers);
				setCourseCatalog(nextCourseCatalog);
				setSelectedStaffId((current) => current || firstVisible?.id || '');
				setSelectedCourseId((current) => current || firstVisible?.courses?.[0] || '');
				setSelectedTaId((current) => current || taProfile?.id || '');
				setTaDraft(
					taProfile
						? {
							email: taProfile.email,
							phone: taProfile.phone,
							officeLocation: taProfile.officeLocation,
							officeHours: taProfile.officeHours,
						}
						: emptyTaDraft
				);
			} catch (error) {
				if (isActive) {
					setPageError(error.message || 'Unable to load staff module data.');
				}
			} finally {
				if (isActive) {
					setIsLoading(false);
				}
			}
		};

		loadStaffData();

		return () => {
			isActive = false;
		};
	}, []);

	const visibleDirectory = useMemo(
		() => staffMembers.filter((staff) => staff.active),
		[staffMembers]
	);

	const selectedStaff = useMemo(
		() => staffMembers.find((staff) => staff.id === selectedStaffId) ?? visibleDirectory[0] ?? null,
		[selectedStaffId, staffMembers, visibleDirectory]
	);

	const selectedCourse = selectedCourseId ? courseCatalog[selectedCourseId] : null;
	const taOptions = useMemo(
		() => staffMembers.filter((staff) => staff.role === 'Teaching Assistant' && staff.active),
		[staffMembers]
	);
	const taProfile = taOptions.find((staff) => staff.id === selectedTaId) ?? taOptions[0] ?? null;

	const staffCourses = useMemo(() => {
		if (!selectedStaff) {
			return [];
		}

		return selectedStaff.courses.map((courseId) => courseCatalog[courseId]).filter(Boolean);
	}, [courseCatalog, selectedStaff]);

	useEffect(() => {
		if (!selectedStaffId && visibleDirectory[0]) {
			setSelectedStaffId(visibleDirectory[0].id);
			setSelectedCourseId(visibleDirectory[0].courses[0] ?? '');
			return;
		}

		if (selectedStaffId && !staffMembers.some((staff) => staff.id === selectedStaffId)) {
			setSelectedStaffId(visibleDirectory[0]?.id ?? '');
			setSelectedCourseId(visibleDirectory[0]?.courses[0] ?? '');
		}
	}, [selectedStaffId, staffMembers, visibleDirectory]);

	useEffect(() => {
		if (!selectedStaff) {
			setSelectedCourseId('');
			return;
		}

		if (!selectedStaff.courses.includes(selectedCourseId)) {
			setSelectedCourseId(selectedStaff.courses[0] ?? '');
		}
	}, [selectedCourseId, selectedStaff]);

	useEffect(() => {
		if (!taOptions.some((staff) => staff.id === selectedTaId)) {
			setSelectedTaId(taOptions[0]?.id ?? '');
		}
	}, [selectedTaId, taOptions]);

	useEffect(() => {
		if (!taProfile) {
			setTaDraft(emptyTaDraft);
			return;
		}

		setTaDraft({
			email: taProfile.email,
			phone: taProfile.phone,
			officeLocation: taProfile.officeLocation,
			officeHours: taProfile.officeHours,
		});
	}, [taProfile]);

	const resetFeedback = (message, target) => {
		setFeedback(message);
		setFeedbackTarget(target);
		window.clearTimeout(window.__staffFeedbackTimeout);
		window.__staffFeedbackTimeout = window.setTimeout(() => {
			setFeedback('');
			setFeedbackTarget('');
		}, 4200);
	};

	const handleSelectStaff = (staffId) => {
		setSelectedStaffId(staffId);
		const nextStaff = staffMembers.find((staff) => staff.id === staffId);
		setSelectedCourseId(nextStaff?.courses[0] ?? '');
	};

	const handleSaveTaProfile = async () => {
		if (!taProfile) {
			return;
		}

		if (!taDraft.email || !taDraft.phone || !taDraft.officeHours || !taDraft.officeLocation) {
			resetFeedback('Please fill in email, phone, office hours, and office location before saving the TA profile.', 'ta');
			return;
		}

		try {
			const updatedTa = await updateStaffTaProfile(taProfile.id, taDraft);
			setStaffMembers((current) =>
				current.map((staff) => (staff.id === updatedTa.id ? updatedTa : staff))
			);
			resetFeedback('TA profile updated. The public directory now reflects the saved changes.', 'ta');
		} catch (error) {
			resetFeedback(error.message || 'Unable to update the TA profile.', 'ta');
		}
	};

	const handleCreateStaff = async () => {
		if (!staffForm.name || !staffForm.role || !staffForm.email || !staffForm.department) {
			resetFeedback('Please fill in Name, Role, Email, and Department before creating a staff profile.', 'admin');
			return;
		}

		try {
			const newStaff = await createStaffMember(staffForm);
			setStaffMembers((current) => [...current, newStaff]);
			setSelectedStaffId(newStaff.id);
			setSelectedCourseId('');
			setStaffForm(emptyStaffForm);
			resetFeedback(`${newStaff.name} has been added to the staff directory.`, 'admin');
		} catch (error) {
			resetFeedback(error.message || 'Unable to create the staff profile.', 'admin');
		}
	};

	const handleDeactivateStaff = async () => {
		if (!selectedStaff) {
			return;
		}

		try {
			const deactivatedStaff = await deactivateStaffMember(selectedStaff.id);
			const updatedMembers = staffMembers.map((staff) =>
				staff.id === deactivatedStaff.id ? deactivatedStaff : staff
			);
			const nextVisibleDirectory = updatedMembers.filter((staff) => staff.active);
			const nextSelectedStaff = nextVisibleDirectory.find((staff) => staff.id !== deactivatedStaff.id) ?? nextVisibleDirectory[0] ?? null;
			setStaffMembers(updatedMembers);
			setSelectedStaffId(nextSelectedStaff?.id ?? '');
			setSelectedCourseId(nextSelectedStaff?.courses[0] ?? '');
			resetFeedback(`${selectedStaff.name} has been deactivated without removing historical data.`, 'admin');
		} catch (error) {
			resetFeedback(error.message || 'Unable to deactivate the selected profile.', 'admin');
		}
	};

	const handleMockBulkUpload = async () => {
		try {
			const result = await triggerStaffBulkUpload();
			resetFeedback(result.message, 'admin');
		} catch (error) {
			resetFeedback(error.message || 'Unable to open the bulk upload action.', 'admin');
		}
	};

	return (
		<div className="staff-page">
			<header className="staff-topbar">
				<div>
					<button type="button" className="community-back" onClick={onBack}>
						Back to dashboard
					</button>
					<p className="eyebrow">Staff Module</p>
					<h1>Directory, course assignments, and staff operations</h1>
					<p className="staff-intro">
						Browse professors and teaching assistants, check their assigned courses, and switch into TA or HR admin workflows for staff management.
					</p>
				</div>
				<div className="staff-viewer-switcher" role="tablist" aria-label="Staff module views">
					{viewerOptions.map((option) => (
						<button
							key={option.id}
							type="button"
							className={`staff-viewer-chip ${viewer === option.id ? 'staff-viewer-chip--active' : ''}`}
							onClick={() => setViewer(option.id)}
						>
							<strong>{option.label}</strong>
							<span>{option.description}</span>
						</button>
					))}
				</div>
			</header>

			{pageError ? <div className="community-feedback">{pageError}</div> : null}

			<section className="staff-overview">
				<article className="community-stat-card">
					<span>Active staff</span>
					<strong>{visibleDirectory.length}</strong>
					<small>Directory entries with public visibility</small>
				</article>
				<article className="community-stat-card">
					<span>Departments</span>
					<strong>{new Set(visibleDirectory.map((staff) => staff.department)).size}</strong>
					<small>Available staff grouped across departments</small>
				</article>
				<article className="community-stat-card">
					<span>Assigned courses</span>
					<strong>{selectedStaff ? staffCourses.length : 0}</strong>
					<small>Listed for the active semester on each profile</small>
				</article>
			</section>

			<section className="staff-workspace">
				<aside className="inbox-panel staff-directory-panel">
					<div className="panel-heading">
						<h2>Staff directory</h2>
						<p>Available to students and university users</p>
					</div>
					<div className="staff-directory-list">
						{isLoading ? (
							<div className="empty-state">
								<h3>Loading staff directory</h3>
								<p>Fetching staff records from the backend.</p>
							</div>
						) : visibleDirectory.length ? (
							visibleDirectory.map((staff) => (
								<button
									key={staff.id}
									type="button"
									className={`thread-item ${selectedStaff?.id === staff.id ? 'thread-item--active' : ''}`}
									onClick={() => handleSelectStaff(staff.id)}
								>
									<div className="thread-item__top">
										<strong>{staff.name}</strong>
										<span>{staff.role}</span>
									</div>
									<p>{staff.department}</p>
									<small>{staff.email}</small>
								</button>
							))
						) : (
							<div className="empty-state">
								<h3>No staff available</h3>
								<p>There are no visible staff profiles to display yet.</p>
							</div>
						)}
					</div>
				</aside>

				<section className="message-panel staff-profile-panel">
					<div className="panel-heading">
						<h2>Staff profile</h2>
						<p>Directory details and active semester course assignments</p>
					</div>
					{selectedStaff ? (
						<>
							<div className="staff-profile-header">
								<div>
									<h3>{selectedStaff.name}</h3>
									<p>
										{selectedStaff.role} • {selectedStaff.department}
									</p>
								</div>
								<span className={`staff-status-badge ${selectedStaff.active ? '' : 'staff-status-badge--inactive'}`}>
									{selectedStaff.active ? 'Active profile' : 'Inactive profile'}
								</span>
							</div>

							<div className="staff-contact-grid">
								<div>
									<span>Email</span>
									<strong>{selectedStaff.email}</strong>
								</div>
								<div>
									<span>Phone</span>
									<strong>{selectedStaff.phone}</strong>
								</div>
								<div>
									<span>Office hours</span>
									<strong>{selectedStaff.officeHours}</strong>
								</div>
								<div>
									<span>Office location</span>
									<strong>{selectedStaff.officeLocation}</strong>
								</div>
							</div>

							<p className="staff-bio">{selectedStaff.bio}</p>

							<div className="staff-course-section">
								<div className="panel-heading">
									<h2>Assigned courses</h2>
									<p>Click any course to preview its curriculum summary</p>
								</div>
								<div className="staff-course-list">
									{staffCourses.length ? (
										staffCourses.map((course) => (
											<button
												key={course.id}
												type="button"
												className={`staff-course-chip ${selectedCourseId === course.id ? 'staff-course-chip--active' : ''}`}
												onClick={() => setSelectedCourseId(course.id)}
											>
												{course.code} • {course.title}
											</button>
										))
									) : (
										<p className="section-text">No active courses are assigned to this staff profile.</p>
									)}
								</div>

								{selectedCourse ? (
									<div className="course-preview-card">
										<div className="thread-item__top">
											<strong>{selectedCourse.code} • {selectedCourse.title}</strong>
											<span>Curriculum module link ready</span>
										</div>
										<p>{selectedCourse.description}</p>
										<div className="course-roles-grid">
											<div>
												<span>Lead Professor</span>
												<strong>
													{staffMembers.find((staff) => staff.id === selectedCourse.leadProfessorId)?.name ?? 'Not assigned'}
												</strong>
											</div>
											<div>
												<span>Assigned TAs</span>
												<strong>
													{selectedCourse.assignedTAIds.length
														? selectedCourse.assignedTAIds
															.map((staffId) => staffMembers.find((staff) => staff.id === staffId)?.name)
															.filter(Boolean)
															.join(', ')
														: 'No TA assigned'}
												</strong>
											</div>
										</div>
									</div>
								) : null}
							</div>
						</>
					) : (
						<div className="empty-state empty-state--large">
							<h3>No staff selected</h3>
							<p>Select a directory entry to view the full staff profile.</p>
						</div>
					)}
				</section>
			</section>

			<section className="staff-role-panels">
				<section className="compose-panel ta-dashboard-panel">
					<div className="panel-heading">
						<h2>TA dashboard</h2>
						<p>Private workflow for teaching assistants</p>
					</div>
					{viewer === 'ta' && taProfile ? (
						<>
							<label className="staff-ta-selector">
								<span>Select TA</span>
								<select
									value={selectedTaId}
									onChange={(event) => setSelectedTaId(event.target.value)}
									disabled={isLoading || !taOptions.length}
								>
									{taOptions.map((staff) => (
										<option key={staff.id} value={staff.id}>
											{staff.name} • {staff.department}
										</option>
									))}
								</select>
							</label>

							<div className="ta-duty-list">
								{taProfile.duties.map((duty) => (
									<div key={duty} className="ta-duty-item">
										<strong>{duty}</strong>
										<span>{taProfile.name}</span>
									</div>
								))}
							</div>

							<div className="compose-grid">
								<label>
									<span>Email</span>
									<input
										type="email"
										value={taDraft.email}
										onChange={(event) => setTaDraft((current) => ({ ...current, email: event.target.value }))}
										disabled={isLoading}
									/>
								</label>
								<label>
									<span>Phone</span>
									<input
										type="text"
										value={taDraft.phone}
										onChange={(event) => setTaDraft((current) => ({ ...current, phone: event.target.value }))}
										disabled={isLoading}
									/>
								</label>
								<label>
									<span>Office hours</span>
									<input
										type="text"
										value={taDraft.officeHours}
										onChange={(event) => setTaDraft((current) => ({ ...current, officeHours: event.target.value }))}
										disabled={isLoading}
									/>
								</label>
								<label>
									<span>Office location</span>
									<input
										type="text"
										value={taDraft.officeLocation}
										onChange={(event) => setTaDraft((current) => ({ ...current, officeLocation: event.target.value }))}
										disabled={isLoading}
									/>
								</label>
							</div>

							<button type="button" className="community-primary staff-ta-save" onClick={handleSaveTaProfile} disabled={isLoading}>
								Save TA profile
							</button>
							{feedback && feedbackTarget === 'ta' ? (
								<div className="community-feedback staff-inline-feedback">{feedback}</div>
							) : null}
						</>
					) : (
						<div className="empty-state">
							<h3>Switch to TA view</h3>
							<p>The TA dashboard appears here with duties, office hours, and contact editing.</p>
						</div>
					)}
				</section>

				<section className="compose-panel hr-admin-panel">
					<div className="panel-heading">
						<h2>HR staff management</h2>
						<p>Create, deactivate, and bulk-upload directory records</p>
					</div>
					{viewer === 'admin' ? (
						<>
							<div className="compose-grid">
								<label>
									<span>Name</span>
									<input
										type="text"
										value={staffForm.name}
										onChange={(event) => setStaffForm((current) => ({ ...current, name: event.target.value }))}
										disabled={isLoading}
									/>
								</label>
								<label>
									<span>Role</span>
									<select
										value={staffForm.role}
										onChange={(event) => setStaffForm((current) => ({ ...current, role: event.target.value }))}
										disabled={isLoading}
									>
										<option value="Professor">Professor</option>
										<option value="Teaching Assistant">Teaching Assistant</option>
										<option value="HR Administrator">HR Administrator</option>
									</select>
								</label>
								<label>
									<span>Email</span>
									<input
										type="email"
										value={staffForm.email}
										onChange={(event) => setStaffForm((current) => ({ ...current, email: event.target.value }))}
										disabled={isLoading}
									/>
								</label>
								<label>
									<span>Department</span>
									<input
										type="text"
										value={staffForm.department}
										onChange={(event) => setStaffForm((current) => ({ ...current, department: event.target.value }))}
										disabled={isLoading}
									/>
								</label>
							</div>

							<div className="compose-grid">
								<label>
									<span>Phone</span>
									<input
										type="text"
										value={staffForm.phone}
										onChange={(event) => setStaffForm((current) => ({ ...current, phone: event.target.value }))}
										disabled={isLoading}
									/>
								</label>
								<label>
									<span>Office hours</span>
									<input
										type="text"
										value={staffForm.officeHours}
										onChange={(event) => setStaffForm((current) => ({ ...current, officeHours: event.target.value }))}
										disabled={isLoading}
									/>
								</label>
								<label>
									<span>Office location</span>
									<input
										type="text"
										value={staffForm.officeLocation}
										onChange={(event) => setStaffForm((current) => ({ ...current, officeLocation: event.target.value }))}
										disabled={isLoading}
									/>
								</label>
								<label>
									<span>Bio</span>
									<input
										type="text"
										value={staffForm.bio}
										onChange={(event) => setStaffForm((current) => ({ ...current, bio: event.target.value }))}
										disabled={isLoading}
									/>
								</label>
							</div>

							<div className="staff-admin-actions">
								<button type="button" className="community-primary" onClick={handleCreateStaff} disabled={isLoading}>
									Create staff profile
								</button>
								<button type="button" className="staff-secondary-action" onClick={handleDeactivateStaff} disabled={isLoading || !selectedStaff}>
									Deactivate selected profile
								</button>
								<button type="button" className="staff-secondary-action" onClick={handleMockBulkUpload} disabled={isLoading}>
									Bulk upload CSV / HR sync
								</button>
							</div>
							{feedback && feedbackTarget === 'admin' ? (
								<div className="community-feedback staff-inline-feedback">{feedback}</div>
							) : null}
						</>
					) : (
						<div className="empty-state">
							<h3>Switch to HR Administrator view</h3>
							<p>The admin panel appears here for record creation, deactivation, and bulk upload actions.</p>
						</div>
					)}
				</section>
			</section>
		</div>
	);
}

export default StaffModulePage;
