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
  async ApiQueryCountData({archiveState, archicvePeriod, archiveYear, archiveOpenStatus}) {
    let obj = {}
    archiveState && (obj.archiveState = archiveState)
    archicvePeriod && (obj.archicvePeriod = archicvePeriod)
    archiveYear && (obj.archiveYear = archiveYear)
    archiveOpenStatus && (obj.archiveOpenStatus = archiveOpenStatus)
    const { data } = await window.IDM.http.get('ctrl/archive/statistics/getArchiveStatisticsCountData', obj)
    return data
  },
  /**
   * @Desc 档案借阅统计
   * @Author hjp
   */
  async ApiQueryReadData({archicvePeriod, archiveYear}) {
    const { data } = await window.IDM.http.get('ctrl/archive/statistics/getArchiveStatisticsBorrowData', {archicvePeriod, archiveYear})
    return data
  },
  /**
   * @Desc 档案利用统计
   * @Author hjp
   */
  async ApiQueryTakeData({archicvePeriod, archiveYear}) {
    const { data } = await window.IDM.http.get('ctrl/archive/statistics/getArchiveStatisticsUsedData', {archicvePeriod, archiveYear})
    return data
  },
}
