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
    <div class="selectunit">
      <div class="chooseunit">
        <div class="font16">已选单位：</div>
        <div class="disflex">
          <div class="select-all">
            <div class="image"></div>
            已选： <span class="colorblue">60条</span>
          </div>
          <div class="select-input">
            <input checked type="text">
          </div>
          <div class="btn">重置</div>
        </div>
      </div>
      <div class="select-content" :style="{height: propData.contentHeight}">
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
              <div class="show"></div>
              <span >常用组</span>
              <div>
                <a-checkbox @change="onChange">
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
          <div class="select-unit-content">
            <div class="select-item" v-for="(item, index) in treeData.zsdwGroup" :key="index">
              <a-checkbox v-model="item.check" class="select-check-common">
                <span class="select-item-name">{{ item.name }}</span>
              </a-checkbox>
              <div class="select-show-more" @click.stop="handleShowDialog(item)"></div>
            </div>
          </div>
        </div>
        <!--循环组-->
        <div class="select-groups">
          <div class="select-border" v-for="(item, index) in treeData.org" :key="index">
            <div class="select-top">
              <div class="left disflex">
                <div class="show"></div>
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
            <div class="select-unit-content">
              <div class="select-item" v-for="(subitem, subindex) in item.children" :key="subindex">
                <a-checkbox v-model="subitem.check" class="select-check" @change="(e) => handleCheck(e, subitem)">
                  <span class="select-item-name">{{ subitem.name }}</span>
                </a-checkbox>
              </div>
            </div>
          </div>
        </div>
      </div>
      <div class="select-foot">
        <div class="select-footbox">
          <div class="foot-box">
            <a-checkbox v-model="dingban">
              定稿版式
            </a-checkbox>
          </div>
          <div class="foot-file" v-for="(item, index) in chooseFile" :key="index">
            {{ item.fileName }}
          </div>
        </div>
      </div>
      <div class="select-btnall">
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
import { handleUnitData, handleUnitFileData } from '../utils/mock'
import { message } from 'ant-design-vue';
message.config({
  top: '50%'
})
export default {
  name: 'ISelectUnit',
  data() {
    return {
      chooseUnit: [],
      dingban: true,
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
      // 文件数据
      chooseFile: [],
      // 所有数据
      treeData: {},
      propData: this.$root.propData.compositeAttr || {
        height: '809px',
        contentHeight: 'calc(100% - 204px)',
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
        message.success(res.message)
        this.dialogCreategroup.visible = false;
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
      }
    },
    // 选择常用组弹框
    handleChooseGroup() {
      let obj = this.dialogGroup.groupary.find(item => item.id == this.dialogGroup.value)
      this.handleUpdate(this.dialogGroup.value, obj.children, () => {
        this.dialogGroup.visible = false;
      })
    },
    // 确定弹框
    async handleOk() {
      this.handleUpdate(this.dialog.groupId, this.dialog.chooseAry)
    },
    // 弹框删除
    handleDialogDelete(index) {
      this.dialog.chooseAry.splice(index, 1)
    },
    // 选择全部
    handleChooseAll() {
      this.handleTreeAddTreeData(this.treeData.org, {check: true})
      this.defaultChooseUnit()
    },
    // 清除全部
    handleDeleteAll() {
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
    // 删除单位
    hadnleDelectUnit(item, index) {
      this.chooseUnit.splice(index, 1)
      this.handleTreeAddTreeData(this.treeData.org, {chooseId: item.id, targetflag: false })
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
    // 全选单位
    handleAllCheck(e, item) {
      if (item.children?.length > 0) {
        item.children.forEach(item => item.check = e.target.checked)
        item.chooseNum = e.target.checked ? item.children.length : 0
        this.defaultChooseUnit()
      }
    },
    // 选中单位
    handleCheck(e, item) {
      let fatherobj = this.handleTreeGetChooseId(this.treeData.org, item.pid)
      let chooseTrueCheck = fatherobj.children.filter(item => item.check)
      fatherobj.check = fatherobj.children.length == chooseTrueCheck.length
      fatherobj.chooseNum = chooseTrueCheck.length
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
          (item.check && item.pid!=0) && select.push(item)
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
            item.check = check;
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
      let params = {
        chooseUnit: this.chooseUnit,
        chooseFile: [{id: '240605104000KVAuUKJj7D0pknMUSeq', fileName: 'DreamBOS发布说明.pdf' }],
        chooseRelationFile: [{id: '2406201339323yYaqNio20hHWiHS6M4', fileName: '关于开展上海市“十四五”规划实施初期评估工作的批复.doc'}]
      }
      if (this.propData.handleSureBtnFunc && this.propData.handleSureBtnFunc.length > 0) {
        let name = this.propData.handleSureBtnFunc[0].name
        window[name] && window[name].call(this, {
          _this: this,
          params: params
        });
      }
    },
    // 处理数据
    hanldeData(data) {
      this.handleTreeAddTreeData(data.org, {check: false})
      this.handleTreeAddTreeData(data.zsdwGroup, {check: false})
      this.treeData = data
    },
    getMockData() {
      //  常用组、单位数据
      let data = handleUnitData()
      this.hanldeData(data)
      // 文件数据
      this.chooseFile = handleUnitFileData()
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
    async initData() {
      if (this.moduleObject.env !== 'production') {
        this.getMockData()
        return
      }
      const params = this.handleParamsFunc()
      if (this.propData.dataSourceForm) {
        IDM.datasource.request(this.propData.dataSourceForm[0]?.id, {
          moduleObject: this.moduleObject,
          ...params,
          }, (data) => {
            this.hanldeData(data)
        })
      }
      let res = await API.ApiUnitExchangeList(params)
      if (res.code == '200') {
        let data = res.data;
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
.dialog-radio{
  width: 100%;
  font-size: 16px;
  margin-bottom: 10px;
}
.selectunit{
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
    .btn{
      padding: 0 24px;
      height: 40px;
      line-height: 40px;
      font-size: 16px;
      color: #333;
      border: 1px solid #cccccc;
      border-radius: 2px;
    }
  }
  
  .select-content{
    overflow-y: auto;
    padding-right: 3px;
    margin-bottom: 10px;
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
  }
  .select-foot{
    max-height: 126px;
    border: 1px solid #e6e6e6;
    margin-bottom: 10px;
    padding: 0px 16px 0px 16px;
    
    .select-footbox{
      display: flex;
      margin: 16px 0px 16px 0px;
      .foot-file+.foot-file{
        margin-left: 10px;
      }
    }
    .foot-box{
      color: #333;
      margin-right: 38px;
    }
  }
  .select-btnall{
    display: flex;
    align-items: center;
    justify-content: flex-end;
    height: 50px;
    button{
      height: 40px;
    }
    button+button{
      margin-left: 10px;
    }
  }
}
</style>

