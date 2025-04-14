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
      <div class="treeselect-top"
        ref="treeselectTop"
        :class="{
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
          <div class="unit-box" :style="setHeight">
            <a-spin class="select-loading" :spinning="loading"></a-spin>
            <!--常用组-->
            <div class="comgroup-box" v-show="!showSearchDialog">
              <div v-for="(item, index) in comGroup" :key="index">
                <div class="group-name">
                  <div class="flex">
                    <a-icon class="jiaicon mr5"  :type="item.shrink ? 'minus' : 'plus'" @click="handleAddKeys(item)" />
                    <span>{{ item.name }}</span>
                    <span class="namecol" @click="chooseGroup(item)">(全选下级)</span>
                  </div>
                  <div class="group-right">
                    <div class="flex">
                      <div class="renew flex" @click="handleUpdateGroup">
                        <div class="renew-img renew-img1"></div>
                        更新组
                      </div>
                      <div class="flex" @click="handleNewGroup">
                        <div class="renew-img renew-img2"></div>
                        创建组
                      </div>
                    </div>
                  </div>
                </div>
                <div class="group-children" v-show="item.shrink" v-for="(subitem, subindex) in item.children" :key="subindex">
                  <div class="flex" :data="subitem.shrink">
                    <a-icon class="jiaicon mr5"  :type="subitem.shrink ? 'minus' : 'plus'" @click="handleAddKeys(subitem)" />
                    <a-checkbox v-model="subitem.check" @click="(e) => handleAddGroup(e, subitem, 'group')">
                      <span>{{ subitem.name }}</span>
                    </a-checkbox>
                    <!--删除组-->
                    <div class="select-delete"><img src="../assets/delete.png" alt="" @click="hadnleDelectUnit(subitem, index)"></div>
                  </div>
                  <!--删除组的单位-->
                  <div class="group-ul" v-show="subitem.shrink">
                    <div class="flex group-ulchild" v-for="(child, childindex) in subitem.children" :key="childindex">
                      <a-checkbox v-model="child.check" @click="(e) => handleAddGroup(e, child, 'single', subitem)" :disabled="child.attrs.noselect" class="groupcheckbox">
                        <div class="groupcheckbox">
                          <span>{{ child.name }}</span>
                        </div>
                      </a-checkbox>
                      <div class="select-deletechild"><img src="../assets/delete.png" alt="" @click="handleDeleteSingleUnit(subitem, child, childindex)"></div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <!--单位-->
            <div class="unit-list" v-show="!showSearchDialog">
              <div v-for="(item, index) in unitTree" :key="index">
                <div class="unit-name">
                  <a-icon class="jiaicon mr5" :type="item.shrink ? 'minus' : 'plus'" @click="handleAddKeys(item)" />
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
            <div class="flex" v-if="tablelist.enableCopy==1 || (tablelist.enableCopy!=1 && tablelist.enablePage==1)">
              <a-input-search
              v-model="numValue"
              placeholder="请输入"
              @search="onSearch"
              >
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
              <span v-if="tablelist.enableCopy==1">份数</span>
            </span>
            <span class="w20">
              <span v-if="tablelist.enablePage==1">份号</span>
            </span>
            <span class="w10">
              <span v-if="tablelist.enableDown==1">下载次数</span>
            </span>
          </div>
          <div class="chooseAly" :style="setHeight">
            <div class="choose-line" v-for="(item, index) in chooseUnit" :key="index">
              <span class="w40">{{ item.name }}</span>
              <div class="w10 choosecopy" >
                <a-input-number style="width: 60px" :min="1" v-if="tablelist.enableCopy==1" v-model="item.copycop" @change="(val) => inputChange(val, item)"></a-input-number>
                <a-input-number style="width: 60px" :min="1" v-if="tablelist.enableCopy!=1 && tablelist.enablePage==1" v-model="item.copycop" @change="(val) => inputChange(val, item)"></a-input-number>
              </div>
              <div class="w20 choosepage">
                <template v-if="tablelist.enablePage==1">
                  <a-input-number :min="1" v-model="item.page1"></a-input-number>
                  <span>-</span>
                  <a-input-number :min="1" v-model="item.page2"></a-input-number>
                </template>
              </div>
              <div class="w10 choosedown" >
                <a-input-number style="width:50px;" :min="1" v-if="tablelist.enableDown==1" v-model="item.down"></a-input-number>
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
        <div class="select-filecontainer" ref="selectLibItem" v-if="!handleParamsFunc().recordId && fileLib.length" data="附件">
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
        <div class="select-filecontainer mt10" ref="selectFileItem" v-if="!handleParamsFunc().recordId && chooseFile.length" data="文件">
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
    <!--请选择常用组-->
    <a-modal
      title="请选择常用组"
      :visible="dialogGroup.visible"
      centered="true"
      width="300px"
      @ok="handleChooseGroup"
      cancelText="取消"
      okText="确定"
      @cancel="dialogGroup.visible=false"
    >
      <div class="dialog-choose-ul">
        <a-radio-group v-model="dialogGroup.value">
          <a-radio v-for="(item, index) in dialogGroup.groupary" :key="index" :value="item.id" class="dialog-radio">{{ item.name }}</a-radio>
        </a-radio-group>
      </div>
    </a-modal>
    <!--创建组-->
    <a-modal
      title="创建组"
      :visible="dialogCreategroup.visible"
      centered="true"
      width="300px"
      @ok="handleCreateSure"
      cancelText="取消"
      okText="确定"
      @cancel="dialogCreategroup.visible=false"
    >
      <div class="dialog-create-center">
        <a-textarea
          v-model="dialogCreategroup.value"
          placeholder="请填写组名称"
          :auto-size="{ minRows: 3, maxRows: 5 }"
        />
      </div>
    </a-modal>
    <!--删除组-->
    <a-modal v-model="deleteDialog.visible"
      title="信息"
      centered="true"
      width="300px"
      cancelText="取消"
      okText="确定"
      @ok="handleDelteGroup">
      <p>确定要删除?</p>
    </a-modal>
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
      numValue: '',
      setHeight: {},
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
      // 常用组
      comGroup: [],
      // 单位
      unitTree: [],
      // 选择的单位
      chooseUnit: [],
      // 总拼音数据
      pinyinAryAll: [],
      moduleObject: {},
      dialogGroup: {
        value: '',
        visible: false,
        groupary: []
      },
      dialogCreategroup: {
        visible: false,
        value: '',
        chooseAry: []
      },
      deleteDialog: {
        visible: false,
        flag: "",
        delteid: "",
        deleteindex: ''
      },
      propData: this.$root.propData.compositeAttr || {
        height: '100vh',
        footBottom: '0px',
        unitHeight: '436px',
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
    this.setHeight = { "height": document.body.offsetHeight + 'px' }
  },
  methods: {
    // 批量修改
    onSearch() {
      if (this.chooseUnit && this.chooseUnit.length > 0) {
        this.chooseUnit.forEach(item => item.copycop = this.numValue)
        this.updateChooseNum(this.chooseUnit);
      }
    },
    // 添加默认展开key
    handleAddKeys(item) {
      item.shrink = !item.shrink;
      if(item.shrink) {
        !this.defaultTreeKeys.includes(item.id) && this.defaultTreeKeys.push(item.id);
      } else {
        this.defaultTreeKeys.includes(item.id) && (this.defaultTreeKeys = this.defaultTreeKeys.filter(k => k != item.id));
      }
    },
    // 选择常用组弹框
    handleChooseGroup() {
      let ary = this.getTreeCheckData(this.unitTree);
      this.handleUpdate(this.dialogGroup.value, ary, () => {
        this.handleGetGroupData();
        this.dialogGroup.visible = false;
      })
    },
    // 更新按钮
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
    // 创建组
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
    // 创建组弹框
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
    // 更新组
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
      let res  = await API.ApiUpdateGroup(obj)
      if (res.code == '200') {
        message.success(res.message);
        fn && fn()
      } else {
        message.success(res.message)
      }
    },
    // 删除组确定
    async handleDelteGroup() {
      if (this.deleteDialog.flag == "unit") {
        this.handleUpdate(this.deleteDialog.delteid, this.deleteDialog.groupary, () => {
          this.deleteDialog.visible = false;
          this.handleGetGroupData()
        })
      } else if (this.deleteDialog.flag == "group") {
        let res = await API.ApiDeleteGroup({groupId: this.deleteDialog.delteid});
        if (res.code == "200") {
          this.deleteDialog.visible = false;
          this.handleGetGroupData();
        }
      }
    },
    // 删除组里的单位
    handleDeleteSingleUnit(father, item, index) {
      let updateAry = father.children.filter(k => k.id != item.id);
      this.deleteDialog.groupary = updateAry
      this.deleteDialog.delteid = father.id;
      this.deleteDialog.flag = "unit";
      this.deleteDialog.visible = true;
    },
    // 删除已选单位
    hadnleDelectUnit(item, index) {
      this.deleteDialog.delteid = item.id;
      this.deleteDialog.flag = "group";
      this.deleteDialog.deleteindex = index;
      this.deleteDialog.visible = true;
    },
    handleSetHeight() {
      let flag = this.handleParamsFunc().recordId; // fileLib 附件 // chooseFile 文件
      let bodyHeight = document.body.offsetHeight,
        contentHeight = bodyHeight - 132;
      let height = this.propData.unitHeight;

      if ((flag || this.chooseFile.length <= 0) && (flag || this.fileLib.length <= 0)) {
        height = contentHeight
        this.setHeight = { "height": height + 'px' }
      }
      if ((flag || this.chooseFile.length <= 0) && (!flag && this.fileLib.length)) {
        height = contentHeight - (this.$refs.selectLibItem?.offsetHeight || 0);
        this.setHeight = { "height": height + 'px' }
      }
      if ((flag || this.fileLib.length <= 0) && (!flag && this.chooseFile.length)) {
        height = contentHeight - this.$refs.selectFileItem?.offsetHeight || 0;
        this.setHeight = { "height": height + 'px' }
      }
      if ((!flag || this.fileLib.length) && (!flag && this.chooseFile.length)) {
        height = contentHeight - (this.$refs.selectLibItem?.offsetHeight || 0) - (this.$refs.selectFileItem?.offsetHeight || 0);
        this.setHeight = { "height": height + 'px' }
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
            if (chooseId == item.id && !item.attrs.noselect) {
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
      // this.handleFatherChoose(this.unitTree)
      

      this.defaultChooseUnit()
    },
    // 更新已选的数字
    updateChooseNum(ary) {
      if (ary?.length <= 0) return
      let params = this.handleParamsFunc();
      ary[0].page1 = params.fh ? (parseInt(params.fh)+1) : 1;
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
      if (!value) {
        item.copycop = 1;
        value = 1
      }
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
          if (item.attrs.noselect && item.children?.length==0) {
          } else {
            item.check = flag;
          }
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
    handleAddGroup(e, subitem, type, father) {
      if (type == 'group') {
        if (subitem.children?.length > 0) {
          subitem.check = e.target.checked;
          subitem.children.forEach(k => {
            if (k.attrs.noselect) {

            } else {
              k.check = e.target.checked
            }
          })
          let chooseIdAry = subitem.children.map(subitem => subitem.id);
          // 选中单位复选框
          this.handleTreeChoose(this.unitTree, chooseIdAry, e.target.checked);
          // 检查单位全选和选中条数 有可能父级选中只是父级
          // this.handleFatherChoose(this.unitTree)
          // 检查常用组其他是否选中
          this.handleTreeChoose(this.comGroup, chooseIdAry, e.target.checked);
          this.handleCheckGroupChoose(this.comGroup)

          this.checkGroupAllChoose()

          this.defaultChooseUnit()
        }
      } else {
        let flag = e.target.checked
        subitem.check = flag
        this.handleTreeAddTreeData(this.unitTree, {chooseId: subitem.id, targetflag: flag });
        if (father.children && father.children.length > 0) {
          const chooseAry = father.children.filter(k => {
            return !k.attrs.noselect && k.check
          });
          father.check = chooseAry.length == father.children.filter(k => !k.attrs.noselect).length
        }
        this.checkGroupAllChoose()
        this.defaultChooseUnit()
      }
    },
    // 搜索内容点击
    hadnleSearchChoose(item) {
      if (item.attrs.noselect) return
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
    // 根上有复选框
    handleFirstGen(item) {
      const flag = item.check;
      // 检查常用组选中
      this.handleTreeAddTreeData(this.comGroup, {chooseId: item.id, targetflag: flag })
      this.handleCheckGroupChoose(this.comGroup)
      // 检查常用组全选
      this.checkGroupAllChoose();

      this.defaultChooseUnit()
    },
    // 选择单位
    handleChoose(item) {
      let flag = item.check
      // let fatherobj = this.handleTreeGetChooseId(this.unitTree, item.pid);
      // let chooseTrueCheck = fatherobj.children.filter(item => item.check)
      // fatherobj.check = fatherobj.children.length == chooseTrueCheck.length

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
            if(item.attrs.noselect) {
              
            } else {
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
    hanldeAddField(tree, defaultAry) {
      if (tree && tree.length>0) {
        tree.forEach(item => {
          this.$set(item, 'shrink', defaultAry.includes(item.id))
          this.$set(item, 'check', false)
          item.chooseNum = 0;
          item.children?.length > 0 && this.hanldeAddField(item.children, defaultAry)
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

        this.hanldeAddField(group, this.defaultTreeKeys)
        group.forEach(item => item.shrink = true);
        this.comGroup = group;

        let unit = codeList.filter(item => item.id !== 'zsdwRootGroup');
        if (this.defaultTreeKeys.length == 0) {
          this.defaultTreeKeys.push(unit[0]?.id)
        }
        this.hanldeAddField(unit, this.defaultTreeKeys)
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
      if (this.chooseUnit?.length > 0) {
        let chooseIdAry = this.chooseUnit.map(item => item.id);
        // // 选中单位复选框
        this.handleTreeChoose(this.unitTree, chooseIdAry, true);
        // // 检查单位全选和选中条数
        // this.handleFatherChoose(this.treeData.org)

        // 检查常用组选中
        this.handleTreeChoose(this.comGroup, chooseIdAry, true)
        this.handleCheckGroupChoose(this.comGroup)
        
        this.defaultChooseUnit()
      }
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
          val = top.DSF.getElementValueByKey("B0014");
          if (val == "" || val == null || val == undefined) {
            val = this.defaultPrintNum;
          }
        }
      }catch(e) {
        val = this.defaultPrintNum;
      }
      return val
    },
    // copycop：份数 page1-page2：编号
    defaultChooseUnit() {
      this.chooseUnit = this.getTreeCheckData(this.unitTree);
      let num = this.getDefaultCopycop();
      this.chooseUnit.forEach(item => {
        if (this.tablelist.enableCopy==1) {
          (!item.copycop || item.copycop == "") && this.$set(item, 'copycop', this.numValue || num);
        }
        if (this.tablelist.enablePage==1) {
          (!item.copycop || item.copycop == "") && this.$set(item, 'copycop', this.numValue || num);
          (!item.page1 || item.page1 == "") && (this.$set(item, 'page1', 1));
          (!item.page2 || item.page2 == "") && (this.$set(item, 'page2', 1));
        }
        this.tablelist.enableDown==1 && (this.$set(item, 'down', 1));
      })
      this.updateChooseNum(this.chooseUnit);
    },
    // 获取选中树节点数据
    getTreeCheckData(tree, select=[]) {
      if (tree && tree.length>0) {
        tree.forEach(item => {
          // (item.children.length==0 && item.check) && select.push(item)
          if (item.attrs.noselect) {

          } else {
            if (item.check) {
              !select.map(k => k.id).includes(item.id) && select.push(item)
            }
          }
          if (item.children?.length > 0) {
            return this.getTreeCheckData(item.children, select)
          }
        })
        return select
      }
    },
    // 清空
    handleClear() {
      this.numValue = "";
      this.chooseUnit.forEach(item => item.copycop = this.numValue)
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
    convertThemeListAttrToStyleObject() {
      let themeList = this.propData.themeList;
      if (!themeList) {
        return;
      }
      const themeNamePrefix =
        IDM.setting &&
        IDM.setting.applications &&
        IDM.setting.applications.themeNamePrefix
          ? IDM.setting.applications.themeNamePrefix
          : "idm-theme-";
      for (let i=0; i<themeList.length; i++) {
        let item = themeList[i];
        if(item.key!=IDM.theme.getCurrentThemeInfo()){
            //此处比对是不渲染输出不用的样式，如果页面会刷新就可以把此处放开
            continue;
        }
        let tempobj = {
          "background-color": item.mainColor ? item.mainColor.hex8 : "",
          "border": item.mainColor ? item.mainColor.hex8 : "",
        };
        IDM.setStyleToPageHead(
          `.${themeNamePrefix}${item.key} #${(this.moduleObject.id || "module_demo")} .themeBtn`,
          tempobj
        );
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
        this.$nextTick(() => {
          this.handleSetHeight()
        })
      }
      // 文件
      let fileres = await API.ApiUnitFileList(params)
      if (fileres.code == '200') {
        let data = fileres.data;
        this.handleDataFile(data)
        this.$nextTick(() => {
          this.handleSetHeight()
        })
      }
      // this.$nextTick(() => {
      //   const selectTopHeight = this.$refs.treeselectTop?.offsetHeight || 0;
      //   const selectLibItem = this.$refs.selectLibItem?.offsetHeight || 0;
      //   const selectFileItem = this.$refs.selectFileItem?.offsetHeight || 0;
      //   const realyHeight = selectTopHeight + selectLibItem + selectFileItem + 55 + 20;
      //   try{
      //     top.setRemoteSendRangeViewHeight (realyHeight);
      //   }catch(e) {
      //     console.log("设置高度", e)
      //   }
      // })
    },
    init() {
      this.handleStyle()
      this.initData()
      this.convertThemeListAttrToStyleObject()
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
  .disabledselect{
    cursor: not-allowed !important;
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
  .w40{
    width: 40%;
    display: inline-block;
    margin-right: 10px;
  }
  .w30{
    width: 30%;
    display: inline-block;
    margin-right: 10px;
  }
  .w10{
    display: inline-block;
    width: 10%;
    margin-right: 10px;
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
  .flex{
    display: flex;
    align-items: center;
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
      // height: 436px;
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
      width: 15%;
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
    // height: 350px;
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
        .group-right{
          display: block;
        }
      }
      .group-name{
        user-select: none;
        display: flex;
        justify-content: space-between;
        align-items: center;
        span{
          font-size: 16px;
        }
      }
      .group-children{
        // height: 32px;
        line-height: 32px;
        padding-left: 20px;
        // display: flex;
        &:hover{
          .select-delete{
            display: block
          }
        }
        ::v-deep .ant-checkbox-inner{
          width: 18px;
          height: 18px;
        }
      }
      .group-ulchild:hover{
        .select-deletechild{
          display: block;
        }
      }
      .groupcheckbox{
        display: flex;
        align-items: center;
        ::v-deep .ant-checkbox{
          height: 18px;
          display: flex;
          align-items: center;
        }
      }
      .group-ul{
        padding-left: 40px;
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
      .select-delete{
        display: none;
        cursor: pointer;
        width: 23px;
        height: 100%;
        color: #999;
      }
      .select-deletechild{
        display: none;
        cursor: pointer;
        width: 23px;
        height: 100%;
        color: #999;
        margin-left: 5px;
      }
    }
    .group-right{
      display: none;
      font-size: 14px;
      div{
        cursor: pointer;
      }
      .renew{
        margin-right: 30px;

      }
      .renew-img{
        width: 16px;
        height: 16px;
        margin-right: 5px;
        background-repeat: no-repeat;
        background-size: 100% 100%;
      }
      .renew-img1{
        background-image: url('../assets/new.png');
      }
      .renew-img2{
        background-image: url('../assets/create.png');
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