import { useEffect, useMemo, useState } from 'react';

import {
	createCurriculumRegistrationRequest,
	getCurriculumBootstrap,
	postCurriculumGrades,
	updateCurriculumRequestStatus,
} from '../services/curriculumService';
import { getStaffBootstrap, publishStaffCourseOffering } from '../services/staffService';

const viewerModes = [
	{
		id: 'student',
		label: 'Student view',
		description: 'Register courses, view materials, and track academic performance.',
	},
	{
		id: 'instructor',
		label: 'Instructor view',
		description: 'Review requests, approve enrollment, and post grades.',
	},
	{
		id: 'unit-head',
		label: 'Unit Head view',
		description: 'Activate semester courses and assign instructors and TAs.',
	},
];

const defaultStaffDirectory = [
	{ id: 'staff-001', name: 'Dr. James Okoro', role: 'Professor', email: 'j.okoro@ums.edu' },
	{ id: 'staff-002', name: 'Fatima Bello', role: 'Teaching Assistant', email: 'f.bello@ums.edu' },
	{ id: 'staff-003', name: 'Prof. Lillian Mensah', role: 'Professor', email: 'l.mensah@ums.edu' },
	{ id: 'staff-004', name: 'Daniel Otieno', role: 'Teaching Assistant', email: 'd.otieno@ums.edu' },
];

const initialCourseCatalog = [
	{
		id: 'csc201',
		code: 'CSC 201',
		title: 'Database Systems',
		credits: 3,
		program: 'Computer Science',
		level: '200',
		prerequisites: ['CSC 102'],
		capacity: 40,
		enrolled: 34,
		group: 'Group A',
		section: 'Section 1',
		leadProfessorId: 'staff-001',
		taIds: ['staff-002'],
		resources: [
			{ label: 'Lecture slides', type: 'Microsoft 365', url: 'https://m365.example.com/csc201/slides' },
			{ label: 'Lab sheet', type: 'Download', url: 'https://m365.example.com/csc201/lab-sheet' },
		],
	},
	{
		id: 'csc245',
		code: 'CSC 245',
		title: 'Software Engineering Fundamentals',
		credits: 2,
		program: 'Computer Science',
		level: '200',
		prerequisites: ['CSC 201'],
		capacity: 35,
		enrolled: 24,
		group: 'Group B',
		section: 'Section 2',
		leadProfessorId: 'staff-001',
		taIds: ['staff-002'],
		resources: [
			{ label: 'Agile playbook', type: 'Microsoft 365', url: 'https://m365.example.com/csc245/playbook' },
		],
	},
	{
		id: 'csc302',
		code: 'CSC 302',
		title: 'Computer Networks',
		credits: 3,
		program: 'Computer Science',
		level: '300',
		prerequisites: ['CSC 201'],
		capacity: 45,
		enrolled: 26,
		group: 'Group A',
		section: 'Section 1',
		leadProfessorId: 'staff-001',
		taIds: ['staff-004'],
		resources: [
			{ label: 'Network lab manual', type: 'Download', url: 'https://example.com/csc302/labs' },
		],
	},
	{
		id: 'csc315',
		code: 'CSC 315',
		title: 'Operating Systems',
		credits: 2,
		program: 'Computer Science',
		level: '300',
		prerequisites: ['CSC 201'],
		capacity: 38,
		enrolled: 17,
		group: 'Group C',
		section: 'Section 2',
		leadProfessorId: 'staff-003',
		taIds: ['staff-002'],
		resources: [
			{ label: 'Kernel notes', type: 'Microsoft 365', url: 'https://example.com/csc315/notes' },
		],
	},
	{
		id: 'bus310',
		code: 'BUS 310',
		title: 'Strategic Management',
		credits: 3,
		program: 'Business Administration',
		level: '300',
		prerequisites: ['BUS 210'],
		capacity: 50,
		enrolled: 29,
		group: 'Group C',
		section: 'Section 1',
		leadProfessorId: 'staff-003',
		taIds: [],
		resources: [
			{ label: 'Case study folder', type: 'External link', url: 'https://example.com/bus310/cases' },
		],
	},
	{
		id: 'eng330',
		code: 'ENG 330',
		title: 'Control Systems',
		credits: 2,
		program: 'Engineering',
		level: '300',
		prerequisites: ['ENG 305'],
		capacity: 32,
		enrolled: 20,
		group: 'Group B',
		section: 'Section 1',
		leadProfessorId: 'staff-003',
		taIds: ['staff-004'],
		resources: [
			{ label: 'Controller workbook', type: 'Download', url: 'https://example.com/eng330/workbook' },
		],
	},
	{
		id: 'eng410',
		code: 'ENG 410',
		title: 'Embedded Systems Workshop',
		credits: 3,
		program: 'Engineering',
		level: '400',
		prerequisites: ['ENG 305'],
		capacity: 25,
		enrolled: 18,
		group: 'Group D',
		section: 'Section 3',
		leadProfessorId: 'staff-003',
		taIds: ['staff-004'],
		resources: [
			{ label: 'Hardware checklist', type: 'Download', url: 'https://example.com/eng410/checklist' },
		],
	},
	{
		id: 'eng420',
		code: 'ENG 420',
		title: 'Industrial Automation',
		credits: 2,
		program: 'Engineering',
		level: '400',
		prerequisites: ['ENG 305'],
		capacity: 24,
		enrolled: 11,
		group: 'Group D',
		section: 'Section 2',
		leadProfessorId: 'staff-003',
		taIds: ['staff-004'],
		resources: [
			{ label: 'Automation sandbox', type: 'External link', url: 'https://example.com/eng420/sandbox' },
		],
	},
];

