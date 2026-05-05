import { useEffect, useMemo, useState } from 'react';

import {
	assignFacilityEquipment,
	createFacilityBooking,
	createFacilityStudent,
	deleteFacilityBooking,
	deleteFacilityStudent,
	getFacilitiesBootstrap,
	updateFacilityBooking,
	updateFacilityStudent,
} from '../services/facilitiesService';

const viewerModes = [
	{
		id: 'student',
		label: 'Student view',
		description: 'Search classrooms and check schedules for a selected date and time.',
	},
	{
		id: 'admin',
		label: 'Admin view',
		description: 'Manage room bookings, equipment allocation, and student records.',
	},
];

const emptyBookingForm = {
	roomId: '',
	date: '2026-05-05',
	startTime: '08:00',
	endTime: '09:00',
	title: '',
	bookedBy: '',
};

const emptyStudentForm = {
	name: '',
	matricNo: '',
	email: '',
	department: '',
	level: '',
};

function isRoomBooked(bookings, roomId, date, time) {
	return bookings.some(
		(booking) =>
			booking.roomId === roomId &&
			booking.date === date &&
			time >= booking.startTime &&
			time < booking.endTime
	);
}

function FacilitiesModulePage({ onBack }) {
	const [viewer, setViewer] = useState('student');
	const [rooms, setRooms] = useState([]);
	const [bookings, setBookings] = useState([]);
	const [equipmentItems, setEquipmentItems] = useState([]);
	const [students, setStudents] = useState([]);
	const [selectedDate, setSelectedDate] = useState('2026-05-05');
	const [selectedTime, setSelectedTime] = useState('10:00');
	const [searchTerm, setSearchTerm] = useState('');
	const [selectedRoomId, setSelectedRoomId] = useState('');
	const [bookingForm, setBookingForm] = useState(emptyBookingForm);
	const [editingBookingId, setEditingBookingId] = useState(null);
	const [selectedEquipmentId, setSelectedEquipmentId] = useState('');
	const [selectedDepartment, setSelectedDepartment] = useState('Computer Science');
	const [selectedStudentId, setSelectedStudentId] = useState('');
	const [studentForm, setStudentForm] = useState(emptyStudentForm);
	const [feedback, setFeedback] = useState('');
	const [feedbackTarget, setFeedbackTarget] = useState('');
	const [loadError, setLoadError] = useState('');
	const [isLoading, setIsLoading] = useState(true);

	useEffect(() => {
		let isActive = true;

		const loadFacilitiesData = async () => {
			setIsLoading(true);
			setLoadError('');

			try {
				const payload = await getFacilitiesBootstrap();
				if (!isActive) {
					return;
				}

				const nextRooms = payload.rooms ?? [];
				const nextBookings = payload.bookings ?? [];
				const nextEquipmentItems = payload.equipmentItems ?? [];
				const nextStudents = payload.students ?? [];
				const firstRoom = nextRooms[0] ?? null;
				const firstStudent = nextStudents[0] ?? null;

				setRooms(nextRooms);
				setBookings(nextBookings);
				setEquipmentItems(nextEquipmentItems);
				setStudents(nextStudents);
				setSelectedRoomId((current) => current || firstRoom?.id || '');
				setBookingForm((current) => ({
					...current,
					roomId: current.roomId || firstRoom?.id || '',
					date: current.date || '2026-05-05',
				}));
				setSelectedEquipmentId((current) => current || nextEquipmentItems[0]?.id || '');
				setSelectedStudentId((current) => current || firstStudent?.id || '');
				setStudentForm(
					firstStudent
						? {
							name: firstStudent.name,
							matricNo: firstStudent.matricNo,
							email: firstStudent.email,
							department: firstStudent.department,
							level: firstStudent.level,
						}
						: emptyStudentForm
				);
			} catch (error) {
				if (isActive) {
					setLoadError(error.message || 'Unable to load facilities module data.');
				}
			} finally {
				if (isActive) {
					setIsLoading(false);
				}
			}
		};

		loadFacilitiesData();

		return () => {
			isActive = false;
		};
	}, []);

	const visibleRooms = useMemo(() => {
		const lowerSearch = searchTerm.toLowerCase();

		return rooms.filter((room) => {
			const matchesSearch =
				room.name.toLowerCase().includes(lowerSearch) ||
				room.building.toLowerCase().includes(lowerSearch) ||
				room.type.toLowerCase().includes(lowerSearch);

			return matchesSearch;
		});
	}, [rooms, searchTerm]);

	const roomSchedules = useMemo(
		() =>
			bookings
				.filter((booking) => booking.roomId === selectedRoomId && booking.date === selectedDate)
				.sort((left, right) => left.startTime.localeCompare(right.startTime)),
		[selectedDate, selectedRoomId, bookings]
	);

	const selectedRoom = rooms.find((room) => room.id === selectedRoomId) ?? null;
	const selectedEquipment = equipmentItems.find((item) => item.id === selectedEquipmentId) ?? null;
	const selectedStudent = students.find((student) => student.id === selectedStudentId) ?? null;
	const departmentOptions = useMemo(() => {
		const departments = new Set([
			...students.map((student) => student.department).filter(Boolean),
			...equipmentItems.map((item) => item.department).filter((department) => department && department !== 'Unassigned'),
			'Student Affairs',
		]);

		return Array.from(departments).sort((left, right) => left.localeCompare(right));
	}, [equipmentItems, students]);
	const availableRoomCount = visibleRooms.filter(
		(room) => !isRoomBooked(bookings, room.id, selectedDate, selectedTime)
	).length;
	const bookedRoomCount = visibleRooms.length - availableRoomCount;

	useEffect(() => {
		if (!rooms.some((room) => room.id === selectedRoomId)) {
			const nextRoomId = rooms[0]?.id || '';
			setSelectedRoomId(nextRoomId);
			setBookingForm((current) => ({ ...current, roomId: nextRoomId }));
		}
	}, [rooms, selectedRoomId]);

	useEffect(() => {
		if (!equipmentItems.some((item) => item.id === selectedEquipmentId)) {
			setSelectedEquipmentId(equipmentItems[0]?.id || '');
		}
	}, [equipmentItems, selectedEquipmentId]);

	useEffect(() => {
		if (!departmentOptions.includes(selectedDepartment)) {
			setSelectedDepartment(departmentOptions[0] || 'Computer Science');
		}
	}, [departmentOptions, selectedDepartment]);

	useEffect(() => {
		if (!editingBookingId) {
			setBookingForm((current) => ({
				...current,
				date: selectedDate,
			}));
		}
	}, [editingBookingId, selectedDate]);

	useEffect(() => {
		if (!students.some((student) => student.id === selectedStudentId)) {
			const nextStudent = students[0] ?? null;
			setSelectedStudentId(nextStudent?.id || '');
			setStudentForm(
				nextStudent
					? {
						name: nextStudent.name,
						matricNo: nextStudent.matricNo,
						email: nextStudent.email,
						department: nextStudent.department,
						level: nextStudent.level,
					}
					: emptyStudentForm
			);
		}
	}, [selectedStudentId, students]);

	const resetFeedback = (message, target) => {
		setFeedback(message);
		setFeedbackTarget(target);
		window.clearTimeout(window.__facilitiesFeedbackTimeout);
		window.__facilitiesFeedbackTimeout = window.setTimeout(() => {
			setFeedback('');
			setFeedbackTarget('');
		}, 4200);
	};

	const handleSelectRoom = (roomId) => {
		setSelectedRoomId(roomId);
		setBookingForm((current) => ({ ...current, roomId }));
	};

	const handleEditBooking = (booking) => {
		setEditingBookingId(booking.id);
		setBookingForm({
			roomId: booking.roomId,
			date: booking.date,
			startTime: booking.startTime,
			endTime: booking.endTime,
			title: booking.title,
			bookedBy: booking.bookedBy,
		});
	};

	const handleSaveBooking = async () => {
		if (!bookingForm.roomId || !bookingForm.date || !bookingForm.startTime || !bookingForm.endTime || !bookingForm.title || !bookingForm.bookedBy) {
			resetFeedback('Room, date, start time, end time, title, and booked by are required before saving a booking.', 'booking');
			return;
		}

		try {
			const savedBooking = editingBookingId
				? await updateFacilityBooking(editingBookingId, bookingForm)
				: await createFacilityBooking(bookingForm);

			setBookings((current) => {
				const nextBookings = editingBookingId
					? current.map((booking) => (booking.id === editingBookingId ? savedBooking : booking))
					: [...current, savedBooking];

				nextBookings.sort((left, right) => {
					const dateComparison = left.date.localeCompare(right.date);
					return dateComparison !== 0 ? dateComparison : left.startTime.localeCompare(right.startTime);
				});

				if (editingBookingId) {
					return nextBookings;
				}

				return nextBookings;
			});
			setSelectedRoomId(savedBooking.roomId);
			setSelectedDate(savedBooking.date);
			setEditingBookingId(null);
			setBookingForm({ ...emptyBookingForm, roomId: savedBooking.roomId, date: savedBooking.date });
			resetFeedback(editingBookingId ? 'Booking updated successfully.' : 'New booking added successfully.', 'booking');
		} catch (error) {
			resetFeedback(error.message || 'Unable to save booking.', 'booking');
		}
	};

	const handleDeleteBooking = async () => {
		if (!editingBookingId) {
			return;
		}

		try {
			await deleteFacilityBooking(editingBookingId);
			setBookings((current) => current.filter((booking) => booking.id !== editingBookingId));
			setEditingBookingId(null);
			setBookingForm({ ...emptyBookingForm, roomId: selectedRoomId, date: selectedDate });
			resetFeedback('Booking removed from the room schedule.', 'booking');
		} catch (error) {
			resetFeedback(error.message || 'Unable to delete booking.', 'booking');
		}
	};

	const handleAllocateEquipment = async () => {
		if (!selectedEquipment) {
			return;
		}

		try {
			const updatedEquipment = await assignFacilityEquipment({
				equipmentId: selectedEquipment.id,
				department: selectedDepartment,
			});
			setEquipmentItems((current) => current.map((item) => (item.id === updatedEquipment.id ? updatedEquipment : item)));
			resetFeedback(`${selectedEquipment.name} assigned to ${selectedDepartment}.`, 'equipment');
		} catch (error) {
			resetFeedback(error.message || 'Unable to assign equipment.', 'equipment');
		}
	};

	const handleAddStudent = async () => {
		if (!studentForm.name || !studentForm.matricNo || !studentForm.email || !studentForm.department) {
			resetFeedback('Name, matric number, email, and department are required before adding a student.', 'student');
			return;
		}

		try {
			const newStudent = await createFacilityStudent(studentForm);
			setStudents((current) => [...current, newStudent]);
			setSelectedStudentId(newStudent.id);
			setStudentForm(emptyStudentForm);
			resetFeedback(`${newStudent.name} added to student records.`, 'student');
		} catch (error) {
			resetFeedback(error.message || 'Unable to add student record.', 'student');
		}
	};

	const handleUpdateStudent = async () => {
		if (!selectedStudent) {
			return;
		}

		try {
			const updatedStudent = await updateFacilityStudent(selectedStudent.id, studentForm);
			setStudents((current) => current.map((student) => (student.id === updatedStudent.id ? updatedStudent : student)));
			resetFeedback(`${selectedStudent.name} updated successfully.`, 'student');
		} catch (error) {
			resetFeedback(error.message || 'Unable to update student record.', 'student');
		}
	};

	const handleDeleteStudent = async () => {
		if (!selectedStudent) {
			return;
		}

		try {
			await deleteFacilityStudent(selectedStudent.id);
			const nextStudents = students.filter((student) => student.id !== selectedStudent.id);
			const nextSelectedStudent = nextStudents[0] ?? null;
			setStudents(nextStudents);
			setSelectedStudentId(nextSelectedStudent?.id || '');
			setStudentForm(
				nextSelectedStudent
					? {
						name: nextSelectedStudent.name,
						matricNo: nextSelectedStudent.matricNo,
						email: nextSelectedStudent.email,
						department: nextSelectedStudent.department,
						level: nextSelectedStudent.level,
					}
					: emptyStudentForm
			);
			resetFeedback(`${selectedStudent.name} removed from student records.`, 'student');
		} catch (error) {
			resetFeedback(error.message || 'Unable to delete student record.', 'student');
		}
	};

	const loadStudentIntoForm = (studentId) => {
		const student = students.find((item) => item.id === studentId);
		setSelectedStudentId(studentId);
		if (student) {
			setStudentForm({
				name: student.name,
				matricNo: student.matricNo,
				email: student.email,
				department: student.department,
				level: student.level,
			});
		}
	};

	return (
		<div className="facilities-page">
			<header className="facilities-topbar">
				<div>
					<button type="button" className="community-back" onClick={onBack}>
						Back to dashboard
					</button>
					<p className="eyebrow">Facilities Module</p>
					<h1>Classrooms, schedules, and operational records</h1>
					<p className="facilities-intro">
						Search available rooms, inspect daily schedules, and switch to admin tools for bookings, equipment allocation, and student record maintenance.
					</p>
				</div>
				<div className="staff-viewer-switcher" role="tablist" aria-label="Facilities module views">
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

			{loadError ? <div className="community-feedback">{loadError}</div> : null}

			<section className="facilities-summary">
				<article className="community-stat-card">
					<span>Visible rooms</span>
					<strong>{visibleRooms.length}</strong>
					<small>Filtered by your current search criteria</small>
				</article>
				<article className="community-stat-card">
					<span>Available now</span>
					<strong>{availableRoomCount}</strong>
					<small>Open at {selectedTime} on {selectedDate}</small>
				</article>
				<article className="community-stat-card">
					<span>Booked now</span>
					<strong>{bookedRoomCount}</strong>
					<small>Occupied during the selected slot</small>
				</article>
			</section>

			<section className="compose-panel facilities-toolbar-card">
				<div className="panel-heading">
					<h2>Find a suitable room</h2>
					<p>Use search, date, and time to narrow the classroom list before opening a schedule.</p>
				</div>
				<div className="facilities-filters">
					<label className="facilities-filter-card">
						<span>Search room</span>
						<input
							type="text"
							value={searchTerm}
							onChange={(event) => setSearchTerm(event.target.value)}
							placeholder="Search by room, building, or type"
						/>
					</label>
					<label className="facilities-filter-card">
						<span>Date</span>
						<input type="date" value={selectedDate} onChange={(event) => setSelectedDate(event.target.value)} />
					</label>
					<label className="facilities-filter-card">
						<span>Time</span>
						<input type="time" value={selectedTime} onChange={(event) => setSelectedTime(event.target.value)} />
					</label>
				</div>
			</section>

			<section className="compose-panel facilities-room-browser">
				<div className="panel-heading">
					<h2>Available classrooms</h2>
					<p>Select a room card to inspect its schedule and manage usage.</p>
				</div>
				<div className="facilities-overview">
					{visibleRooms.map((room) => {
						const booked = isRoomBooked(bookings, room.id, selectedDate, selectedTime);

						return (
							<article
								key={room.id}
								className={`module-card module-card--facilities facilities-room-card ${selectedRoomId === room.id ? 'facilities-room-card--selected' : ''}`}
								role="button"
								tabIndex={0}
								onClick={() => handleSelectRoom(room.id)}
								onKeyDown={(event) => {
									if (event.key === 'Enter' || event.key === ' ') {
										event.preventDefault();
										handleSelectRoom(room.id);
									}
								}}
							>
								<div className="module-card__header">
									<span className="module-code">{room.name}</span>
									<span className={`facilities-status-badge ${booked ? 'facilities-status-badge--booked' : ''}`}>
										{booked ? 'Booked' : 'Available'}
									</span>
								</div>
								<div className="module-card__body">
									<h3>{room.building}</h3>
									<p>
										{room.type} • Capacity {room.capacity}
									</p>
								</div>
								<div className="module-tags" aria-label={`${room.name} facilities`}>
									{room.facilities.map((item) => (
										<span key={item}>{item}</span>
									))}
								</div>
							</article>
						);
					})}
				</div>
			</section>

			<section className="facilities-workspace">
				<section className="message-panel facilities-schedule-panel">
					<div className="panel-heading">
						<h2>Room schedule</h2>
						<p>
							{selectedRoom ? `${selectedRoom.name} • ${selectedRoom.building}` : 'Select a room'}
						</p>
					</div>
					{roomSchedules.length ? (
						<div className="thread-list">
							{roomSchedules.map((booking) => (
								<button
									key={booking.id}
									type="button"
									className={`thread-item ${editingBookingId === booking.id ? 'thread-item--active' : ''}`}
									onClick={() => handleEditBooking(booking)}
								>
									<div className="thread-item__top">
										<strong>{booking.title}</strong>
										<span>
											{booking.startTime} - {booking.endTime}
										</span>
									</div>
									<p>{booking.bookedBy}</p>
									<small>{booking.date}</small>
								</button>
							))}
						</div>
					) : (
						<div className="empty-state">
							<h3>No bookings for this date</h3>
							<p>Selected room is free for the chosen day.</p>
						</div>
					)}
				</section>

				<section className="compose-panel facilities-booking-panel">
					<div className="panel-heading">
						<h2>Manage classroom schedule</h2>
						<p>Admin workflow for adding, updating, and deleting bookings</p>
					</div>
					{viewer === 'admin' ? (
						<>
							<div className="compose-grid">
								<label>
									<span>Room</span>
									<select
										value={bookingForm.roomId}
										onChange={(event) => setBookingForm((current) => ({ ...current, roomId: event.target.value }))}
									>
										{rooms.map((room) => (
											<option key={room.id} value={room.id}>
												{room.name} • {room.building}
											</option>
										))}
									</select>
								</label>
								<label>
									<span>Date</span>
									<input
										type="date"
										value={bookingForm.date}
										onChange={(event) => setBookingForm((current) => ({ ...current, date: event.target.value }))}
									/>
								</label>
								<label>
									<span>Start time</span>
									<input
										type="time"
										value={bookingForm.startTime}
										onChange={(event) => setBookingForm((current) => ({ ...current, startTime: event.target.value }))}
									/>
								</label>
								<label>
									<span>End time</span>
									<input
										type="time"
										value={bookingForm.endTime}
										onChange={(event) => setBookingForm((current) => ({ ...current, endTime: event.target.value }))}
									/>
								</label>
							</div>

							<div className="compose-grid">
								<label>
									<span>Booking title</span>
									<input
										type="text"
										value={bookingForm.title}
										onChange={(event) => setBookingForm((current) => ({ ...current, title: event.target.value }))}
									/>
								</label>
								<label>
									<span>Booked by</span>
									<input
										type="text"
										value={bookingForm.bookedBy}
										onChange={(event) => setBookingForm((current) => ({ ...current, bookedBy: event.target.value }))}
									/>
								</label>
							</div>

							<div className="staff-admin-actions">
								<button type="button" className="community-primary" onClick={handleSaveBooking}>
									{editingBookingId ? 'Update booking' : 'Add booking'}
								</button>
								<button type="button" className="staff-secondary-action" onClick={handleDeleteBooking}>
									Delete booking
								</button>
							</div>

							{feedback && feedbackTarget === 'booking' ? (
								<div className="community-feedback curriculum-inline-feedback">{feedback}</div>
							) : null}
						</>
					) : (
						<div className="empty-state">
							<h3>Switch to Admin view</h3>
							<p>Booking management is available only in the admin workflow.</p>
						</div>
					)}
				</section>
			</section>

			<section className="facilities-admin-grid">
				<section className="compose-panel">
					<div className="panel-heading">
						<h2>Allocate equipment</h2>
						<p>Assign resources to departments and update their status</p>
					</div>
					{viewer === 'admin' ? (
						<>
							<div className="compose-grid">
								<label>
									<span>Equipment</span>
									<select value={selectedEquipmentId} onChange={(event) => setSelectedEquipmentId(event.target.value)}>
										{equipmentItems.map((item) => (
											<option key={item.id} value={item.id}>
												{item.name}
											</option>
										))}
									</select>
								</label>
								<label>
									<span>Department</span>
									<select value={selectedDepartment} onChange={(event) => setSelectedDepartment(event.target.value)}>
										{departmentOptions.map((department) => (
											<option key={department} value={department}>
												{department}
											</option>
										))}
									</select>
								</label>
							</div>

							{selectedEquipment ? (
								<div className="course-preview-card">
									<div className="thread-item__top">
										<strong>{selectedEquipment.name}</strong>
										<span>{selectedEquipment.category}</span>
									</div>
									<p>
										Current status: {selectedEquipment.status} • Location: {selectedEquipment.location}
									</p>
								</div>
							) : null}

							<button type="button" className="community-primary" onClick={handleAllocateEquipment}>
								Assign equipment
							</button>

							{feedback && feedbackTarget === 'equipment' ? (
								<div className="community-feedback curriculum-inline-feedback">{feedback}</div>
							) : null}
						</>
					) : (
						<div className="empty-state">
							<h3>Switch to Admin view</h3>
							<p>Equipment allocation is available only in the admin workflow.</p>
						</div>
					)}
				</section>

				<section className="compose-panel">
					<div className="panel-heading">
						<h2>Manage student records</h2>
						<p>Add, update, or delete student information</p>
					</div>
					{viewer === 'admin' ? (
						<>
							<div className="thread-list facilities-student-list">
								{students.map((student) => (
									<button
										key={student.id}
										type="button"
										className={`thread-item ${selectedStudentId === student.id ? 'thread-item--active' : ''}`}
										onClick={() => loadStudentIntoForm(student.id)}
									>
										<div className="thread-item__top">
											<strong>{student.name}</strong>
											<span>{student.level} level</span>
										</div>
										<p>{student.department}</p>
										<small>{student.matricNo}</small>
									</button>
								))}
							</div>

							<div className="compose-grid">
								<label>
									<span>Name</span>
									<input
										type="text"
										value={studentForm.name}
										onChange={(event) => setStudentForm((current) => ({ ...current, name: event.target.value }))}
									/>
								</label>
								<label>
									<span>Matric no</span>
									<input
										type="text"
										value={studentForm.matricNo}
										onChange={(event) => setStudentForm((current) => ({ ...current, matricNo: event.target.value }))}
									/>
								</label>
								<label>
									<span>Email</span>
									<input
										type="email"
										value={studentForm.email}
										onChange={(event) => setStudentForm((current) => ({ ...current, email: event.target.value }))}
									/>
								</label>
								<label>
									<span>Department</span>
									<input
										type="text"
										value={studentForm.department}
										onChange={(event) => setStudentForm((current) => ({ ...current, department: event.target.value }))}
									/>
								</label>
								<label>
									<span>Level</span>
									<input
										type="text"
										value={studentForm.level}
										onChange={(event) => setStudentForm((current) => ({ ...current, level: event.target.value }))}
									/>
								</label>
							</div>

							<div className="staff-admin-actions">
								<button type="button" className="community-primary" onClick={handleAddStudent}>
									Add student
								</button>
								<button type="button" className="staff-secondary-action" onClick={handleUpdateStudent}>
									Update selected
								</button>
								<button type="button" className="staff-secondary-action" onClick={handleDeleteStudent}>
									Delete selected
								</button>
							</div>

							{feedback && feedbackTarget === 'student' ? (
								<div className="community-feedback curriculum-inline-feedback">{feedback}</div>
							) : null}
						</>
					) : (
						<div className="empty-state">
							<h3>Switch to Admin view</h3>
							<p>Student record management is available only in the admin workflow.</p>
						</div>
					)}
				</section>
			</section>
		</div>
	);
}

export default FacilitiesModulePage;
