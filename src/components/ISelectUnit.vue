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
    <div class="selectunit" @click="hanldeClick">
      <a-spin class="select-loading" :spinning="loading"></a-spin>
      <div class="chooseunit">
        <div class="font16">已选单位：</div>
        <div class="disflex">
          <div class="select-all">
            <div class="image"></div>
            已选： <span class="colorblue">{{chooseUnit.length}}条</span>
          </div>
          <div class="select-input">
            <input checked type="text" v-model="searchInput" @input="handleInput">
            <div class="select-search-div" v-show="showSearchDialog">
              <div class="search-li"
                v-for="(item, index) in pinyinAryAll"
                :key="index"
                @click.stop="handleSearchChoose(item)"
                :class="{'checked': item.check}"
              >{{ item.name }}</div>
            </div>
          </div>
          <div class="btn" @click="handleReset">重置</div>
        </div>
      </div>
      <div class="select-content" :style="setHeight()">
        <div class="select-ul" v-if="chooseUnit.length>0">
          <div class="select-label" v-for="(item, index) in chooseUnit" :key="index">
            {{ item.name }}
            <div class="select-delete"><img src="../assets/delete.png" alt="" @click="hadnleDelectUnit(item, index)"></div>
          </div>
        </div>
        <!--常用组-->
        <div class="select-common select-border mbl10">
          <div class="select-top">
            <div class="left disflex">
              <div class="show" @click="groupTtype=!groupTtype"></div>
              <span >常用组</span>
              <div>
                <a-checkbox @change="hadnleGroutChoose">
                  全选
                </a-checkbox>
              </div>
            </div>
            <div class="right disflex">
              <div class="renew disflex" @click="handleUpdateGroup">
                <div class="renew-img renew-img1"></div>
                更新组
              </div>
              <div class="disflex" @click="handleNewGroup">
                <div class="renew-img renew-img2"></div>
                创建组
              </div>
            </div>
          </div>
          <div class="select-unit-content" v-show="groupTtype">
            <div class="select-item" v-for="(item, index) in treeData.zsdwGroup" :key="index">
              <a-checkbox v-model="item.check" class="select-check-common" @change="(e) => handleAddGroup(e, item)">
                <span class="select-item-name">{{ item.name }}</span>
              </a-checkbox>
              <div class="select-show-more" @click.stop="handleShowDialog(item)"></div>
            </div>
          </div>
        </div>
        <!--循环单位-->
        <div class="select-groups">
          <div class="select-border" v-for="(item, index) in treeData.org" :key="index">
            <div class="select-top">
              <div class="left disflex">
                <div class="show" @click="item.foldtype = !item.foldtype"></div>
                <span >{{ item.name }}</span>
                <div>
                  <a-checkbox v-model="item.check" @change="(e) => handleAllCheck(e, item)">
                    全选
                  </a-checkbox>
                </div>
              </div>
              <div class="right disflex">
                <div>已勾选：<span class="colorblue">{{ item.chooseNum }}条</span></div>
              </div>
            </div>
            <div class="select-unit-content" v-show="item.foldtype">
              <div class="select-item" v-for="(subitem, subindex) in item.children" :key="subindex">
                <a-checkbox v-model="subitem.check" class="select-check" :disabled="subitem.attrs.noselect" @change="(e) => handleCheck(subitem)">
                  <span class="select-item-name" :class="subitem.attrs.noselect&&'select-item-nameno'">{{ subitem.name }}</span>
                </a-checkbox>
              </div>
            </div>
          </div>
        </div>
      </div>
      <!--附件-->
      <div class="select-filecontainer" v-if="!handleParamsFunc().recordId && fileLib.length">
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
      <div class="select-filecontainer" v-if="!handleParamsFunc().recordId && chooseFile.length">
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
      <div class="select-btnall" :style="`bottom:${propData.footBottom};right:${propData.footRight}`" v-if="treeData.org.length > 0">
        <a-button @click="handleChooseAll">选择全部</a-button>
        <a-button @click="handleDeleteAll">清除已选</a-button>
        <a-button type="primary" @click="handleSure">确定</a-button>
      </div>
    </div>
    <!--常用组弹框-->
    <a-modal
      :title="dialog.title"
      :visible="dialog.visible"
      centered="true"
      :confirm-loading="confirmLoading"
      @ok="handleOk"
      cancelText="取消"
      okText="确定"
      @cancel="dialog.visible=false"
    >
      <div class="dialog-group-ul">
        <div class="dialog-group-li" v-for="(item, index) in dialog.chooseAry" :key="index">
          <span>{{ item.name }}</span>
          <img src="../assets/delete.png" alt="" @click="handleDialogDelete(index)">
        </div>
      </div>
    </a-modal>
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
  </div>
