<template>
    <div idm-ctrl="idm_module" :id="moduleObject.id" :idm-ctrl-id="moduleObject.id" class="flex flex-col">
        <div class="flex justify-center search-container">
            <el-form label-width="80px" label-position="left" class="form">
                <el-form-item label="常用模版">
                    <div class="flex items-start gap-2">
                        <el-radio-group v-model="data.template" size="small" class="flex-1 w-0">
                            <el-radio v-for="n in templates" :key="n.id" :label="n.id" :border="true">{{ n.bt }}</el-radio>
                        </el-radio-group>
                        <el-button v-if="template.data.length > 4" @click="template.expand = !template.expand" size="small">{{ template.expand ? '收起' : '更多' }}</el-button>
                    </div>
                </el-form-item>
                <el-form-item label="全 宗 号" v-show="showAll">
                    <el-cascader
                        v-model="data.fond"
                        :options="fondOptions"
                        :props="{
                            multiple: true
                        }"
                        separator=" "
                        class="w-full"
                        clearable
                    ></el-cascader>
                </el-form-item>
                <el-form-item label="检索信息" v-show="showAll">
                    <div class="flex flex-col condition-list">
                        <div v-for="(condition, i) in data.conditions" :key="i" class="flex gap-2 condition-item">
                            <div style="width: 60px; text-align: right">
                                <template v-if="i == 0">当</template>
                                <el-select v-else v-model="condition.logicalRelation">
                                    <el-option v-for="m in whereTypes" :key="m.value" :label="m.label" :value="m.value"></el-option>
                                </el-select>
                            </div>
                            <el-select v-model="condition.filterCode" @change="(value) => fileterCodeChange(value, condition)" style="width: 110px">
                                <el-option v-for="m in filterItems" :key="m.filterCode" :label="m.filterName" :value="m.filterCode"></el-option>
                            </el-select>
                            <el-select v-model="condition.logicalConditionCode" @change="(v) => logicalChange(v, condition)" style="width: 95px">
                                <el-option
                                    v-for="m in getFilterItem(condition.filterCode).logicalConditionList"
                                    :key="m.logicalConditionCode"
                                    :label="m.logicalConditionName"
                                    :value="m.logicalConditionCode"
                                ></el-option>
                            </el-select>
                            <div class="flex-1 w-0">
                                <template v-if="!['IS NULL', 'IS NOT NULL'].includes(condition.logicalConditionCode)">
                                    <div v-if="getFilterItem(condition.filterCode).filterController == 'controlDateTime'" class="flex gap-2">
                                        <template v-if="condition.logicalConditionCode == '<>'">
                                            <el-date-picker v-model="condition.filterStart" type="date" placeholder="选择日期" value-format="yyyy-MM-dd" class="flex-1">
                                            </el-date-picker>
                                            <el-date-picker v-model="condition.filterEnd" type="date" placeholder="选择日期" value-format="yyyy-MM-dd" class="flex-1">
                                            </el-date-picker>
                                        </template>
                                        <el-date-picker v-else v-model="condition.filterValue" type="date" placeholder="选择日期" value-format="yyyy-MM-dd" class="flex-1">
                                        </el-date-picker>
                                    </div>
                                    <!-- <div v-else-if="getFilterItem(condition.filterCode).filterController == 'controlComboBox'" class="flex gap-2">
                                        <el-select v-model="condition.filterValues" multiple filterable allow-create default-first-option class="flex-1"> </el-select>
                                    </div> -->
                                    <el-input v-else v-model="condition.filterValue"></el-input>
                                </template>
                            </div>
                            <div class="flex items-center gap-2 condition-actions">
                                <i @click="addCondition(condition, i)" class="el-icon-circle-plus-outline condition-actions-btn"></i>
                                <i v-if="i > 1" @click="removeCondition(condition, i)" class="el-icon-remove-outline condition-actions-btn"></i>
                            </div>
                        </div>
                    </div>
                </el-form-item>
                <el-form-item label="归档年度" v-show="showAll">
                    <div class="flex gap-2">
                        <el-select v-model="data.yearStart" filterable default-first-option>
                            <el-option value="1900" label="不限"></el-option>
                            <el-option
                                v-for="n in Array.from({ length: year - 1989 }, (_, i) => year - i)"
                                :key="n"
                                :value="n.toString()"
                                :label="n.toString()"
                                :disabled="n > data.yearEnd"
                            ></el-option>
                        </el-select>
                        -
                        <el-select v-model="data.yearEnd" filterable default-first-option>
                            <el-option
                                v-for="n in Array.from({ length: year - 1989 }, (_, i) => year - i)"
                                :key="n"
                                :value="n.toString()"
                                :label="n == year ? '至今' : n.toString()"
                                :disabled="n < data.yearStart"
                            ></el-option>
                        </el-select>
                    </div>
                </el-form-item>
                <div class="flex justify-center form-actions">
                    <el-button @click="search" type="primary">检索</el-button>
                    <el-button @click="viewTemplate">检索模版</el-button>
                    <el-button @click="saveTemplate">保存为模版</el-button>
                    <el-button @click="exportTemplate">导出</el-button>
                    <el-button v-if="urlObject.fid!=null" @click="addToMaterial">加入素材库</el-button>
                </div>
                <div class="expanded" :class="{open:showAll}" @click="showAll = !showAll;">高级检索</div>
            </el-form>
        </div>
        <div class="simpleFormData">
            <span v-if="data.fond.length">全宗号：{{data.fond.join(",")}}</span>
            <span>
                <template v-for="(condition, i) in data.conditions">
                {{i==0?'当':whereTypes.find((item)=>{return item.value == condition.logicalRelation}).label}}{{filterItems.find((item)=>{return item.filterCode == condition.filterCode}).filterName}}{{getFilterItem(condition.filterCode).logicalConditionList.find((item)=>{return item.logicalConditionCode == condition.logicalConditionCode}).logicalConditionName}}“{{!['IS NULL', 'IS NOT NULL'].includes(condition.logicalConditionCode)&&condition.logicalConditionCode == '<>'?condition.filterStart +'-' + condition.filterEnd:condition.filterValue}}”
                </template>
            </span>
            <span>归档年度：{{data.yearStart == '1900'?'不限':data.yearStart}}-{{data.yearEnd == year?'至今':data.yearEnd}}</span>
        </div>
        <iframe :src="listFrameUrl" class="w-full list-frame" :style="{height:showAll?'70vh':'calc(100vh - 198px)'}"></iframe>
    </div>
