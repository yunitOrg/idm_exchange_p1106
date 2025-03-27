<template>
    <div idm-ctrl="idm_module" :id="moduleObject.id" :idm-ctrl-id="moduleObject.id" class="flex flex-col">
        <div class="flex justify-center">
            <el-form label-width="80px" label-position="left" class="form">
                <el-form-item label="常用模版">
                    <div class="flex items-start gap-2">
                        <el-radio-group v-model="data.template" size="small" class="flex-1 w-0">
                            <el-radio v-for="n in templates" :key="n.id" :label="n.id" :border="true">{{ n.bt }}</el-radio>
                        </el-radio-group>
                        <el-button v-if="template.data.length > 4" @click="template.expand = !template.expand" size="small">{{ template.expand ? '收起' : '更多' }}</el-button>
                    </div>
                </el-form-item>
                <el-form-item label="全 宗 号">
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
                <el-form-item label="检索信息">
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
                <el-form-item label="归档年度">
                    <div class="flex gap-2">
                        <el-select v-model="data.yearStart" filterable default-first-option>
                            <el-option :value="1900" label="不限"></el-option>
                            <el-option v-for="n in Array.from({ length: year - 1989 }, (_, i) => year - i)" :key="n" :value="n" :label="n" :disabled="n > data.yearEnd"></el-option>
                        </el-select>
                        -
                        <el-select v-model="data.yearEnd" filterable default-first-option>
                            <el-option
                                v-for="n in Array.from({ length: year - 1989 }, (_, i) => year - i)"
                                :key="n"
                                :value="n"
                                :label="n == year ? '至今' : n"
                                :disabled="n < data.yearStart"
                            ></el-option>
                        </el-select>
                    </div>
                </el-form-item>
                <div class="flex justify-center form-actions">
                    <el-button @click="search" type="primary">检索</el-button>
                    <el-button @click="viewTemplate">检索模版</el-button>
                    <el-button @click="saveTemplate">保存为模版</el-button>
                </div>
            </el-form>
        </div>
        <iframe :src="listFrameUrl" class="w-full list-frame"></iframe>
    </div>
</template>
<script>
import { bindStyle, bindProp } from '../mixins'
export default {
    mixins: [bindProp(), bindStyle()],
    data() {
        const year = new Date().getFullYear()
        return {
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
                yearStart: 1900,
                yearEnd: year,
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
            this.fetchTemplates()
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
            this.data.conditions.splice(index + 1, 0, _.cloneDeep(item))
        },
        removeCondition(item, index) {
            this.data.conditions.splice(index, 1)
        },
        fetchSearchKey(searchParam) {
            return window.IDM.http
                .post('ctrl/archive/search/addSearchParam', {
                    searchParam
                })
                .then(({ data }) => data.data.searchParamKey)
        },
        viewTemplate() {
            this.fetchSearchKey(this.conditionParams).then((key) => {
                top.layer.open({
                    title: '检索模版',
                    type: 2,
                    content: window.IDM.url.getWebPath(`ctrl/list/250319092208sq8x43vH2MYG7xA346N?moduleId=250319090934qsa5CCFaQV6GeJOdvwe&searchParamKey=${key}`),
                    area: ['80vw', '80vh']
                })
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
        search() {
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
        }
    }
}
</script>
<style lang="scss" scoped>
@use '../style/common.scss';
.gap-2 {
    gap: 20px;
}
.form {
    width: min(80%, 920px);
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
            padding: 0;
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
