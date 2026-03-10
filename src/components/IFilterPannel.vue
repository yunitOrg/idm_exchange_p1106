<template>
    <div idm-ctrl="idm_module" :id="moduleObject.id" :idm-ctrl-id="moduleObject.id" class="flex flex-col">
        <div class="flex justify-center search-container">
            <el-form label-width="80px" label-position="left" class="form">
                <el-form-item label="常用模版">
                    <div class="flex items-start gap-2">
                        <el-radio-group v-model="data.template" size="small" class="flex-1 w-0">
                            <!-- 修改处：添加 @click.native.prevent="toggleTemplate(n.id)" -->
                            <el-radio 
                                v-for="n in templates" 
                                :key="n.id" 
                                :label="n.id" 
                                :border="true"
                                @click.native.prevent="toggleTemplate(n.id)"
                            >
                                {{ n.bt }}
                            </el-radio>
                        </el-radio-group>
                        <el-button v-if="template.data.length > 4" @click="template.expand = !template.expand" size="small">{{ template.expand ? '收起' : '更多' }}</el-button>
                    </div>
                </el-form-item>
                <!-- <el-form-item label="全 宗" v-show="showAll">
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
                </el-form-item> -->
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
                                   <div v-else-if="getFilterItem(condition.filterCode).filterController == 'controlComboBox'" class="flex gap-2">
                                      
                                        <el-select 
                                            v-model="condition.filterValue" 
                                            filterable 
                                            clearable
                                            class="flex-1"
                                            placeholder="请选择"
                                        >
                                         
                                            <el-option 
                                                v-for="m in (getFilterItem(condition.filterCode).childrenCode || [])" 
                                                :key="m.codeValue" 
                                                :label="m.codeName" 
                                                :value="m.codeName"
                                            ></el-option>
                                        </el-select>
                                    </div>
                                    <el-input v-else v-model="condition.filterValue" clearable placeholder="请输入" ></el-input>
                                </template>
                            </div>
                            <div class="flex items-center gap-2 condition-actions">
                                <i @click="addCondition(condition, i)" class="el-icon-circle-plus-outline condition-actions-btn"></i>
                                <i v-if="i > 1" @click="removeCondition(condition, i)" class="el-icon-remove-outline condition-actions-btn"></i>
                            </div>
                        </div>
                    </div>
                </el-form-item>
                <!-- <el-form-item label="归档年度" v-show="showAll">
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
                </el-form-item> -->
                <div class="flex justify-center form-actions">
                    <el-button @click="search" type="primary">检索</el-button>
                    <el-button @click="viewTemplate">检索模版</el-button>
                    <el-button @click="saveTemplate">保存为模版</el-button>
                    <!-- <el-button @click="exportTemplate">导出</el-button> -->
                    <el-button v-if="urlObject.fid!=null" @click="addToMaterial">加入素材库</el-button>
                </div>
                <div class="expanded" :class="{open:showAll}" @click="showAll = !showAll;">高级检索</div>
                <div v-if="urlObject.fileRelaId!=null ||  (urlObject.fileRelaIds && urlObject.fileRelaIds.length>0)" class="expanded expanded2"  @click="addToMaterial2">关联文件</div>

            </el-form>
        </div>
        <div class="w-full list-frame-container" :style="{height:showAll?'70vh':'calc(100vh - 198px)'}">
            <div class="simpleFormData">
                <span v-if="data.fond.length">全宗号：{{data.fond.join(",")}}</span>
                <span>
                    <template v-for="(condition, i) in data.conditions">
                    {{i==0?'当':whereTypes.find((item)=>{return item.value == condition.logicalRelation}).label}}{{filterItems.find((item)=>{return item.filterCode == condition.filterCode}).filterName}}{{getFilterItem(condition.filterCode).logicalConditionList.find((item)=>{return item.logicalConditionCode == condition.logicalConditionCode}).logicalConditionName}}“{{!['IS NULL', 'IS NOT NULL'].includes(condition.logicalConditionCode)&&condition.logicalConditionCode == '<>'?condition.filterStart +'-' + condition.filterEnd:condition.filterValue}}”
                    </template>
                    <!-- <template v-for="(condition, i) in data.conditions">
                        {{i==0?'当':whereTypes.find((item)=>{return item.value == condition.logicalRelation}).label}}{{filterItems.find((item)=>{return item.filterCode == condition.filterCode}).filterName}}{{getFilterItem(condition.filterCode).logicalConditionList.find((item)=>{return item.logicalConditionCode == condition.logicalConditionCode}).logicalConditionName}}
                        
                        “{{ getDisplayValue(condition) }}”
                    </template> -->
                </span>
                <!-- <span>归档年度：{{data.yearStart == '1900'?'不限':data.yearStart}}-{{data.yearEnd == year?'至今':data.yearEnd}}</span> -->
            </div>

            <iframe :src="listFrameUrl" class=" list-frame" :style="{width:'100%'}"></iframe>
        </div>
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
                clickFunctions2:"",
                isShowSck:"fid!=null",
                searchJumpUrl:"/ctrl/archiveProjectController/openAdvancedSearchPage"
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
                yearStart: '',//1900
                yearEnd: '',//year.toString()
                fond: []
            },
            listFrameUrl: '',
            showIframe:false,
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
                label: n.fondsName,
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
                    
                    // --- 新增/修改逻辑开始 ---
                    // 处理 controlComboBox：将数组转换为逗号分隔的字符串
                    if (item && item.filterController === 'controlComboBox' && Array.isArray(n.filterValue)) {
                        n.filterValue = n.filterValue.join(',')
                    }
                    // --- 新增/修改逻辑结束 ---

                    if (item.filterController == 'controlDateTime' && n.logicalConditionCode == '<>') {
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
            //将filterCode值存放在sessionStorage
            // sessionStorage.setItem('filterCode',this.data.conditions.map(n => n.filterCode).join(','))
            // console.log(this.data.conditions,"检索信息watch");
        },
        'data.template': {
        handler(value) {
           if (!value) {
                 // ... 清空逻辑保持你原来的 ...
                 this.data.conditions = [{
                    filterCode: this.filterItems[0]?.filterCode || '',
                    filterValue: '',
                    logicalRelation: 'AND',
                    logicalConditionCode: this.filterItems[0]?.logicalConditionList[0]?.logicalConditionCode || ''
                }];
                    this.data.yearStart = '';
                    this.data.yearEnd = '';
                    this.data.fond = [];
                return;
            }

            const templateData = this.template.data.find((n) => n.id == value);
            if (!templateData) return;

            const searchParam = JSON.parse(templateData.searchParam || [])
            this.data.conditions = searchParam
                .filter((n) => !['ARCHIVE_YEAR', 'FONDS_NO', 'ARCHIVE_TYPE'].includes(n.filterCode))
                .map((n) => {
                    // --- 新增逻辑：处理 ComboBox 回显 ---
                    // 必须先获取 filterItem 定义才能知道是不是下拉框
                    // 注意：这里有个风险，如果 filterItems 还没加载完，可能找不到 item。
                    // 通常模版加载在 filterItems 之后，如果顺序不确定，这里需要健壮性判断。
                    const itemDef = this.getFilterItem(n.filterCode); 
                    
                    if (itemDef && itemDef.filterController === 'controlComboBox') {
                        // 如果有逗号分隔的字符串，转为数组；否则为空数组
                        n.filterValue = n.filterValue ? n.filterValue.split(',') : [];
                    } else {
                        n.filterValue = [];
                    }
                    // ----------------------------------

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
    },
        'data.fond': {
            handler(value) {
                console.log(value);
                 window.IDM.http.get(`ctrl/archive/search/getFilterItems?fondsNo=${this.data.fond.join(',')}`).then(({ data }) => {
                    this.filterItems = data.data
                })
            }
        },

    },
    mounted() {
        this.urlObject = window.IDM?.url?.queryObject() || {};
        console.log(this.urlObject);
        this.initData()
    },
    methods: {
        initData() {
            // window.IDM.http.get('http://localhost:8080/DreamOne/ctrl/archive/search/getArchiveTypeList').then(({ data }) => {
            //     this.fonds = data.data
            // })
            window.IDM.http.get(`/ctrl/archive/search/getFilterItems?fondsNo=${this.data.fond.join(',')}`).then(({ data }) => {
                this.filterItems = data.data
                this.$nextTick(() => {
                    this.search();
                })
            })
            this.fetchTemplates();
            
            
        },
        fetchTemplates() {
            window.IDM.http.get('/ctrl/archive/search/getSearchTemplate').then(({ data }) => {
                this.template.data = data.data
            })
        },
        // 新增：切换模版选中状态
        toggleTemplate(id) {
            if (this.data.template === id) {
                // 如果当前已经选中该值，则清空（取消选中）
                this.data.template = '';
            } else {
                // 否则选中该值
                this.data.template = id;
            }
        },
        getFilterItem(filterCode) {
          return this.filterItems.find((n) => n.filterCode == filterCode) || {} 
        },
        addCondition(item, index) {
            // 判断当前要添加的这个配置是不是下拉框
            const isCombo = item.filterController === 'controlComboBox';
            
            this.data.conditions.splice(index + 1, 0, {
                ..._.cloneDeep(item),
                filterValue: isCombo ? [] :'', // 显式初始化数组
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
                    '/ctrl/archive/search/addSearchParam',
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
                content: window.IDM.url.getWebPath(`/ctrl/list/250319092208sq8x43vH2MYG7xA346N?moduleId=250319090934qsa5CCFaQV6GeJOdvwe`),
                area: ['80vw', '80vh']
            })
        },
        saveTemplate() {
            this.fetchSearchKey(this.conditionParams).then((key) => {
                top.layer.open({
                    title: '保存为模版',
                    type: 2,
                    content: window.IDM.url.getWebPath(`/ctrl/formControl/sysForm?from=list&moduleId=250319090934qsa5CCFaQV6GeJOdvwe&searchParamKey=${key}`),
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
            var that = this;
            //获取this.data.conditions中的filterCode
            this.showAll = false;
            this.showIframe = false;
            this.listFrameUrl = "";
            // sessionStorage.setItem('filterCode',this.data.conditions.map(n => n.filterCode).join(','))
            // console.log(this.data.conditions,"检索信息");
            // this.fetchSearchKey(this.conditionParams).then((key) => {
            //     this.listFrameUrl = window.IDM.url.getWebPath(`${that.propData.searchJumpUrl}?moduleId=2406041600297BTvDAGGotrv6bHRewb&searchParamKey=${key}`)
            //     this.showIframe = true;
            // })
            console.log(JSON.stringify(this.data.conditions))
            // 1. 将this.data.conditions转换为JSON字符串
            let filtersStr= JSON.stringify(this.data.conditions)
            // 2. URL编码
            const encodedFilters = encodeURIComponent(filtersStr);

            this.listFrameUrl = window.IDM.url.getWebPath(`${that.propData.searchJumpUrl}?filters=${encodedFilters}`)        
            this.showIframe = true;
        },
        // 新增：用于格式化显示筛选值
        getDisplayValue(condition) {
            // 1. 获取当前条件的配置项
            const item = this.getFilterItem(condition.filterCode);
            
            // 2. 处理日期范围 (保留原逻辑)
            if (!['IS NULL', 'IS NOT NULL'].includes(condition.logicalConditionCode) && condition.logicalConditionCode == '<>') {
                return condition.filterStart + ' - ' + condition.filterEnd;
            }

            // 3. 处理下拉框 (controlComboBox) - 核心修改点
            if (item && item.filterController === 'controlComboBox') {
                const options = item.childrenCode || [];
                const val = condition.filterValue;

                // 如果值是数组（多选情况），则转换所有选项并用逗号拼接
                if (Array.isArray(val)) {
                    return val.map(v => {
                        const found = options.find(opt => opt.codeValue == v);
                        return found ? found.codeName : v;
                    }).join(',');
                }
                
                // 如果值是字符串（单选情况）
                const found = options.find(opt => opt.codeValue == val);
                return found ? found.codeName : val;
            }

            // 4. 其他情况（文本框等）直接返回值
            return condition.filterValue;
        },
        fileterCodeChange(value, condition) {
            const item = this.getFilterItem(condition.filterCode)
            
            // 设置默认逻辑符
            if(item.logicalConditionList && item.logicalConditionList.length > 0){
                condition.logicalConditionCode = item.logicalConditionList[0].logicalConditionCode
            }

          
            // 如果是下拉框，初始化 filterValue 为空数组
            if (item.filterController === 'controlComboBox') {
                this.$set(condition, 'filterValue', []) // 使用 $set 确保响应式
            } else {
                // 如果不是下拉框，可以清理掉这个属性（可选）
                if(condition.filterValue) condition.filterValue = []; 
            }
            // --- 新增逻辑结束 ---

            condition.filterValue = ''
            // 同时也清空时间
            condition.filterStart = ''
            condition.filterEnd = ''
        },
        logicalChange(value, condition) {
            condition.filterValue = ''
        },
        addToMaterial(){
            this.customFunctionHandle(this.propData.clickFunctions);
        },
        //关联文件的点击事件
        addToMaterial2(){
            this.customFunctionHandle(this.propData.clickFunctions2);
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
    .expanded2{
        right: -250px;
        padding: 0 10px;
        cursor: pointer;
        background-image: none;
        &.open{
           background-image: none;
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
.list-frame-container{
    position: relative;
    .simpleFormData{
        position: absolute;
        top: 25px;
    }
    .list-frame {
        border: none;
        height: 100%;
    }
}
</style>
