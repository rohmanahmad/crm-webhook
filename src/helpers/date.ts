export const getCurrentDate = (days: number = 0, months: number = 0, years: number = 0): string => {
    const currentDate = new Date();
    currentDate.setDate(currentDate.getDate() + days);
    currentDate.setMonth(currentDate.getMonth() + months);
    currentDate.setFullYear(currentDate.getFullYear() + years);
    const year = currentDate.getFullYear();
    const month = String(currentDate.getMonth() + 1).padStart(2, '0');
    const day = String(currentDate.getDate()).padStart(2, '0');
    return `${day}-${month}-${year}`;
}

export const getCurrentMonthYear = (): string => {
    const currentDate = new Date();
    const year = currentDate.getFullYear();
    const month = currentDate.toLocaleString('default', { month: 'short' });
    return month + '-' + year;
}