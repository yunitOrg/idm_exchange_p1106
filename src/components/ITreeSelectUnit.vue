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
    <div class="itreeselectunit">
      <div class="treeselect-top" :class="{
        'treeborder': handleParamsFunc().recordId
      }">
        <div class="treeselect-left">
          <div class="treeselect-search search-combg">
            <a-input ref="userNameInput" class="search-input" v-model="searchName" placeholder="请输入" @input="handleInput">
              <a-icon type="search" slot="suffix" style="color: rgba(0,0,0,.45);font-size: 20px;" />
            </a-input>
          </div>
          <div class="select-tip">
            <span class="selecttip-icon"></span>
            <span>选择机构</span>
          </div>
          <div class="unit-box" :style="setHeight()">
            <a-spin class="select-loading" :spinning="loading"></a-spin>
            <!--常用组-->
            <div class="comgroup-box" v-show="!showSearchDialog">
              <div v-for="(item, index) in comGroup" :key="index">
                <div class="group-name">
                  <a-icon class="jiaicon mr5"  :type="item.shrink ? 'minus' : 'plus'" @click="item.shrink = !item.shrink" />
                  <span>{{ item.name }}</span>
                  <span class="namecol" @click="chooseGroup(item)">(全选下级)</span>
                </div>
                <div class="group-children" v-show="item.shrink" v-for="(subitem, subindex) in item.children" :key="subindex">
                  <a-checkbox v-model="subitem.check" @click="(e) => handleAddGroup(e, subitem)">
                    <span>{{ subitem.name }}</span>
                  </a-checkbox>
                </div>
              </div>
            </div>
            <!--单位-->
            <div class="unit-list" v-show="!showSearchDialog">
              <div v-for="(item, index) in unitTree" :key="index">
                <div class="unit-name">
                  <a-icon class="jiaicon mr5" :type="item.shrink ? 'minus' : 'plus'" @click="item.shrink = !item.shrink" />
                  <span>{{ item.name }}</span>
                  <span class="namecol" @click=hadnleAllChoose(item)>(全选下级)</span>
                </div>
                <treeSelectUnit
                  :item="item"
                  v-show="item.shrink"
                  ref="treeSelect"></treeSelectUnit>
              </div>
            </div>
            <div v-show="showSearchDialog">
              <div class="searchul" v-if="pinyinAryAll.length> 0">
                <div v-for="(item, index) in pinyinAryAll" :key="index" :class="item.check?'activehui':''" @click="hadnleSearchChoose(item)">{{ item.name }}</div>
              </div>
              <div v-else>
                <span>无数据</span>
              </div>
            </div>
          </div>
        </div>
        <div class="treeselect-right">
          <div class="treeselect-allnum search-combg">
            <span>已选择数量：<span>{{ chooseUnit.length }}</span></span>
            <span style="color:#0086d9;cursor: pointer;" @click="handleClear">清空</span>
          </div>
          <div class="treeselect-choose">
            <span class="w20">已选机构</span>
            <span class="w20">
              <span v-if="tablelist.enableCopy==1">份数</span>
            </span>
            <span class="w20">
              <span v-if="tablelist.enablePage==1">编号</span>
            </span>
            <span class="w20">
              <span v-if="tablelist.enableDown==1">下载次数</span>
            </span>
          </div>
          <div class="chooseAly" :style="setHeight()">
            <div class="choose-line" v-for="(item, index) in chooseUnit" :key="index">
              <span class="w20">{{ item.name }}</span>
              <div class="w20 choosecopy" >
                <a-input-number :min="1" v-if="tablelist.enableCopy==1" v-model="item.copycop" @change="(val) => inputChange(val, item)"></a-input-number>
                <a-input-number :min="1" v-if="tablelist.enableCopy!=1 && tablelist.enablePage==1" v-model="item.copycop" @change="(val) => inputChange(val, item)"></a-input-number>
              </div>
              <div class="w20 choosepage">
                <template v-if="tablelist.enablePage==1">
                  <a-input-number :min="0" disabled v-model="item.page1"></a-input-number>
                  <span>-</span>
                  <a-input-number :min="1" disabled v-model="item.page2"></a-input-number>
                </template>
              </div>
              <div class="w20 choosedown" >
                <a-input-number :min="1" v-if="tablelist.enableDown==1" v-model="item.down"></a-input-number>
              </div>
              <data value="w20">
                <i class="icon-op icon-up-arrow" @click="handleMoveUp(index)" :class="index>0 && 'op'"></i>
                <i class="icon-op icon-down-arrow" @click="handleMoveMown(index)" :class="index < chooseUnit.length-1 && 'op'"></i>
                <i class="icon-close" @click="handleDelete(item, index)"></i>
              </data>
            </div>
          </div>
        </div>
      </div>
      <!--附件-->
      <div class="select-filecontainer" v-if="!handleParamsFunc().recordId &&fileLib.length" data="附件">
        <div class="boxx" v-for="(item, index) in fileLib" :key="index">
          <div class="boxx-checkbox"><a-checkbox v-model="item.checkboxItem">{{ item.attValueText }}</a-checkbox></div>
          <div class="text">
            <template v-if="getFileIcon(item.fileName) == 'common'">
              <svg-icon iconClass="common" class="treesvg"></svg-icon>
            </template>
            <template v-else>
              <img :src="handleGetImg(item)" alt="">
            </template>
            <span>{{ item.fileName }}</span>
          </div>
        </div>
      </div>
      <!--文件-->
      <div class="select-filecontainer mt10" v-if="!handleParamsFunc().recordId && chooseFile.length" data="文件">
        <div class="boxx" v-for="(item, index) in chooseFile" :key="index">
          <div class="boxx-checkbox"><a-checkbox v-model="item.checkboxItem">{{ item.attValueText }}</a-checkbox></div>
          <div class="text">
            <template v-if="getFileIcon(item.fileName) == 'common'">
              <svg-icon iconClass="common" class="treesvg"></svg-icon>
            </template>
            <template v-else>
              <img :src="handleGetImg(item)" alt="">
            </template>
            <span>{{ item.fileName }}</span>
          </div>
        </div>
      </div>
      <!--顶部按钮-->
      <div class="treeselect-foot" :style="`bottom:${propData.footBottom}`">
        <a-button type="primary" @click="handleSure">确定</a-button>
        <a-button @click="hanldeNone">取消</a-button>
      </div>
    </div>
  </div>
