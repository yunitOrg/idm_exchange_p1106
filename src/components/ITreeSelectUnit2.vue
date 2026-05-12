<template>
  <!--
    根目录规范(必须不能为空)：
    idm-ctrl：控件类型 drag_container：容器，drag_container_inlieblock：行内容器，idm_module：非容器的组件
    id：使用moduleObject.id，如果id不使用这个将会被idm-ctrl-id属性替换
    idm-ctrl-id：组件的id，这个必须不能为空
  -->
  <div idm-ctrl="idm_module" :id="moduleObject.id" :idm-ctrl-id="moduleObject.id">
    <div class="itreeselectunit2">
      <div class="treeselect-top" ref="treeselectTop" :class="{
        'treeborder': handleParamsFunc().recordId
      }">
        <div class="treeselect-left">
          <div class="treeselect-search search-combg">
            <a-input ref="userNameInput" class="search-input" v-model="searchName" placeholder="请输入"
              @input="handleInput">
              <a-icon type="search" slot="suffix" style="color: rgba(0,0,0,.45);font-size: 20px;" />
            </a-input>
          </div>
          <div class="select-tip">
            <span class="selecttip-icon"></span>
            <span>选择机构</span>
          </div>

          <!-- 新增 Tab 页签区域，加入 ref="unitTabs" 以便动态计算高度 -->
          <div class="unit-tabs" ref="unitTabs" v-show="!showSearchDialog && tabList.length > 0">
            <div v-for="tab in tabList" :key="tab.id" class="unit-tab-item" :class="{ 'active': activeTabKey === tab.id }"
              @click="activeTabKey = tab.id">
              {{ tab.name }}
            </div>
          </div>

          <!-- 左侧单位树容器，使用专属的 leftSetHeight (已减去 Tab 高度) -->
          <div class="unit-box" :style="leftSetHeight">
            <a-spin class="select-loading" :spinning="loading"></a-spin>

            <!-- 根据 Tab 切换展示树 -->
            <div class="unit-list" v-show="!showSearchDialog">
              <div v-for="(item, index) in tabList" :key="index" v-show="activeTabKey === item.id">
                <!-- 这里展示当前 Tab 对应的顶级节点 -->
                <div class="unit-name">
                  <a-icon class="jiaicon mr5" :type="item.shrink ? 'minus' : 'plus'" @click="handleAddKeys(item)" />
                  <a-checkbox v-if="!item.attrs.noselect" v-model="item.check" @change="(e) => handleFirstGen(item)">
                    <span>{{ item.name }}</span>
                  </a-checkbox>
                  <span v-else>{{ item.name }}</span>
                  <span class="namecol" @click="hadnleAllChoose(item)">(全选下级)</span>
                </div>
                <!-- 递归展示子级 -->
                <treeSelectUnit2 :item="item" v-show="item.shrink" ref="treeSelect"></treeSelectUnit2>
              </div>
            </div>

            <!-- 搜索结果 -->
            <div v-show="showSearchDialog">
              <div class="searchul" v-if="pinyinAryAll.length > 0">
                <div v-for="(item, index) in pinyinAryAll" :key="index" :class="{
                  activehui: item.check,
                  disabledselect: item.attrs.noselect
                }" @click="hadnleSearchChoose(item)">{{ item.name }}</div>
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
            <div class="flex" v-if="tablelist.enableCopy == 1 || (tablelist.enableCopy != 1 && tablelist.enablePage == 1)">
              <a-input-search v-model="numValue" placeholder="请输入" @search="onSearch">
                <template #enterButton>
                  <a-button type="primary" class="themeBtn">批量修改份数</a-button>
                </template>
              </a-input-search>
            </div>
            <span style="color:#0086d9;cursor: pointer;" @click="handleClear">清空</span>
          </div>
          <div class="treeselect-choose">
            <span class="w40">已选机构</span>
            <span class="w10">
              <span v-if="tablelist.enableCopy == 1">份数</span>
            </span>
            <span class="w20">
              <span v-if="tablelist.enablePage == 1">份号</span>
            </span>
            <span class="w10">
              <span v-if="tablelist.enableDown == 1">下载次数</span>
            </span>
          </div>
          <!-- 右侧已选容器，继续使用 setHeight -->
          <div class="chooseAly" :style="setHeight">
            <div class="choose-line" v-for="(item, index) in chooseUnit" :key="index">
              <span class="w40">{{ item.name }}</span>
              <div class="w10 choosecopy">
                <a-input-number style="width: 60px" :min="1" v-if="tablelist.enableCopy == 1" v-model="item.copycop"
                  @change="(val) => inputChange(val, item)"></a-input-number>
                <a-input-number style="width: 60px" :min="1" v-if="tablelist.enableCopy != 1 && tablelist.enablePage == 1"
                  v-model="item.copycop" @change="(val) => inputChange(val, item)"></a-input-number>
              </div>
              <div class="w20 choosepage">
                <template v-if="tablelist.enablePage == 1">
                  <a-input-number :min="1" v-model="item.page1"></a-input-number>
                  <span>-</span>
                  <a-input-number :min="1" v-model="item.page2"></a-input-number>
                </template>
              </div>
              <div class="w10 choosedown">
                <a-input-number style="width:50px;" :min="1" v-if="tablelist.enableDown == 1"
                  v-model="item.down"></a-input-number>
              </div>
              <div class="w20">
                <i class="icon-op icon-up-arrow" @click="handleMoveUp(index)" :class="index > 0 && 'op'"></i>
                <i class="icon-op icon-down-arrow" @click="handleMoveMown(index)"
                  :class="index < chooseUnit.length - 1 && 'op'"></i>
                <i class="icon-close" @click="handleDelete(item, index)"></i>
              </div>
            </div>
          </div>
        </div>
      </div>
      <!--附件-->
      <div class="select-filecontainer" ref="selectLibItem" v-if="!handleParamsFunc().recordId && fileLib.length"
        data="附件">
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
      <div class="select-filecontainer mt10" ref="selectFileItem"
        v-if="!handleParamsFunc().recordId && chooseFile.length" data="文件">
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
        <a-button type="primary" class="themeBtn" @click="handleSure">确定</a-button>
        <a-button @click="hanldeNone">取消</a-button>
      </div>
    </div>
  </div>