</template>

<script>
import API from '../api/index';
import { handleUnitData, handleUnitFileData, handleUnitAtta } from '../utils/mock'
import { message } from 'ant-design-vue';
message.config({
  top: '50%'
})
export default {
  name: 'ISelectUnit',
  data() {
    return {
      groupTtype: true,
      searchInput: '',
      chooseUnit: [],
      dingban: true,
      loading: false,
      moduleObject: {},
      dialog: {
        title: '',
        visible: false,
        groupId: '',
        confirmLoading: false,
        chooseAry: []
      },
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
      showSearchDialog: false,
      // 文件数据
      chooseFile: [],
      // 附件数据
      fileLib: [],
      // 所有数据
      treeData: {
        org: {},
        zsdwGroup: {}
      },
      // 总拼音数据
      pinyinAryAll: [],
      propData: this.$root.propData.compositeAttr || {
        height: '100vh',
        contentHeight: 'calc(100vh - 330px)',
        noFileHeigt: 'calc(100vh - 260px)',
        footBottom: '30px',
        footRight: '20px',
        ulbox: {
          marginTopVal: "",
          marginRightVal: "",
          marginBottomVal: "",
          marginLeftVal: "",
          paddingTopVal: "",
          paddingRightVal: "18px",
          paddingBottomVal: "0",
          paddingLeftVal: "18px"
        }
      },
    }
  },
  mounted() {
    this.moduleObject = this.$root.moduleObject;
    this.init();
  },
  methods: {
    setHeight() {
      let flag = this.handleParamsFunc().recordId;
      return  {
        "height": flag ? this.propData.noFileHeigt : this.propData.contentHeight
      }
    },
    handleGetImg(item) {
      let key = this.getFileIcon(item.fileName);
      return `${IDM.url.getURLRoot()}p1135/190313143112jfLuUxrc19Dchhv4BPU/images/${key}.svg`;
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
    // 重置
    handleReset() {
      this.searchInput = '';
      // this.showSearchDialog = false;
    },
    hanldeClick() {
      this.showSearchDialog = false;
    },
    // 搜索框点击li
    handleSearchChoose(item) {
      let flag = !item.check
      if (item.children && item.children.length > 0) {
        item.children.forEach(item => item.check = flag)
      }
      item.check = flag;
      if (item.children?.length > 0) {
        let chooseIdAry = item.children.map(item => item.id)
        // 选中单位复选框
        this.handleTreeChoose(this.treeData.org, chooseIdAry, flag);

      }
      // 检查单位全选和选中条数
      this.handleFatherChoose(this.treeData.org)
      
      this.defaultChooseUnit()
    },
    // 查询拼音数据
    searchGroupUnit(key) {
      const searchGroup = (tree, key) => {
        if (tree && tree.length>0) {
          tree.forEach(item => {
            if (item.children?.length == 0) {
              if (item.attrs.fullPinYin.includes(key) || item.name.includes(key)) {
                !this.pinyinAryAll.map(k => k.id).includes(item.id) && this.pinyinAryAll.push(item)
              }
            }
            item.children?.length > 0 && searchGroup(item.children, key)
          })
        }
      };
      const searchUnit =(tree, key) => {
        if (tree && tree.length>0) {
          tree.forEach(item => {
            if (item.attrs.fullPinYin.includes(key) || item.name.includes(key)) {
              !this.pinyinAryAll.map(k => k.id).includes(item.id) && this.pinyinAryAll.push(item)
            }
            item.children?.length > 0 && searchUnit(item.children, key)
          })
        }
      }
      searchGroup(this.treeData.org, key)
      searchUnit(this.treeData.zsdwGroup, key)
    },
    handleInput(e) {
      this.showSearchDialog = true;

      this.pinyinAryAll = []
      this.searchGroupUnit(this.searchInput)
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
    // 创建组
    handleNewGroup() {
      let chooseData = this.getTreeCheckData(this.treeData.org)
      if (chooseData.length <= 0) {
        message.error('请选择单位')
        return
      }
      this.dialogCreategroup.value = '';
      this.dialogCreategroup.chooseAry = chooseData;
      this.dialogCreategroup.visible = true;
    },
    // 更新按钮
    handleUpdateGroup() {
      let alyChoose = this.getTreeCheckData(this.treeData.zsdwGroup)
      if (alyChoose.length <= 0) {
        message.error('请选择小组')
        return
      } else if (alyChoose.length == 1) {
        let current = alyChoose[0]
        this.handleUpdate(current.id, current.children)
      } else {
        this.dialogGroup.groupary = alyChoose
        this.dialogGroup.value = alyChoose[0].id
        this.dialogGroup.visible = true
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
        message.success(res.message)
        fn && fn()
      } else {
        message.success(res.message)
      }
    },
    // 获取常用组所有的id
    getGroupAllId(tree, allId=[]) {
      if (tree && tree.length>0) {
        tree.forEach(item => {
          allId.push(item.id)
          return item.children?.length > 0 && this.getGroupAllId(item.children, allId)
        })
      }
      return allId
    },
    // 常用组全选
    hadnleGroutChoose(e) {
      this.handleTreeAddTreeData(this.treeData.zsdwGroup, {check: e.target.checked});
      let chooseIdAry = this.getGroupAllId(this.treeData.zsdwGroup)
      // 选中单位复选框
      this.handleTreeChoose(this.treeData.org, chooseIdAry, e.target.checked);
      // 检查单位全选和选中条数
      this.handleFatherChoose(this.treeData.org)
      
      this.defaultChooseUnit()
    },
    // 选择常用组弹框
    handleChooseGroup() {
      let obj = this.dialogGroup.groupary.find(item => item.id == this.dialogGroup.value)
      this.handleUpdate(this.dialogGroup.value, obj.children, () => {
        this.dialogGroup.visible = false;
      })
    },
    // 常用组 确定弹框
    async handleOk() {
      this.handleUpdate(this.dialog.groupId, this.dialog.chooseAry, () => {
        this.dialog.visible = false;
        this.handleGetGroupData()
      })
    },
    // 弹框删除
    handleDialogDelete(index) {
      this.dialog.chooseAry.splice(index, 1)
    },
    // 选择全部
    handleChooseAll() {
      this.handleTreeAddTreeData(this.treeData.zsdwGroup, {check: true});

      this.handleTreeAddTreeData(this.treeData.org, {check: true})
      // 检查单位全选和选中条数
      this.handleFatherChoose(this.treeData.org)
      
      this.defaultChooseUnit()
    },
    // 清除全部
    handleDeleteAll() {
      this.handleTreeAddTreeData(this.treeData.zsdwGroup, {check: false});

      this.handleTreeAddTreeData(this.treeData.org, {check: false})
      this.defaultChooseUnit()
    },
    // 弹框
    handleShowDialog(item) {
      this.dialog.visible = true;
      this.dialog.title = item.name;
      this.dialog.groupId = item.id;
      this.dialog.chooseAry = JSON.parse(JSON.stringify(item.children));
    },
    // 删除已选单位
    hadnleDelectUnit(item, index) {
      this.chooseUnit.splice(index, 1)
      // 单位取消选中
      this.handleTreeAddTreeData(this.treeData.org, {chooseId: item.id, targetflag: false })
       // 检查单位全选和选中条数
       this.handleFatherChoose(this.treeData.org)
       // 检查常用组选中
       this.handleTreeAddTreeData(this.treeData.zsdwGroup, {chooseId: item.id, targetflag: false })
       this.handleCheckGroupChoose(this.treeData.zsdwGroup)
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
      window.IDM.setStyleToPageHead(this.moduleObject.id + " .selectunit", styleObject);
    },
    // 选中常用组
    handleAddGroup(e, item) {
      if (item.children?.length > 0) {
        item.children.forEach(k => k.check = true)
        let chooseIdAry = item.children.map(item => item.id)
        // 选中单位复选框
        this.handleTreeChoose(this.treeData.org, chooseIdAry, e.target.checked);
        // 检查单位全选和选中条数
        this.handleFatherChoose(this.treeData.org);
        // 检查常用组其他是否选中
        this.handleTreeChoose(this.treeData.zsdwGroup, chooseIdAry, e.target.checked);
        this.handleCheckGroupChoose(this.treeData.zsdwGroup)
        
        this.defaultChooseUnit()
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
    // org 选中数据
    handleTreeChoose(tree, chooseIdAry, chooseType) {
      if (tree && tree.length>0) {
        tree.forEach(item => {
          if (chooseIdAry.includes(item.id)) {
            if(item.attrs.noselect && item.children?.length==0) {
            } else {
              item.check = chooseType
            }
          }
          item.children?.length > 0 && this.handleTreeChoose(item.children, chooseIdAry, chooseType)
        })
      }
    },
    // 全选单位
    handleAllCheck(e, item) {
      if (item.children?.length > 0) {
        item.children.forEach(item => item.check = e.target.checked)
        item.chooseNum = e.target.checked ? item.children.length : 0
        this.defaultChooseUnit()
      }
    },
    // 选中单位
    handleCheck(item) {
      let fatherobj = this.handleTreeGetChooseId(this.treeData.org, item.pid)
      let chooseTrueCheck = fatherobj.children.filter(item => item.check)
      fatherobj.check = fatherobj.children.length == chooseTrueCheck.length
      fatherobj.chooseNum = chooseTrueCheck.length

      // 检查常用组选中
      this.handleTreeAddTreeData(this.treeData.zsdwGroup, {chooseId: item.id, targetflag: item.check })
      this.handleCheckGroupChoose(this.treeData.zsdwGroup)

      this.defaultChooseUnit()
    },
    defaultChooseUnit() {
      let alyChoose = this.getTreeCheckData(this.treeData.org)
      this.chooseUnit = alyChoose
    },
    // 获取选中树节点数据
    getTreeCheckData(tree, select=[]) {
      if (tree && tree.length>0) {
        tree.forEach(item => {
          (item.check && item.children.length==0) && select.push(item)
          if (item.children?.length > 0) {
            return this.getTreeCheckData(item.children, select)
          }
        })
        return select
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
            if (item.attrs.noselect && item.children?.length==0) {
            } else {
              item.check = check;
            }
            item.chooseNum = 0;
          }
          item.children?.length > 0 && this.handleTreeAddTreeData(item.children, params)
        })
      }
    },
    // 获取id 对应数据
    handleTreeGetChooseId(tree, chooseId) {
      let chooseobj = {}
      if (tree && tree.length>0) {
        tree.forEach(item => {
          if (chooseId == item.id) {
            chooseobj = item
          }
          return item.children?.length > 0 && this.handleTreeGetChooseId(item.children, chooseId)
        })
      }
      return chooseobj
    },
    // 确定按钮
    handleSure() {
      if (this.chooseUnit.length <= 0) {
        message.error('请选择需要发送的单位！')
        return
      }
      this.chooseUnit.forEach(item => delete item.children)
      let params = {
        // 单位
        chooseUnit: this.chooseUnit,
        // 文件
        chooseFile: this.chooseFile.filter(item => item.checkboxItem),
        // 附件
        chooseRelationFile: this.fileLib.filter(item => item.checkboxItem)
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
    // 处理数据 常用组、单位数据
    hanldeData(data) {
      this.handleTreeAddTreeData(data.org, {check: false})
      this.handleTreeAddTreeData(data.zsdwGroup, {check: false})
      data.org.forEach(item => {
        item.foldtype = true
      })
      this.treeData = data
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
        data.forEach(item => {
          item.checkboxItem = false
        })
        this.chooseFile = data
      }
    },
    getMockData() {
      //  常用组、单位数据
      this.hanldeData(handleUnitData())
      // 附件
      this.handleFileListData(handleUnitAtta())
      // 文件数据
      this.handleDataFile(handleUnitFileData())
    },

    // 接口参数
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
    // 获取常用组和单位数据
    async handleGetGroupData() {
      const params = this.handleParamsFunc()
      this.loading = true;
      let unitRes = await API.ApiExchangeList(params)
      if (unitRes.code == '200') {
        this.loading = false;
        this.hanldeData(unitRes.data);
        this.handleDataBack()
      } else {
        this.loading = false;
      }
    },

    // 回显数据 org
    handleDataBack() {
      if (this.chooseUnit?.length > 0) {
        let chooseIdAry = this.chooseUnit.map(item => item.id)
        // 选中单位复选框
        this.handleTreeChoose(this.treeData.org, chooseIdAry, true);
        // 检查单位全选和选中条数
        this.handleFatherChoose(this.treeData.org)

        // 检查常用组选中
        this.handleTreeChoose(this.treeData.zsdwGroup, chooseIdAry, true)
        this.handleCheckGroupChoose(this.treeData.zsdwGroup)
        
        this.defaultChooseUnit()
      }

      if (this.moduleObject.env !== 'production') {
        let params = {
          ids: ",230729190259ierAg1NWmdClVxayyGG,2304241611407jknbFQF0TF9WWP2e98,2307291902598W4QioooBGNlWFOQzTL",
          text: ",市政府办公厅,市经济信息化委,市科委"
        }
        this.hanldeReply(params)
        return
      }
      let params = this.handleParamsFunc();
      this.hanldeReply(params.initData)
    },
    hanldeReply(data) {
      if (data && data.ids) {
        let chooseIdAry = data.ids.split(',')
        // 选中单位复选框
        this.handleTreeChoose(this.treeData.org, chooseIdAry, true);
        // 检查单位全选和选中条数
        this.handleFatherChoose(this.treeData.org)

        // 检查常用组选中
        this.handleTreeChoose(this.treeData.zsdwGroup, chooseIdAry, true)
        this.handleCheckGroupChoose(this.treeData.zsdwGroup)
        
        this.defaultChooseUnit()
      }
    },
    async initData() {
      // if (this.moduleObject.env !== 'production') {
      //   this.getMockData()
      //   return
      // }

      // 获取单位和常用组
      const params = this.handleParamsFunc()
      // if (this.propData.dataSourceForm) {
      //   IDM.datasource.request(this.propData.dataSourceForm[0]?.id, {
      //     moduleObject: this.moduleObject,
      //     ...params,
      //     }, (data) => {
      //       this.hanldeData(data)
      //   })
      // }
      this.handleGetGroupData();
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
.dialog-group-ul{
  display: flex;
  flex-wrap: wrap;
  // height: calc(100% - 50px);
  max-height: 300px;
  padding: 10px;
  overflow-y: auto;
  border: 0;
  margin-bottom: 10px;
  .dialog-group-li{
    display: flex;
    align-items: center;
    height: 24px;
    min-width: 24px;
    padding: 4px;
    margin: 5px 10px 5px 0px;
    background-color: #f4f4f4;
    border: 1px solid rgba(229, 229, 229, 1);
    border-radius: 2px;
    font-family: PingFangSC-Regular;
    color: #333333;
    img{
      cursor: pointer;
      padding: 0 7px;
    }
  }
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
.dialog-radio{
  width: 100%;
  font-size: 16px;
  margin-bottom: 10px;
}
.selectunit{
  position: relative;
  .select-border{
    border: 1px solid #e6e6e6;
  }
  /*
  * 滚动条设置
  */
  .select-content::-webkit-scrollbar {
    width: 6px;
    height: 6px;
  }
  .select-content::-webkit-scrollbar-thumb {
    background-color: rgba(0, 0, 0, 0.1);
  }
  .select-content::-webkit-scrollbar-track-piece {
    border-radius: 6px;
    background-color: rgba(0, 0, 0, 0.1);
  }
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
  .font16{
    font-size: 16px;
    font-family: PingFangSC-Regular;
    color: #333;
  }
  .mbl10{
    margin-bottom: 10px;
  }
  .disflex{
    display: flex;
    align-items: center;
    line-height: 1;
  }
  .colorblue{
    color: #0086d9;
  }
  ::v-deep .ant-checkbox-inner{
    width: 18px;
    height: 18px;
  }
  .chooseunit{
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding-left: 24px;
    height: 70px;
    line-height: 70px;
    .select-all{
      display: flex;
      align-items: center;
      height: 40px;
      padding: 0 10px;
      margin-right: 10px;
      background-color: #eee;
      border-radius: 4px;
      font-size: 14px;
      .image{
        width: 16px;
        height: 16px;
        margin-right: 5px;
        background: url('../assets//file.png');
        background-repeat: no-repeat;
        background-size: 100% 100%;
      }
    }
    .select-input{
      height: 40px;
      width: 198px;
      margin-right: 10px;
      display: flex;
      input{
        width: 100%;
        height: 100%;
        box-sizing: border-box;
        border: 1px solid #cccccc;
        border-radius: 2px;
        outline: none;
        padding-left: 10px;
      }
      input:focus{
        outline: none;
      }
    }
    .select-search-div{
      max-width: 290px;
      top: 55px;
      display: block;
      max-height: 400px;
      min-width: 198px;
      padding: 5px;
      margin-top: 2px;
      overflow: auto;
      box-sizing: border-box;
      border: 1px solid #e4e5e9;
      box-shadow: 0px 0px 3px #e4e5e9;
      background-color: #ffffff;
      position: absolute;
      z-index: 9999;
      .search-li{
        text-align: left;
        cursor: pointer;
        line-height: 25px;
        font-size: 14px;
        width: auto;
        white-space: nowrap;
        color: #333;
      }
      .checked{
        color: #d2d2d2;
      }
    }
    .btn{
      padding: 0 24px;
      height: 40px;
      line-height: 40px;
      font-size: 16px;
      color: #333;
      border: 1px solid #cccccc;
      border-radius: 2px;
      cursor: pointer;
    }
  }
  
  .select-content{
    overflow-y: auto;
    padding-right: 3px;
    .select-ul{
      display: flex;
      flex-wrap: wrap;
      max-height: 81%;
      padding: 10px 24px;
      margin-bottom: 10px;
      background-color: #eee;
      border: 1px solid #cccccc;
      .select-label{
        display: flex;
        align-items: center;
        height: 24px;
        min-width: 24px;
        padding: 3px 4px 4px;
        margin: 5px 10px 5px 0px;
        background-color: #f4f4f4;
        border: 1px solid #e5e5e5;
        border-radius: 2px;
        font-family: PingFangSC-Regular;
        font-size: 14px;
        color: #333333;
        box-sizing: border-box;
      }
      .select-delete{
        display: flex;
        align-items: center;
        justify-content: center;
        cursor: pointer;
        width: 23px;
        height: 100%;
        color: #999;
      }
    }
    .select-show-more{
      display: inline-block;
      flex-grow: 0;
      flex-shrink: 1;
      flex-basis: 8px;
      width: 8px;
      height: 13px;
      background-image: url('../assets/right.png');
      background-repeat: no-repeat;
      background-size: 8px 13px;
      // margin: 0 5px;
      cursor: pointer;
    }
    .select-groups{
      .select-border+.select-border{
        margin-top: 10px;
      }
      ::v-deep .ant-checkbox + span{
        width: calc(100% - 18px);
      }
    }
    .select-top{
      display: flex;
      justify-content: space-between;
      align-items: center;
      height: 48px;
      padding-right: 15px;
      background-color: #f9fcfe;
      border-bottom: 1px solid #e6e6e6;
      .left{
        margin-left: 19px;
        .show{
          width: 12px;
          height: 6px;
          background-image: url('../assets/show.png');
          background-repeat: no-repeat;
          background-size: 100% 100%;
          cursor: pointer;
        }
        span{
          font-size: 16px;
          color: #333;
          margin: 0 20px 0 8px;
        }
      }
      .right{
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
    .select-unit-content{
      width: 100%;
      padding: 16px 16px 0px 16px;
      display: flex;
      flex-wrap: wrap;
    }
    .select-item{
      display: flex;
      align-items: center;
      font-family: PingFangSC-Regular;
      font-size: 14px;
      color: #333333;
      letter-spacing: 0;
      line-height: 16px;
      font-weight: 400;
      width: calc(20% - 5px);
      margin-right: 5px;
      margin-bottom: 16px;
    }
    .select-check-common{
      // width: 100%;
      display: flex;
      align-items: center;
      ::v-deep .ant-checkbox + span{
        display: flex;
        align-items: center;
        // max-width: calc(100% - 20px);
      }
    }
    .select-check{
      width: 100%;
      display: flex;
      align-items: center;
    }
    .select-item-name{
      color: #333;
      width: 100%;
      flex: 1;
      display: inline-block;
      cursor: pointer;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }
    .select-item-nameno{
      color: #999;
      cursor: not-allowed;
    }
  }
  .select-filecontainer{
    margin-top: 10px;
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
  .select-btnall{
    display: flex;
    align-items: center;
    justify-content: flex-end;
    height: 50px;
    margin-top: 10px;
    position: absolute;
    button{
      height: 40px;
    }
    button+button{
      margin-left: 10px;
    }
  }
}
</style>

