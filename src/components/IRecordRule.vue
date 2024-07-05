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
    <div class="recordrule-wrap">
      <div class="recordrule">
        <div class="record-left">
          <div class="record-title pd10">档好规则</div>
          <div class="pd10">
            <div class="record-input">
              <a-textarea v-model="recordField" :rows="6" @blur="handleBlur"></a-textarea>
            </div>
            <div class="mt20">
              <span>预览：xxxx</span>
              <div class="record-ul mb10">
                <span v-for="(item, index) in chartList" :key="index" @click="handleClick(item)">{{ item.label }}</span>
              </div>
            </div>
          </div>
        </div>
        <div class="record-right">
          <div class="record-head pd10">
            <span>变量</span>
            <div>
              <a-button>删除变量</a-button>
              <a-button class="ml10">新增自定义变量</a-button>
            </div>
          </div>
          <div class="record-tree pdall">
            <div class="record-tree-ul" v-for="(item, index) in recordList" :key="index">
              <div class="record-tree-li" @click="handleShow(item)">
                <span class="recordsvg">
                  <svg-icon iconClass="arrow"></svg-icon>
                </span>
                {{ item.text }}
              </div>
              <div class="record-tree-box" v-show="item.isShow">
                <div v-for="(subitem, subindex) in item.children" :key="subindex" @click="handleChoose(subitem)">{{ subitem.text }}</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import API from '../api/record';
export default {
  name: 'IRecordRule',
  data() {
    return {
      recordField: '',
      // 光标位置
      cursorPos: '',
      chartList: [
        {label: '*', value: 1},{label: '.', value: 2},{label: '【', value: 3},{label: '】', value: 4},{label: '{', value: 5},{label: '}', value: 6},
        {label: '〔', value: 7},{label: '〕', value: 8},
        {label: '&', value: 9},{label: '@', value: 10},{label: '「', value: 11},{label: '」', value: 12}],
      recordList: [],
      moduleObject: {},
      propData: this.$root.propData.compositeAttr || {
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
    this.init();
  },
  methods: {
    handleBlur(e) {
      this.cursorPos = e.srcElement.selectionStart;
    },
    // 选中字符
    handleClick(item) {
      if (this.recordField == undefined) {
        this.recordField = item.label;
      } else {
        let start = this.recordField.substring(0, this.cursorPos || 0),
          end = this.recordField.substring(this.cursorPos || 0);
        this.recordField = `${start}${item.label}${end}`;
      }
      this.cursorPos++
    },
    handleShow(item) {
      item.isShow = !item.isShow;
    },
    // 选中变量
    handleChoose(item) {
      let str = `[${item.text}]`;
      if (this.recordField == undefined) {
        this.recordField = str;
      } else {
        let start = this.recordField.substring(0, this.cursorPos || 0),
          end = this.recordField.substring(this.cursorPos || 0);
        this.recordField = `${start}${str}${end}`;
      }
      this.cursorPos = this.cursorPos + str.length;
    },
    propDataWatchHandle(propData) {
      this.propData = propData.compositeAttr || {};
      this.init()
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
      window.IDM.setStyleToPageHead(this.moduleObject.id + " .recordrule-wrap", styleObject);
    },
    async initData() {
      let res = await API.ApiRecordList()
      if (res.code == '200') {
        let ary = res.data || [];
        ary.forEach((item, index) => {
          item.isShow = index == 0
        })
        this.recordList = ary;
      }
    },
    init() {
      this.handleStyle();
      this.initData()
    }
  }
}
</script>

<style lang="scss" scoped>
.recordrule-wrap{
  font-size: 16px;
  color: #333;
  .recordrule{
    display: flex;
    border: 1px solid #e8e8e8;
  }
  .pd10{
    padding: 0 10px;
  }
  .mt20{
    margin-top: 20px;
  }
  .mb10{
    margin-bottom: 10px;
  }
  .ml10{
    margin-left: 10px;
  }
  .pdall{
    padding: 10px;
  }
  .record-title{
    line-height: 45px;
    border-bottom: 1px solid #e8e8e8;
  }
  .record-head{
    line-height: 45px;
    display: flex;
    justify-content: space-between;
    align-items: center;
    border-bottom: 1px solid #e8e8e8;
  }
  .record-left{
    width: 60%;
    border-right: 1px solid #e8e8e8;
    .record-input{
      input{
        min-height: 200px;
      }
      margin-top: 10px;
    }
    .record-ul{
      span{
        display: inline-block;
        width: 70px;
        line-height: 30px;
        border: 1px solid #666;
        margin: 5px;
        text-align: center;
        border-radius: 4px;
        cursor: pointer;
        user-select: none;
      }
      span:active{
        border: 1px solid #ccc;
      }
    }
  }
  .record-right{
    width: 40%;
    .record-tree{
      max-height: 500px;
      overflow-y: auto;
    }
    .record-tree-li{
      cursor: pointer;
      user-select: none;
    }
    .record-tree-box{
      padding-left: 40px;
      div{
        cursor: pointer;
      }
      div:active{
        color: #ccc;
      }
    }
  }
  /*
  * 滚动条设置
  */
  .record-tree::-webkit-scrollbar {
    width: 6px;
    height: 6px;
  }
  .record-tree::-webkit-scrollbar-thumb {
    background-color: rgba(0, 0, 0, 0.1);
  }
  .record-tree::-webkit-scrollbar-track-piece {
    border-radius: 6px;
    background-color: rgba(0, 0, 0, 0.1);
  }
}
</style>
