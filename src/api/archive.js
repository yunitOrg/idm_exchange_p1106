export default {
    /**
     * @Desc 档案数量统计
     * @Author hjp
     */
    async ApiQuerySource() {
        const { data } = await window.IDM.http.get('ctrl/archive/statistics/getQueryDataSource?sourceType=1')
        return data
    },
    /**
     * @Desc 档案数量
     * @Author hjp
     */
    async ApiQueryCountData(params) {
        const { data } = await window.IDM.http.get('ctrl/archive/statistics/getArchiveStatisticsCountData', params)
        return data
    },
    /**
     * @Desc 档案借阅统计
     * @Author hjp
     */
    async ApiQueryReadData({ archicvePeriod, archiveYear }) {
        const { data } = await window.IDM.http.get('ctrl/archive/statistics/getArchiveStatisticsBorrowData', { archicvePeriod, archiveYear })
        return data
    },
    /**
     * @Desc 档案利用统计
     * @Author hjp
     */
    async ApiQueryTakeData(params) {
        const { data } = await window.IDM.http.get('ctrl/archive/statistics/getArchiveStatisticsUsedData', params)
        return data
    }
}
