import { useState, useEffect } from 'react';
import type { ScheduleItem } from '../types/businessType';
import { SCHEDULE_DAYS, createDefaultSchedule, isDayInvalid, isNullish } from '../utils/scheduleUtils';
import { FaClock } from 'react-icons/fa';
import '../static/css/components/ScheduleEditor.css';

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
        <div className="schedule-editor">
            <h4 className="schedule-editor__title">
                <FaClock /> Horarios de atención
            </h4>

            <div className="schedule-editor__header" aria-hidden="true">
                <span />
                <span className="schedule-editor__col-open">Desde</span>
                <span />
                <span className="schedule-editor__col-close">Hasta</span>
                <span />
            </div>

            {SCHEDULE_DAYS.map(({ day, name }) => {
                const item = schedule.find(s => s.day === day);
                const isOpen = item?.open != null && item?.close != null;
                const invalid = isDayInvalid(item);
                const openEqualClose = !isNullish(item?.open) && item?.open === item?.close;

                return (
                    <div
                        key={day}
                        className={[
                            'schedule-day',
                            !isOpen && !invalid ? 'schedule-day--closed' : '',
                            invalid ? 'schedule-day--invalid' : '',
                        ].filter(Boolean).join(' ')}
                    >
                        <label className="schedule-day__toggle">
                            <input
                                type="checkbox"
                                checked={isOpen}
                                onChange={() => toggleDay(day)}
                            />
                            {name}
                        </label>

                        {isOpen ? (
                            <>
                                <div className="schedule-day__open">
                                    <input
                                        type="time"
                                        className="schedule-day__time"
                                        value={item?.open || ''}
                                        aria-label={`Hora de apertura de ${name}`}
                                        onChange={e => updateDay(day, 'open', e.target.value)}
                                    />
                                </div>
                                <span className="schedule-day__sep">a</span>
                                <div className="schedule-day__close">
                                    <input
                                        type="time"
                                        className="schedule-day__time"
                                        value={item?.close || ''}
                                        aria-label={`Hora de cierre de ${name}`}
                                        onChange={e => updateDay(day, 'close', e.target.value)}
                                    />
                                </div>
                            </>
                        ) : (
                            <div className="schedule-day__status">
                                <span className="schedule-day__chip schedule-day__chip--closed">Cerrado</span>
                            </div>
                        )}

                        <div className="schedule-day__note">
                            {invalid ? (
                                <span className="schedule-day__error">
                                    {openEqualClose
                                        ? 'Horario de apertura y cierre iguales'
                                        : 'Estado inválido: open y close deben ser ambos nulos o ambos con hora'}
                                </span>
                            ) : isOpen ? (
                                <span className="schedule-day__chip schedule-day__chip--open">Abierto</span>
                            ) : null}
                        </div>
                    </div>
                );
            })}
        </div>
    );
}
