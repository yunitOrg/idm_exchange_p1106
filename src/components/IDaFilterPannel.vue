<template>
    <div idm-ctrl="idm_module" :id="moduleObject.id" :idm-ctrl-id="moduleObject.id">
        <div class="flex justify-center">
            <el-form label-width="80px" label-position="left" class="form">
                <el-form-item label="常用模版">
                    <el-checkbox-group v-model="data.templates" size="small">
                        <el-checkbox v-for="n in templates" :key="n.value" :label="n.value" :border="true">{{ n.label }}</el-checkbox>
                    </el-checkbox-group>
                </el-form-item>
                <el-form-item label="全 宗 号">
                    <el-select v-model="data.no" multiple placeholder="请选择" class="w-full">
                        <el-option v-for="n in fondsNo" :key="n.value" :label="n.label" :value="n.value"> </el-option>
                    </el-select>
                </el-form-item>
                <el-form-item label="检索信息">
                    <div class="flex flex-col condition-list">
                        <div v-for="(condition, i) in data.conditions" :key="i" class="flex gap-2 condition-item">
                            <div style="width: 60px; text-align: right">
                                <template v-if="condition.type == 'if'">当</template>
                                <el-select v-else v-model="condition.type">
                                    <el-option v-for="m in whereTypes" :key="m.value" :label="m.label" :value="m.value"></el-option>
                                </el-select>
                            </div>
                            <el-select v-model="condition.item" class="flex-1">
                                <el-option v-for="m in conditionitems" :key="m.value" :label="m.label" :value="m.value"></el-option>
                            </el-select>
                            <el-select v-model="condition.where" class="flex-1">
                                <el-option v-for="m in getWheres(condition.item)" :key="m.value" :label="m.label" :value="m.value"></el-option>
                            </el-select>
                            <div style="flex: 5">
                                <div v-if="condition.item == 2" class="flex gap-2">
                                    <el-date-picker v-model="condition.value" type="date" placeholder="选择日期" class="flex-1"> </el-date-picker>
                                    <el-date-picker v-if="condition.where == 4" v-model="condition.value" type="date" placeholder="选择日期" class="flex-1"> </el-date-picker>
                                </div>
                                <el-input v-else></el-input>
                            </div>
                            <div class="flex-1 flex items-center gap-2 condition-actions">
                                <i @click="addCondition(condition, i)" class="el-icon-circle-plus-outline condition-actions-btn"></i>
                                <i v-if="i > 1" @click="removeCondition(condition, i)" class="el-icon-remove-outline condition-actions-btn"></i>
                            </div>
                        </div>
                    </div>
                </el-form-item>
                <el-form-item label="发布时间"> </el-form-item>
                <div class="flex justify-center form-actions">
                    <el-button type="primary">检索</el-button>
                    <el-button>检索模版</el-button>
                    <el-button>保存为模版</el-button>
                </div>
            </el-form>
        </div>
    </div>
</template>
<script>
import { bindStyle, bindProp } from '../mixins'
const nullOrNotNull = [
    {
        label: '为空',
        value: 8
    },
    {
        label: '非空',
        value: 9
    }
]
export default {
    mixins: [bindProp(), bindStyle()],
    data() {
        return {
            templates: [
                {
                    label: '模版A',
                    value: 1
                }
            ],
            fondsNo: [
                {
                    label: '0001 文书档案',
                    value: 1
                }
            ],
            whereTypes: [
                {
                    label: '且',
                    value: 'and'
                }
            ],
            conditionitems: [
                {
                    label: '题名',
                    value: 1,
                    where: [
                        {
                            label: '包含',
                            value: 1
                        },
                        {
                            label: '不包含',
                            value: 2
                        }
                    ].concat(nullOrNotNull)
                },
                {
                    label: '保管期限',
                    value: 2,
                    where: [
                        {
                            label: '等于',
                            value: 1
                        },
                        {
                            label: '小于',
                            value: 2
                        },
                        {
                            label: '大于',
                            value: 3
                        },
                        {
                            label: '介于',
                            value: 4
                        }
                    ].concat(nullOrNotNull)
                }
            ],
            data: {
                templates: [],
                no: [],
                conditions: [
                    {
                        type: 'if',
                        item: 1,
                        where: 1,
                        value: ''
                    },
                    {
                        type: 'and',
                        item: 2,
                        where: 1,
                        value: ''
                    },
                    {
                        type: 'and',
                        item: 2,
                        where: 1,
                        value: ''
                    }
                ]
            }
        }
    },
    methods: {
        getWheres(item) {
            return this.conditionitems.find((n) => n.value == item)?.where || []
        },
        addCondition(item, index) {
            this.data.conditions.splice(index + 1, 0, _.cloneDeep(item))
        },
        removeCondition(item, index) {
            this.data.conditions.splice(index, 1)
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
        &-btn {
            font-size: 20px;
            color: #0080ff;
            cursor: pointer;
        }
    }
}
</style>