</template>

<script>
import  treeSelectUnit from '../commonComponents/treeSelectUnit.vue';
import API from '../api/index';
import { message } from 'ant-design-vue';
message.config({
  top: '50%'
})
export default {
  name: 'ITreeSelectUnit',
  components: {
    treeSelectUnit
  },
  data() {
    return {
      defaultPrintNum: 1,
      loading: false,
      // 总数据
      tablelist: {},
      showSearchDialog: false,
      // 搜索内容
      searchName: '',
      // 文件数据
      chooseFile: [],
      // 附件数据
      fileLib: [],
      // 常用组
      comGroup: [],
      // 单位
      unitTree: [],
      // 选择的单位
      chooseUnit: [],
      // 总拼音数据
      pinyinAryAll: [],
      moduleObject: {},
      propData: this.$root.propData.compositeAttr || {
        height: '100vh',
        footBottom: '0px',
        unitHeight: '436px',
        unitNoFileHeight: "500px"
      }
    }
  },
  provide () {
    return {
      fatherRef: this
    }
  },
  mounted() {
    this.moduleObject = this.$root.moduleObject;
    this.init()
  },
  methods: {
    setHeight() {
      let flag = this.handleParamsFunc().recordId;
      return  {
        "height": flag ? this.propData.unitNoFileHeight : this.propData.unitHeight
      }
    },
    handleGetImg(item) {
      let key = this.getFileIcon(item.fileName);
      return `${IDM.url.getURLRoot()}p1135/190313143112jfLuUxrc19Dchhv4BPU/images/${key}.svg`;
    },
    // 获取id 对应数据
    handleTreeGetChooseId(tree, chooseId) {
      for(let i=0; i<tree.length; i++) {
        let item = tree[i];
        if (item.id == chooseId) {
          return item
        } else {
          if (item.children) {
            let node = this.handleTreeGetChooseId(item.children, chooseId);
            if (node) {
              return node
            }
          }
        }
      }
    },
    // 查询拼音数据
    searchGroupUnit(key) {
      const searchGroup = (tree, key) => {
        if (tree && tree.length>0) {
          tree.forEach(item => {
            // if (item.children?.length == 0) {
              if (item.name.includes(key) || item.name.includes(key) && item.children?.length <= 0) {
                !this.pinyinAryAll.map(k => k.id).includes(item.id) && this.pinyinAryAll.push(item)
              }
            // }
            item.children?.length > 0 && searchGroup(item.children, key)
          })
        }
      };
      const searchUnit =(tree, key) => {
        if (tree && tree.length>0) {
          tree.forEach(item => {
            if ((item.name.includes(key) || item.name.includes(key)) && item.children?.length <= 0) {
              !this.pinyinAryAll.map(k => k.id).includes(item.id) && this.pinyinAryAll.push(item)
            }
            item.children?.length > 0 && searchUnit(item.children, key)
          })
        }
      }
      searchUnit(this.unitTree, key);
      searchGroup(this.comGroup, key);
    },
    // 搜索框
    handleInput() {
      if (this.searchName) {
        this.showSearchDialog = true;
        this.pinyinAryAll = [];
        this.searchGroupUnit(this.searchName);
      } else {
        this.showSearchDialog = false;
      }
    },
    // 获取常用组所有的id
    getGroupAllId(tree, allId=[]) {
      if (tree && tree.length>0) {
        tree.forEach(item => {
          item.children.length == 0 && allId.push(item.id)
          return item.children?.length > 0 && this.getGroupAllId(item.children, allId)
        })
      }
      return allId
    },
    // 检查 父级查看选中个数
    handleFatherChoose(tree) {
      if (tree && tree.length>0) {
        tree.forEach(item => {
          item.chooseNum = item.children.filter(k => k.check).length;
          if (item.children.length > 0) {
            item.check = (item.children.filter(k => k.check).length == item.children.length);
          }
          item.children?.length > 0 && this.handleFatherChoose(item.children)
        })
      }
    },
    handleTreeAddTreeData(tree, params={chooseId: '', targetflag: false, check: false}) {
      let { chooseId, targetflag, check } = params
      if (tree && tree.length>0) {
        tree.forEach(item => {
          if (chooseId) {
            if (chooseId == item.id) {
              item.check = targetflag
              return
            }
          } else{
            if (!item.attrs.noselect) {
              item.check = check
            }
            item.chooseNum = 0;
          }
          item.children?.length > 0 && this.handleTreeAddTreeData(item.children, params)
        })
      }
    },
    // 检查常用组全选
    checkGroupAllChoose() {
      let group = this.comGroup[0].children || [];
      this.comGroup[0].check = group.length && (group.filter(item => item.check).length == group.length);
    },
    // 常用组全选下级
    chooseGroup(item) {
      item.check = !item.check;
      this.handleTreeAddTreeData(this.comGroup, {check: item.check});
      let chooseIdAry = this.getGroupAllId(this.comGroup)
      // 选中单位复选框
      this.handleTreeChoose(this.unitTree, chooseIdAry, item.check);
      // 检查单位全选和选中条数
      this.handleFatherChoose(this.unitTree)
      

      this.defaultChooseUnit()
    },
    // 更新已选的数字
    updateChooseNum(ary) {
      if (ary?.length <= 0) return
      ary[0].page1 = 1;
      ary[0].page2 = ary[0].copycop;
      let defaultCopy = ary[0].copycop, defaultPage1 = ary[0].page1, defaultPage2 = ary[0].page2;
      ary.forEach((k, i) => {
        if (i > 0) {
          k.page1 = parseInt(defaultCopy) + parseInt(defaultPage1);
          k.page2 = parseInt(k.copycop) + parseInt(defaultPage2);
          defaultCopy = k.copycop;
          defaultPage1 = k.page1;
          defaultPage2 = k.page2;
        }
      })
    },
    // 输入框监听
    inputChange(value, item) {
      item.page2 = value
      this.updateChooseNum(this.chooseUnit);
    },
    // 上移
    handleMoveUp(index) {
      if (index == 0) return
      let newlist = this.chooseUnit;
      newlist.splice(index-1, 0, newlist[index]);
      newlist.splice(index+1, 1);
      this.chooseUnit = newlist;
      this.updateChooseNum(this.chooseUnit);
    },
    // 下移
    handleMoveMown(index) {
      if (index == this.chooseUnit.length - 1) {
        return
      }
      let newlist= this.chooseUnit;
      newlist.splice(index+2, 0, newlist[index]);
      newlist.splice(index, 1)
      this.chooseUnit = newlist
      this.updateChooseNum(this.chooseUnit);
    },
    // 删除
    handleDelete(item, index) {
      item.check = false;
      this.chooseUnit.splice(index, 1);
      this.updateChooseNum(this.chooseUnit);

      this.handleChoose(item)
    },
    hadnleTreeCheck(tree, flag) {
      if (tree && tree.length>0) {
        tree.forEach(item => {
          item.check = flag;
          item.children?.length > 0 && this.hadnleTreeCheck(item.children, flag);
        })
      }
    },
    // 全选所有下级
    hadnleAllChoose(item) {
      item.check = !item.check;
      if (item.children?.length > 0) {
        this.hadnleTreeCheck([item], item.check)
        item.chooseNum = item.check ? item.children.length : 0
        // 选中常用组
        this.handleTreeAddTreeData(this.comGroup, {check: item.check});
        this.defaultChooseUnit()
      }
    },
    // 全选下级
    hadnleNextAllChoose(item) {
      item.check = !item.check;
      if (item.children?.length > 0) {
        this.hadnleTreeCheck([item], item.check)
        
        // 查找item的所有元素
        let chooseIdAry = this.getGroupAllId([item]);
        this.handleTreeChoose(this.comGroup, chooseIdAry, item.check);
        this.handleCheckGroupChoose(this.comGroup)
          // 检查常用组全选
          this.checkGroupAllChoose();

          this.defaultChooseUnit()
        // 选中常用组
        // this.handleTreeAddTreeData(this.comGroup, {check: item.check});
        // this.defaultChooseUnit()
      }
    },
    isImage(ext) {
        return ['png', 'jpg', 'jpeg', 'bmp', 'gif', 'webp', 'psd', 'svg', 'tiff'].indexOf(ext.toLowerCase()) !== -1;
    },
    getFileIcon(fileName) {
      let format = '';
      if (fileName){
        format = fileName.split('.')[1];
        if (format){
            switch (format) {
                case "doc":
                case "docx":
                case "wps":
                    format = "word";
                    break;
                case "xls":
                case "xlsx":
                    format = "xlsx";
                    break;
                case "htm":
                case "html":
                    format = "html";
                    break;
                case "ppt":
                case "pptx":
                    format = "ppt";
                    break;
                default:
                    format = "common";
                    break;
            }
        }
        if (this.isImage(format)){
            format = "img";
        }
      }
      return format;
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
      window.IDM.setStyleToPageHead(this.moduleObject.id + " .itreeselectunit", styleObject);
    },
    // 选中常用组复选框
    handleAddGroup(e, subitem) {
      if (subitem.children?.length > 0) {
        subitem.check = e.target.checked;
        subitem.children.forEach(k => k.check = e.target.checked)
        let chooseIdAry = subitem.children.map(subitem => subitem.id);
        this.checkGroupAllChoose()
        // 选中单位复选框
        this.handleTreeChoose(this.unitTree, chooseIdAry, e.target.checked);
        this.defaultChooseUnit()
      }
    },
    // 搜索内容点击
    hadnleSearchChoose(item) {
      let flag = !item.check
      item.check = flag;
      if (item.children && item.children.length > 0) {
        item.children.forEach(item => item.check = flag);
        let chooseIdAry = item.children.map(item => item.id)
        // 选中单位复选框
        this.handleTreeChoose(this.unitTree, chooseIdAry, flag);

        // 检查常用组选中
        this.handleTreeAddTreeData(this.comGroup, {chooseId: item.id, targetflag: flag })
        this.handleCheckGroupChoose(this.comGroup)
        // 检查常用组全选
        this.checkGroupAllChoose();

        this.defaultChooseUnit()
      } else {
        this.handleChoose(item)
      }
    },
    // 选择单位
    handleChoose(item) {
      let flag = item.check
      let fatherobj = this.handleTreeGetChooseId(this.unitTree, item.pid);
      let chooseTrueCheck = fatherobj.children.filter(item => item.check)
      fatherobj.check = fatherobj.children.length == chooseTrueCheck.length

      // 检查常用组选中
      this.handleTreeAddTreeData(this.comGroup, {chooseId: item.id, targetflag: flag })
      this.handleCheckGroupChoose(this.comGroup)
      // 检查常用组全选
      this.checkGroupAllChoose();

      this.defaultChooseUnit()
    },
    // org 选中数据
    handleTreeChoose(tree, chooseIdAry, chooseType) {
      if (tree && tree.length>0) {
        tree.forEach(item => {
          if (chooseIdAry.includes(item.id)) {
            if(!item.attrs.noselect) {
              item.check = chooseType
            }
          }
          item.children?.length > 0 && this.handleTreeChoose(item.children, chooseIdAry, chooseType)
        })
      }
    },
    getMockData() {

    },
    // 接口参数
    handleParamsFunc() {
      if (this.propData.handleParamsFunc && this.propData.handleParamsFunc.length > 0) {
        let name = this.propData.handleParamsFunc[0].name
        return window[name] && window[name].call(this, {
          _this: this,
        }) || {};
      } else {
        return IDM.url.queryObject()
      }
    },
    // 附件数据
    handleFileListData(data) {
      if (data && data.length > 0) {
        let { selectAttvalue } = this.handleParamsFunc();
        // selectAtt = '0,1,3;0,1,2,4,3';
        if (selectAttvalue) {
          let split = selectAttvalue.split(';');
          let chooseCheckbox = split[0].split(',')
          data.forEach(item => {
            item.checkboxItem = chooseCheckbox.includes(`${item.attValue}`);
          })
        }
        this.fileLib = data;
      }
    },
    // 文件数据
    handleDataFile(data) {
      if (data && data.length > 0) {
        let { selectFileRelationValue } = this.handleParamsFunc();
        if (selectFileRelationValue) {
          // selectFileRelationValue = "0,1;0,1,2";
          let split = selectFileRelationValue.split(';');
          let chooseCheckbox = split[0].split(',');
          data.forEach(item => {
            item.checkboxItem = chooseCheckbox.includes(`${item.relaType}`);
          })
        }
        this.chooseFile = data
      }
    },
    hanldeAddField(tree, flag) {
      if (tree && tree.length>0) {
        tree.forEach(item => {
          this.$set(item, 'shrink', flag)
          this.$set(item, 'check', false)
          item.chooseNum = 0;
          item.children?.length > 0 && this.hanldeAddField(item.children, false)
        })
      }
    },
    // 获取常用组和单位数据
    async handleGetGroupData() {
      const params = this.handleParamsFunc();
      this.loading = true;
      let unitRes = await API.ApiGetTreeListGroup(params)
      if (unitRes.code == '200') {
        this.loading = false;
        let obj = unitRes.data || {};
        this.defaultPrintNum = obj.defaultPrintNum;
        this.tablelist = obj;
        let { codeList } = obj;
        let group = codeList.filter(item => item.id == 'zsdwRootGroup');
        this.hanldeAddField(group, false)
        group.forEach(item => item.shrink = true);
        this.comGroup = group;
        let unit = codeList.filter(item => item.id !== 'zsdwRootGroup');
        this.hanldeAddField(unit, true)
        this.unitTree = unit;
        this.handleDataBack()
      } else {
        this.loading = false;
      }
    },
    // 检查常用组选中
    handleCheckGroupChoose(tree) {
      if (tree && tree.length>0) {
        tree.forEach(item => {
          if (item.children.length != 0) {
            item.check = (item.children.filter(k => k.check).length == item.children.length);
          }
          item.children?.length > 0 && this.handleCheckGroupChoose(item.children)
        })
      }
    },
    hanldeReply(data) {
      if (data && data.ids) {
        let chooseIdAry = data.ids.split(',')
        // 如果包括常用组则拼接常用组的所有单位 然后回显单位 常用组
        this.handleBackGroup(chooseIdAry, (chooseIdAry) => {
          
          // 选中单位复选框
          this.handleTreeChoose(this.unitTree, chooseIdAry, true);

          // 检查常用组选中
          this.handleTreeChoose(this.comGroup, chooseIdAry, true)
          this.handleCheckGroupChoose(this.comGroup)
          // 检查常用组全选
          this.checkGroupAllChoose();

          this.defaultChooseUnit()
        });
      }
    },
    // 回显常用组
    handleBackGroup(chooseIdAry, fn) {
      let group = this.comGroup[0]?.children
      group && group.length && group.forEach(item => {
        if (chooseIdAry.includes(item.id)) {
          item.check = true;
          item.children.forEach(k => k.check = true);
          let groupchooseIdAry = item.children.map(item => item.id);
          chooseIdAry = chooseIdAry.concat(groupchooseIdAry);
        }
      })
      fn && fn(chooseIdAry);
    },
    // 回显数据
    handleDataBack() {
      if (this.moduleObject.env !== 'production') {
        // let params = {
        //   ids: ",2408021437127YZlFRQxke5Qoi3pYWX,230729190259ierAg1NWmdClVxayyGG,2304241611407jknbFQF0TF9WWP2e98,2307291902598W4QioooBGNlWFOQzTL",
        //   text: ",市政府办公厅,市经济信息化委,市科委"
        // }
        // this.hanldeReply(params)
        return
      }
      let params = this.handleParamsFunc();
      this.hanldeReply(params.initData)
    },
    getDefaultCopycop() {
      let val = 1;
      try{
        if(top.DSF.isXForm()) {
          val = top.DSF.getElementValueByKey("B0014")
        }
      }catch(e) {
        val = this.defaultPrintNum;
        console.log(e)
      }
      return val
    },
    // copycop：份数 page1-page2：编号
    defaultChooseUnit() {
      this.chooseUnit = this.getTreeCheckData(this.unitTree);
      let num = this.getDefaultCopycop();
      this.chooseUnit.forEach(item => {
        if (this.tablelist.enableCopy==1) {
          (!item.copycop || item.copycop == "") && this.$set(item, 'copycop', num);
        }
        if (this.tablelist.enablePage==1) {
          (!item.copycop || item.copycop == "") && this.$set(item, 'copycop', num);
          (!item.page1 || item.page1 == "") && (item.page1 = 1);
          (!item.page2 || item.page2 == "") && (item.page2 = 1);
        }
        this.tablelist.enableDown==1 && (item.down = '');
      })
      this.updateChooseNum(this.chooseUnit);
    },
    // 获取选中树节点数据
    getTreeCheckData(tree, select=[]) {
      if (tree && tree.length>0) {
        tree.forEach(item => {
          (item.children.length==0 && item.check) && select.push(item)
          if (item.children?.length > 0) {
            return this.getTreeCheckData(item.children, select)
          }
        })
        return select
      }
    },
    // 清空
    handleClear() {
      this.handleTreeAddTreeData(this.comGroup, {check: false});

      this.handleTreeAddTreeData(this.chooseUnit, {check: false})
      this.defaultChooseUnit()
    },
    // 取消
    hanldeNone() {
      try{
        parent.layer.close(top.openViewIndex)
      } catch(e) {
        console.log('取消弹框调用失败', e)
      }
    },
    // 确定
    handleSure() {
      if (this.chooseUnit.length <= 0) {
        message.error('请选择需要发送的单位！')
        return
      }
      this.chooseUnit.forEach(item => {
        this.tablelist.enableCopy==1 && (item.copy = item.copycop);
        this.tablelist.enablePage==1 && (item.page = `${item.page1}-${item.page2}`);
        delete item.children
      })
      let params = {
        // 单位
        chooseUnit: this.chooseUnit,
        // 文件
        chooseFile: this.fileLib.filter(item => item.checkboxItem),
        // 附件
        chooseRelationFile: this.chooseFile.filter(item => item.checkboxItem)
      }
      console.log('最终数据', params);
      if (this.propData.handleSureBtnFunc && this.propData.handleSureBtnFunc.length > 0) {
        let name = this.propData.handleSureBtnFunc[0].name
        window[name] && window[name].call(this, {
          _this: this,
          params: params
        });
      }
    },
    async initData() {
      this.handleGetGroupData()
      const params = this.handleParamsFunc()
      // 附件
      let res = await API.ApiUnitExchangeList(params)
      if (res.code == '200') {
        let data = res.data;
        this.handleFileListData(data)
      }
      // 文件
      let fileres = await API.ApiUnitFileList(params)
      if (fileres.code == '200') {
        let data = fileres.data;
        this.handleDataFile(data)
      }
    },
    init() {
      this.handleStyle()
      this.initData()
    }
  }
}
</script>

