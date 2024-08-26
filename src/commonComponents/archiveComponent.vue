<template>
  <div>
    <div class="head mb10">
      <svg-icon iconClass="shu"></svg-icon>
      <span>档案数量统计</span>
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
      <div class="super-middle" style="width: 20%;">
        <span class="super-mr10">数据来源</span>
        <a-select v-model="search.archiveState" allowClear style="width: 50%">
          <a-select-option :value="item.value" v-for="(item, index) in selectData.archiveStageList" :key="index">
            {{ item.text }}
          </a-select-option>
        </a-select>
      </div>
      <div class="super-middle" style="width: 20%;">
        <span class="super-mr10">保管期限</span>
        <a-select v-model="search.archicvePeriod" allowClear style="width: 50%">
          <a-select-option :value="item.value" v-for="(item, index) in selectData.arvhivePeriodList" :key="index">
            {{ item.text }}
          </a-select-option>
        </a-select>
      </div>
      <div class="super-middle" style="width: 20%;">
        <span class="super-mr10">开放程度</span>
        <a-select v-model="search.archiveOpenStatus" allowClear style="width: 50%">
          <a-select-option :value="item.value" v-for="(item, index) in selectData.archiveOpenTypeList" :key="index">
            {{ item.text }}
          </a-select-option>
        </a-select>
      </div>
      <div class="super-middle" style="width: 20%;">
        <span class="super-mr10">年度</span>
        <a-config-provider :locale="locale">
          <a-date-picker
            v-model="search.archiveYear"
            placeholder="请选择年份"
            mode="year"
            format='YYYY'
            :open='yearShowOne'
            @openChange="openChangeOne"
            @panelChange="panelChangeOne"/>
        </a-config-provider>
      </div>
      <div style="width: 20%;">
        <a-button class="h40 super-btn" type="primary"  @click="handleSearch">检索</a-button>
      </div>
    </div>
    <div class="echartsBox" ref="line1"></div>
    <!--表格-->
    <table class="stattable" v-if="archiveGridList.length > 0">
      <thead>
        <tr>
          <td :colspan="seeTableRow.length">分类</td>
          <td>条目数量</td>
        </tr>
      </thead>
      <tbody>
        <tr v-for="(item, index) in archiveGridList" :key="index">
          <td :rowspan="item.firstRow+1" v-if="item.firstRow+1 > 0">{{ item.archiveStageText }}</td>
          <td :rowspan="item.secondRow+1" v-if="item.secondRow+1 > 0">{{ item.archiveTypeText }}</td>
          <td v-if="seeTableRow.includes('3') || item.archiveSubTypeText">{{ item.archiveSubTypeText }}</td>
          <td>{{ item.archiveCount }}</td>
        </tr>
      </tbody>
    </table>
  </div>
</template>

<script>
import locale from 'ant-design-vue/es/locale/zh_CN';
import API from '../api/archive';
import moment from 'moment';
export default {
  data() {
    return {
      locale,
      // 表格数据
      archiveGridList: [],
      yearShowOne: false,
      selectData: {},
      // 表格列数
      seeTableRow: [],
      search: {
        archiveState: '-1',
        archicvePeriod: '',
        archiveOpenStatus: '',
        archiveYear: moment(moment().format('YYYY'))
      },
    }
  },
  mounted() {
    this.handleRequireList()
  },
  methods: {
    openChangeOne(status) {
      if (status) {
        this.yearShowOne = true
      }
    },
    /**
     * 档案数量统计
     */
     async handleRequireList() {
      this.archiveGridList = [];
      this.seeTableRow = [];
      let obj = Object.assign({}, this.search, {archiveYear: this.search.archiveYear ? this.search.archiveYear.format('YYYY') : ''})
      let res = await API.ApiQueryCountData(obj);
      if (res.code == '200') {
        this.contentTable(res.data)
      }
    },
    // 检索
    handleSearch() {
      this.handleRequireList()
    },
    panelChangeOne(value) {
      this.search.archiveYear = value;
      this.yearShowOne = false;
    },
    initecharts(data) {
      let xary = data.map(item => item.archiveTypeText)
      let bardata = data.map(item => {
        return {
          value: item.archiveCount,
          itemStyle: { color: '#389EFD' }
        }
      })
      let myChart = this.$echarts.init(this.$refs.line1);
      let option = {
        tooltip:{
          trigger: 'axis',
          axisPointer: {
            type: 'shadow'
          }
        },
        xAxis: {
          type: 'category',
          data: xary,
          axisLabel: {
            textStyle: {
              color: '#333',
              fontSize: '16'
            }
          },
          axisTick: {
            alignWithLabel: true
          }
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
      myChart.setOption(option);
    },
    // 下拉框数据
    hanldeSelectData(data) {
      this.selectData = data
    },
    tableComputed(data) {
      if(data && data.length > 0) {
        data.forEach(item => {
          if(item.archiveStageText) {
            !this.seeTableRow.includes('1') && this.seeTableRow.push('1')
          }
          if (item.archiveTypeText) {
            !this.seeTableRow.includes('2') && this.seeTableRow.push('2')
          }
          if (item.archiveSubTypeText) {
            !this.seeTableRow.includes('3') && this.seeTableRow.push('3')
          }
        });
        let middleField = '', sum = 0, item = {};
        for (let index = 0; index < data.length; index++) {
          const element = data[index];
          if (middleField == element.archiveStageText) {
            sum++
            element.archiveStageText = ''
          } else {
            item = element
            sum = 0
            middleField = element.archiveStageText
          }
          item.firstRow = sum
        }
        let middleStatus = '', num = 0, middleitem = {};
        for (let index = 0; index < data.length; index++) {
          const element = data[index];
          if (middleStatus == element.archiveTypeText) {
            num++
            element.archiveTypeText = ''
          } else {
            middleitem = element
            num = 0
            middleStatus = element.archiveTypeText
          }
          middleitem.secondRow = num
        }
        this.archiveGridList = data
      }
    },
    // 柱状图+表格
    contentTable(data) {
      this.initecharts(data.archiveBarChartList);
      this.tableComputed(data.archiveGridList || [])
    }
  }
}
</script>

<style scoped lang="scss">
 .echartsBox{
  width: 100%;
  height: 400px;
}
</style>
