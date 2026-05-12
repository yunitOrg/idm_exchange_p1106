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

          <!-- 页签区域 -->
          <div class="unit-tabs" ref="unitTabs" v-show="!showSearchDialog && tabList.length > 0">
            <div v-for="tab in tabList" :key="tab.id" class="unit-tab-item"
              :class="{ 'active': activeTabKey === tab.id }" @click="activeTabKey = tab.id">
              {{ tab.name }}
            </div>
          </div>

          <div class="unit-box" :style="leftSetHeight">
            <a-spin class="select-loading" :spinning="loading"></a-spin>

            <div class="unit-list" v-show="!showSearchDialog">
              <div v-for="(item, index) in tabList" :key="index" v-show="activeTabKey === item.id">

                <!-- 【常用组】的专属渲染结构 -->
                <div v-if="item.id === 'zsdwRootGroup'" class="comgroup-box">
                  <div class="group-name">
                    <div class="flex">
                      <a-icon class="jiaicon mr5" :type="item.shrink ? 'minus' : 'plus'" @click="handleAddKeys(item)" />
                      <span>{{ item.name }}</span>
                      <span class="namecol" @click="chooseGroup(item)">(全选下级)</span>
                    </div>
                    <div class="group-right">
                      <div class="flex">
                        <div class="renew flex" @click="handleUpdateGroup">
                          <div class="renew-img renew-img1"></div>更新组
                        </div>
                        <div class="flex" @click="handleNewGroup">
                          <div class="renew-img renew-img2"></div>创建组
                        </div>
                      </div>
                    </div>
                  </div>
                  <!-- 小组列表 -->
                  <div class="group-children" v-show="item.shrink" v-for="(subitem, subindex) in item.children"
                    :key="subindex">
                    <div class="flex" :data="subitem.shrink">
                      <a-icon class="jiaicon mr5" :type="subitem.shrink ? 'minus' : 'plus'"
                        @click="handleAddKeys(subitem)" />
                      <a-checkbox v-model="subitem.check" @change="(e) => handleAddGroup(e, subitem, 'group')">
                        <span>{{ subitem.name }}</span>
                      </a-checkbox>
                      <!--删除组-->
                      <div class="select-delete"><img src="../assets/delete.png" alt=""
                          @click="hadnleDelectUnit(subitem, subindex)"></div>
                    </div>
                    <!--删除组的单位-->
                    <div class="group-ul" v-show="subitem.shrink">
                      <div class="flex group-ulchild" v-for="(child, childindex) in subitem.children" :key="childindex">
                        <a-checkbox v-model="child.check" @change="(e) => handleAddGroup(e, child, 'single', subitem)"
                          :disabled="child.attrs.noselect" class="groupcheckbox">
                          <div class="groupcheckbox">
                            <span>{{ child.name }}</span>
                          </div>
                        </a-checkbox>
                        <div class="select-deletechild"><img src="../assets/delete.png" alt=""
                            @click="handleDeleteSingleUnit(subitem, child, childindex)"></div>
                      </div>
                    </div>
                  </div>
                </div>

                <!-- 【普通树节点】渲染结构 (直接调用子组件，取消顶级节点重复展示) -->
                <template v-else>
                  <treeSelectUnit2 class="first-level" :item="item" ref="treeSelect"></treeSelectUnit2>
                </template>

              </div>
            </div>

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
            <div class="flex"
              v-if="tablelist.enableCopy == 1 || (tablelist.enableCopy != 1 && tablelist.enablePage == 1)">
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
          <div class="chooseAly" :style="setHeight">
            <div class="choose-line" v-for="(item, index) in chooseUnit" :key="index">
              <span class="w40">{{ item.name }}</span>
              <div class="w10 choosecopy">
                <a-input-number style="width: 60px" :min="1" v-if="tablelist.enableCopy == 1" v-model="item.copycop"
                  @change="(val) => inputChange(val, item)"></a-input-number>
                <a-input-number style="width: 60px" :min="1"
                  v-if="tablelist.enableCopy != 1 && tablelist.enablePage == 1" v-model="item.copycop"
                  @change="(val) => inputChange(val, item)"></a-input-number>
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
      <div class="treeselect-foot" :style="`bottom:${propData.footBottom}`">
        <a-button type="primary" class="themeBtn" @click="handleSure">确定</a-button>
        <a-button @click="hanldeNone">取消</a-button>
      </div>
    </div>

    <!-- 弹框区 -->
    <a-modal title="请选择常用组" :visible="dialogGroup.visible" centered width="300px" @ok="handleChooseGroup"
      cancelText="取消" okText="确定" @cancel="dialogGroup.visible = false">
      <div class="dialog-choose-ul">
        <a-radio-group v-model="dialogGroup.value">
          <a-radio v-for="(item, index) in dialogGroup.groupary" :key="index" :value="item.id" class="dialog-radio">{{
            item.name }}</a-radio>
        </a-radio-group>
      </div>
    </a-modal>
    <a-modal title="创建组" :visible="dialogCreategroup.visible" centered width="300px" @ok="handleCreateSure"
      cancelText="取消" okText="确定" @cancel="dialogCreategroup.visible = false">
      <div class="dialog-create-center">
        <a-textarea v-model="dialogCreategroup.value" placeholder="请填写组名称" :auto-size="{ minRows: 3, maxRows: 5 }" />
      </div>
    </a-modal>
    <a-modal v-model="deleteDialog.visible" title="信息" centered width="300px" cancelText="取消" okText="确定"
      @ok="handleDelteGroup">
      <p>确定要删除?</p>
    </a-modal>
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
      setHeight: {},
      leftSetHeight: {},
      defaultPrintNum: 1,
      loading: false,
      tablelist: {},
      defaultTreeKeys: [],
      showSearchDialog: false,
      searchName: '',
      chooseFile: [],
      fileLib: [],
      comGroup: [],  // 保存常用组数据引用
      unitTree: [],  // 保存除常用组以外的正常单位分类
      tabList: [],   // 承载顶部全部页签
      activeTabKey: '',
      chooseUnit: [],
      pinyinAryAll: [],
      moduleObject: {},
      // 常用组弹框相关状态
      dialogGroup: { value: '', visible: false, groupary: [] },
      dialogCreategroup: { visible: false, value: '', chooseAry: [] },
      deleteDialog: { visible: false, flag: "", delteid: "", deleteindex: '' },
      propData: this.$root.propData.compositeAttr || {
        height: '100vh',
        footBottom: '0px',
        unitHeight: '436px',
      }
    }
  },
  watch: {
    activeTabKey(newVal) {
      if (newVal) {
        let currentTab = this.tabList.find(t => t.id === newVal);
        if (currentTab) {
          this.$set(currentTab, 'shrink', true);
          if (!this.defaultTreeKeys.includes(currentTab.id)) {
            this.defaultTreeKeys.push(currentTab.id);
          }
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
    /* =================== 常用组相关逻辑 =================== */
    handleChooseGroup() {
      let ary = this.getTreeCheckData(this.unitTree);
      this.handleUpdate(this.dialogGroup.value, ary, () => {
        this.handleGetGroupData();
        this.dialogGroup.visible = false;
      })
    },
    handleUpdateGroup() {
      let alyChoose = []
      this.comGroup.forEach(item => {
        item.children && item.children.forEach(k => {
          k.check && alyChoose.push(k)
        })
      })
      if (alyChoose.length <= 0) {
        message.error('请选择小组')
        return
      } else if (alyChoose.length == 1) {
        let current = alyChoose[0];
        let ary = this.getTreeCheckData(this.unitTree);
        this.handleUpdate(current.id, ary, () => {
          this.handleGetGroupData();
        });
      } else {
        this.dialogGroup.groupary = alyChoose
        this.dialogGroup.value = alyChoose[0].id
        this.dialogGroup.visible = true
      }
    },
    handleNewGroup() {
      let chooseData = this.getTreeCheckData(this.unitTree)
      if (chooseData.length <= 0) {
        message.error('请选择单位')
        return
      }
      this.dialogCreategroup.value = '';
      this.dialogCreategroup.chooseAry = chooseData;
      this.dialogCreategroup.visible = true;
    },
    async handleCreateSure() {
      let ids = '', texts = '';
      this.dialogCreategroup.chooseAry.forEach(item => {
        ids += `,${item.id}`;
        texts += `,${item.name}`
      })
      let obj = {
        name: this.dialogCreategroup.value,
        ids: ids.slice(1),
        texts: texts.slice(1)
      }
      let res = await API.ApiSaveGroup(obj)
      if (res.code == '200') {
        message.success(res.message);
        this.dialogCreategroup.visible = false;
        this.handleGetGroupData();
      } else {
        this.dialogCreategroup.visible = false;
        message.success(res.message)
      }
    },
    async handleUpdate(groupId, targetAry, fn) {
      let ids = '', texts = '';
      targetAry.forEach(item => {
        ids += `,${item.id}`;
        texts += `,${item.name}`
      })
      let obj = {
        groupId: groupId,
        ids: ids.slice(1),
        texts: texts.slice(1)
      }
      let res = await API.ApiUpdateGroup(obj)
      if (res.code == '200') {
        message.success(res.message);
        fn && fn()
      } else {
        message.success(res.message)
      }
    },
    async handleDelteGroup() {
      if (this.deleteDialog.flag == "unit") {
        this.handleUpdate(this.deleteDialog.delteid, this.deleteDialog.groupary, () => {
          this.deleteDialog.visible = false;
          this.handleGetGroupData()
        })
      } else if (this.deleteDialog.flag == "group") {
        let res = await API.ApiDeleteGroup({ groupId: this.deleteDialog.delteid });
        if (res.code == "200") {
          this.deleteDialog.visible = false;
          this.handleGetGroupData();
        }
      }
    },
    handleDeleteSingleUnit(father, item, index) {
      let updateAry = father.children.filter(k => k.id != item.id);
      this.deleteDialog.groupary = updateAry
      this.deleteDialog.delteid = father.id;
      this.deleteDialog.flag = "unit";
      this.deleteDialog.visible = true;
    },
    hadnleDelectUnit(item, index) {
      this.deleteDialog.delteid = item.id;
      this.deleteDialog.flag = "group";
      this.deleteDialog.deleteindex = index;
      this.deleteDialog.visible = true;
    },
    getGroupAllId(tree, allId = []) {
      if (tree && tree.length > 0) {
        tree.forEach(item => {
          item.children.length == 0 && allId.push(item.id)
          return item.children?.length > 0 && this.getGroupAllId(item.children, allId)
        })
      }
      return allId
    },
    checkGroupAllChoose() {
      let group = this.comGroup[0]?.children || [];
      if (this.comGroup[0]) {
        this.comGroup[0].check = group.length && (group.filter(item => item.check).length == group.length);
      }
    },
    chooseGroup(item) {
      item.check = !item.check;
      this.handleTreeAddTreeData(this.comGroup, { check: item.check });
      let chooseIdAry = this.getGroupAllId(this.comGroup)
      this.handleTreeChoose(this.unitTree, chooseIdAry, item.check);
      this.defaultChooseUnit()
    },
    handleAddGroup(e, subitem, type, father) {
      if (type == 'group') {
        if (subitem.children?.length > 0) {
          subitem.check = e.target.checked;
          subitem.children.forEach(k => {
            if (!k.attrs.noselect) k.check = e.target.checked
          })
          let chooseIdAry = subitem.children.map(subitem => subitem.id);
          this.handleTreeChoose(this.unitTree, chooseIdAry, e.target.checked);
          this.handleTreeChoose(this.comGroup, chooseIdAry, e.target.checked);
          this.handleCheckGroupChoose(this.comGroup)
          this.checkGroupAllChoose()
          this.defaultChooseUnit()
        }
      } else {
        let flag = e.target.checked
        subitem.check = flag
        this.handleTreeAddTreeData(this.unitTree, { chooseId: subitem.id, targetflag: flag });
        if (father && father.children && father.children.length > 0) {
          const chooseAry = father.children.filter(k => !k.attrs.noselect && k.check);
          father.check = chooseAry.length == father.children.filter(k => !k.attrs.noselect).length
        }
        this.checkGroupAllChoose()
        this.defaultChooseUnit()
      }
    },
    handleCheckGroupChoose(tree) {
      if (tree && tree.length > 0) {
        tree.forEach(item => {
          if (item.children.length != 0) {
            if (item.children && item.children.length > 0) {
              let len = item.children.filter(k => !k.attrs.noselect && k.check).length;
              let fatherlen = item.children.filter(k => !k.attrs.noselect).length;
              item.check = len == fatherlen
            }
          }
          item.children?.length > 0 && this.handleCheckGroupChoose(item.children)
        })
      }
    },
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

    /* =================== 基础交互与生命周期 =================== */
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
      this.setHeight = { "height": height + 'px' }
      let tabHeight = 0;
      if (this.$refs.unitTabs && !this.showSearchDialog && this.tabList.length > 0) {
        tabHeight = this.$refs.unitTabs.offsetHeight || 0;
      }
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
    hadnleSearchChoose(item) {
      if (item.attrs.noselect) return
      item.check = !item.check;
      if (item.children && item.children.length > 0) {
        this.hadnleTreeCheck(item, item.check);
      }
      this.handleTreeAddTreeData(this.comGroup, { chooseId: item.id, targetflag: item.check })
      this.handleCheckGroupChoose(this.comGroup)
      this.checkGroupAllChoose();
      this.defaultChooseUnit();
    },
    handleFirstGen(item) {
      this.hadnleTreeCheck(item, item.check);
      this.handleTreeAddTreeData(this.comGroup, { chooseId: item.id, targetflag: item.check })
      this.handleCheckGroupChoose(this.comGroup)
      this.checkGroupAllChoose();
      this.defaultChooseUnit()
    },
    handleChoose(item) {
      this.handleTreeAddTreeData(this.tabList, { chooseId: item.id, targetflag: item.check });
      this.handleTreeAddTreeData(this.comGroup, { chooseId: item.id, targetflag: item.check })
      this.handleCheckGroupChoose(this.comGroup)
      this.checkGroupAllChoose();
      this.defaultChooseUnit()
    },
    hadnleNextAllChoose(item) {
      item.check = !item.check;
      this.hadnleTreeCheck(item, item.check);
      let chooseIdAry = this.getGroupAllId([item]);
      this.handleTreeChoose(this.comGroup, chooseIdAry, item.check);
      this.handleCheckGroupChoose(this.comGroup)
      this.checkGroupAllChoose();
      this.defaultChooseUnit();
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

        // 【提取常用组并加入到页签最前面】
        let group = codeList.filter(item => item.id === 'zsdwRootGroup');
        group.forEach(item => { item.name = "常用组"; item.shrink = true; });
        this.hanldeAddField(group, this.defaultTreeKeys);
        this.comGroup = group; // 保存引用

        // 【提取其余正常单位并加入页签】
        let tabs = codeList.filter(item => item.pid === "0" && item.id !== 'zsdwRootGroup');
        tabs.forEach(tab => {
          if (!this.defaultTreeKeys.includes(tab.id)) this.defaultTreeKeys.push(tab.id);
          if (tab.children && tab.children.length > 0) {
            tab.children.forEach(child => {
              if (!this.defaultTreeKeys.includes(child.id)) this.defaultTreeKeys.push(child.id);
            })
          }
        })
        this.hanldeAddField(tabs, this.defaultTreeKeys);
        this.unitTree = tabs; // 保存引用用于提取已勾选单位

        // 组装总Tab
        this.tabList = [];
        if (group.length > 0) this.tabList.push(...group);
        if (tabs.length > 0) this.tabList.push(...tabs);

        if (this.tabList.length > 0) {
          this.activeTabKey = this.tabList[0].id;
        }

        this.handleDataBack();
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
        this.handleBackGroup(chooseIdAry, (chooseIdAry) => {
          this.handleTreeChoose(this.unitTree, chooseIdAry, true);
          this.handleTreeChoose(this.comGroup, chooseIdAry, true);
          this.handleCheckGroupChoose(this.comGroup);
          this.checkGroupAllChoose();
          this.defaultChooseUnit()
        });
      }
    },
    handleDataBack() {
      if (this.chooseUnit?.length > 0) {
        let chooseIdAry = this.chooseUnit.map(item => item.id);
        this.handleTreeChoose(this.unitTree, chooseIdAry, true);
        this.handleTreeChoose(this.comGroup, chooseIdAry, true);
        this.handleCheckGroupChoose(this.comGroup);
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
      // 获取正常单位里勾选的（因为常用组里的单位在正常树里也有，用unitTree查就能保证不多不少）
      this.chooseUnit = this.getTreeCheckData(this.unitTree);
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

  /* 常用组CSS部分 */
  .comgroup-box {
    &:hover {
      .namecol {
        display: block !important;
      }

      .group-right {
        display: block;
      }
    }

    .group-name {
      user-select: none;
      display: flex;
      justify-content: space-between;
      align-items: center;

      span {
        font-size: 16px;
      }
    }

    .group-children {
      line-height: 32px;
      padding-left: 20px;

      &:hover .select-delete {
        display: block;
      }

      ::v-deep .ant-checkbox-inner {
        width: 18px;
        height: 18px;
      }
    }

    .group-ulchild:hover .select-deletechild {
      display: block;
    }

    .groupcheckbox {
      display: flex;
      align-items: center;

      ::v-deep .ant-checkbox {
        height: 18px;
        display: flex;
        align-items: center;
      }
    }

    .group-ul {
      padding-left: 40px;
    }

    span {
      font-size: 14px;
      color: #333;
      max-width: 250px;
      white-space: nowrap;
      display: inline-block;
      vertical-align: middle;
      overflow: hidden;
      text-overflow: ellipsis;
    }

    .select-delete {
      display: none;
      cursor: pointer;
      width: 23px;
      height: 100%;
      color: #999;
    }

    .select-deletechild {
      display: none;
      cursor: pointer;
      width: 23px;
      height: 100%;
      color: #999;
      margin-left: 5px;
    }
  }

  .group-right {
    display: none;
    font-size: 14px;

    div {
      cursor: pointer;
    }

    .renew {
      margin-right: 30px;
    }

    .renew-img {
      width: 16px;
      height: 16px;
      margin-right: 5px;
      background-repeat: no-repeat;
      background-size: 100% 100%;
    }

    .renew-img1 {
      background-image: url('../assets/new.png');
    }

    .renew-img2 {
      background-image: url('../assets/create.png');
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
      display: flex;
      align-items: center;

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

    // 抵消子组件默认带来的 20px 缩进，使被提级的原二级节点能靠左侧对齐
    ::v-deep .first-level {
      margin-left: 0 !important;
    }
  }

  .treeselect-foot {
    width: 100%;
    line-height: 55px;
    background-color: $bgColor;
    bottom: 0;
    text-align: right;
    padding: 0 30px;
    position: absolute;

    button {
      width: 78px;
      height: 32px;
      font-size: 16px;
    }

    button+button {
      margin-left: 20px;
    }
  }
}
</style>