</template>

<script>
import treeSelectUnit2 from '../commonComponents/treeSelectUnit2.vue';
import API from '../api/index2';
import { message } from 'ant-design-vue';
message.config({
  top: '50%'
})
export default {
  name: 'ITreeSelectUnit2',
  components: {
    treeSelectUnit2
  },
  data() {
    return {
      numValue: '',
      setHeight: {}, // 用于右侧的高度
      leftSetHeight: {}, // 新增：专属左侧带Tab的高度计算
      defaultPrintNum: 1,
      loading: false,
      // 总数据
      tablelist: {},
      // 默认展开
      defaultTreeKeys: [],
      showSearchDialog: false,
      // 搜索内容
      searchName: '',
      // 文件数据
      chooseFile: [],
      // 附件数据
      fileLib: [],
      // Tab 列表（原来的 unitTree 分拆）
      tabList: [],
      activeTabKey: '',
      // 选择的单位
      chooseUnit: [],
      // 总拼音数据
      pinyinAryAll: [],
      moduleObject: {},
      propData: this.$root.propData.compositeAttr || {
        height: '100vh',
        footBottom: '0px',
        unitHeight: '436px',
      }
    }
  },
  watch: {
    // 监听 Tab 切换，切换时确保当前 Tab 及其第一层级展开
    activeTabKey(newVal) {
      if (newVal) {
        let currentTab = this.tabList.find(t => t.id === newVal);
        if (currentTab) {
          // 确保当前 tab 是展开状态
          this.$set(currentTab, 'shrink', true);
          if (!this.defaultTreeKeys.includes(currentTab.id)) {
            this.defaultTreeKeys.push(currentTab.id);
          }
          // 确保第一层子节点也是展开状态
          if (currentTab.children && currentTab.children.length > 0) {
            currentTab.children.forEach(child => {
              this.$set(child, 'shrink', true);
              if (!this.defaultTreeKeys.includes(child.id)) {
                this.defaultTreeKeys.push(child.id);
              }
            });
          }
        }
      }
    }
  },
  provide() {
    return {
      fatherRef: this
    }
  },
  mounted() {
    this.moduleObject = this.$root.moduleObject;
    this.init()
    this.setHeight = { "height": document.body.offsetHeight + 'px' };
    this.leftSetHeight = { "height": document.body.offsetHeight + 'px' };

    window.getTreeSelectData = () => {
      return {
        chooseUnit: this.chooseUnit,
        chooseFile: this.fileLib.filter(item => item.checkboxItem),
        chooseRelationFile: this.chooseFile.filter(item => item.checkboxItem)
      }
    }
  },
  methods: {
    onSearch() {
      if (this.chooseUnit && this.chooseUnit.length > 0) {
        this.chooseUnit.forEach(item => item.copycop = this.numValue)
        this.updateChooseNum(this.chooseUnit);
      }
    },
    handleAddKeys(item) {
      item.shrink = !item.shrink;
      if (item.shrink) {
        !this.defaultTreeKeys.includes(item.id) && this.defaultTreeKeys.push(item.id);
      } else {
        this.defaultTreeKeys.includes(item.id) && (this.defaultTreeKeys = this.defaultTreeKeys.filter(k => k != item.id));
      }
    },
    handleSetHeight() {
      let flag = this.handleParamsFunc().recordId;
      let bodyHeight = document.body.offsetHeight,
        contentHeight = bodyHeight - 132;
      let height = this.propData.unitHeight;

      if ((flag || this.chooseFile.length <= 0) && (flag || this.fileLib.length <= 0)) {
        height = contentHeight
      }
      else if ((flag || this.chooseFile.length <= 0) && (!flag && this.fileLib.length)) {
        height = contentHeight - (this.$refs.selectLibItem?.offsetHeight || 0);
      }
      else if ((flag || this.fileLib.length <= 0) && (!flag && this.chooseFile.length)) {
        height = contentHeight - (this.$refs.selectFileItem?.offsetHeight || 0);
      }
      else if ((!flag || this.fileLib.length) && (!flag && this.chooseFile.length)) {
        height = contentHeight - (this.$refs.selectLibItem?.offsetHeight || 0) - (this.$refs.selectFileItem?.offsetHeight || 0);
      }

      // 赋值右侧的高度保持原本逻辑不变
      this.setHeight = { "height": height + 'px' }

      // 动态获取新加的 tab 区域的高度
      let tabHeight = 0;
      if (this.$refs.unitTabs && !this.showSearchDialog && this.tabList.length > 0) {
        tabHeight = this.$refs.unitTabs.offsetHeight || 0;
      }

      // 左侧高度需额外减去 tab 的高度
      this.leftSetHeight = { "height": (height - tabHeight) + 'px' }
    },
    handleGetImg(item) {
      let key = this.getFileIcon(item.fileName);
      return `${IDM.url.getURLRoot()}p1135/190313143112jfLuUxrc19Dchhv4BPU/images/${key}.svg`;
    },
    searchGroupUnit(key) {
      const searchUnit = (tree, key) => {
        if (tree && tree.length > 0) {
          tree.forEach(item => {
            if ((item.name.includes(key)) && item.children?.length <= 0) {
              !this.pinyinAryAll.map(k => k.id).includes(item.id) && this.pinyinAryAll.push(item)
            }
            item.children?.length > 0 && searchUnit(item.children, key)
          })
        }
      }
      searchUnit(this.tabList, key);
    },
    handleInput() {
      if (this.searchName) {
        this.showSearchDialog = true;
        this.pinyinAryAll = [];
        this.searchGroupUnit(this.searchName);
      } else {
        this.showSearchDialog = false;
      }
      // 添加重新计算高度，以适应 tab 隐藏/展示带来的高度变化
      this.$nextTick(() => {
        this.handleSetHeight();
      });
    },
    handleTreeAddTreeData(tree, params = { chooseId: '', targetflag: false, check: false }) {
      let { chooseId, targetflag, check } = params
      let dataList = Array.isArray(tree) ? tree : [tree];
      if (dataList && dataList.length > 0) {
        dataList.forEach(item => {
          if (chooseId) {
            if (chooseId == item.id && !item.attrs.noselect) {
              item.check = targetflag
              return
            }
          } else {
            if (!item.attrs.noselect) {
              item.check = check
            }
          }
          item.children?.length > 0 && this.handleTreeAddTreeData(item.children, params)
        })
      }
    },
    updateChooseNum(ary) {
      if (ary?.length <= 0) return
      let params = this.handleParamsFunc();
      ary[0].page1 = params.fh ? (parseInt(params.fh) + 1) : 1;
      ary[0].page2 = params.fh ? (parseInt(params.fh) + parseInt(ary[0].copycop)) : ary[0].copycop;
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
    inputChange(value, item) {
      if (!value) {
        item.copycop = 1;
        value = 1
      }
      item.page2 = value
      this.updateChooseNum(this.chooseUnit);
    },
    handleMoveUp(index) {
      if (index == 0) return
      let newlist = [...this.chooseUnit];
      newlist.splice(index - 1, 0, newlist[index]);
      newlist.splice(index + 1, 1);
      this.chooseUnit = newlist;
      this.updateChooseNum(this.chooseUnit);
    },
    handleMoveMown(index) {
      if (index == this.chooseUnit.length - 1) return
      let newlist = [...this.chooseUnit];
      newlist.splice(index + 2, 0, newlist[index]);
      newlist.splice(index, 1)
      this.chooseUnit = newlist
      this.updateChooseNum(this.chooseUnit);
    },
    handleDelete(item, index) {
      item.check = false;
      this.chooseUnit.splice(index, 1);
      this.updateChooseNum(this.chooseUnit);
      this.handleChoose(item)
    },
    hadnleTreeCheck(tree, flag) {
      let dataList = Array.isArray(tree) ? tree : [tree];
      if (dataList && dataList.length > 0) {
        dataList.forEach(item => {
          if (!(item.attrs.noselect && item.children?.length == 0)) {
            item.check = flag;
          }
          item.children?.length > 0 && this.hadnleTreeCheck(item.children, flag);
        })
      }
    },
    hadnleAllChoose(item) {
      item.check = !item.check;
      this.hadnleTreeCheck(item, item.check);
      this.defaultChooseUnit();
    },
    hadnleNextAllChoose(item) {
      item.check = !item.check;
      this.hadnleTreeCheck(item, item.check);
      this.defaultChooseUnit();
    },
    getFileIcon(fileName) {
      let format = '';
      if (fileName) {
        format = fileName.split('.').pop().toLowerCase();
        switch (format) {
          case "doc": case "docx": case "wps": format = "word"; break;
          case "xls": case "xlsx": format = "xlsx"; break;
          case "htm": case "html": format = "html"; break;
          case "ppt": case "pptx": format = "ppt"; break;
          case "png": case "jpg": case "jpeg": case "gif": format = "img"; break;
          default: format = "common"; break;
        }
      }
      return format;
    },
    propDataWatchHandle(propData) {
      this.propData = propData.compositeAttr || {};
      this.init()
    },
    handleStyle() {
      let styleObject = {};
      for (const key in this.propData) {
        if (this.propData.hasOwnProperty.call(this.propData, key)) {
          const element = this.propData[key]
          if (!element && element !== false && element != 0) continue
          switch (key) {
            case 'width': styleObject['width'] = element; break
            case 'height': styleObject['height'] = element; break
            case 'ulbox': IDM.style.setBoxStyle(styleObject, element); break
            case 'bgColor': styleObject['background-color'] = element && element.hex8; break
            case 'boxShadow': styleObject['box-shadow'] = element; break
            case 'boxborder': IDM.style.setBorderStyle(styleObject, element); break
          }
        }
      }
      window.IDM.setStyleToPageHead(this.moduleObject.id + " .itreeselectunit2", styleObject);
    },
    hadnleSearchChoose(item) {
      if (item.attrs.noselect) return
      item.check = !item.check;
      if (item.children && item.children.length > 0) {
        this.hadnleTreeCheck(item, item.check);
      }
      this.defaultChooseUnit();
    },
    handleFirstGen(item) {
      this.hadnleTreeCheck(item, item.check);
      this.defaultChooseUnit()
    },
    handleChoose(item) {
      this.handleTreeAddTreeData(this.tabList, { chooseId: item.id, targetflag: item.check });
      this.defaultChooseUnit()
    },
    handleTreeChoose(tree, chooseIdAry, chooseType) {
      if (tree && tree.length > 0) {
        tree.forEach(item => {
          if (chooseIdAry.includes(item.id)) {
            if (!item.attrs.noselect) item.check = chooseType
          }
          item.children?.length > 0 && this.handleTreeChoose(item.children, chooseIdAry, chooseType)
        })
      }
    },
    handleParamsFunc() {
      if (this.propData.handleParamsFunc && this.propData.handleParamsFunc.length > 0) {
        let name = this.propData.handleParamsFunc[0].name
        return window[name] && window[name].call(this, { _this: this }) || {};
      } else {
        return IDM.url.queryObject()
      }
    },
    handleFileListData(data) {
      if (data && data.length > 0) {
        let { selectAttvalue } = this.handleParamsFunc();
        if (selectAttvalue) {
          let chooseCheckbox = selectAttvalue.split(';')[0].split(',')
          data.forEach(item => {
            item.checkboxItem = chooseCheckbox.includes(`${item.attValue}`);
          })
        }
        this.fileLib = data;
      }
    },
    handleDataFile(data) {
      if (data && data.length > 0) {
        let { selectFileRelationValue } = this.handleParamsFunc();
        if (selectFileRelationValue) {
          let chooseCheckbox = selectFileRelationValue.split(';')[0].split(',');
          data.forEach(item => {
            item.checkboxItem = chooseCheckbox.includes(`${item.relaType}`);
          })
        }
        this.chooseFile = data
      }
    },
    hanldeAddField(tree, defaultAry) {
      if (tree && tree.length > 0) {
        tree.forEach(item => {
          this.$set(item, 'shrink', defaultAry.includes(item.id))
          this.$set(item, 'check', false)
          item.children?.length > 0 && this.hanldeAddField(item.children, defaultAry)
        })
      }
    },
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

        // 过滤顶级节点作为 Tab，排除 zsdwRootGroup
        let tabs = codeList.filter(item => item.pid === "0" && item.id !== 'zsdwRootGroup');

        // 初始化时将所有 Tab 及其第一级子节点推入 defaultTreeKeys 默认展开
        tabs.forEach(tab => {
          if (!this.defaultTreeKeys.includes(tab.id)) {
            this.defaultTreeKeys.push(tab.id);
          }
          if (tab.children && tab.children.length > 0) {
            tab.children.forEach(child => {
              if (!this.defaultTreeKeys.includes(child.id)) {
                this.defaultTreeKeys.push(child.id);
              }
            })
          }
        })

        this.hanldeAddField(tabs, this.defaultTreeKeys);

        this.tabList = tabs;
        if (this.tabList.length > 0) {
          this.activeTabKey = this.tabList[0].id;
        }
        this.handleDataBack();

        // 确保数据渲染后计算高度
        this.$nextTick(() => {
          this.handleSetHeight();
        });
      } else {
        this.loading = false;
      }
    },
    hanldeReply(data) {
      if (data && data.ids) {
        let chooseIdAry = data.ids.split(',')
        this.handleTreeChoose(this.tabList, chooseIdAry, true);
        this.defaultChooseUnit()
      }
    },
    handleDataBack() {
      if (this.chooseUnit?.length > 0) {
        let chooseIdAry = this.chooseUnit.map(item => item.id);
        this.handleTreeChoose(this.tabList, chooseIdAry, true);
        this.defaultChooseUnit()
      }
      if (this.moduleObject.env !== 'production') return;
      let params = this.handleParamsFunc();
      this.hanldeReply(params.initData)
    },
    getDefaultCopycop() {
      let val = 1;
      if (this.propData.isGetDefaultPrintNum == true) {
        val = this.defaultPrintNum;
      } else {
        try {
          if (top.DSF.isXForm()) {
            val = top.DSF.getElementValueByKey("B0014") || this.defaultPrintNum;
          }
        } catch (e) {
          val = this.defaultPrintNum;
        }
      }
      return val
    },
    defaultChooseUnit() {
      this.chooseUnit = this.getTreeCheckData(this.tabList);
      let num = this.getDefaultCopycop();
      this.chooseUnit.forEach(item => {
        if (this.tablelist.enableCopy == 1 || this.tablelist.enablePage == 1) {
          if (!item.copycop) this.$set(item, 'copycop', this.numValue || num);
        }
        if (this.tablelist.enablePage == 1) {
          if (!item.page1) this.$set(item, 'page1', 1);
          if (!item.page2) this.$set(item, 'page2', 1);
        }
        if (this.tablelist.enableDown == 1) {
          if (!item.down) this.$set(item, 'down', 1);
        }
      })
      this.updateChooseNum(this.chooseUnit);
    },
    getTreeCheckData(tree, select = []) {
      if (tree && tree.length > 0) {
        tree.forEach(item => {
          if (!item.attrs.noselect && item.check) {
            !select.map(k => k.id).includes(item.id) && select.push(item)
          }
          if (item.children?.length > 0) this.getTreeCheckData(item.children, select)
        })
        return select
      }
    },
    handleClear() {
      this.numValue = "";
      this.hadnleTreeCheck(this.tabList, false);
      this.defaultChooseUnit()
    },
    hanldeNone() {
      try { parent.layer.close(top.openViewIndex) } catch (e) { }
    },
    handleSure() {
      if (this.chooseUnit.length <= 0) {
        message.error('请选择需要发送的单位！')
        return
      }
      const submitUnit = JSON.parse(JSON.stringify(this.chooseUnit));
      submitUnit.forEach(item => {
        if (this.tablelist.enableCopy == 1) item.copy = item.copycop;
        if (this.tablelist.enablePage == 1) item.page = `${item.page1}-${item.page2}`;
        delete item.children
      })
      let params = {
        chooseUnit: submitUnit,
        chooseFile: this.fileLib.filter(item => item.checkboxItem),
        chooseRelationFile: this.chooseFile.filter(item => item.checkboxItem)
      }
      if (this.propData.handleSureBtnFunc && this.propData.handleSureBtnFunc.length > 0) {
        let name = this.propData.handleSureBtnFunc[0].name
        window[name] && window[name].call(this, { _this: this, params: params });
      }
    },
    async initData() {
      this.handleGetGroupData()
      const params = this.handleParamsFunc()
      let res = await API.ApiUnitExchangeList(params)
      if (res.code == '200') {
        this.handleFileListData(res.data)
        this.$nextTick(() => this.handleSetHeight())
      }
      let fileres = await API.ApiUnitFileList(params)
      if (fileres.code == '200') {
        this.handleDataFile(fileres.data)
        this.$nextTick(() => this.handleSetHeight())
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
$primaryColor: #0a74dd;

.itreeselectunit2 {
  position: relative;

  .unit-tabs {
    display: flex;
    background: #fff;
    border-bottom: 1px solid #d0d0d0;
    padding: 0 10px;

    .unit-tab-item {
      padding: 8px 16px;
      cursor: pointer;
      font-size: 14px;
      color: #666;
      border-bottom: 2px solid transparent;
      transition: all 0.3s;

      &.active {
        color: $primaryColor;
        border-bottom-color: $primaryColor;
        font-weight: bold;
      }

      &:hover {
        color: $primaryColor;
      }
    }
  }

  .searchul div {
    line-height: 28px;
    cursor: pointer;
  }

  .activehui {
    color: #ccc;
  }

  .disabledselect {
    cursor: not-allowed !important;
  }

  .treesvg {
    font-size: 16px;
    margin-right: 4px;
  }

  .select-loading {
    position: absolute;
    left: 50%;
    top: 50%;
  }

  .w40 {
    width: 40%;
    display: inline-block;
    margin-right: 10px;
  }

  .w10 {
    display: inline-block;
    width: 10%;
    margin-right: 10px;
  }

  .w20 {
    display: inline-block;
    width: 20%;
    margin-right: 10px;
  }

  .mt10 {
    margin-top: 10px;
  }

  .namecol {
    margin-left: 5px;
    color: $primaryColor !important;
    font-size: 14px !important;
    cursor: pointer;
    display: none !important;
  }

  .flex {
    display: flex;
    align-items: center;
  }

  .icon-close {
    display: inline-block;
    width: 16px;
    height: 16px;
    background-image: url('../assets/icon-choice-blue.png');
    background-position: -103px -63px;
    margin-left: 5px;
    cursor: pointer;
  }

  .icon-op {
    cursor: pointer;
    width: 20px;
    height: 18px;
    display: inline-block;
    background-image: url('../assets/icon-form.png');
    background-repeat: no-repeat;
    margin-right: 5px;
  }

  .icon-up-arrow {
    background-position: -253px -41px;

    &.op {
      background-position: -330px -41px !important;
    }
  }

  .icon-down-arrow {
    background-position: -368px -42px !important;

    &.op {
      background-position: -291px -42px !important;
    }
  }

  .treeselect-search {
    padding: 8px 12px;

    .search-input {
      width: 100%;
    }

    ::v-deep .ant-input {
      border-radius: 50px !important;
    }
  }

  .mr5 {
    margin-right: 5px;
  }

  .search-combg {
    padding: 0 12px 0 17px;
    height: 45px;
    line-height: 45px;
    border-bottom: 1px solid #d0d0d0;
    background-color: $bgColor;
  }

  .treeselect-top {
    width: 100%;
    display: flex;
  }

  .treeborder {
    border-bottom: 1px solid #e6e6e6;
  }

  .treeselect-left {
    width: 50%;
    border-right: 1px solid #d0d0d0;

    .select-tip {
      padding: 0 12px 0 17px;
      height: 32px;
      line-height: 32px;
      background-color: $bgColor;

      .selecttip-icon {
        margin-right: 5px;
        display: inline-block;
        width: 18px;
        height: 18px;
        background-image: url('../assets/icon-choice-blue.png');
        background-position: -6px -6px;
      }
    }
  }

  .treeselect-right {
    width: 50%;

    .treeselect-allnum {
      display: flex;
      justify-content: space-between;
    }

    .treeselect-choose {
      background-color: $bgColor;
      height: 32px;
      line-height: 32px;
      padding: 0 12px 0 17px;
      display: flex;
    }

    .chooseAly {
      overflow-y: auto;
      padding: 0 12px 0 17px;

      .choose-line {
        display: flex;
        align-items: center;
        padding: 5px 0;
      }

      .choosepage {
        display: flex;
        align-items: center;
      }
    }
  }

  .select-filecontainer {
    max-height: 126px;
    overflow-y: auto;
    border: 1px solid #e6e6e6;
    padding: 0 16px;

    .boxx {
      display: flex;
      margin: 16px 0;

      .boxx-checkbox {
        width: 15%;
        margin-right: 10px;

        ::v-deep .ant-checkbox-inner {
          width: 18px;
          height: 18px;
        }
      }

      img {
        width: 16px;
        height: 16px;
        margin-right: 4px;
      }
    }
  }

  .unit-box {
    position: relative;
    padding: 10px 20px;
    overflow-y: auto;

    .jiaicon {
      font-size: 14px;
      cursor: pointer;
    }
  }

  .unit-list {
    &:hover .namecol {
      display: block !important;
    }

    .unit-name {
      display: flex;
      align-items: center;

      span {
        font-size: 16px;
      }
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