/**
 * ImprovedDatePicker — ported verbatim from consumer-app-questions
 * (the "Votre date de naissance?" field). Segmented JJ/MM/AAAA inputs with
 * per-segment dropdowns plus a react-day-picker calendar popup.
 *
 * Stores/emits the date as a "YYYY-MM-DD" string (or null when cleared).
 */
import { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { DayPicker } from 'react-day-picker';
import { fr } from 'date-fns/locale';
import dayjs from 'dayjs';
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
    const pickerBarRef = useRef(null);

    // Popups are portaled to <body> (so the card's overflow:hidden can't clip
    // them); we compute their on-screen position from the trigger's rect.
    const [calPos, setCalPos] = useState(null);
    const [dayPos, setDayPos] = useState(null);
    const [monthPos, setMonthPos] = useState(null);
    const [yearPos, setYearPos] = useState(null);

    // Keep the open popup pinned to its trigger while the page scrolls/resizes.
    useEffect(() => {
        const anyOpen = showCalendar || showDayDropdown || showMonthDropdown || showYearDropdown;
        if (!anyOpen) return;
        const update = () => {
            if (pickerBarRef.current) {
                const r = pickerBarRef.current.getBoundingClientRect();
                setCalPos({ top: r.bottom + 8, left: r.left, width: r.width });
            }
            if (dayRef.current) { const r = dayRef.current.getBoundingClientRect(); setDayPos({ top: r.bottom + 4, left: r.left }); }
            if (monthRef.current) { const r = monthRef.current.getBoundingClientRect(); setMonthPos({ top: r.bottom + 4, left: r.left }); }
            if (yearRef.current) { const r = yearRef.current.getBoundingClientRect(); setYearPos({ top: r.bottom + 4, left: r.left }); }
        };
        update();
        window.addEventListener('scroll', update, true);
        window.addEventListener('resize', update);
        return () => {
            window.removeEventListener('scroll', update, true);
            window.removeEventListener('resize', update);
        };
    }, [showCalendar, showDayDropdown, showMonthDropdown, showYearDropdown]);

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
            <div className="improved-date-picker" ref={pickerBarRef}>
                {pickerMode !== 'month' && (
                    <>
                        <button
                            type="button"
                            onClick={() => {
                                if (!showCalendar && pickerBarRef.current) {
                                    const r = pickerBarRef.current.getBoundingClientRect();
                                    setCalPos({ top: r.bottom + 8, left: r.left, width: r.width });
                                }
                                setShowCalendar(!showCalendar);
                            }}
                            className="calendar-toggle-btn"
                            title="Calendrier"
                        >
                            <div className="calendar-icon-bg" />
                            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 18 18" fill="none" style={{ position: 'relative', flexShrink: 0 }}>
                                <path d="M13.6667 2.83331H4.33333C3.59695 2.83331 3 3.43027 3 4.16665V13.5C3 14.2364 3.59695 14.8333 4.33333 14.8333H13.6667C14.403 14.8333 15 14.2364 15 13.5V4.16665C15 3.43027 14.403 2.83331 13.6667 2.83331Z" fill="url(#paint0_linear_25_8000)" />
                                <path d="M3 6.83331H15M13.6667 2.83331H4.33333C3.59695 2.83331 3 3.43027 3 4.16665V13.5C3 14.2364 3.59695 14.8333 4.33333 14.8333H13.6667C14.403 14.8333 15 14.2364 15 13.5V4.16665C15 3.43027 14.403 2.83331 13.6667 2.83331Z" stroke="#1A1ABA" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round" />
                                <path d="M6.33337 1.5V4.16667M11.6667 1.5V4.16667" stroke="#1A1ABA" strokeWidth="1.8" strokeLinecap="round" />
                                <defs>
                                    <linearGradient id="paint0_linear_25_8000" x1="3" y1="2.83331" x2="15" y2="14.8333" gradientUnits="userSpaceOnUse">
                                        <stop stopColor="#F0F0FF" stopOpacity="0.4" />
                                        <stop offset="1" stopColor="#E0E0FF" stopOpacity="0.6" />
                                    </linearGradient>
                                </defs>
                            </svg>
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
                                    onFocus={(e) => { const r = e.currentTarget.getBoundingClientRect(); setDayPos({ top: r.bottom + 4, left: r.left }); setShowDayDropdown(true); setShowMonthDropdown(false); setShowYearDropdown(false); }}
                                    placeholder="JJ"
                                    maxLength={2}
                                    className="date-input-field"
                                />
                                {showDayDropdown && dayPos && createPortal(
                                    <div ref={dayDropdownRef} className="date-dropdown dropdown-day" style={{ position: 'fixed', top: dayPos.top, left: dayPos.left, marginTop: 0 }}>
                                        {days.map((d) => (
                                            <button key={d} type="button" onClick={() => handleSelectValue('day', d)} className="dropdown-option">
                                                {d}
                                            </button>
                                        ))}
                                    </div>,
                                    document.body,
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
                            onFocus={(e) => { const r = e.currentTarget.getBoundingClientRect(); setMonthPos({ top: r.bottom + 4, left: r.left }); setShowMonthDropdown(true); setShowDayDropdown(false); setShowYearDropdown(false); }}
                            placeholder="MM"
                            maxLength={2}
                            className="date-input-field"
                        />
                        {showMonthDropdown && monthPos && createPortal(
                            <div ref={monthDropdownRef} className="date-dropdown dropdown-month" style={{ position: 'fixed', top: monthPos.top, left: monthPos.left, marginTop: 0 }}>
                                {mois.map((m) => (
                                    <button key={m.value} type="button" onClick={() => handleSelectValue('month', m.value)} className="dropdown-option">
                                        {m.label}
                                    </button>
                                ))}
                            </div>,
                            document.body,
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
                            onFocus={(e) => { const r = e.currentTarget.getBoundingClientRect(); setYearPos({ top: r.bottom + 4, left: r.left }); setShowYearDropdown(true); setShowDayDropdown(false); setShowMonthDropdown(false); }}
                            placeholder="AAAA"
                            maxLength={4}
                            className="date-input-field"
                        />
                        {showYearDropdown && yearPos && createPortal(
                            <div ref={yearDropdownRef} className="date-dropdown dropdown-year" style={{ position: 'fixed', top: yearPos.top, left: yearPos.left, right: 'auto', marginTop: 0 }}>
                                {years.map((y) => (
                                    <button key={y} type="button" onClick={() => handleSelectValue('year', y.toString())} className="dropdown-option">
                                        {y}
                                    </button>
                                ))}
                            </div>,
                            document.body,
                        )}
                    </div>
                </div>
            </div>

            {showCalendar && pickerMode !== 'month' && calPos && createPortal(
                <div ref={calendarRef} className="calendar-popup" style={{ position: 'fixed', top: calPos.top, left: calPos.left, marginTop: 0 }}>
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
                </div>,
                document.body,
            )}
        </div>
    );
};

export default ImprovedDatePicker;
