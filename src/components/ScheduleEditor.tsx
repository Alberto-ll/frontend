import { useState, useEffect } from 'react';

export interface ScheduleItem {
    day: number;
    open: string | null;
    close: string | null;
}

interface ScheduleEditorProps {
    value: ScheduleItem[];
    onChange: (schedule: ScheduleItem[]) => void;
}

const DAYS = [
    { day: 1, name: 'Lunes' },
    { day: 2, name: 'Martes' },
    { day: 3, name: 'Miércoles' },
    { day: 4, name: 'Jueves' },
    { day: 5, name: 'Viernes' },
    { day: 6, name: 'Sábado' },
    { day: 7, name: 'Domingo' },
];

function createDefaultSchedule(): ScheduleItem[] {
    return DAYS.map(({ day }) => ({
        day,
        open: null,
        close: null,
    }));
}

export function ScheduleEditor({ value, onChange }: ScheduleEditorProps) {
    // Ensure schedule always has 7 days
    const [schedule, setSchedule] = useState<ScheduleItem[]>(() => {
        if (value && value.length === 7) return value;
        return createDefaultSchedule();
    });

    useEffect(() => {
        if (value && value.length === 7) {
            setSchedule(value);
        }
    }, [value]);

    const updateDay = (day: number, field: 'open' | 'close', val: string) => {
        const newSchedule = schedule.map(item =>
            item.day === day ? { ...item, [field]: val || null } : item
        );
        setSchedule(newSchedule);
        onChange(newSchedule);
    };

    const toggleDay = (day: number) => {
        const item = schedule.find(s => s.day === day);
        const isOpen = item?.open !== null && item?.close !== null;

        const newSchedule = schedule.map(s =>
            s.day === day
                ? { ...s, open: isOpen ? null : '08:00', close: isOpen ? null : '23:00' }
                : s
        );
        setSchedule(newSchedule);
        onChange(newSchedule);
    };

    return (
        <div className="schedule-editor" style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            <h4 style={{ margin: 0 }}>Horarios de atención</h4>
            {DAYS.map(({ day, name }) => {
                const item = schedule.find(s => s.day === day);
                const isOpen = item?.open !== null && item?.close !== null;

                return (
                    <div
                        key={day}
                        style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '1rem',
                            padding: '0.5rem 0.75rem',
                            border: '1px solid #e5e7eb',
                            borderRadius: '6px',
                            backgroundColor: isOpen ? '#f0fdf4' : '#fef2f2',
                        }}
                    >
                        <label
                            style={{
                                minWidth: '100px',
                                fontWeight: 600,
                                fontSize: '0.9rem',
                                cursor: 'pointer',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '0.5rem',
                            }}
                        >
                            <input
                                type="checkbox"
                                checked={isOpen}
                                onChange={() => toggleDay(day)}
                                style={{ cursor: 'pointer' }}
                            />
                            {name}
                        </label>

                        {isOpen ? (
                            <>
                                <input
                                    type="time"
                                    value={item?.open || ''}
                                    onChange={e => updateDay(day, 'open', e.target.value)}
                                    style={{
                                        padding: '0.35rem 0.5rem',
                                        borderRadius: '4px',
                                        border: '1px solid #d1d5db',
                                    }}
                                />
                                <span style={{ color: '#6b7280' }}>a</span>
                                <input
                                    type="time"
                                    value={item?.close || ''}
                                    onChange={e => updateDay(day, 'close', e.target.value)}
                                    style={{
                                        padding: '0.35rem 0.5rem',
                                        borderRadius: '4px',
                                        border: '1px solid #d1d5db',
                                    }}
                                />
                            </>
                        ) : (
                            <span style={{ color: '#9ca3af', fontStyle: 'italic', marginLeft: '0.5rem' }}>
                                Cerrado
                            </span>
                        )}
                    </div>
                );
            })}
        </div>
    );
}
