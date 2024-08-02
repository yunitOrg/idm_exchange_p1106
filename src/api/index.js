export default {
    // 获取系统配置
    handleGetSystemSetting(key) {
        return IDM.http.getSync('/ctrl/idm/form/getSysConfigInfo', { key })
    },
    /**
    * @Desc 单位选择-常用组-单位
    * @Author hjp
    */
    async ApiExchangeList({sendLevel, pk, moduleId, operationFlag, flat, mode, recordId}) {
        let formdata = new FormData();
        sendLevel && formdata.append('sendLevel', sendLevel)
        pk && formdata.append('pk', pk)
        moduleId && formdata.append('moduleId', moduleId)
        operationFlag && formdata.append('operationFlag', operationFlag)
        flat &&  formdata.append('flat', flat)
        mode && formdata.append('mode', mode)
        recordId && formdata.append('recordId', recordId)
        const { data } = await window.IDM.http.post('ctrl/remote/sendRangeData', formdata, {
            headers: {
            'Content-Type': 'application/json'
            },
        })
        return data
    },
    /**
    * @Desc 单位选择-附件
    * @Author hjp
    */
    async ApiUnitExchangeList({moduleId, pk, selectAtt}) {
        let formdata = new FormData();
        moduleId && formdata.append('moduleId', moduleId)
        pk && formdata.append('pk', pk)
        selectAtt && formdata.append('selectAtt', selectAtt)
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
        moduleId && formdata.append('moduleId', moduleId)
        pk && formdata.append('pk', pk)
        selectFileRelationValue && formdata.append('selectFileRelationValue', selectFileRelationValue)
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
     /**
    * @Desc 单位选择-删除组
    * @Author hjp
    */
     async ApiDeleteGroup({groupId}) {
        let formdata = new FormData();
        formdata.append('groupId', groupId)
        const { data } = await window.IDM.http.post('ctrl/remoteZsdw/delZsdwGroup', formdata, {
            headers: {
            'Content-Type': 'application/json'
            },
        })
        return data
    },
    

    /**
    * @Desc 树形-单位选择-常用组
    * @Author hjp
    */
    async ApiGetTreeListGroup({infotype, pk, moduleId, exchangeModeId, sendType,selectAttvalue,isJoint,flat,templateId, operationFlag, sendLevel, mode, recordId}) {
        let formdata = new FormData();
        sendLevel && formdata.append('sendLevel', sendLevel)
        infotype && formdata.append('infotype', infotype)
        pk && formdata.append('pk', pk)
        moduleId && formdata.append('moduleId', moduleId)
        exchangeModeId && formdata.append('exchangeModeId', exchangeModeId)
        sendType && formdata.append('sendType', sendType)
        selectAttvalue && formdata.append('selectAttvalue', selectAttvalue)
        isJoint && formdata.append('isJoint', isJoint)
        mode && formdata.append('mode', mode)
        flat && formdata.append('flat', flat)
        templateId && formdata.append('templateId', templateId)
        operationFlag && formdata.append('operationFlag', operationFlag)
        recordId && formdata.append('recordId', recordId)
        const { data } = await window.IDM.http.post('ctrl/remote/sendRangeData', formdata, {
            headers: {
            'Content-Type': 'application/json'
            },
        })
        return data
    },

}