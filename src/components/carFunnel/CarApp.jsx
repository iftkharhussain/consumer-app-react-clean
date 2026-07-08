/* eslint-disable */
import { useState, useEffect } from 'react';
import { ConfigProvider } from 'antd';
import { useDispatch, useSelector } from 'react-redux';
import { motion, AnimatePresence } from 'framer-motion';
import { theme } from './theme';
import MainLayout from './MainLayout';
import TopNavigation from './TopNavigation';
import { DynamicRenderer } from './DynamicRenderer';
import BackButton from './common/BackButton';
import MaxDriversModal from './MaxDriversModal';
import { getScreen } from 'config/carFunnel';
import {
  navigateTo,
  goBack,
  jumpTo,
  startAddingVehicle,
  startAddingDriver,
  resetCreationFlow,
  selectVehicles,
  selectDrivers,
  selectCurrentVehicleIndex,
  selectCurrentDriverIndex,
  selectCurrentScreenId,
  selectIsAddingNewVehicle,
  selectIsAddingNewDriver,
  setCurrentVehicleIndex as setCurrentVehicleIndexAction,
  setCurrentDriverIndex as setCurrentDriverIndexAction,
  addVehicle,
  addDriver,
  removeVehicle,
  removeDriver,
} from 'store/carFunnel';
import 'styles/carFunnel/App.css';

// Constants for max limits
const MAX_VEHICLES = 2;
const MAX_DRIVERS = 3;