</template>
<script>
import { bindStyle, bindProp } from '../mixins'
export default {
    mixins: [bindProp(), bindStyle()],
    data() {
        const year = new Date().getFullYear()
        return {
            propData: this._propData?.compositeAttr || this.$root?.propData?.compositeAttr || {
                clickFunctions: "",
                isShowSck:"fid!=null"
            },
            urlObject:{},
            showAll:false,
            year,
            template: {
                data: [],
                expand: false
            },
            fonds: [],
            whereTypes: [
                {
                    label: '且',
                    value: 'AND'
                },
                {
                    label: '或',
                    value: 'OR'
                }
            ],
            filterItems: [],
            data: {
                template: '',
                conditions: [],
                yearStart: '1900',
                yearEnd: year.toString(),
                fond: []
            },
            listFrameUrl: ''
        }
    },
    computed: {
        templates() {
            if (this.template.expand) {
                return this.template.data
            }
            return this.template.data.slice(0, 4)
        },
        fondOptions() {
            return this.fonds.map((n) => ({
                label: n.fondsNo,
                value: n.fondsNo,
                children: n.archiveTypeList.map((n) => ({
                    label: n.archiveTypeName,
                    value: n.archiveTypeId,
                    disabled: !n.isSelect
                }))
            }))
        },
        fondParams() {
            if (this.data.fond.length > 0) {
                return [
                    {
                        filterCode: 'FONDS_NO',
                        filterValue: this.data.fond.map((n) => n[0]).join(','),
                        logicalRelation: 'AND',
                        logicalConditionCode: 'IN'
                    },
                    {
                        filterCode: 'ARCHIVE_TYPE',
                        filterValue: this.data.fond.map((n) => n[1]).join(','),
                        logicalRelation: 'AND',
                        logicalConditionCode: 'IN'
                    }
                ]
            }
            return null
        },
        conditionParams() {
            return this.data.conditions
                .map((n) => {
                    const item = this.getFilterItem(n.filterCode)
                    if (item.filterController == 'controlDateTime' && n.logicalConditionCode == '<>') {
                        n.filterValue = `${n.filterStart} - ${n.filterEnd}`
                    }
                    // if (item.filterController == 'controlComboBox') {
                    //     n.filterValue = n.filterValues.join(',')
                    // }
                    return {
                        filterCode: n.filterCode,
                        filterValue: n.filterValue,
                        logicalRelation: n.logicalRelation,
                        logicalConditionCode: n.logicalConditionCode
                    }
                })
                .concat([
                    {
                        filterCode: 'ARCHIVE_YEAR',
                        filterValue: `${this.data.yearStart} - ${this.data.yearEnd}`,
                        logicalConditionCode: '<>',
                        logicalRelation: 'AND'
                    }
                ])
                .concat(this.fondParams || [])
                .filter((n) => {
                    if (!['IS NULL', 'IS NOT NULL'].includes(n.logicalConditionCode) && n.filterValue == '') {
                        return false
                    }
                    return true
                })
        }
    },
    watch: {
        filterItems(value) {
            this.data.conditions = value.slice(0, 3).map((n) => ({
                filterCode: n.filterCode,
                filterValue: '',
                logicalRelation: 'AND',
                logicalConditionCode: n.logicalConditionList[0]?.logicalConditionCode
            }))
        },
        'data.template': {
            handler(value) {
                const searchParam = JSON.parse(this.template.data.find((n) => n.id == value).searchParam || [])
                this.data.conditions = searchParam
                    .filter((n) => !['ARCHIVE_YEAR', 'FONDS_NO', 'ARCHIVE_TYPE'].includes(n.filterCode))
                    .map((n) => {
                        if (n.filterController == 'controlDateTime' && n.logicalConditionCode == '<>') {
                            const dates = n.filterValue.split(' - ')
                            n.filterStart = dates[0]
                            n.filterEnd = dates[1]
                        }
                        return n
                    })
                const years = searchParam.find((n) => n.filterCode == 'ARCHIVE_YEAR')?.filterValue.split(' - ')
                if (years) {
                    this.data.yearStart = years[0]
                    this.data.yearEnd = years[1]
                }
                const fonds = searchParam.find((n) => n.filterCode == 'FONDS_NO')?.filterValue.split(',')
                const types = searchParam.find((n) => n.filterCode == 'ARCHIVE_TYPE')?.filterValue.split(',')
                if (fonds) {
                    this.data.fond = fonds.map((n, i) => [n, types[i]])
                }
            }
        }
    },
    mounted() {
        this.urlObject = window.IDM?.url?.queryObject() || {};
        console.log(this.urlObject);
        this.initData()
    },
    methods: {
        initData() {
            window.IDM.http.get('ctrl/archive/search/getArchiveTypeList').then(({ data }) => {
                this.fonds = data.data
            })
            window.IDM.http.get('ctrl/archive/search/getFilterItems').then(({ data }) => {
                this.filterItems = data.data
            })
            this.fetchTemplates();
            this.search();
        },
        fetchTemplates() {
            window.IDM.http.get('ctrl/archive/search/getSearchTemplate').then(({ data }) => {
                this.template.data = data.data
            })
        },
        getFilterItem(filterCode) {
            return this.filterItems.find((n) => n.filterCode == filterCode)
        },
        addCondition(item, index) {
            this.data.conditions.splice(index + 1, 0, {
                ..._.cloneDeep(item),
                filterValue: '',
                filterStart: '',
                filterEnd: ''
            })
        },
        removeCondition(item, index) {
            this.data.conditions.splice(index, 1)
        },
        fetchSearchKey(searchParam) {
            return window.IDM.http
                .post(
                    'ctrl/archive/search/addSearchParam',
                    JSON.stringify({
                        searchParam
                    }),
                    {
                        headers: {
                            'Content-Type': 'application/json'
                        }
                    }
                )
                .then(({ data }) => data.data.searchParamKey)
        },
        viewTemplate() {
            top.layer.open({
                title: '检索模版',
                type: 2,
                content: window.IDM.url.getWebPath(`ctrl/list/250319092208sq8x43vH2MYG7xA346N?moduleId=250319090934qsa5CCFaQV6GeJOdvwe`),
                area: ['80vw', '80vh']
            })
        },
        saveTemplate() {
            this.fetchSearchKey(this.conditionParams).then((key) => {
                top.layer.open({
                    title: '保存为模版',
                    type: 2,
                    content: window.IDM.url.getWebPath(`ctrl/formControl/sysForm?from=list&moduleId=250319090934qsa5CCFaQV6GeJOdvwe&searchParamKey=${key}`),
                    area: ['1050px', '310px'],
                    end: () => {
                        this.fetchTemplates()
                    }
                })
            })
        },
        exportTemplate() {
            $(".list-frame").contents().find("button[op='exportXls']").click()
        },
        search() {
            this.showAll = false;
            this.fetchSearchKey(this.conditionParams).then((key) => {
                this.listFrameUrl = window.IDM.url.getWebPath(`ctrl/list/250324093129UzcvL2G3daLlcfmEPLL?moduleId=2406041600297BTvDAGGotrv6bHRewb&searchParamKey=${key}`)
            })
        },
        fileterCodeChange(value, condition) {
            const item = this.getFilterItem(condition.filterCode)
            condition.logicalConditionCode = item.logicalConditionList[0].logicalConditionCode
            // if (item.filterController == 'controlComboBox') {
            //     this.$set(condition, 'filterValues', [])
            //     return
            // }
            condition.filterValue = ''
        },
        logicalChange(value, condition) {
            condition.filterValue = ''
        },
        addToMaterial(){
            this.customFunctionHandle(this.propData.clickFunctions);
        },
        customFunctionHandle(customFunction, param = {}) {
            let urlObject = window.IDM.url.queryObject();
            let pageId = window.IDM.broadcast && window.IDM.broadcast.pageModule ? window.IDM.broadcast.pageModule.id : "";
            var clickFunction = customFunction;
            clickFunction && clickFunction.forEach((item1) => {
                window[item1.name] &&
                    window[item1.name].call(this, {
                        urlData: urlObject,
                        pageId,
                        commonParam: this.commonParam(),
                        customParam: item1.param,
                        ...param,
                        this: this,
                    });
            });
        },
        commonParam() {
            return {
                moduleObject: this.moduleObject,
                pageId: window.IDM.broadcast && window.IDM.broadcast.pageModule ?window.IDM.broadcast.pageModule.id : '',
                urlObject: IDM.url.queryObject()
            };
        },
    }
}
</script>
<style lang="scss" scoped>
@use '../style/common.scss';
.simpleFormData{
    padding: 0 20px;
    font-size: 14px;
    span+span{
        margin-left: 20px;
    }
}
.search-container{
    overflow: hidden;
}
.gap-2 {
    gap: 20px;
}
.form {
    width: min(80%, 920px);
    position: relative;
    .expanded{
        width: auto;
        padding: 0 24px 0 10px;
        height: 32px;
        line-height: 32px;
        font-size: 12px;
        border-radius: 3px;
        text-align: center;
        background: #56a9ff;
        color: #fff;
        position: absolute;
        right: -120px;
        top: 18px;
        background-position: 94% center;
        background-repeat: no-repeat;
        background-image: url('../assets/arrow-right.png');
        &.open{
           background-image: url('../assets/arrow-down.png');
        }
    }
    :deep(.el-form-item__label) {
        font-weight: 500;
    }
    :deep(.el-form-item) {
        border-bottom: 1px solid #eee;
        padding: 18px 0;
        margin-bottom: 0;
    }
    :deep(.el-radio-group) {
        display: flex;
        flex-wrap: wrap;
        gap: 20px;
    }
    :deep(.el-radio) {
        padding: 6px 28px;
        border-radius: 4px;
        .el-radio__input {
            display: none;
        }
        .el-radio__label {
            padding: 3px 0;
            display: block;
            width: 80px;
            text-align: center;
            overflow: hidden;
            text-overflow: ellipsis;
            white-space: nowrap;
        }
        &.is-checked {
            background: #dff6ff;
            border: 1px solid rgba(0, 145, 255, 1);
            .el-radio__label {
                color: #0091ff;
            }
        }
    }
    &-actions {
        padding: 30px 0;
        :deep(.el-button) {
            width: 120px;
        }
    }
}
.condition {
    &-list {
        gap: 16px;
    }
    &-item {
    }
    &-actions {
        width: 80px;
        &-btn {
            font-size: 20px;
            color: #0080ff;
            cursor: pointer;
        }
    }
}
.list-frame {
    border: none;
    height: 70vh;
}
</style>
