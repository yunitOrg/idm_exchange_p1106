<template>
    <div idm-ctrl="idm_module" :id="moduleObject.id" :idm-ctrl-id="moduleObject.id" class="h-screen flex flex-col">
        <div class="flex justify-center">
            <el-form label-width="80px" label-position="left" class="form">
                <el-form-item label="常用模版">
                    <el-radio-group v-model="data.template" size="small">
                        <el-radio v-for="n in templates" :key="n.id" :label="n.id" :border="true">{{ n.bt }}</el-radio>
                    </el-radio-group>
                    <el-button v-if="template.data.length > 4" @click="template.expand = true">更多</el-button>
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
                            <el-select v-model="condition.logicalConditionCode" style="width: 95px">
                                <el-option
                                    v-for="m in getFilterItem(condition.filterCode).logicalConditionList"
                                    :key="m.logicalConditionCode"
                                    :label="m.logicalConditionName"
                                    :value="m.logicalConditionCode"
                                ></el-option>
                            </el-select>
                            <div class="flex-1 w-0">
                                <div v-if="getFilterItem(condition.filterCode).filterController == 'controlDateTime'" class="flex gap-2">
                                    <el-date-picker v-model="condition.filterValue" type="date" placeholder="选择日期" value-format="yyyy-MM-dd" class="flex-1"> </el-date-picker>
                                </div>
                                <div v-else-if="getFilterItem(condition.filterCode).filterController == 'controlComboBox'" class="flex gap-2">
                                    <el-input v-model="condition.filterStart" class="flex-1"> </el-input>
                                    <el-input v-model="condition.filterEnd" class="flex-1"> </el-input>
                                </div>
                                <el-input v-else-if="getFilterItem(condition.filterCode).filterController == 'controlTextBox'" v-model="condition.filterValue"></el-input>
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
                        <el-select v-model="data.yearStart">
                            <el-option :value="1900" label="不限"></el-option>
                            <el-option
                                v-for="(_, i) in Array.from({ length: 4 })"
                                :key="i"
                                :value="year - i - 1"
                                :label="year - i - 1"
                                :disabled="year - i - 1 > data.yearEnd"
                            ></el-option>
                        </el-select>
                        -
                        <el-select v-model="data.yearEnd">
                            <el-option
                                v-for="(_, i) in Array.from({ length: 5 })"
                                :key="i"
                                :value="year - i"
                                :label="i == 0 ? '至今' : year - i"
                                :disabled="year - i < data.yearStart"
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
        {{ searchParam }}
        <iframe :src="listUrl" class="flex-1 h-0 w-full list-frame"></iframe>
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
            listUrl: ''
        }
    },
    computed: {
        templates() {
            return this.template.data.slice(0, this.template.expand ? null : 4)
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
        searchParam() {
            return encodeURIComponent(
                JSON.stringify(
                    this.data.conditions
                        .map((n) => {
                            if (this.getFilterItem(n.filterCode).filterController == 'controlComboBox') {
                                n.filterValue = `${n.filterStart} - ${n.filterEnd}`
                            }
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
                        .concat(
                            this.data.fond
                                .map((n) => [
                                    {
                                        filterCode: 'FONDS_NO',
                                        filterValue: n[0],
                                        logicalRelation: 'AND',
                                        logicalConditionCode: '='
                                    },
                                    {
                                        filterCode: 'ARCHIVE_TYPE',
                                        filterValue: n[1],
                                        logicalRelation: 'AND',
                                        logicalConditionCode: '='
                                    }
                                ])
                                .flat()
                        )
                )
            )
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
                this.listUrl = window.IDM.url.getWebPath(
                    `ctrl/list/250324093129UzcvL2G3daLlcfmEPLL?moduleId=2406041600297BTvDAGGotrv6bHRewb&searchParam=${this.template.data.find((n) => n.id == value).searchParam}`
                )
            }
        }
    },
    mounted() {
        this.initData()
    },
    methods: {
        initData() {
            window.IDM.http.get('ctrl/archive/search/getSearchTemplate').then(({ data }) => {
                this.template.data = data.data
            })
            window.IDM.http.get('ctrl/archive/search/getArchiveTypeList').then(({ data }) => {
                this.fonds = data.data
            })
            window.IDM.http.get('ctrl/archive/search/getFilterItems').then(({ data }) => {
                this.filterItems = data.data
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
        viewTemplate() {
            top.layer.open({
                title: '检索模版',
                type: 2,
                content: window.IDM.url.getWebPath(`ctrl/list/250319092208sq8x43vH2MYG7xA346N?moduleId=250319090934qsa5CCFaQV6GeJOdvwe&searchParam=${this.searchParam}`),
                area: ['80vw', '80vh']
            })
        },
        saveTemplate() {
            top.layer.open({
                title: '保存为模版',
                type: 2,
                content: window.IDM.url.getWebPath(`ctrl/formControl/sysForm?from=list&moduleId=250319090934qsa5CCFaQV6GeJOdvwe&searchParam=${this.searchParam}`),
                area: ['1050px', '310px']
            })
        },
        search() {
            this.listUrl = window.IDM.url.getWebPath(`ctrl/list/250324093129UzcvL2G3daLlcfmEPLL?moduleId=2406041600297BTvDAGGotrv6bHRewb&searchParam=${this.searchParam}`)
        },
        fileterCodeChange(value, condition) {
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
    :deep(.el-checkbox) {
        padding: 6px 28px;
        border-radius: 4px;
        .el-checkbox__input {
            display: none;
        }
        .el-checkbox__label {
            padding: 0;
        }
        &.is-bordered.is-checked {
            background: #dff6ff;
            border: 1px solid rgba(0, 145, 255, 1);
            .el-checkbox__label {
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
}
</style>
