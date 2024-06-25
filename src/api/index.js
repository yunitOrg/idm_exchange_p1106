export default {
    // 获取系统配置
    handleGetSystemSetting(key) {
        return IDM.http.getSync('/ctrl/idm/form/getSysConfigInfo', { key })
    },
    /**
    * @Desc 单位选择-附件
    * @Author hjp
    */
    async ApiUnitExchangeList({moduleId, pk, selectAtt}) {
        let formdata = new FormData();
        formdata.append('moduleId', moduleId)
        formdata.append('pk', pk)
        formdata.append('selectAtt', selectAtt)
        const { data } = await window.IDM.http.post('ctrl/remoteExchangeView/attachmentData', formdata, {
            headers: {
            'Content-Type': 'application/json'
            },
        })
        return data
    },
    /**
    * @Desc 单位选择-文件
    * @Author hjp
    */
    async ApiUnitFileList({moduleId, pk, selectFileRelationValue}) {
        let formdata = new FormData();
        formdata.append('moduleId', moduleId)
        formdata.append('pk', pk)
        formdata.append('selectFileRelationValue', selectFileRelationValue)
        const { data } = await window.IDM.http.post('ctrl/remoteExchangeView/fileRelationData', formdata, {
            headers: {
            'Content-Type': 'application/json'
            },
        })
        return data
    },
    /**
    * @Desc 单位选择-更新常用组
    * @Author hjp
    */
    async ApiUpdateGroup({groupId, ids, texts}) {
        let formdata = new FormData();
        formdata.append('groupId', groupId)
        formdata.append('ids', ids)
        formdata.append('texts', texts)
        const { data } = await window.IDM.http.post('ctrl/remoteZsdw/updateZsdwGroup', formdata, {
            headers: {
            'Content-Type': 'application/json'
            },
        })
        return data
    },
    /**
    * @Desc 单位选择-创建组
    * @Author hjp
    */
    async ApiSaveGroup({name, ids, texts}) {
        let formdata = new FormData();
        formdata.append('name', name)
        formdata.append('ids', ids)
        formdata.append('texts', texts)
        const { data } = await window.IDM.http.post('ctrl/remoteZsdw/saveZsdwGroup', formdata, {
            headers: {
            'Content-Type': 'application/json'
            },
        })
        return data
    },
}