const initialStudents = [
	{
		id: 'student-1',
		name: 'Amina Yusuf',
		program: 'Computer Science',
		level: '300',
		gpa: 3.2,
		cgpa: 3.18,
		completedCourses: ['CSC 102', 'CSC 201', 'BUS 210'],
		registeredCourseIds: ['csc201', 'csc302'],
		notifications: ['Your previous registration request for CSC 201 was approved.'],
		gradebook: {
			csc201: { midterm: 16, participation: 8, final: 58, posted: true },
			csc302: { midterm: 0, participation: 0, final: 0, posted: false },
		},
	},
	{
		id: 'student-2',
		name: 'Samuel Kariuki',
		program: 'Engineering',
		level: '400',
		gpa: 1.9,
		cgpa: 2.05,
		completedCourses: ['ENG 305'],
		registeredCourseIds: ['eng330', 'eng410'],
		notifications: ['Advisor meeting recommended before finalizing registration.'],
		gradebook: {
			eng330: { midterm: 12, participation: 8, final: 0, posted: false },
			eng410: { midterm: 11, participation: 7, final: 44, posted: false },
		},
	},
];

const initialRequests = [
	{
		id: 'req-001',
		studentName: 'Amina Yusuf',
		studentId: 'student-1',
		courseId: 'csc315',
		gpa: 3.2,
		status: 'Pending',
		message: 'Requesting CSC 315 with Group C / Section 2',
	},
	{
		id: 'req-002',
		studentName: 'Samuel Kariuki',
		studentId: 'student-2',
		courseId: 'eng420',
		gpa: 1.9,
		status: 'Pending',
		message: 'Needs approval due to GPA threshold review.',
	},
];

const initialGrades = {
	studentId: 'student-1',
	courseId: 'csc201',
	midterm: 18,
	participation: 9,
	final: 60,
	posted: false,
};

const initialSemesterOfferings = [
	{
		id: 'offer-001',
		courseId: 'csc201',
		program: 'Computer Science',
		level: '200',
		leadProfessorId: 'staff-001',
		taIds: ['staff-002'],
		published: true,
	},
];

function getGpaLimits(gpa) {
	if (gpa < 2) {
		return { maxCreditHours: 15 };
	}

	if (gpa <= 3) {
		return { maxCreditHours: 18 };
	}

	return { maxCreditHours: 21 };
}

function clampScore(value, min, max) {
	if (Number.isNaN(value)) {
		return min;
	}

	return Math.min(Math.max(value, min), max);
}

