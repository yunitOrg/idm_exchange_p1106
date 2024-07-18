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
          <div class="record-title pd10">档号规则</div>
          <div class="pd10">
            <div class="record-input">
              <a-textarea v-model="recordField" :rows="6" @blur="handleBlur"></a-textarea>
            </div>
            <div class="mt20">
              <span>预览：{{ previewFiled }}</span>
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
              <a-button @click="handleDel">删除变量</a-button>
              <a-button class="ml10" @click="hanldeAddField">新增自定义变量</a-button>
            </div>
          </div>
          <div class="record-tree pdall">
            <div class="record-tree-ul" v-for="(item, index) in recordList" :key="index">
              <div class="record-tree-li" @click="handleShow(item)">
                <svg-icon iconClass="arrow" :class="item.isShow ? 'recordDown' : 'recordUp'"></svg-icon>
                {{ item.text }}
              </div>
              <div class="record-tree-box" v-show="item.isShow">
                <div v-for="(subitem, subindex) in item.children" :key="subindex" >
                  <template v-if="item.value == 2">
                    <a-radio v-model="subitem.check" @change="(e) => handleRadio(e, subitem)"></a-radio>
                  </template>
                  <span @click="handleChoose(subitem)">{{ subitem.text }}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      <div class="textright mt20">
        <a-button type="primary" class="recordbtn" @click="handleSendParams">确定</a-button>
        <a-button class="recordbtn ml10" @click="handleCloseDialog">取消</a-button>
      </div>
      <!--新增变量-->
      <a-modal v-model="dialog.visibile"
        title="新增自定义变量"
        @ok="handleOk"
        okText="确定"
        cancelText="取消"
      >
        <a-form-model ref="ruleForm" :model="form" :rules="rules" :label-col="dialog.labelCol" :wrapper-col="dialog.wrapperCol">
          <a-form-model-item label="变量名称：" prop="variableName">
            <a-input v-model="form.variableName" placeholder="请输入变量名称"></a-input>
          </a-form-model-item>
          <a-form-model-item label="变量类型：" prop="radio">
            <a-radio-group v-model="form.radio">
              <a-radio :value="item.value" v-for="(item, index) in dialog.ary" :key="index">{{ item.label }}</a-radio>
            </a-radio-group>
          </a-form-model-item>
          <a-form-model-item label="默认值：" prop="defaultValue">
            <a-input v-model="form.defaultValue" placeholder="请输入默认值"></a-input>
          </a-form-model-item>
        </a-form-model>
      </a-modal>
      <!--件号-->
      <a-modal
        v-model="jiandialog.visibile"
        title="件号"
        okText="确定"
        width="400px"
        @ok="handleJianOk"
        cancelText="取消">
        <a-form-model ref="jianrule" :model="jianform" :rules="jianrules" :label-col="dialog.labelCol" :wrapper-col="dialog.wrapperCol">
          <a-form-model-item label="位数：" prop="name">
            <a-input-number style="width:300px" :max="6" v-model="jianform.name" placeholder="请输入位数"></a-input-number>
          </a-form-model-item>
        </a-form-model>
      </a-modal>
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
      // 变量
      recordList: [],
      recordListAry: [],
      //件号
      jiandialog: {
        visibile: false
      },
      // 弹框
      dialog:{
        visibile: false,
        ary: [{label: '数字', value: 1},{label: '文本', value: 2}],
        labelCol: { span: 4 },
        wrapperCol: { span: 14 }
      },
      form: {
        variableName: '',
        radio: 1,
        defaultValue: ''
      },
      jianform: {
        name: ''
      },
      jianrules: {
        name: [{ required: true, message: '请输入位数', trigger: 'blur' }],
      },
      rules: {
        variableName: [{ required: true, message: '请输入变量名称', trigger: 'blur' }],
        radio: [{ required: true, message: '请选择变量类型', trigger: 'change' }],
        defaultValue: [{ required: true, message: '请输入默认值', trigger: 'blur' }],
      },
      sureObj: {},
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
  computed: {
    previewFiled() {
      const regex = /\{(.*?)\}/g;
      return this.recordField.replace(regex, (val) => {
        let name = val.slice(1, -1);
        if (name.indexOf('件号') > -1) {
          let k = name.split(',')[1];
          if (k) {
            return Array.from({length:parseFloat(k)}, () => '0').join('')
          }
        }
        return this.recordListAry.find(item => item.text == name) == undefined ? val : this.recordListAry.find(item => item.text == name)?.defaultValue
      })
    }
  },
  mounted() {
    this.moduleObject = this.$root.moduleObject;
    this.init();
  },
  methods: {
    // 单选框
    handleRadio(e, item) {
      let ary = this.recordList.find(item => item.value == 2).children;
      ary.forEach(item => item.check = false);
      item.check = true;
    },
    // 删除变量
    async handleDel() {
      let ary = this.recordList.find(item => item.value == 2).children
      if (ary && ary.length > 0) {
        let chooseAry = ary.filter(item => item.check)
        if (chooseAry && chooseAry.length > 0) {
          let res = await API.ApiRecordDelete({ variableName: chooseAry[0]?.text });
          if (res.code == '200') {
            this.$message.success(res.message);
            this.initData()
          } else {
            this.$message.error(res.message);
          }
        } else {
          this.$message.error('请选择自定义变量')
        }
      }
    },
    // 新增变量
    hanldeAddField() {
      this.form.variableName = '';
      this.form.radio = 1;
      this.form.defaultValue = '';
      this.dialog.visibile = true;
      this.$refs.ruleForm?.resetFields();
    },
    handleJianOk() {
      this.$refs.jianrule.validate(valid => {
        if (valid) {
          this.addVar({text: `件号,${this.jianform.name}`}, () => {
            this.jiandialog.visibile = false;
          });
        } else {
          return false
        }
      })
    },
    handleOk() {
      this.$refs.ruleForm.validate(valid => {
        if (valid) {
          this.hanldeAddFile()
        } else {
          return false
        }
      })
    },
    // 新增自定义变量
    async hanldeAddFile() {
      let obj = {
        variableType: this.form.radio,
        variableTypeText: this.dialog.ary.find(item => item.value = this.form.radio).label,
        variableName: this.form.variableName,
        defaultValue: this.form.defaultValue
      }
      let res = await API.ApiRecordAdd(obj)
      if (res.code == '200') {
        this.$message.success(res.message);
        this.dialog.visibile = false;
        this.initData()
      } else {
        this.$message.error(res.message);
        this.dialog.visibile = false;
      }
    },
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
      if (item.text == '件号') { // 件号
        this.jiandialog.visibile = true;
        this.$refs.jianrule?.resetFields();
        return
      }
      this.addVar(item)
    },
    addVar(item, fn) {
      let str = `{${item.text}}`;
      if (this.recordField == undefined) {
        this.recordField = str;
      } else {
        let start = this.recordField.substring(0, this.cursorPos || 0),
          end = this.recordField.substring(this.cursorPos || 0);
        this.recordField = `${start}${str}${end}`;
      }
      this.cursorPos = this.cursorPos + str.length;
      fn && fn()
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
      this.recordListAry = [];
      let res = await API.ApiRecordList()
      if (res.code == '200') {
        let ary = res.data || [];
        ary.forEach((item, index) => {
          item.isShow = index == 0;
          if (item.children && item.children.length > 0) {
            item.children.forEach(k => {
              k.check = false;
              this.recordListAry.push(k);
            })
          }
        })
        this.recordList = ary;
      }
    },
    // URL 参数
    handleParamsFunc() {
      return IDM.url.queryObject()
    },
    checkPage() {
      this.sureObj = this.handleParamsFunc();
      if (this.sureObj.archiveRule) {
        this.recordField = decodeURIComponent(this.sureObj.archiveRule);
      }
    },
    // 取消按钮
    handleCloseDialog() {
      try{
        // parent && parent[0][0][0].closeIdmWindow()
        top.openInnerViewWindow.closeIdmWindow()
      } catch(e) {
        console.log('取消按钮报错', e)
      }
    },
    // 确定按钮
    handleSendParams() {
      try{
        top.openInnerViewWindow.loadParentData(this.recordField, this.sureObj.subTrIndex, this.sureObj.metaId) // 调用dsf方法初始化
      } catch(e) {
        console.log('确定按钮报错', e)
      }
    },
    init() {
      this.checkPage();
      this.handleStyle();
      this.initData();
    }
  }
}
</script>

<style lang="scss" scoped>
.recordrule-wrap{
  font-size: 16px;
  color: #333;
  .textright{
    text-align: right;
  }
  .recordrule{
    display: flex;
    border: 1px solid #e8e8e8;
  }
  .recordbtn{
    width: 80px;
    height: 40px;
    font-size: 16px;
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
  .recordDown{
    transform: rotate(0deg);
  }
  .recordUp{
    transform: rotate(-94deg);
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
      span:active{
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
