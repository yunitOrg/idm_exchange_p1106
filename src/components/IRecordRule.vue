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
    <div class="recordrule">
      232
    </div>
  </div>
</template>

<script>
export default {
  name: 'IRecordRule',
  data() {
    return {
      moduleObject: {},
      propData: this.$root.propData.compositeAttr || {}
    }
  },
  mounted() {
    this.moduleObject = this.$root.moduleObject;
    this.requireMount();
    this.init();
  },
  methods: {
    propDataWatchHandle(propData) {
      this.propData = propData.compositeAttr || {};
      this.init()
    },
    init() {
      console.log(1)
    }
  }
}
</script>