function CurriculumModulePage({ onBack }) {
	const [viewer, setViewer] = useState('student');
	const [staffDirectory, setStaffDirectory] = useState(defaultStaffDirectory);
	const [courseCatalog, setCourseCatalog] = useState(initialCourseCatalog);
	const [studentProfiles, setStudentProfiles] = useState(initialStudents);
	const [selectedStudentViewId, setSelectedStudentViewId] = useState('student-1');
	const [registrationRequests, setRegistrationRequests] = useState(initialRequests);
	const [selectedCourseId, setSelectedCourseId] = useState('csc245');
	const [selectedGroup, setSelectedGroup] = useState('Group B');
	const [selectedSection, setSelectedSection] = useState('Section 2');
	const [gradeDraft, setGradeDraft] = useState(initialGrades);
	const [selectedInstructorStudentId, setSelectedInstructorStudentId] = useState('student-1');
	const [selectedTrackedCourseId, setSelectedTrackedCourseId] = useState('csc201');
	const [semesterOfferings, setSemesterOfferings] = useState([]);
	const [selectedOfferingCourseId, setSelectedOfferingCourseId] = useState('csc245');
	const [selectedProgram, setSelectedProgram] = useState('Computer Science');
	const [selectedLevel, setSelectedLevel] = useState('200');
	const [selectedProfessorId, setSelectedProfessorId] = useState('staff-001');
	const [selectedTaIds, setSelectedTaIds] = useState(['staff-002']);
	const [feedback, setFeedback] = useState('');
	const [feedbackTarget, setFeedbackTarget] = useState('');
	const [pageError, setPageError] = useState('');
	const getStaffName = (staffId) => staffDirectory.find((staff) => staff.id === staffId)?.name ?? 'Not assigned';

	const studentProfile = studentProfiles.find((student) => student.id === selectedStudentViewId) ?? initialStudents[0];
	const instructorTargetStudent =
		studentProfiles.find((student) => student.id === selectedInstructorStudentId) ?? initialStudents[0];
	const selectedCourse = courseCatalog.find((course) => course.id === selectedCourseId) ?? null;
	const limits = getGpaLimits(studentProfile.gpa);
	const registeredCourses = courseCatalog.filter((course) => studentProfile.registeredCourseIds.includes(course.id));
	const instructorRegisteredCourses = courseCatalog.filter((course) =>
		instructorTargetStudent.registeredCourseIds.includes(course.id)
	);
	const trackedCourseId =
		registeredCourses.some((course) => course.id === selectedTrackedCourseId)
			? selectedTrackedCourseId
			: registeredCourses[0]?.id ?? '';
	const trackedCourse = registeredCourses.find((course) => course.id === trackedCourseId) ?? null;
	const trackedCourseGrade = trackedCourse ? studentProfile.gradebook[trackedCourse.id] : null;
	const effectiveGradeCourseId =
		instructorRegisteredCourses.some((course) => course.id === gradeDraft.courseId)
			? gradeDraft.courseId
			: instructorRegisteredCourses[0]?.id ?? '';
	const gradeCourse = courseCatalog.find((course) => course.id === effectiveGradeCourseId) ?? null;
	const currentCredits = registeredCourses.reduce((sum, course) => sum + course.credits, 0);

	const availableCourses = useMemo(() => courseCatalog, [courseCatalog]);

	const requestRows = useMemo(
		() =>
			registrationRequests.map((request) => ({
				...request,
				course: courseCatalog.find((course) => course.id === request.courseId),
			})),
		[registrationRequests]
	);

	const pendingRequestRows = useMemo(
		() => requestRows.filter((request) => request.status === 'Pending'),
		[requestRows]
	);
	const selectedOfferingCourse = courseCatalog.find((course) => course.id === selectedOfferingCourseId) ?? null;

	const weightedScore =
		clampScore(gradeDraft.midterm, 0, 20) +
		clampScore(gradeDraft.participation, 0, 10) +
		clampScore(gradeDraft.final, 0, 70);
	const projectedSemesterGpa = Number((Math.min(weightedScore / 25, 4)).toFixed(2));
	const projectedCgpa = Number((Math.min((instructorTargetStudent.cgpa + projectedSemesterGpa) / 2, 4)).toFixed(2));
	const academicStanding = projectedSemesterGpa < 2 ? 'Academic Probation' : projectedSemesterGpa > 3.6 ? 'Honors' : 'Good Standing';

	const resetFeedback = (message, target) => {
		setFeedback(message);
		setFeedbackTarget(target);
		window.clearTimeout(window.__curriculumFeedbackTimeout);
		window.__curriculumFeedbackTimeout = window.setTimeout(() => {
			setFeedback('');
			setFeedbackTarget('');
		}, 2600);
	};

	useEffect(() => {
		let isActive = true;

		const loadCurriculumState = async () => {
			try {
				const [curriculumPayload, staffPayload] = await Promise.all([
					getCurriculumBootstrap(),
					getStaffBootstrap(),
				]);
				if (!isActive) {
					return;
				}

				setCourseCatalog(curriculumPayload.courseCatalog ?? initialCourseCatalog);
				setStudentProfiles(curriculumPayload.studentProfiles ?? initialStudents);
				setRegistrationRequests(curriculumPayload.registrationRequests ?? initialRequests);
				setStaffDirectory(staffPayload.staffMembers ?? defaultStaffDirectory);
				setSemesterOfferings(staffPayload.semesterOfferings ?? []);
				setPageError('');
			} catch (error) {
				if (isActive) {
					setPageError(error.message || 'Unable to load persisted curriculum data.');
				}
			}
		};

		loadCurriculumState();

		return () => {
			isActive = false;
		};
	}, []);

	const handleRequestStatusChange = async (requestId, status) => {
		const request = registrationRequests.find((item) => item.id === requestId);
		if (!request) {
			return;
		}

		try {
			const result = await updateCurriculumRequestStatus(requestId, { status });
			setRegistrationRequests((current) =>
				current.map((item) => (item.id === requestId ? result.request : item))
			);
			setStudentProfiles((current) =>
				current.map((student) => (student.id === result.student.id ? result.student : student))
			);
			setCourseCatalog((current) =>
				current.map((course) => (course.id === result.course.id ? result.course : course))
			);
			resetFeedback(
				status === 'Accept'
					? 'Registration accepted and synced across student-facing modules.'
					: 'Registration request rejected and student notification queued.',
				'instructor-review'
			);
		} catch (error) {
			resetFeedback(error.message || 'Unable to update the registration request.', 'instructor-review');
		}
	};

	const handleRegisterCourse = async () => {
		if (!selectedCourse) {
			return;
		}

		try {
			const request = await createCurriculumRegistrationRequest({
				studentId: selectedStudentViewId,
				courseId: selectedCourse.id,
				group: selectedGroup,
				section: selectedSection,
			});
			setRegistrationRequests((current) => [request, ...current]);
			resetFeedback('Course registration request submitted for instructor review.', 'student-registration');
		} catch (error) {
			resetFeedback(error.message || 'Unable to submit registration request.', 'student-registration');
		}
	};

	const handlePostGrades = async () => {
		if (!effectiveGradeCourseId) {
			resetFeedback('Select a student with at least one registered course before posting grades.', 'instructor-grades');
			return;
		}

		const normalizedMidterm = clampScore(gradeDraft.midterm, 0, 20);
		const normalizedParticipation = clampScore(gradeDraft.participation, 0, 10);
		const normalizedFinal = clampScore(gradeDraft.final, 0, 70);

		try {
			const result = await postCurriculumGrades({
				studentId: selectedInstructorStudentId,
				courseId: effectiveGradeCourseId,
				midterm: normalizedMidterm,
				participation: normalizedParticipation,
				final: normalizedFinal,
			});
			setStudentProfiles((current) =>
				current.map((student) => (student.id === result.student.id ? result.student : student))
			);
			setGradeDraft((current) => ({
				...current,
				midterm: result.postedGrade.midterm,
				participation: result.postedGrade.participation,
				final: result.postedGrade.final,
				posted: true,
			}));
			resetFeedback(`Grades posted for ${instructorTargetStudent.name} and GPA / CGPA updated.`, 'instructor-grades');
		} catch (error) {
			resetFeedback(error.message || 'Unable to post grades.', 'instructor-grades');
		}
	};

	const toggleTaAssignment = (staffId) => {
		setSelectedTaIds((current) =>
			current.includes(staffId) ? current.filter((id) => id !== staffId) : [...current, staffId]
		);
	};

	const handlePublishOffering = async () => {
		if (!selectedOfferingCourse) {
			resetFeedback('Select a course before publishing the semester offering.', 'unit-head-offering');
			return;
		}

		try {
			const offering = await publishStaffCourseOffering({
				sourceCourseId: selectedOfferingCourse.id,
				code: selectedOfferingCourse.code,
				title: selectedOfferingCourse.title,
				description: `${selectedOfferingCourse.title} published from curriculum planning.`,
				program: selectedProgram,
				level: selectedLevel,
				leadProfessorId: selectedProfessorId,
				taIds: selectedTaIds,
			});

			setSemesterOfferings((current) => [
				offering,
				...current.filter((item) => item.staffCourseId !== offering.staffCourseId),
			]);
			setPageError('');
			resetFeedback('Semester course offering published and synced to assigned staff.', 'unit-head-offering');
		} catch (error) {
			resetFeedback(error.message || 'Unable to publish semester offering.', 'unit-head-offering');
		}
	};

	return (
		<div className="curriculum-page">
			<header className="curriculum-topbar">
				<div>
					<button type="button" className="community-back" onClick={onBack}>
						Back to dashboard
					</button>
					<p className="eyebrow">Curriculum Module</p>
					<h1>Registration rules, grade workflows, and semester course planning</h1>
					<p className="curriculum-intro">
						Switch across Student, Instructor, and Unit Head workflows to manage registration, grading, academic standing, and semester course publishing from one module.
					</p>
				</div>
				<div className="staff-viewer-switcher" role="tablist" aria-label="Curriculum module views">
					{viewerModes.map((mode) => (
						<button
							key={mode.id}
							type="button"
							className={`staff-viewer-chip ${viewer === mode.id ? 'staff-viewer-chip--active' : ''}`}
							onClick={() => setViewer(mode.id)}
						>
							<strong>{mode.label}</strong>
							<span>{mode.description}</span>
						</button>
					))}
				</div>
			</header>

			{pageError ? <div className="community-feedback">{pageError}</div> : null}

			<section className="curriculum-summary">
				<article className="community-stat-card">
					<span>Current GPA</span>
					<strong>{studentProfile.gpa.toFixed(2)}</strong>
					<small>Credit-hour limit: {currentCredits} / {limits.maxCreditHours} credit hours</small>
				</article>
				<article className="community-stat-card">
					<span>Registered load</span>
					<strong>{currentCredits}</strong>
					<small>{registeredCourses.length} active course assignments</small>
				</article>
				<article className="community-stat-card">
					<span>Academic standing</span>
					<strong>{academicStanding}</strong>
					<small>Updates when final grades are posted</small>
				</article>
			</section>

			<section className="curriculum-grid curriculum-grid--student">
				<section className="message-panel">
					<div className="panel-heading">
						<h2>Rule-based registration</h2>
						<p>Select courses, groups, and sections within your GPA eligibility</p>
					</div>

					<div className="curriculum-student-card">
						<div className="curriculum-student-card__header">
							<div>
								<p className="panel-label">Student profile</p>
								<h3>{studentProfile.name}</h3>
							</div>
							<span className="curriculum-status-chip">GPA {studentProfile.gpa.toFixed(2)}</span>
						</div>

						<div className="curriculum-student-card__meta">
							<div>
								<span>Program</span>
								<strong>{studentProfile.program}</strong>
							</div>
							<div>
								<span>Level</span>
								<strong>{studentProfile.level}</strong>
							</div>
							<div>
								<span>CGPA</span>
								<strong>{studentProfile.cgpa.toFixed(2)}</strong>
							</div>
						</div>

						<label className="curriculum-student-select">
							<span>Switch student</span>
							<select value={selectedStudentViewId} onChange={(event) => setSelectedStudentViewId(event.target.value)}>
								{studentProfiles.map((student) => (
									<option key={student.id} value={student.id}>
										{student.name} • GPA {student.gpa.toFixed(2)}
									</option>
								))}
							</select>
						</label>
					</div>

					<div className="compose-grid">
						<label>
							<span>Course</span>
							<select value={selectedCourseId} onChange={(event) => setSelectedCourseId(event.target.value)}>
								{availableCourses.map((course) => (
									<option key={course.id} value={course.id}>
										{course.code} • {course.title} • {course.credits} CH
									</option>
								))}
							</select>
						</label>
						<label>
							<span>Group</span>
							<select value={selectedGroup} onChange={(event) => setSelectedGroup(event.target.value)}>
								<option value="Group A">Group A</option>
								<option value="Group B">Group B</option>
								<option value="Group C">Group C</option>
							</select>
						</label>
						<label>
							<span>Section</span>
							<select value={selectedSection} onChange={(event) => setSelectedSection(event.target.value)}>
								<option value="Section 1">Section 1</option>
								<option value="Section 2">Section 2</option>
								<option value="Section 3">Section 3</option>
							</select>
						</label>
					</div>

					{selectedCourse ? (
						<div className="course-preview-card">
							<div className="thread-item__top">
								<strong>{selectedCourse.code} • {selectedCourse.title}</strong>
								<span>{selectedCourse.credits} credits</span>
							</div>
							<p>
								Prerequisites: {selectedCourse.prerequisites.join(', ')} • Capacity: {selectedCourse.enrolled}/{selectedCourse.capacity}
							</p>
						</div>
					) : null}

					<button type="button" className="community-primary" onClick={handleRegisterCourse}>
						Submit registration request
					</button>

					{feedback && feedbackTarget === 'student-registration' ? (
						<div className="community-feedback curriculum-inline-feedback">{feedback}</div>
					) : null}
				</section>

				<section className="compose-panel">
					<div className="panel-heading">
						<h2>Student progress tracking</h2>
						<p>Use the assigned-course dropdown to verify active registration, materials, grades, and staff</p>
					</div>

					{registeredCourses.length ? (
						<>
							<label className="curriculum-student-select">
								<span>Assigned courses</span>
								<select value={trackedCourseId} onChange={(event) => setSelectedTrackedCourseId(event.target.value)}>
									{registeredCourses.map((course) => (
										<option key={course.id} value={course.id}>
											{course.code} • {course.title}
										</option>
									))}
								</select>
							</label>

							{trackedCourse ? (
								<article className="thread-item curriculum-course-card">
									<div className="thread-item__top">
										<strong>{trackedCourse.code}</strong>
										<span>{trackedCourse.group} • {trackedCourse.section}</span>
									</div>
									<p>{trackedCourse.title}</p>
									<small>
										Professor: {getStaffName(trackedCourse.leadProfessorId)} • TA: {trackedCourse.taIds.length ? trackedCourse.taIds.map(getStaffName).join(', ') : 'Not assigned'}
									</small>
									<div className="curriculum-resource-list">
										{trackedCourse.resources.map((resource) => (
											<a key={resource.label} href={resource.url} className="curriculum-resource-chip">
												{resource.label} • {resource.type}
											</a>
										))}
									</div>
									<div className="course-roles-grid">
										<div>
											<span>Registration status</span>
											<strong>Confirmed in current curriculum load</strong>
										</div>
										<div>
											<span>Credit hours</span>
											<strong>{trackedCourse.credits} CH</strong>
										</div>
										<div>
											<span>Grades</span>
											<strong>
												{trackedCourseGrade?.posted ? `Midterm ${trackedCourseGrade.midterm}, Participation ${trackedCourseGrade.participation}, Final ${trackedCourseGrade.final}` : 'Not posted yet'}
											</strong>
										</div>
									</div>
								</article>
							) : null}
						</>
					) : (
						<div className="empty-state">
							<h3>No registered courses</h3>
							<p>This student has no confirmed course assignments yet.</p>
						</div>
					)}

					<div className="curriculum-notification-panel">
						<h3>Notifications</h3>
						<ul className="highlight-list">
							{studentProfile.notifications.map((notice) => (
								<li key={notice}>{notice}</li>
							))}
						</ul>
					</div>
				</section>
			</section>

			<section className="curriculum-grid curriculum-grid--instructor">
				<section className="message-panel">
					<div className="panel-heading">
						<h2>Instructor review and enrollment finalization</h2>
						<p>Student requests with GPA, target student context, and decision controls</p>
					</div>

					{viewer === 'instructor' ? (
						<div className="thread-list">
							<div className="course-preview-card">
								<div className="thread-item__top">
									<strong>Instructor target student</strong>
									<span>{instructorTargetStudent.program} • Level {instructorTargetStudent.level}</span>
								</div>
								<p>
									{instructorTargetStudent.name} • GPA {instructorTargetStudent.gpa.toFixed(2)} • CGPA {instructorTargetStudent.cgpa.toFixed(2)}
								</p>
							</div>
							{pendingRequestRows.map((request) => (
								<article key={request.id} className="thread-item curriculum-request-card">
									<div className="thread-item__top">
										<strong>{request.studentName}</strong>
										<span>GPA {request.gpa.toFixed(2)}</span>
									</div>
									<p>{request.course?.code} • {request.course?.title}</p>
									<small>{request.message}</small>
									<div className="staff-admin-actions">
										<button type="button" className="community-primary" onClick={() => handleRequestStatusChange(request.id, 'Accept')}>
											Accept
										</button>
										<button type="button" className="staff-secondary-action" onClick={() => handleRequestStatusChange(request.id, 'Reject')}>
											Reject
										</button>
										<span className="curriculum-status-chip">{request.status}</span>
									</div>
								</article>
							))}

							{!pendingRequestRows.length ? (
								<div className="empty-state">
									<h3>No pending requests</h3>
									<p>All registration requests for this queue have already been reviewed.</p>
								</div>
							) : null}

							{feedback && feedbackTarget === 'instructor-review' ? (
								<div className="community-feedback curriculum-inline-feedback">{feedback}</div>
							) : null}
						</div>
					) : (
						<div className="empty-state">
							<h3>Switch to Instructor view</h3>
							<p>This panel is available only for instructors reviewing registration requests.</p>
						</div>
					)}
				</section>

				<section className="compose-panel">
					<div className="panel-heading">
						<h2>Grade entry and automated GPA</h2>
						<p>Weighted scoring with automated standing updates</p>
					</div>

					{viewer === 'instructor' ? (
						<>
							<div className="course-preview-card">
								<div className="thread-item__top">
									<strong>Posting grades for</strong>
									<span>{instructorTargetStudent.program} • Level {instructorTargetStudent.level}</span>
								</div>
								<p>
									{instructorTargetStudent.name} • Current GPA {instructorTargetStudent.gpa.toFixed(2)} • Registered courses {instructorRegisteredCourses.length}
								</p>
							</div>

							<div className="compose-grid">
								<label>
									<span>Student</span>
									<select
										value={selectedInstructorStudentId}
										onChange={(event) => {
											const nextStudentId = event.target.value;
											const nextStudent = studentProfiles.find((student) => student.id === nextStudentId);
											setSelectedInstructorStudentId(nextStudentId);
											setGradeDraft((current) => ({
												...current,
												studentId: nextStudentId,
												courseId: nextStudent?.registeredCourseIds[0] ?? '',
											}));
										}}
									>
										{studentProfiles.map((student) => (
											<option key={student.id} value={student.id}>
												{student.name} • GPA {student.gpa.toFixed(2)}
											</option>
										))}
									</select>
								</label>
								<label>
									<span>Course</span>
									<select
										value={effectiveGradeCourseId}
										onChange={(event) => setGradeDraft((current) => ({ ...current, courseId: event.target.value }))}
									>
										{instructorRegisteredCourses.map((course) => (
											<option key={course.id} value={course.id}>
												{course.code} • {course.title}
											</option>
										))}
									</select>
								</label>
								<label>
									<span>Midterm (20%)</span>
									<input type="number" min="0" max="20" value={gradeDraft.midterm} onChange={(event) => setGradeDraft((current) => ({ ...current, midterm: clampScore(Number(event.target.value), 0, 20) }))} />
								</label>
								<label>
									<span>Participation / Attendance (10%)</span>
									<input type="number" min="0" max="10" value={gradeDraft.participation} onChange={(event) => setGradeDraft((current) => ({ ...current, participation: clampScore(Number(event.target.value), 0, 10) }))} />
								</label>
								<label>
									<span>Final (70%)</span>
									<input type="number" min="0" max="70" value={gradeDraft.final} onChange={(event) => setGradeDraft((current) => ({ ...current, final: clampScore(Number(event.target.value), 0, 70) }))} />
								</label>
							</div>

							<div className="course-roles-grid curriculum-grade-grid">
								<div>
									<span>Projected GPA</span>
									<strong>{projectedSemesterGpa.toFixed(2)}</strong>
								</div>
								<div>
									<span>Projected CGPA</span>
									<strong>{projectedCgpa.toFixed(2)}</strong>
								</div>
								<div>
									<span>Standing</span>
									<strong>{academicStanding}</strong>
								</div>
								<div>
									<span>Posting status</span>
									<strong>{gradeDraft.posted ? 'Posted to student profile' : 'Draft only'}</strong>
								</div>
							</div>

							<button type="button" className="community-primary" onClick={handlePostGrades}>
								Post grades
							</button>

							{feedback && feedbackTarget === 'instructor-grades' ? (
								<div className="community-feedback curriculum-inline-feedback">{feedback}</div>
							) : null}
						</>
					) : (
						<div className="empty-state">
							<h3>Switch to Instructor view</h3>
							<p>This panel is available only for instructors entering and posting grades.</p>
						</div>
					)}
				</section>
			</section>

			<section className="compose-panel curriculum-unit-head-panel">
				<div className="panel-heading">
					<h2>Semester offering and level assignment</h2>
					<p>Activate course offerings and publish staff assignments</p>
				</div>

				{viewer === 'unit-head' ? (
					<>
						<div className="compose-grid">
							<label>
								<span>Course catalog</span>
								<select value={selectedOfferingCourseId} onChange={(event) => setSelectedOfferingCourseId(event.target.value)}>
									{courseCatalog.map((course) => (
										<option key={course.id} value={course.id}>
											{course.code} • {course.title}
										</option>
									))}
								</select>
							</label>
							<label>
								<span>Program</span>
								<select value={selectedProgram} onChange={(event) => setSelectedProgram(event.target.value)}>
									<option value="Computer Science">Computer Science</option>
									<option value="Business Administration">Business Administration</option>
									<option value="Engineering">Engineering</option>
								</select>
							</label>
							<label>
								<span>Level</span>
								<select value={selectedLevel} onChange={(event) => setSelectedLevel(event.target.value)}>
									<option value="200">200</option>
									<option value="300">300</option>
									<option value="400">400</option>
								</select>
							</label>
							<label>
								<span>Primary instructor</span>
								<select value={selectedProfessorId} onChange={(event) => setSelectedProfessorId(event.target.value)}>
									{staffDirectory.filter((staff) => staff.role === 'Professor').map((staff) => (
										<option key={staff.id} value={staff.id}>
											{staff.name}
										</option>
									))}
								</select>
							</label>
						</div>

						<div className="curriculum-ta-picker">
							<p className="panel-label">Assign teaching assistants</p>
							<div className="curriculum-check-grid">
								{staffDirectory.filter((staff) => staff.role === 'Teaching Assistant').map((staff) => (
									<label key={staff.id} className="curriculum-check-card">
										<input
											type="checkbox"
											checked={selectedTaIds.includes(staff.id)}
											onChange={() => toggleTaAssignment(staff.id)}
										/>
										<span>{staff.name}</span>
									</label>
								))}
							</div>
						</div>

						<button type="button" className="community-primary" onClick={handlePublishOffering}>
							Publish semester offering
						</button>

						{feedback && feedbackTarget === 'unit-head-offering' ? (
							<div className="community-feedback curriculum-inline-feedback">{feedback}</div>
						) : null}

						<div className="thread-list curriculum-offering-list">
							{semesterOfferings.map((offering) => {
								return (
									<article key={offering.id} className="thread-item">
										<div className="thread-item__top">
											<strong>{offering.code} • {offering.title}</strong>
											<span>{offering.program} • Level {offering.level}</span>
										</div>
										<p>
											Professor: {getStaffName(offering.leadProfessorId)}
										</p>
										<small>
											TA assignments: {offering.taIds.length ? offering.taIds.map(getStaffName).join(', ') : 'None'} • {offering.published ? 'Published to LMS' : 'Draft'}
										</small>
									</article>
								);
							})}
						</div>
					</>
				) : (
					<div className="empty-state">
						<h3>Switch to Unit Head view</h3>
						<p>This panel activates semester courses and publishes instructor assignments.</p>
					</div>
				)}
			</section>
		</div>
	);
}

export default CurriculumModulePage;