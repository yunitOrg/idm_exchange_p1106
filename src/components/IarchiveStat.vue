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
    <div class="archiveStat">
      <!-- <div class="tab mb10">
        <div class="tab-li" v-for="(item, index) in tablist" :key="index"
          :class="{'activity': item.value == current}"
          @click="handleTab(item)">{{ item.lable }}</div>
      </div> -->
      <template v-if="current == 1">
        <ArchiveComponent
          ref="archiveComponent"
        ></ArchiveComponent>
      </template>
      <template v-if="current == 2">
        <ReadComponent ref="readComponent"></ReadComponent>
      </template>
      <template v-if="current == 3">
        <UseComponent ref="useComponent"></UseComponent>
      </template>
    </div>
  </div>
</template>

<script>
import API from '../api/archive';
import ArchiveComponent from '../commonComponents/archiveComponent';
import ReadComponent from '../commonComponents/readComponent';
import UseComponent from '../commonComponents/useComponent';
export default {
  name: 'ISelectUnit',
  components: {
    ArchiveComponent,
    ReadComponent,
    UseComponent
  },
  data() {
    return {
      current: 0,
      tablist: [
        {
          value: 1,
          lable: '档案数量统计'
        },
        {
          value: 2,
          lable: '档案借阅统计'
        },
        {
          value: 3,
          lable: '档案利用统计'
        }
      ],
      selectData: {},
      moduleObject: {},
      propData: this.$root.propData.compositeAttr || {
        defaultPageIndex: 1,
        ulbox: {
          marginTopVal: "",
          marginRightVal: "",
          marginBottomVal: "",
          marginLeftVal: "",
          paddingTopVal: "20px",
          paddingRightVal: "20px",
          paddingBottomVal: "20px",
          paddingLeftVal: "20px"
        }
      }
    }
  },
  mounted() {
    this.moduleObject = this.$root.moduleObject;
    // this.requireMount();
    this.init();
  },
  methods: {
    propDataWatchHandle(propData) {
      this.propData = propData.compositeAttr || {};
      this.init()
    },
    // 接口参数
    handleParamsFunc() {
      return IDM.url.queryObject()
    },
    // tab选项
    handleTab(item) {
      // if (item.value == this.current) return
      this.current = item.value;
      this.$nextTick(() => {
        if(this.current == 1) {
          this.requireMount(() => {
            this.$refs.archiveComponent.hanldeSelectData(this.selectData)
          });
        } else if (this.current == 2) {
          this.requireMount(() => {
            this.$refs.readComponent.hanldeSelectData(this.selectData)
          });
        } else if (this.current == 3) {
          this.requireMount(() => {
            this.$refs.useComponent.hanldeSelectData(this.selectData)
          });
        }
      })
    },
    /**
     * @Desc 设置样式
     */
     handleStyle() {
      let styleObject = {};
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
          }
        }
      }
      window.IDM.setStyleToPageHead(this.moduleObject.id + " .archiveStat", styleObject);
    },
    /**
     * @Desc 设置主题
     */
     convertThemeListAttrToStyleObject() {
      var themeList = this.propData.themeList;
      if (!themeList) {
          return
      }
      const themeNamePrefix =
          IDM.setting && IDM.setting.applications && IDM.setting.applications.themeNamePrefix
              ? IDM.setting.applications.themeNamePrefix
              : 'idm-theme-'
      for (var i = 0; i < themeList.length; i++) {
        var item = themeList[i]
        let bulletBgColorObj = {
            'color': item.mainColor ? IDM.hex8ToRgbaString(item.mainColor.hex8) : '',
            'fill': item.mainColor ? IDM.hex8ToRgbaString(item.mainColor.hex8) : ''
        }
        IDM.setStyleToPageHead(`.${themeNamePrefix}${item.key} #${(this.moduleObject.id || "module_demo")} .archiveStat .head svg`, bulletBgColorObj)
      }
    },
    // 获取下拉数据
    async requireMount(fn) {
      let res = await API.ApiQuerySource();
      if (res.code == '200') {
        this.selectData = res.data;
        fn && fn()
      }
    },
    handleTabUrl() {
      let urlparams = this.propData.defaultPageIndex;
      this.handleTab({value: parseInt(urlparams)})
    },
    init() {
      this.handleTabUrl();
      this.handleStyle();
      this.convertThemeListAttrToStyleObject()
    }
  }
}
</script>

<style lang="scss">
.archiveStat{
  .h40{
    height: 40px;
  }
  .mb10{
    margin-bottom: 10px;
  }
  .mb20{
    margin-bottom: 20px;
  }
  .super-btn{
    width: 80px;
    font-size: 16px;
  }
  .super-middle{
    display: flex;
    align-items:center;
    justify-content: center;
    text-align: center
  }
  .head{
    font-size: 16px;
    border: 1px solid #ccc;
    box-sizing: border-box;
    padding: 0 10px 0 6px;
    line-height: 45px;
    span{
      margin-left: 13px;
    }
  }
  .tab{
    display: flex;
    .tab-li{
      padding: 6px 10px;
      font-size: 16px;
      color: #333;
      border: 1px solid #ccc;
      cursor: pointer;
    }
    .tab-li:nth-child(2n){
      border-left-color: transparent;
      border-right-color: transparent;
    }
    .activity{
      color: #0086d9;
    }
  }
  .table-head{
    display: flex;
    justify-content:space-between;
    button+button{
      margin-left: 20px;
    }
  }
  .table-search{
    display: flex;
    background-color: #f5f5f5;
    margin-bottom: 10px;
    padding: 5px 0;
    .super-mr10{
      color: #333;
      margin-right: 20px;
      font-size: 16px;
      font-weight: 500;
    }
  }
  .stattable{
    width: 100%;
    height: 100%;
    table-layout: fixed;
    thead{
      background-color: #f9fcfe;
    }
    td {
      height: 50px;
      text-align: center;
      width: 54px;
      border: 1px solid #ddd;
      font-size: #333;
      font-size: 16px;
    }
  }
}
</style>

