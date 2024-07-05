export default {
  /**
   * @Desc 档号规则-变量列表
   * @Author hjp
   */
  async ApiRecordList() {
    const { data } = await window.IDM.http.get('ctrl/archive/fonds/getVariableList')
    return data
  },
  /**
    * @Desc 档号规则-删除变量
    * @Author hjp
    */
  async ApiRecordDelete({variableName}) {
    const { data } = await window.IDM.http.post('ctrl/archive/fonds/managerVariable?type=delete', {variableName}, {
        headers: {
        'Content-Type': 'application/json'
        },
    })
    return data
  },
  /**
    * @Desc 档号规则-删除变量
    * @Author hjp
    */
  async ApiRecordAdd({variableType, variableTypeText, variableName, defaultValue}) {
    const { data } = await window.IDM.http.post('ctrl/archive/fonds/managerVariable?type=add', {variableType, variableTypeText, variableName, defaultValue}, {
        headers: {
        'Content-Type': 'application/json'
        },
    })
    return data
  }
}