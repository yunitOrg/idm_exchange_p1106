<template>
  <!--
    根目录规范(必须不能为空)：
    idm-ctrl：控件类型 drag_container：容器，drag_container_inlieblock：行内容器，idm_module：非容器的组件
    id：使用moduleObject.id，如果id不使用这个将会被idm-ctrl-id属性替换
    idm-ctrl-id：组件的id，这个必须不能为空
  -->
  <div
    idm-ctrl="idm_module"
    :id="moduleObject.id"
    :idm-ctrl-id="moduleObject.id"
  >
    <div class="imodulehead" 
      :style="propData.heightType == 'adaptive' ? { height: moduleHeight + 'px' } : {}">
      <!--头部-->
      <div class="head-wrap" v-if="propData.showTitle">
        <div class="tab-ul" :style="{width: propData.tabwidth, height: propData.tabheight}" >
          <span
            :style="{marginLeft: propData.tabRightLeftDis, marginRight: propData.tabRightLeftDis}"
            v-for="(tab, tabindex) in tabList"
            :key="tabindex"
            :class="{
              activetab: tab.showTab
            }"
            @click="handleClick(tab)"
          >{{ tab[propData.tabLable] || tab.label }}</span>
        </div>
      </div>
      <!--内容-->
      <div class="haed-content" >
        <template v-if="propData.resContent == 'static'">
          <div class="head-line">
            <div class="flex">
              <span style="color: #333;">时间：</span>
              <template v-if="timeCompare">
                <span class="head-day" v-for="(k, i) in ['7日', '14日', '30日']" :key="i" @click="handleSetTime(i)">{{ k }}</span>
                <a-config-provider :locale="locale">
                  <a-range-picker @change="onChange" v-model="timeall" format="YYYY-MM-DD" class="head-contenttime" />
                </a-config-provider>
              </template>
              <template v-else>
                <a-config-provider :locale="locale">
                  <a-month-picker @change="onChangeMonth" v-model="startTimeMonth" format="YYYY-MM" class="head-month" />
                </a-config-provider>
                <span style="margin: 0 10px;">对比</span>
                <a-config-provider :locale="locale">
                  <a-month-picker @change="onChangeMonth" v-model="endTimeMonth" format="YYYY-MM" class="head-month" />
                </a-config-provider>
              </template>
            </div>
            <div><a-button type="primary" style="background-color: #025FB2;" @click="timeCompare = !timeCompare">按时间对比</a-button></div>
          </div>
          <div class="head-tu">
            <span class="shu"></span>
            <span>趋势图</span>
          </div>
          <div class="echartsLine" :style="{height: propData.contentEchartsHeight}" ref="line1"></div>
        </template>
        <template v-if="propData.resContent == 'drag'">
          <div
            class="drag_container dragContent"
            idm-ctrl-inner
            :idm-ctrl-id="moduleObject.id"
            idm-container-index="headcontent"
          ></div>
        </template>
      </div>
      <!--悬浮容器-->
      <div class="head-drag" v-show="propData.showDragContainer"
        :style="{ left: propData.dragContainerLeft, top: propData.dragContainerTop, right: propData.dragContainerRight, bottom: propData.dragContainerBottom }">
        <div class="drag_container" idm-ctrl-inner :idm-ctrl-id="moduleObject.id" idm-container-index="headdrag"></div>
      </div>
    </div>
  </div>
</template>

