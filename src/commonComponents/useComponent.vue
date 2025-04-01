<template>
    <div>
        <div class="head mb10">
            <svg-icon iconClass="shu"></svg-icon>
            <span>档案利用统计</span>
        </div>
        <div class="table-head mb10">
            <div></div>
            <div>
                <!-- <a-button class="h40 super-btn" type="primary" @click="handleSearch">检索</a-button> -->
                <!-- <a-button class="h40 super-btn">导出</a-button> -->
            </div>
        </div>
        <!--搜索-->
        <div class="table-search">
            <div class="super-middle" style="width: 25%">
                <span class="super-mr10">全宗号</span>
                <a-select v-model="search.fondsNo" allowClear style="width: 50%">
                    <a-select-option :value="item.value" v-for="(item, index) in selectData.archiveFondList" :key="index">
                        {{ item.text }}
                    </a-select-option>
                </a-select>
            </div>
            <div class="super-middle" style="width: 25%">
                <span class="super-mr10">保管期限</span>
                <a-select v-model="search.archicvePeriod" allowClear style="width: 50%">
                    <a-select-option :value="item.value" v-for="(item, index) in selectData.arvhivePeriodList" :key="index">
                        {{ item.text }}
                    </a-select-option>
                </a-select>
            </div>
            <div class="super-middle" style="width: 25%">
                <span class="super-mr10">年度</span>
                <a-config-provider :locale="locale">
                    <a-date-picker
                        v-model="search.archiveYear"
                        placeholder="请选择年份"
                        mode="year"
                        format="YYYY"
                        :open="yearShowOne"
                        @openChange="openChangeOne"
                        @panelChange="panelChangeOne"
                    />
                </a-config-provider>
            </div>
            <div style="width: 25%">
                <a-button class="h40 super-btn" type="primary" @click="handleSearch">检索</a-button>
            </div>
        </div>
        <div class="echartsBox" ref="line1"></div>
        <!--表格-->
        <table class="stattable" v-show="archiveGridList.length > 0">
            <thead>
                <tr>
                    <td>分类</td>
                    <td>利用次数</td>
                </tr>
            </thead>
            <tbody>
                <tr v-for="(item, index) in archiveGridList" :key="index">
                    <td>{{ item.archiveTypeText }}</td>
                    <td>{{ item.archiveCount }}</td>
                </tr>
            </tbody>
        </table>
    </div>
</template>

<script>
import locale from 'ant-design-vue/es/locale/zh_CN'
import API from '../api/archive'
import moment from 'moment'
export default {
    data() {
        return {
            locale,
            yearShowOne: false,
            selectData: {},
            // 表格数据
            archiveGridList: [],
            search: {
                archicvePeriod: '',
                archiveYear: moment(moment().format('YYYY'))
            }
        }
    },
    mounted() {},
    methods: {
        // 下拉框数据
        hanldeSelectData(data) {
            this.selectData = data
            Object.entries(this.selectData).forEach(([key, value]) => {
                if (key == 'archiveFondList') {
                    if (Array.isArray(value) && value.length > 0) {
                        this.search.fondsNo = value[0].value
                    }
                }
            })
            this.handleRequireList()
        },
        handleSearch() {
            this.handleRequireList()
        },
        openChangeOne(status) {
            if (status) {
                this.yearShowOne = true
            }
        },
        panelChangeOne(value) {
            this.search.archiveYear = value
            this.yearShowOne = false
        },
        /**
         * 档案利用统计
         */
        async handleRequireList() {
            this.archiveGridList = []
            let obj = Object.assign({}, this.search, { archiveYear: this.search.archiveYear ? this.search.archiveYear.format('YYYY') : '' })
            let res = await API.ApiQueryTakeData(obj)
            if (res.code == '200') {
                this.contentTable(res.data)
            }
        },
        // 柱状图
        initBar(data) {
            let myChart = this.$echarts.init(this.$refs.line1)
            let bardata = data.map((item) => {
                return {
                    value: item.archiveCount,
                    itemStyle: { color: '#389EFD' }
                }
            })
            let option = {
                tooltip: {
                    trigger: 'axis',
                    axisPointer: {
                        type: 'shadow'
                    }
                },
                xAxis: {
                    type: 'category',
                    axisLabel: {
                        textStyle: {
                            color: '#333',
                            fontSize: '16'
                        }
                    },
                    axisTick: {
                        alignWithLabel: true
                    },
                    data: data.map((item) => item.archiveTypeText)
                },
                yAxis: {
                    type: 'value'
                },
                series: [
                    {
                        data: bardata,
                        type: 'bar'
                    }
                ]
            }
            myChart.setOption(option)
        },
        // 柱状图+表格
        contentTable(data) {
            this.initBar(data.archiveList)
            this.archiveGridList = data.archiveList || []
        }
    }
}
</script>

<style lang="scss" scoped>
.echartsBox {
    width: 100%;
    height: 400px;
}
</style>
