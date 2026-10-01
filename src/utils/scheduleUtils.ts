import type { ScheduleItem } from '../types/businessType';

export const SCHEDULE_DAYS = [
    { day: 1, name: 'Lunes' },
    { day: 2, name: 'Martes' },
    { day: 3, name: 'Miércoles' },
    { day: 4, name: 'Jueves' },
    { day: 5, name: 'Viernes' },
    { day: 6, name: 'Sábado' },
    { day: 7, name: 'Domingo' },
];

export function createDefaultSchedule(): ScheduleItem[] {
    return SCHEDULE_DAYS.map(({ day }) => ({
        day,
        open: null,
        close: null,
    }));
}

export function isNullish(val: string | null | undefined): boolean {
    return val === null || val === undefined || val === '';
}

/** open y close deben estar ambos en null o ambos con hora. open === close también es inválido. */
export function isDayInvalid(item: ScheduleItem | undefined): boolean {
    if (!item) return true;
    const openNull = isNullish(item.open);
    const closeNull = isNullish(item.close);
    if (openNull !== closeNull) return true;
    if (!openNull && !closeNull && item.open === item.close) return true;
    return false;
}