<style lang="scss" scoped>
$bgColor: #efeff2;
.itreeselectunit{
  position: relative;
  /*
  * 滚动条设置
  */
  .select-filecontainer::-webkit-scrollbar {
    width: 6px;
    height: 6px;
  }
  .select-filecontainer::-webkit-scrollbar-thumb {
    background-color: rgba(0, 0, 0, 0.1);
  }
  .select-filecontainer::-webkit-scrollbar-track-piece {
    border-radius: 6px;
    background-color: rgba(0, 0, 0, 0.1);
  }
  .searchul{
    div{
      line-height: 28px;
      cursor: pointer;
    }
  }
  .activehui{
    color: #ccc;
  }
  .treesvg{
    font-size: 16px;
    margin-right: 4px;
  }
  .select-loading{
    position: absolute;
    left: 50%;
    top: 50%;
  }
  .w20{
    display: inline-block;
    width: 20%;
    margin-right: 10px;
  }
  .mt10{
    margin-top: 10px;
  }
  .namecol{
    margin-left: 5px;
    color: #0a74dd !important;
    vertical-align: middle;
    font-size: 14px !important;
    cursor: pointer;
    display: none !important;
  }
  .icon-close{
    display: inline-block;
    width: 16px;
    height: 16px;
    background-image: url('../assets/icon-choice-blue.png');
    background-position: -103px -63px;
    margin-left: 5px;
    vertical-align: middle;
    cursor: pointer;
  }
  .icon-up-arrow{
    background-position: -253px -41px;
  }
  .icon-up-arrow.op{
    background-position: -330px -41px !important;
  }
  .icon-down-arrow{
    background-position: -368px -42px !important;
  }
  .icon-down-arrow.op{
    background-position: -291px -42px !important;
  }
  .icon-op{
    cursor: pointer;
    width: 20px;
    height: 18px;
    vertical-align: middle;
    display: inline-block;
    background-image: url('../assets/icon-form.png');
    background-repeat: no-repeat;
    margin-right: 5px;
  }
  .treeselect-search{
    .search-input{
      width: 200px;
    }
    ::v-deep .ant-input{
      border-radius: 50px !important;
    }
  }
  .mr5{
    margin-right: 5px;
  }
  .search-combg{
    padding: 0 12px 0 17px;
    height: 45px;
    color: #333;
    line-height: 45px;
    border-bottom: 1px solid #d0d0d0;
    background-color: $bgColor;
  }
  .treeselect-top{
    width: 100%;
    display: flex;
  }
  .treeborder{
    border-bottom: 1px solid #e6e6e6;
  }
  .treeselect-left{
    width: 50%;
    border-right: 1px solid #d0d0d0;
    .select-tip{
      padding: 0 12px 0 17px;
      height: 32px;
      line-height: 32px;
      background-color: $bgColor;
      .selecttip-icon{
        margin-right: 5px;
        vertical-align:middle;
        display: inline-block;
        width: 18px;
        height: 18px;
        background-image: url('../assets/icon-choice-blue.png');
        background-repeat: no-repeat;
        background-position: -6px -6px;
      }
    }
  }
  .treeselect-right{
    width: 50%;
    .treeselect-allnum{
      display: flex;
      justify-content: space-between;
    }
    .treeselect-choose{
      background-color: $bgColor;
      height: 32px;
      line-height: 32px;
      padding: 0 12px 0 17px;
      color: #333;
    }
    .chooseAly{
      height: 436px;
      overflow-y: auto;
      padding: 0 12px 0 17px;
      color: #333;
      .choose-line{
        display: flex;
        align-items: center;
        padding: 5px 0;
      }
      .choosepage{
        display: flex;
        align-items: center;
      }
    }
  }
  .select-filecontainer{
    max-height: 126px;
    overflow-y: auto;
    border: 1px solid #e6e6e6;
    padding: 0px 16px 0px 16px;
    .boxx-checkbox{
      width: 10%;
      margin-right: 10px;
      cursor: pointer;
      ::v-deep .ant-checkbox-inner{
        width: 18px;
        height: 18px;
      }
    }
    img{
      width: 16px;
      height: 16px;
      margin-right: 4px;
    }
    .boxx{
      color: #333333;
      display: flex;
      margin: 16px 0px 16px 0px;
    }
  }
  .unit-box{
    position: relative;
    padding: 10px 20px;
    height: 436px;
    overflow-y: auto;
    font-size: 16px;
    color: #333;
    .jiaicon{
      font-size: 14px;
      cursor: pointer;
    }
    .comgroup-box{
      &:hover{
        .namecol{
          display: block !important;
        }
      }
      .group-name{
        user-select: none;
        display: flex;
        align-items: center;
        span{
          font-size: 16px;
        }
      }
      .group-children{
        height: 32px;
        line-height: 32px;
        padding-left: 40px;
        ::v-deep .ant-checkbox-inner{
          width: 18px;
          height: 18px;
        }
      }
      span{
        font-size: 14px;
        color: #333;
        max-width: 250px;
        white-space: nowrap;
        display: inline-block;
        vertical-align: middle;
        overflow: hidden;
        text-overflow: ellipsis;
      }
    }
  }
  .unit-list{
    &:hover{
      .namecol{
        display: block !important;
      }
    }
    .unit-name{
      display: flex;
      align-items: center;
    }
  }
  .treeselect-foot{
    width: 100%;
    line-height: 55px;
    background-color: $bgColor;
    // position: absolute;
    bottom: 0;
    text-align: right;
    padding: 0 30px;
    position: absolute;
    button{
      width: 78px;
      height: 32px;
      font-size: 16px;
    }
    button+button{
      margin-left: 20px;
    }
  }
}
</style>