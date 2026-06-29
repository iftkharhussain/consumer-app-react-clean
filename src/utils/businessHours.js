/**
 * Business hours utility to handle Montreal timezone and opening hours
 */

const DAYS_FR = ['Dimanche', 'Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi', 'Samedi'];

// TESTING MODE: All days open 24/7 for testing ezLeads and email notifications
// const BUSINESS_HOURS = {
//   'Lundi': { start: '00:00', end: '23:59', label: '24h/24 (TEST MODE)' },
//   'Mardi': { start: '00:00', end: '23:59', label: '24h/24 (TEST MODE)' },
//   'Mercredi': { start: '00:00', end: '23:59', label: '24h/24 (TEST MODE)' },
//   'Jeudi': { start: '00:00', end: '23:59', label: '24h/24 (TEST MODE)' },
//   'Vendredi': { start: '00:00', end: '23:59', label: '24h/24 (TEST MODE)' },
//   'Samedi': { start: '00:00', end: '23:59', label: '24h/24 (TEST MODE)' },
//   'Dimanche': { start: '00:00', end: '23:59', label: '24h/24 (TEST MODE)' },
// };

// PRODUCTION HOURS (uncomment when testing is complete):
const BUSINESS_HOURS = {
  'Lundi': { start: '08:30', end: '18:00', label: '8:30 - 18:00' },
  'Mardi': { start: '08:30', end: '18:00', label: '8:30 - 18:00' },
  'Mercredi': { start: '08:30', end: '18:00', label: '8:30 - 18:00' },
  'Jeudi': null,
  'Vendredi': { start: '08:30', end: '16:30', label: '8:30 - 16:30' },
  'Samedi': null,
  'Dimanche': null,
};

/**
 * Gets the current date/time in Montreal timezone
 */
export const getMontrealTime = () => {
    try {
        return new Date(new Date().toLocaleString("en-US", { timeZone: "America/Montreal" }));
    } catch (e) {
        // Fallback to local time if timezone is not supported
        return new Date();
    }
};

/**
 * Returns business hours for a specific day name (in French)
 */
export const getHoursForDay = (dayName) => {
    return BUSINESS_HOURS[dayName] || null;
};

/**
 * Returns formatted hours list for the schedule modal
 */
export const getFullSchedule = () => {
    const montrealDate = getMontrealTime();
    const currentDayIndex = montrealDate.getDay();
    
    return DAYS_FR.map((day, index) => {
        const hours = BUSINESS_HOURS[day];
        return {
            day,
            hours: hours ? hours.label : 'Fermé',
            isToday: index === currentDayIndex
        };
    });
};

/**
 * Checks if the business is currently open in Montreal
 */
export const isOpenNow = () => {
    const montrealDate = getMontrealTime();
    const dayName = DAYS_FR[montrealDate.getDay()];
    const hours = BUSINESS_HOURS[dayName];
    
    if (!hours) return false;
    
    const [startHour, startMin] = hours.start.split(':').map(Number);
    const [endHour, endMin] = hours.end.split(':').map(Number);
    
    const currentHour = montrealDate.getHours();
    const currentMin = montrealDate.getMinutes();
    
    const currentTimeMinutes = currentHour * 60 + currentMin;
    const startTimeMinutes = startHour * 60 + startMin;
    const endTimeMinutes = endHour * 60 + endMin;
    
    return currentTimeMinutes >= startTimeMinutes && currentTimeMinutes < endTimeMinutes;
};

/**
 * Finds the next opening day and time from now.
 * Returns { dayName, start } or null if no opening found within 7 days.
 */
export const getNextOpening = () => {
    const montrealDate = getMontrealTime();
    const currentDayIndex = montrealDate.getDay();
    const currentHour = montrealDate.getHours();
    const currentMin = montrealDate.getMinutes();
    const currentTimeMinutes = currentHour * 60 + currentMin;

    // Check today first — if we haven't reached opening time yet
    const todayName = DAYS_FR[currentDayIndex];
    const todayHours = BUSINESS_HOURS[todayName];
    if (todayHours) {
        const [startHour, startMin] = todayHours.start.split(':').map(Number);
        const startTimeMinutes = startHour * 60 + startMin;
        if (currentTimeMinutes < startTimeMinutes) {
            return { dayName: todayName, start: todayHours.start, isToday: true };
        }
    }

    // Check next 7 days
    for (let i = 1; i <= 7; i++) {
        const nextDayIndex = (currentDayIndex + i) % 7;
        const nextDayName = DAYS_FR[nextDayIndex];
        const nextHours = BUSINESS_HOURS[nextDayName];
        if (nextHours) {
            return { dayName: nextDayName, start: nextHours.start, isToday: false };
        }
    }

    return null;
};

/**
 * Formats an opening time for display, removing leading zero.
 * "08:30" -> "8:30", "10:30" -> "10:30"
 */
const formatOpeningTime = (timeStr) => {
    if (!timeStr) return timeStr;
    return timeStr.replace(/^0/, '');
};

/**
 * Returns a string like "Ouvert aujourd'hui de 8:30 - 16:30"
 * or "Ouvre à 8:30 lundi" when currently closed.
 */
export const getFormattedTodayHours = () => {
    if (isOpenNow()) {
        const montrealDate = getMontrealTime();
        const dayName = DAYS_FR[montrealDate.getDay()];
        const hours = BUSINESS_HOURS[dayName];
        return `Ouvert aujourd'hui de ${hours.label}`;
    }

    // Closed — show "Ouvre à X:XX [day]"
    const next = getNextOpening();
    if (!next) return "Fermé";

    const formattedTime = formatOpeningTime(next.start);
    if (next.isToday) {
        return `Ouvre à ${formattedTime} aujourd'hui`;
    }
    return `Ouvre à ${formattedTime} ${next.dayName.toLowerCase()}`;
};

/**
 * Returns a simple string for the current day's hours or "Fermé"
 */
export const getTodayHoursLabel = () => {
    const montrealDate = getMontrealTime();
    const dayName = DAYS_FR[montrealDate.getDay()];
    const hours = BUSINESS_HOURS[dayName];
    
    return hours ? hours.label : 'Fermé';
};
