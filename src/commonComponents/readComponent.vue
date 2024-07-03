<template>
  <div>
    <div class="head mb10">
      <svg-icon iconClass="shu"></svg-icon>
      <span>档案借阅统计</span>
    </div>
    <div class="table-head mb10">
      <div></div>
      <div>
        <a-button class="h40 super-btn" type="primary" @click="handleSearch">检索</a-button>
        <!-- <a-button class="h40 super-btn">导出</a-button> -->
      </div>
    </div>
    <!--搜索-->
    <div class="table-search">
      <div class="super-middle" style="width: 25%;">
        <span class="super-mr10">保管期限</span>
        <a-select v-model="search.archicvePeriod" allowClear style="width: 50%">
          <a-select-option :value="item.value" v-for="(item, index) in selectData.arvhivePeriodList" :key="index">
            {{ item.text }}
          </a-select-option>
        </a-select>
      </div>
      <div class="super-middle" style="width: 25%;">
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
    </div>
    <div class="table-pie">
      <div class="echartsBox" ref="line1"></div>
      <div class="echartsBox" ref="line2"></div>
    </div>
    <!--表格-->
    <table class="stattable" v-if="archiveGridList.length > 0">
      <thead>
        <tr>
          <td>分类</td>
          <td>查看</td>
          <td>下载</td>
          <td>打印</td>
          <td>电子借阅</td>
          <td>实体借阅</td>
          <td>借阅次数</td>
        </tr>
      </thead>
      <tbody>
        <tr v-for="(item, index) in archiveGridList" :key="index">
          <td >{{ item.archiveTypeText }}</td>
          <td >{{ item.view }}</td>
          <td>{{ item.download }}</td>
          <td>{{ item.print }}</td>
          <td>{{ item.print }}</td>
          <td>{{ item.print }}</td>
          <td>{{ item.print }}</td>
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
  mounted() {
    this.handleRequireList()
  },
  methods: {
    // 下拉框数据
    hanldeSelectData(data) {
      this.selectData = data
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
      this.search.archiveYear = value;
      this.yearShowOne = false;
    },
    /**
     * 档案借阅统计
     */
     async handleRequireList() {
      this.archiveGridList = [];
      let obj = Object.assign({}, this.search, {archiveYear: this.search.archiveYear ? this.search.archiveYear.format('YYYY') : ''})
      let res = await API.ApiQueryReadData(obj);
      if (res.code == '200') {
        this.contentTable(res.data)
      }
    },
    // 柱状图
    initBar(data) {
      let myChart = this.$echarts.init(this.$refs.line1);
      let option = {
        title: {
          text: '借阅情况',
          left: 'center',
          bottom: '0'
        },
        tooltip:{
          trigger: 'axis',
          axisPointer: {
            type: 'shadow'
          }
        },
        grid: {
          bottom: '20%',
          containLabel: true
        },
        legend: {
          data: [{name: '查看'}, {name: '下载'}, {name: '打印'}],
          left: 'center',
          bottom: '40'
        },
        xAxis: {
          type: 'category',
          data: data.map(item => item.archiveTypeText),
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
            name: '查看',
            data: data.map(item => item.view),
            type: 'bar'
          },
          {
            name: '下载',
            data: data.map(item => item.download),
            type: 'bar'
          },
          {
            name: '打印',
            data: data.map(item => item.print),
            type: 'bar'
          }
        ]
      }
      myChart.setOption(option);
    },
    // 饼图
    initPie(data) {
      let seriesData = data.map(item => {
        return {
          name: item.archiveTypeText,
          value: ((item.archiveCount/item.totalCount)*100).toFixed(2)
        }
      });
      let myChart = this.$echarts.init(this.$refs.line2);
      let option = {
        title: {
          text: '借阅总次数',
          left: 'center',
          bottom: '0'
        },
        legend: {
          data: data.map(item => ({name: item.archiveTypeText})),
          left: 'center',
          bottom: '40'
        },
        tooltip: {
          show: true,
          trigger: 'item',
          formatter: function (params) {
            let circle = `<span style="display:inline-block;margin-right:5px;border-radius:50%;width:10px;height:10px;background-color:${params.color}"></span>`
            return `${circle} ${params.name}  ${params.data.value}%`
          }
        },
        series: [
          {
            data: seriesData,
            type: 'pie',
            radius: '50%',
            label: {
              normal: {
                show: true,
                textStyle: {
                  fontSize: '16'
                }
              }
            }
          }
        ]
      }
      myChart.setOption(option);
    },
    // 柱状图+表格
    contentTable(data) {
      this.initBar(data.barChart);
      this.initPie(data.pieChart);
      this.archiveGridList = data.dataGrid || []
    }
  }
}
</script>

<style lang="scss" scoped>
.table-pie{
  display: flex;
  .echartsBox{
    width: 50%;
    height: 400px;
  }
}
</style>
