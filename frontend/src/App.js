import { useEffect, useState } from 'react';

import CommunityModulePage from './pages/CommunityModulePage';
import CurriculumModulePage from './pages/CurriculumModulePage';
import FacilitiesModulePage from './pages/FacilitiesModulePage';
import StaffModulePage from './pages/StaffModulePage';

const modules = [
	{
		title: 'Staff Module',
		code: '01',
		summary: 'Manage lecturers, administrators, roles, and departmental assignments.',
		focus: ['Profiles', 'Departments', 'Role setup'],
		action: 'Open staff records',
		accent: 'staff',
		view: 'staff',
		available: true,
	},
	{
		title: 'Community Module',
		code: '02',
		summary: 'Coordinate student engagement, clubs, notices, and community activities.',
		focus: ['Announcements', 'Events', 'Engagement'],
		action: 'Explore community',
		accent: 'community',
		view: 'community',
		available: true,
	},
	{
		title: 'Curriculum Module',
		code: '03',
		summary: 'Organize programmes, course structures, credit units, and academic flow.',
		focus: ['Programmes', 'Courses', 'Semester plan'],
		action: 'View curriculum',
		accent: 'curriculum',
		view: 'curriculum',
		available: true,
	},
	{
		title: 'Facilities Module',
		code: '04',
		summary: 'Track classrooms, labs, maintenance status, and shared campus resources.',
		focus: ['Rooms', 'Assets', 'Maintenance'],
		action: 'Check facilities',
		accent: 'facilities',
		view: 'facilities',
		available: true,
	},
];

const userHighlights = [
	'Review staff and department information in one place.',
	'Check announcements, activities, and community updates.',
	'Browse programmes, courses, and semester structure.',
	'View campus spaces, assets, and facility records.',
];

function App() {
	const [activeView, setActiveView] = useState('dashboard');

	useEffect(() => {
		window.scrollTo({ top: 0, left: 0, behavior: 'auto' });
	}, [activeView]);

	if (activeView === 'staff') {
		return <StaffModulePage onBack={() => setActiveView('dashboard')} />;
	}

	if (activeView === 'community') {
		return <CommunityModulePage onBack={() => setActiveView('dashboard')} />;
	}

	if (activeView === 'curriculum') {
		return <CurriculumModulePage onBack={() => setActiveView('dashboard')} />;
	}

	if (activeView === 'facilities') {
		return <FacilitiesModulePage onBack={() => setActiveView('dashboard')} />;
	}

	return (
		<div className="app-shell">
			<div className="background-orb orb-one" />
			<div className="background-orb orb-two" />

			<main className="dashboard-layout">
				<section className="hero-panel">
					<div className="hero-copy">
						<p className="eyebrow">University Management System</p>
						<h1>Your university dashboard, organized by what matters.</h1>
						<p className="hero-text">
							Access staff operations, community activity, academic planning, and
							facilities management from one clean entry point designed for daily use.
						</p>
					</div>

					<div className="hero-utility-grid">
						<section className="hero-utility-card" aria-label="What you can do">
							<p className="panel-label">What you can do</p>
							<ul className="highlight-list">
								{userHighlights.map((item) => (
									<li key={item}>{item}</li>
								))}
							</ul>
						</section>
					</div>
				</section>

				<section className="module-section">
					<div className="section-heading">
						<div>
							<p className="eyebrow">Modules</p>
							<h2>Choose a service area</h2>
						</div>
						<p className="section-text">
							Open the part of the system you want to manage right now.
						</p>
					</div>

					<div className="module-grid">
						{modules.map((module) => (
							<article
								key={module.title}
								className={`module-card module-card--${module.accent}`}
								role={module.available ? 'button' : undefined}
								tabIndex={module.available ? 0 : undefined}
								onClick={() => module.view && setActiveView(module.view)}
								onKeyDown={(event) => {
									if (module.view && (event.key === 'Enter' || event.key === ' ')) {
										event.preventDefault();
										setActiveView(module.view);
									}
								}}
							>
								<div className="module-card__header">
									<span className="module-code">{module.code}</span>
									<span className="module-status">Available</span>
								</div>

								<div className="module-card__body">
									<h3>{module.title}</h3>
									<p>{module.summary}</p>
								</div>

								<div className="module-tags" aria-label={`${module.title} focus areas`}>
									{module.focus.map((item) => (
										<span key={item}>{item}</span>
									))}
								</div>

								<div className={`module-action ${module.available ? '' : 'module-action--disabled'}`}>
									{module.action}
								</div>
							</article>
						))}
					</div>
				</section>
			</main>
		</div>
	);
}

export default App;
