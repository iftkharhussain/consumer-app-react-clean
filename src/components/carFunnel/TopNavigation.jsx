/* eslint-disable */
import React from 'react';
import { calculateProgress, getStepsWithStatus } from 'utils/carFunnel/progressCalculator';
import { getAssetPath } from 'utils/carFunnel/assetPath';
import BackButton from './common/BackButton';
import 'styles/carFunnel/components/TopNavigation.css';

const Step = ({ title, status, isLast }) => {
	// status: 'finish' | 'process' | 'wait'
	const circleClass = [
		'nav-step__circle',
		`nav-step__circle--${status}`
	].join(' ');

	return (
		<div className="nav-step">
			<div className={circleClass}>
				{status === 'finish' && (
					<img
						src={getAssetPath('/images/car-tick.svg')}
						alt="Done"
						className="nav-step__tick"
					/>
				)}
				{status === 'process' && <div className="nav-step__dot" />}
				{status === 'wait' && (
					<img
						src={getAssetPath('/images/_Step icon base.svg')}
						alt="Step"
						className="nav-step__icon"
					/>
				)}
			</div>
			<div className="nav-step__title">{title}</div>
		</div>
	);
};

const TopNavigation = ({
	currentScreenId,
	completedCars = 0,
	completedDrivers = 0,
	currentCarIndex = 0,
	currentDriverIndex = 0,
	isAddingNewVehicle = false,
	isAddingNewDriver = false,
	hasBackButton = false,
	onBack
}) => {
	const progressPercentage = calculateProgress({
		currentScreenId,
		completedCars,
		completedDrivers,
		currentCarIndex,
		currentDriverIndex,
	});

	const steps = getStepsWithStatus({
		currentScreenId,
		completedCars,
		completedDrivers,
	});

	let lockedProgressPercentage = 0;
	if (isAddingNewVehicle) {
		lockedProgressPercentage = 48;
	} else if (isAddingNewDriver) {
		lockedProgressPercentage = 90;
	}

	return (
		<div className={`top-navigation ${hasBackButton ? 'top-navigation--with-back' : ''}`}>
			{/* Back Button - positioned absolutely to the left */}
			{hasBackButton && (
				<div className="top-navigation__back-container">
					<BackButton onClick={onBack} />
				</div>
			)}

			<div className="top-navigation__progress-container">
				{/* Gray Background Bar */}
				<div className="top-navigation__track" />

				{/* Light Blue Progress Bar (for locked/completed sections) */}
				{lockedProgressPercentage > 0 && (
					<div
						className="top-navigation__bar top-navigation__bar--locked"
						style={{ width: `${lockedProgressPercentage}%` }}
					/>
				)}

				{/* Dark Blue Progress Bar (current progress) */}
				<div
					className="top-navigation__bar top-navigation__bar--active"
					style={{ width: `${progressPercentage}%` }}
				/>

				<div className="top-navigation__steps">
					{steps.map((step, index) => (
						<Step
							key={index}
							title={step.title}
							status={step.status}
							isLast={index === steps.length - 1}
						/>
					))}
				</div>
			</div>
		</div>
	);
};

export default TopNavigation;
