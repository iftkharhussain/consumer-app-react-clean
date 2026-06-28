/**
 * ImprovedDatePicker — ported verbatim from consumer-app-questions
 * (the "Votre date de naissance?" field). Segmented JJ/MM/AAAA inputs with
 * per-segment dropdowns plus a react-day-picker calendar popup.
 *
 * Stores/emits the date as a "YYYY-MM-DD" string (or null when cleared).
 */
import { useState, useEffect, useRef } from 'react';
import { DayPicker } from 'react-day-picker';
import { fr } from 'date-fns/locale';
import dayjs from 'dayjs';
import { CalendarOutlined } from '@ant-design/icons';
import 'react-day-picker/dist/style.css';
import './ImprovedDatePicker.css';

const ImprovedDatePicker = ({
    value,
    onChange,
    placeholder = "Sélectionner une date",
    fromYear = 1900,
    toYear = dayjs().year() + 10,
    className = '',
    style = {},
    pickerMode = 'full' // 'full' (JJ/MM/AAAA) or 'month' (MM/AAAA)
}) => {
    // Bridge between string (stored in Redux), dayjs, and standard Date
    const internalValue = value ? (dayjs.isDayjs(value) ? value.toDate() : (typeof value === 'string' && value.includes('T') ? new Date(value) : dayjs(value).toDate())) : null;

    const [day, setDay] = useState('');
    const [month, setMonth] = useState('');
    const [year, setYear] = useState('');
    const [showCalendar, setShowCalendar] = useState(false);
    const [showDayDropdown, setShowDayDropdown] = useState(false);
    const [showMonthDropdown, setShowMonthDropdown] = useState(false);
    const [showYearDropdown, setShowYearDropdown] = useState(false);

    const dayRef = useRef(null);
    const monthRef = useRef(null);
    const yearRef = useRef(null);
    const calendarRef = useRef(null);
    const dayDropdownRef = useRef(null);
    const monthDropdownRef = useRef(null);
    const yearDropdownRef = useRef(null);

    const mois = [
        { value: '01', label: 'Janvier' },
        { value: '02', label: 'Février' },
        { value: '03', label: 'Mars' },
        { value: '04', label: 'Avril' },
        { value: '05', label: 'Mai' },
        { value: '06', label: 'Juin' },
        { value: '07', label: 'Juillet' },
        { value: '08', label: 'Août' },
        { value: '09', label: 'Septembre' },
        { value: '10', label: 'Octobre' },
        { value: '11', label: 'Novembre' },
        { value: '12', label: 'Décembre' },
    ];

    const years = Array.from({ length: toYear - fromYear + 1 }, (_, i) => toYear - i);

    const getMaxDays = () => {
        if (!month || !year) return 31;
        return new Date(parseInt(year), parseInt(month), 0).getDate();
    };

    const days = Array.from({ length: getMaxDays() }, (_, i) => (i + 1).toString().padStart(2, '0'));

    // Sync inputs with internalValue
    useEffect(() => {
        if (internalValue && !isNaN(internalValue.getTime())) {
            setDay(internalValue.getDate().toString().padStart(2, '0'));
            setMonth((internalValue.getMonth() + 1).toString().padStart(2, '0'));
            setYear(internalValue.getFullYear().toString());
        } else if (!value) {
            setDay('');
            setMonth('');
            setYear('');
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [value]);

    // Notify parent of valid date changes
    const notifyParentIfValid = (d, m, y) => {
        // If month mode, we don't need a day from the user, we use '01'
        const effectiveDay = pickerMode === 'month' ? '01' : d;

        if (effectiveDay && m && y && y.length === 4) {
            const dNum = parseInt(effectiveDay);
            const mNum = parseInt(m);
            const yNum = parseInt(y);

            if (dNum > 0 && dNum <= 31 && mNum > 0 && mNum <= 12 && yNum >= fromYear && yNum <= toYear) {
                const testDate = new Date(yNum, mNum - 1, dNum);
                // Validate if real date (e.g., handles Feb 30)
                if (testDate.getDate() === dNum && testDate.getMonth() === mNum - 1) {
                    // Send as YYYY-MM-DD string to avoid timezone issues
                    onChange(dayjs(testDate).format('YYYY-MM-DD'));
                    return;
                }
            }
        }

        // If everything is empty, notify parent
        if (!d && !m && !y) {
            onChange(null);
        }
    };

    // Click outside handling
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (calendarRef.current && !calendarRef.current.contains(event.target)) {
                setShowCalendar(false);
            }
            if (dayDropdownRef.current && !dayDropdownRef.current.contains(event.target) && event.target !== dayRef.current) {
                setShowDayDropdown(false);
            }
            if (monthDropdownRef.current && !monthDropdownRef.current.contains(event.target) && event.target !== monthRef.current) {
                setShowMonthDropdown(false);
            }
            if (yearDropdownRef.current && !yearDropdownRef.current.contains(event.target) && event.target !== yearRef.current) {
                setShowYearDropdown(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const handleDayChange = (e) => {
        const val = e.target.value.replace(/\D/g, '').slice(0, 2);
        setDay(val);
        if (val.length === 2 && parseInt(val) <= 31 && parseInt(val) > 0) {
            monthRef.current?.focus();
            setShowDayDropdown(false);
        }
        notifyParentIfValid(val, month, year);
    };

    const handleMonthChange = (e) => {
        const val = e.target.value.replace(/\D/g, '').slice(0, 2);
        setMonth(val);
        if (val.length === 2 && parseInt(val) <= 12 && parseInt(val) > 0) {
            yearRef.current?.focus();
            setShowMonthDropdown(false);
        }
        notifyParentIfValid(day, val, year);
    };

    const handleYearChange = (e) => {
        const val = e.target.value.replace(/\D/g, '').slice(0, 4);
        setYear(val);
        if (val.length === 4) {
            setShowYearDropdown(false);
        }
        notifyParentIfValid(day, month, val);
    };

    const handleDayKeyDown = (e) => {
        if (e.key === 'Enter') setShowDayDropdown(false);
    };

    const handleMonthKeyDown = (e) => {
        if (e.key === 'Backspace' && month === '' && pickerMode !== 'month') {
            dayRef.current?.focus();
        }
        if (e.key === 'Enter') setShowMonthDropdown(false);
    };

    const handleYearKeyDown = (e) => {
        if (e.key === 'Backspace' && year === '') {
            monthRef.current?.focus();
        }
        if (e.key === 'Enter') setShowYearDropdown(false);
    };

    const handleCalendarSelect = (date) => {
        if (date) {
            const d = pickerMode === 'month' ? '01' : date.getDate().toString().padStart(2, '0');
            const m = (date.getMonth() + 1).toString().padStart(2, '0');
            const y = date.getFullYear().toString();
            setDay(d);
            setMonth(m);
            setYear(y);
            setShowCalendar(false);
            onChange(dayjs(date).format('YYYY-MM-DD'));
        }
    };

    const handleSelectValue = (type, val) => {
        if (type === 'day') {
            setDay(val);
            setShowDayDropdown(false);
            monthRef.current?.focus();
            notifyParentIfValid(val, month, year);
        } else if (type === 'month') {
            setMonth(val);
            setShowMonthDropdown(false);
            yearRef.current?.focus();
            notifyParentIfValid(day, val, year);
        } else if (type === 'year') {
            setYear(val);
            setShowYearDropdown(false);
            notifyParentIfValid(day, month, val);
        }
    };

    const getCalendarDefaultMonth = () => {
        if (internalValue && !isNaN(internalValue.getTime())) return internalValue;
        const mNum = month ? parseInt(month) : dayjs().month() + 1;
        const yNum = year && year.length === 4 ? parseInt(year) : dayjs().year() - 30;
        return new Date(yNum, mNum - 1);
    };

    return (
        <div className={`improved-date-picker-wrapper ${className}`} style={style}>
            <div className="improved-date-picker">
                {pickerMode !== 'month' && (
                    <>
                        <button
                            type="button"
                            onClick={() => setShowCalendar(!showCalendar)}
                            className="calendar-toggle-btn"
                            title="Calendrier"
                        >
                            <div className="calendar-icon-bg" />
                            <CalendarOutlined style={{ color: '#3c40c7', fontSize: '16px', position: 'relative' }} />
                        </button>
                        <div className="calendar-separator" />
                    </>
                )}

                <div className="date-inputs-container">
                    {pickerMode !== 'month' && (
                        <>
                            <div className="date-input-field-wrapper">
                                <input
                                    ref={dayRef}
                                    type="text"
                                    inputMode="numeric"
                                    value={day}
                                    onChange={handleDayChange}
                                    onKeyDown={handleDayKeyDown}
                                    onFocus={() => { setShowDayDropdown(true); setShowMonthDropdown(false); setShowYearDropdown(false); }}
                                    placeholder="JJ"
                                    maxLength={2}
                                    className="date-input-field"
                                />
                                {showDayDropdown && (
                                    <div ref={dayDropdownRef} className="date-dropdown dropdown-day">
                                        {days.map((d) => (
                                            <button key={d} type="button" onClick={() => handleSelectValue('day', d)} className="dropdown-option">
                                                {d}
                                            </button>
                                        ))}
                                    </div>
                                )}
                            </div>
                            <span className="date-input-divider">/</span>
                        </>
                    )}

                    <div className="date-input-field-wrapper">
                        <input
                            ref={monthRef}
                            type="text"
                            inputMode="numeric"
                            value={month}
                            onChange={handleMonthChange}
                            onKeyDown={handleMonthKeyDown}
                            onFocus={() => { setShowMonthDropdown(true); setShowDayDropdown(false); setShowYearDropdown(false); }}
                            placeholder="MM"
                            maxLength={2}
                            className="date-input-field"
                        />
                        {showMonthDropdown && (
                            <div ref={monthDropdownRef} className="date-dropdown dropdown-month">
                                {mois.map((m) => (
                                    <button key={m.value} type="button" onClick={() => handleSelectValue('month', m.value)} className="dropdown-option">
                                        {m.label}
                                    </button>
                                ))}
                            </div>
                        )}
                    </div>

                    <span className="date-input-divider">/</span>

                    <div className="date-input-field-wrapper year">
                        <input
                            ref={yearRef}
                            type="text"
                            inputMode="numeric"
                            value={year}
                            onChange={handleYearChange}
                            onKeyDown={handleYearKeyDown}
                            onFocus={() => { setShowYearDropdown(true); setShowDayDropdown(false); setShowMonthDropdown(false); }}
                            placeholder="AAAA"
                            maxLength={4}
                            className="date-input-field"
                        />
                        {showYearDropdown && (
                            <div ref={yearDropdownRef} className="date-dropdown dropdown-year">
                                {years.map((y) => (
                                    <button key={y} type="button" onClick={() => handleSelectValue('year', y.toString())} className="dropdown-option">
                                        {y}
                                    </button>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {showCalendar && pickerMode !== 'month' && (
                <div ref={calendarRef} className="calendar-popup">
                    <DayPicker
                        mode="single"
                        selected={internalValue}
                        onSelect={handleCalendarSelect}
                        locale={fr}
                        fromYear={fromYear}
                        toYear={toYear}
                        captionLayout="dropdown"
                        defaultMonth={getCalendarDefaultMonth()}
                    />
                </div>
            )}
        </div>
    );
};

export default ImprovedDatePicker;