<script>
import locale from 'ant-design-vue/es/locale/zh_CN';
import ImoduleHead from '../mixins/ImoduleHead';
import moment from "moment";
export default {
  name: 'IRecordRule',
  mixins: [ImoduleHead],
  data() {
    return {
      locale,
      timeall: [],
      startTimeMonth: '',
      endTimeMonth: '',
      timeCompare: true,
      moduleHeight: 0,
      tabList: [],
      moduleObject: {},
    }
  },
  computed: {
    chooseTab() {
      return  this.tabList.filter(item => item.showTab)[0]
    }
  },
  mounted() {
    this.moduleObject = this.$root.moduleObject;
    this.init();
  },
  methods: {
    onChangeMonth(date) {
      if (this.startTimeMonth && this.endTimeMonth) {
        this.requireDataContent();
      }
    },
    handleSetTime(i) {
      switch(i) {
        case 0:
            this.timeall = [moment().add(-6, 'days'), moment()]
          break
        case 1:
          this.timeall = [moment().add(-13, 'days'), moment()]
          break
        case 2:
          this.timeall = [moment().add(-29, 'days'), moment()]
          break
      }
      this.requireDataContent();
    },
    // 日期
    onChange(date) {
      if (date && date.length > 0) {
        this.requireDataContent()
      }
    },
    // 点击tab
    handleClick(item) {
      this.tabList.forEach(item => this.$set(item, 'showTab', false));
      item.showTab = true;
      this.requireDataContent()
    },
    propDataWatchHandle(propData) {
      this.propData = propData.compositeAttr || {};
      this.init()
    },
    resizeContentWrapperHeight(wrapperHeight, wrapperWidth) {
      wrapperHeight = wrapperHeight || $('#' + this.moduleObject.packageid)
      .parents('.fsl-region-element')
      .height();
      wrapperWidth = wrapperWidth || $('#' + this.moduleObject.packageid)
      .parents('.fsl-region-element')
      .width();
      let moduleTBMarginNumber = 0;
      const iAttrArray = ['marginTopVal', 'marginBottomVal'];
      iAttrArray.forEach(item => {
        if (this.propData.ulbox && this.propData.ulbox[item]) {
          if (this.propData.box[item].indexOf('%') > -1) {
            //用宽度计算出实际的px
            moduleTBMarginNumber =
              moduleTBMarginNumber +
              (parseFloat(this.propData.ulbox[item].replace('%', '')) / 100) * wrapperWidth;
          } else {
            moduleTBMarginNumber =
              moduleTBMarginNumber + parseFloat(this.propData.ulbox[item].replace('px', ''));
          }
        }
      });
      this.moduleHeight = wrapperHeight - moduleTBMarginNumber;
    },
    /**
     * 组件通信：接收消息的方法
     */
    receiveBroadcastMessage(messageObject) {
      switch(messageObject.type) {
        case 'regionResize':
          if (messageObject.message && messageObject.message.gridEleTarget) {
            let gridEleTarget = messageObject.message.gridEleTarget
            if (gridEleTarget && gridEleTarget.offsetHeight && this.propData.HeightType == 'adaptive') {
            this.resizeContentWrapperHeight(gridEleTarget.offsetHeight, gridEleTarget.offsetWidth);
            }
          }
          break
      }
    },
    /**
     * @Desc 设置样式
     */
     handleStyle() {
      let styleObject = {},
        tabStyleObject = {},
        dragObject = {},
        splitObject = {},
        showlineObject = {},
        contentObject = {},
        chooseObject = {};
      for (const key in this.propData) {
        if (this.propData.hasOwnProperty.call(this.propData, key)) {
          const element = this.propData[key]
          if (!element && element !== false && element != 0) {
            continue
          }
          switch (key) {
            case 'width':
              styleObject['width'] = element;
              break
            case 'height':
              styleObject['height'] = element;
              break
            case 'ulbox':
              IDM.style.setBoxStyle(styleObject, element)
              break
            case 'bgColor':
              styleObject['background-color'] = element && element.hex8;
              break
            case 'boxShadow':
              styleObject['box-shadow'] = element;
              break
            case 'boxborder':
              IDM.style.setBorderStyle(styleObject, element);
              break
            case 'titleFont':
              IDM.style.setFontStyle(tabStyleObject, element);
              break
            case 'tabBox':
              IDM.style.setBoxStyle(tabStyleObject, element);
              break
            case 'tabBorder':
              IDM.style.setBorderStyle(tabStyleObject, element);
              break
            case 'chooseTitleFont':
              IDM.style.setFontStyle(chooseObject, element);
              break
            case 'showLine':
              !element && (showlineObject['content'] = 'unset');
              break
            case 'lineColor':
              showlineObject['background-color'] = element && element.hex8;
              break
            case 'lineSize':
              showlineObject['height'] = element + 'px';
              break
            case 'splitColor':
              splitObject['background-color'] = element && element.hex8;
              break
            case 'splitWidth':
              splitObject['width'] = element;
              break
            case 'splitHeight':
              splitObject['height'] = element;
              break
            case 'splitRight':
              splitObject['right'] = element;
              break
            case 'contentBox':
              IDM.style.setBoxStyle(contentObject, element);
              break
            case 'contentWidth':
              contentObject['width'] = element;
              break
            case 'contentHeight':
              contentObject['height'] = element;
              break
            case 'dragWidth':
              dragObject['width'] = element;
              break
            case 'dragHeight':
              dragObject['height'] = element;
              break
          }
        }
      }
      window.IDM.setStyleToPageHead(this.moduleObject.id + " .imodulehead", styleObject);
      window.IDM.setStyleToPageHead(this.moduleObject.id + " .imodulehead .tab-ul", tabStyleObject);
      window.IDM.setStyleToPageHead(this.moduleObject.id + " .imodulehead .tab-ul .activetab", chooseObject);
      window.IDM.setStyleToPageHead(this.moduleObject.id + " .imodulehead .tab-ul .activetab:before", showlineObject);
      window.IDM.setStyleToPageHead(this.moduleObject.id + " .imodulehead .tab-ul span:after", splitObject);
      window.IDM.setStyleToPageHead(this.moduleObject.id + " .imodulehead .haed-content", contentObject);
      window.IDM.setStyleToPageHead(this.moduleObject.id + " .imodulehead .haed-content .dragContent", dragObject);
    },
    // tab数据处理
    handleTab(ary) {
      if (ary && ary.length > 0) {
        let num = ary.filter(item => item.showTab).length;
        !num && (this.$set(ary[0], 'showTab', true));
        this.tabList = ary;
      }
      if (this.propData.resContent == 'static') {
        this.handleSetTime(0)
      }
    },
    // 接口参数
    handleRequireparams() {
      if (this.propData.handleDataSource && this.propData.handleDataSource.length > 0) {
        let name = this.propData.handleDataSource[0].name;
        let startTime = '', endTime = '';
        if(this.timeCompare) {
          startTime = moment(this.timeall[0]).format('YYYY-MM-DD');
          endTime = moment(this.timeall[1]).format('YYYY-MM-DD');
        } else {
          startTime = this.startTimeMonth && moment(this.startTimeMonth).format('YYYY-MM');
          endTime = this.endTimeMonth && moment(this.endTimeMonth).format('YYYY-MM');
        }
        return window[name] && window[name].call(this, {
          _this: this,
          itemChooseTab: this.chooseTab,
          type: this.timeCompare,
          timeObj: [startTime, endTime],
          urlparams: this.handleParamsFunc(),
        });
      }
    },
    getMockData() {
      let option = {
        legend: {
          data: ['调用次数'],
          itemWidth: 10,
          itemHeight: 10,
          bottom: '20px',
          icon: 'circle',
          itemStyle: {
            color: '#6DD400',
          },
          textStyle: {
            color: '#333',
            fontSize: '14'
          }
        },
        grid: {
          left: '3%',
          right: '6%',
          bottom: 80
        },
        xAxis: {
          type: 'category',
          data: [
            {
            value: 'Mon',
            textStyle: {
                padding: [5,0]
              }
            },
            {
            value: 'Tue',
            textStyle: {
                padding: [5,0]
              }
            },
            {
            value: 'Wed',
            textStyle: {
                padding: [5,0]
              }
            },
          ],
          axisTick: {
            length: 1,
            alignWithLabel: true,
            lineStyle: {
              type: 'dotted',
              color: '#6DD400',
              width: 10,
              cap: 'round'
            }
          }
        },
        yAxis: {
          type: 'value'
        },
        series: [
          {
            name: '调用次数',
            data: [150, 230, 224, 218, 135, 147, 260],
            type: 'line',
            symbol: 'none',
            lineStyle: {
              color: '#0091FF'
            }
          }
        ]
      };
      let myChart = this.$echarts.init(this.$refs.line1);
      myChart.setOption(option);
    },
    // 设置折线图
    handleSetLine(data) {
      let option = {};
      if (this.propData.handleEcharts && this.propData.handleEcharts.length > 0) {
        let name = this.propData.handleEcharts[0].name
        let params = this.handleRequireparams();
        option = window[name] && window[name].call(this, {
          _this: this,
          params: params,
          data: data,
          type: this.timeCompare
        });
      } else {
        // option = {
        //   legend: {
        //     data: ['调用次数'],
        //     itemWidth: 10,
        //     itemHeight: 10,
        //     bottom: '20px',
        //     icon: 'circle',
        //     itemStyle: {
        //       color: '#6DD400',
        //     },
        //     textStyle: {
        //       color: '#333',
        //       fontSize: '14'
        //     }
        //   },
        //   grid: {
        //     left: '3%',
        //     right: '6%',
        //     bottom: 80
        //   },
        //   xAxis: {
        //     type: 'category',
        //     data: [
        //       {
        //       value: 'Mon',
        //       textStyle: {
        //           padding: [5,0]
        //         }
        //       },
        //       {
        //       value: 'Tue',
        //       textStyle: {
        //           padding: [5,0]
        //         }
        //       },
        //       {
        //       value: 'Wed',
        //       textStyle: {
        //           padding: [5,0]
        //         }
        //       },
        //     ],
        //     axisTick: {
        //       length: 1,
        //       alignWithLabel: true,
        //       lineStyle: {
        //         type: 'dotted',
        //         color: '#6DD400',
        //         width: 10,
        //         cap: 'round'
        //       }
        //     }
        //   },
        //   yAxis: {
        //     type: 'value'
        //   },
        //   series: [
        //     {
        //       name: '调用次数',
        //       data: [150, 230, 224, 218, 135, 147, 260],
        //       type: 'line',
        //       symbol: 'none',
        //       lineStyle: {
        //         color: '#0091FF'
        //       }
        //     }
        //   ]
        // };
      }
      let myChart = this.$echarts.init(this.$refs.line1);
      myChart.setOption(option);
    },
    sendBroadcastMessage(object) {
      window.IDM.broadcast && window.IDM.broadcast.send(object);
    },
    // 内容调用接口
    requireDataContent() {
      if (this.moduleObject.env !== 'production') {
        this.getMockData()
        return
      }
      let params = this.handleRequireparams();
      // 发送消息
      this.sendBroadcastMessage({
        type: "linkageDemand",
        message: {
          ...params
        }
      });
      
      if (this.propData.reqMethod == 'fixed') {
        window.IDM.http.get(this.chooseTab[this.propData.tabReqUrl], params, {
            headers: {
            'Content-Type': 'application/json'
            },
        }).then(res => {
          let data = res.data || {};
          if (data.code === '200') {
            this.handleSetLine(data.data)
          }
        })
      } else if (this.propData.reqMethod == 'dataSource') {
        this.propData.contentDataSource && IDM.datasource.request(this.propData.contentDataSource[0]?.id, {
          moduleObject: this.moduleObject,
          ...params,
          }, (data) => {
            this.handleSetLine(data)
        })
      }
    },
    // URL接口参数
    handleParamsFunc() {
      if (this.propData.handleParamsFunc && this.propData.handleParamsFunc.length > 0) {
        let name = this.propData.handleParamsFunc[0].name
        return window[name] && window[name].call(this, {
          _this: this,
        });
      } else {
        return IDM.url.queryObject()
      }
    },
    async initData() {
      if (this.propData.tabData == 'static') {
        this.handleTab(this.propData.tabList)
      } else if (this.propData.tabData == 'dataSource') {
        let params = this.handleParamsFunc();
        IDM.datasource.request(this.propData.tabDataSource[0]?.id, {
          moduleObject: this.moduleObject,
          ...params,
          }, (data) => {
            this.handleTab(data);
        })
      }
    },
    init() {
      this.handleStyle();
      this.initData();
    }
  }
}
</script>

