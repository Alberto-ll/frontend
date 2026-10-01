import { useState, useEffect } from 'react';
import type { ScheduleItem } from '../types/businessType';
import { SCHEDULE_DAYS, createDefaultSchedule, isDayInvalid, isNullish } from '../utils/scheduleUtils';

interface ScheduleEditorProps {
    value: ScheduleItem[];
    onChange: (schedule: ScheduleItem[]) => void;
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
        const newSchedule = schedule.map(item => {
            if (item.day !== day) return item;

            const nextVal = val || null;
            const updated: ScheduleItem = { ...item, [field]: nextVal };

            // Paridad: si un lado queda en null, el otro también debe ser null
            if (field === 'open' && isNullish(updated.open)) {
                updated.close = null;
            }
            if (field === 'close' && isNullish(updated.close)) {
                updated.open = null;
            }

            return updated;
        });
        setSchedule(newSchedule);
        onChange(newSchedule);
    };

    const toggleDay = (day: number) => {
        const item = schedule.find(s => s.day === day);
        const isOpen = item?.open != null && item?.close != null;

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
            {SCHEDULE_DAYS.map(({ day, name }) => {
                const item = schedule.find(s => s.day === day);
                const isOpen = item?.open != null && item?.close != null;
                const invalid = isDayInvalid(item);
                const openEqualClose = !isNullish(item?.open) && item?.open === item?.close;

                return (
                    <div
                        key={day}
                        style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '1rem',
                            padding: '0.5rem 0.75rem',
                            border: invalid ? '2px solid #dc2626' : '1px solid #e5e7eb',
                            borderRadius: '6px',
                            backgroundColor: invalid ? '#fef2f2' : isOpen ? '#f0fdf4' : '#fef2f2',
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
                                        border: invalid ? '2px solid #dc2626' : '1px solid #d1d5db',
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
                                        border: invalid ? '2px solid #dc2626' : '1px solid #d1d5db',
                                    }}
                                />
                            </>
                        ) : (
                            <span style={{ color: '#9ca3af', fontStyle: 'italic', marginLeft: '0.5rem' }}>
                                Cerrado
                            </span>
                        )}

                        {invalid && (
                            <span style={{
                                color: '#dc2626',
                                fontSize: '0.75rem',
                                fontWeight: 600,
                                marginLeft: 'auto',
                            }}>
                                {openEqualClose
                                    ? 'Horario de apertura y cierre iguales'
                                    : 'Estado inválido: open y close deben ser ambos nulos o ambos con hora'}
                            </span>
                        )}
                    </div>
                );
            })}
        </div>
    );
}
