class DateUtil {
    public getYesterdayRange(): {start: Date, end: Date} {
        const now = new Date();
        const start = new Date(now);
        start.setDate(start.getDate() - 1);
        start.setHours(0, 0, 0, 0);

        const end = new Date(now);
        end.setDate(end.getDate() - 1);
        end.setHours(23, 59, 59, 999);

        return {start, end};
    }
}

export default new DateUtil();