<style lang="scss" scoped>
.imodulehead{
  position: relative;
  .flex{
    display: flex;
    align-items: center;
  }
  .tab-ul{
    display: flex;
    align-items: center;
    span{
      position: relative;
      height: 100%;
      cursor: pointer;
      user-select: none;
    }
    span:nth-child(1){
      margin-left: 0 !important;
    }
    span::after{
      content: "";
      position: absolute;
      right: 0;
      top: 50%;
      transform: translateY(-50%);
    }
    span:last-child{
      &::after{
        display: none;
      }
    }
    .activetab{
      &::before{
        content: "";
        width: calc(100%);
        position: absolute;
        bottom: 0;
      }
    }
  }
  .head-contenttime{
    width: 200px;
    height: 32px;
  }
  
  .head-line{
    display: flex;
    justify-content: space-between;
    .head-day{
      cursor: pointer;
      display: inline-block;
      border: 1px solid #d9d9d9;
      width: 68px;
      line-height: 32px;
      height: 32px;
      text-align: center;
    }
    .head-day:nth-child(3){
      border-left: 0;
      border-right: 0;
    }
    .head-day:nth-child(4){
      border-right: 0;
    }
    ::v-deep .ant-calendar-picker-input{
      border-radius: 0;
    }
    .head-month{
      width: 100px;
    }
  }
  .head-tu{
    display: flex;
    align-items: center;
    margin-top: 20px;
    .shu{
      display: inline-block;
      width: 6px;
      height: 18px;
      background-color: #025FB2;
      margin-right: 10px;
    }
    span{
      color: #333;
      font-size: 16px;
    }
  }
  .echartsLine{
    width: inherit;
    overflow: hidden;
  }
  .head-drag{
    position: absolute;
  }
}
</style>