function App() {
  const dispatch = useDispatch();

  // Get data from Redux store
  const reduxVehicles = useSelector(selectVehicles);
  const reduxDrivers = useSelector(selectDrivers);
  const currentVehicleIndex = useSelector(selectCurrentVehicleIndex);
  const currentDriverIndex = useSelector(selectCurrentDriverIndex);
  const currentScreenId = useSelector(selectCurrentScreenId);
  const navigationHistory = useSelector((state) => state.navigation.history);
  const isAddingNewVehicle = useSelector(selectIsAddingNewVehicle);
  const isAddingNewDriver = useSelector(selectIsAddingNewDriver);

  const [showMaxDriversModal, setShowMaxDriversModal] = useState(false);

  // Scroll to top whenever screen or entity changes
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'instant' });
  }, [currentScreenId, currentVehicleIndex, currentDriverIndex]);

  const currentScreen = getScreen(currentScreenId);

  const handleNavigate = (nextScreenId) => {
    if (nextScreenId) {
      // Update Redux navigation state
      dispatch(navigateTo({ screenId: nextScreenId }));
    }
  };

  const handleBack = () => {
    // Special case: Driver Summary → always go to Car Summary
    if (currentScreenId === '9-driver1') {
      dispatch(jumpTo({ screenId: 'summary-1car', stepId: 1 }));
      return;
    }

    // Special case: If in "add vehicle" flow and on first screen, go back to car summary
    if (isAddingNewVehicle && currentScreenId === 'auto-1') {
      // If this is a new vehicle being added (index > 0), remove it
      if (currentVehicleIndex > 0) {
        dispatch(removeVehicle(currentVehicleIndex));
        // Go back to previous vehicle
        const previousIndex = currentVehicleIndex - 1;
        dispatch(setCurrentVehicleIndexAction(previousIndex));
      }

      // Navigate to car summary page
      dispatch(navigateTo({ screenId: 'summary-1car' }));
      return;
    }

    // Special case: If in "add driver" flow and on first screen, go back to driver summary
    if (isAddingNewDriver && currentScreenId === '1-driver1') {
      // If this is a new driver being added (index > 0), remove it
      if (currentDriverIndex > 0) {
        dispatch(removeDriver(currentDriverIndex));
        // Go back to previous driver
        const previousDriverIndex = currentDriverIndex - 1;
        dispatch(setCurrentDriverIndexAction(previousDriverIndex));
      }

      dispatch(navigateTo({ screenId: '9-driver1' }));
      return;
    }

    // Regular back navigation
    dispatch(goBack());
  };

  const handleAddVehicle = () => {
    // Check if we can add another vehicle (max 2 total)
    // We count vehicles that have some data or are the initial one
    if (reduxVehicles.length >= MAX_VEHICLES) {
      alert(`Maximum ${MAX_VEHICLES} vehicles allowed`);
      return;
    }

    // Add new vehicle in Redux
    dispatch(addVehicle());

    // Set creation flow flag
    dispatch(startAddingVehicle());

    // Update Redux navigation state
    dispatch(navigateTo({ screenId: 'auto-1' }));
  };

  const handleAddDriver = () => {
    // Check if we can add another driver (max 3 total)
    if (reduxDrivers.length >= MAX_DRIVERS) {
      setShowMaxDriversModal(true);
      return;
    }

    // Add new driver in Redux
    dispatch(addDriver());

    // Set creation flow flag
    dispatch(startAddingDriver());

    // Update Redux navigation state
    dispatch(navigateTo({ screenId: '1-driver1' }));
  };

  // Calculate completed items for TopNavigation
  // A vehicle/driver is considered "completed" if it has data and we are past it (index > it) 
  // OR if we are currently editing it but it has data (this logic might need tuning based on UI requirements)
  // For now, mirroring previous logic: count of items with keys
  const completedCars = reduxVehicles.filter(v => Object.keys(v).length > 0).length;
  const completedDrivers = reduxDrivers.filter(d => Object.keys(d).length > 0).length;

  // Check if back button should be visible
  const showBackButton = currentScreen?.type !== 'verification' &&
    navigationHistory.length > 0;

  return (
    <ConfigProvider
      // inherit:false isolates this from the host app's parent ConfigProvider
      // (which sets hashed:false + Inter tokens) so the car funnel renders with
      // ONLY its own theme — exactly like the standalone external form.
      theme={{ ...theme, inherit: false }}
      // Render antd popups (Select/DatePicker/Dropdown/Tooltip) INSIDE .car-funnel
      // so the scoped car CSS reaches them (matches the source app exactly).
      getPopupContainer={(trigger) =>
        (trigger && trigger.closest && trigger.closest('.car-funnel')) ||
        document.querySelector('.car-funnel') ||
        document.body}
    >
      <MainLayout>
        {currentScreen?.type !== 'verification' && (
          <TopNavigation
            currentScreenId={currentScreenId}
            completedCars={completedCars}
            completedDrivers={completedDrivers}
            currentCarIndex={currentVehicleIndex}
            currentDriverIndex={currentDriverIndex}
            isAddingNewVehicle={isAddingNewVehicle}
            isAddingNewDriver={isAddingNewDriver}
            hasBackButton={showBackButton}
            onBack={handleBack}
          />
        )}

        {/* Show title only for summary and contact screens */}
        {(currentScreen?.type === 'summary' || currentScreen?.isContactInfo) && (
          <div className="screen-title-wrapper" style={{ textAlign: 'center', marginBottom: currentScreen?.isContactInfo ? '1.5rem' : '2rem' }}>
            <h1 style={{
              color: currentScreen?.isContactInfo ? '#3FC098' : '#000',
              textAlign: 'center',
              fontFamily: currentScreen?.isContactInfo ?  'var(--font-family-body)':'var(--font-family-body), sans-serif' ,
              fontSize: currentScreen?.isContactInfo ? '24px' : '20px',
              fontStyle: 'normal',
              fontWeight: 700,
              lineHeight: currentScreen?.isContactInfo ? '32px' : '28px',
              letterSpacing: currentScreen?.isContactInfo ? '0.07px' : 'normal',
              marginBottom: currentScreen?.isContactInfo ? '4px' : '0px',
              marginTop: 0
            }}>
              {currentVehicleIndex > 0 && currentScreen?.stepId === 1
                ? 'Ajoutez un deuxième véhicule'
                : (currentScreen?.title)}
            </h1>
            <p style={{
              color: currentScreen?.isContactInfo ? '#364153' : '#000',
              textAlign: 'center',
              fontFamily: currentScreen?.isContactInfo ? 'var(--font-family-body)':'Inter, sans-serif',
              fontSize: currentScreen?.isContactInfo ? '16px' : '14px',
              fontStyle: 'normal',
              fontWeight: currentScreen?.isContactInfo ? 400 : (currentScreen?.type === 'verification' ? 600 : 500),
              lineHeight: currentScreen?.isContactInfo ? '24px' : '20px',
              letterSpacing: currentScreen?.isContactInfo ? '-0.312px' : 'normal',
              margin: 0
            }}>{currentScreen?.subtitle}</p>
          </div>
        )}

        {/* All screens now use DynamicRenderer */}
        <AnimatePresence mode="wait">
          <motion.div
            key={`${currentScreenId}-v${currentVehicleIndex}-d${currentDriverIndex}`}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className='transition-wrapper-key'
            transition={{ duration: 0.3, ease: 'easeOut' }}
          >
            <DynamicRenderer
              screen={getScreen(currentScreenId)}
              onNavigate={(nextScreenId, data) => {
                // Data is already saved to Redux by the screen component
                handleNavigate(nextScreenId);
              }}
              onBack={handleBack}
              currentVehicleIndex={currentVehicleIndex}
              currentDriverIndex={currentDriverIndex}
              onAddVehicle={handleAddVehicle}
              onAddDriver={handleAddDriver}
            />
          </motion.div>
        </AnimatePresence>
      </MainLayout>

      {/* Max Drivers Modal */}
      <MaxDriversModal
        visible={showMaxDriversModal}
        onClose={() => setShowMaxDriversModal(false)}
      />
    </ConfigProvider>
  );
}

export default App;
