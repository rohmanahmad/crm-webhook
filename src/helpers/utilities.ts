export const tryJsonParse = (data: string): [any, any] => {
    try {
        return [null, JSON.parse(data)];
    } catch (error) {
        return [error, null];
    }
}