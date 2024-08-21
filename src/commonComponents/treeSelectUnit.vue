<template>
  <div class="subunit">
    <template v-if="item.children">
      <div v-for="(res, index) in item.children" :key="index">
        <div class="unit-name">
          <template v-if="res.children.length > 0">
            <a-icon class="jiaicon mr5" :type="res.shrink ? 'minus' : 'plus'" @click="handleShrink(res)" />
            <template v-if="res.attrs.noselect">
              <span>{{ res.name }}</span>
            </template>
            <template v-else>
              <a-checkbox v-model="res.check" @change="(e) => handleFirstGen(res)">
                <span>{{ res.name }}</span>
              </a-checkbox>
            </template>
            <span class="namecol" @click="handleChooseALL(res)">(全选下级)</span>
          </template>
          <template v-else>
            <a-checkbox v-model="res.check" @change="(e) => handleChoose(res)" :disabled="res.attrs.noselect">
              <span :class="res.attrs.noselect&&'select-item-nameno'">{{ res.name }}</span>
            </a-checkbox>
          </template>
        </div>
        <div v-if="res.children" v-show="res.shrink">
          <treeSelectUnit :item="res"></treeSelectUnit>
        </div>
      </div>
    </template>
  </div>
</template>

<script>
export default {
  name: 'treeSelectUnit',
  props: {
    item: {
      type: Array,
      require: true
    },
  },
  inject: ['fatherRef'],
  data() {
    return {
      unitTree: []
    }
  },
  methods: {
    init(data) {
      this.unitTree = data;
    },
    handleChoose(item) {
      this.fatherRef.handleChoose(item)
    },
    handleFirstGen(item) {
      this.fatherRef.handleFirstGen(item)
    },
    // 全选下级
    handleChooseALL(item) {
      this.fatherRef.hadnleNextAllChoose(item)
    },
    handleShrink(item) {
      this.fatherRef.handleAddKeys(item)
    }
  }
}
</script>

<style lang="scss" scoped>
.mr5{
  margin-right: 5px;
}
.namecol{
  margin-left: 5px;
  color: #0a74dd !important;
  vertical-align: middle;
  font-size: 14px !important;
  cursor: pointer;
  display: none !important;
}
.subunit{
  margin-left: 20px;
  ::v-deep .ant-checkbox-inner{
    width: 18px;
    height: 18px;
  }
  span{
    line-height: 32px;
    font-size: 14px;
    color: #333;
    max-width: 250px;
    white-space: nowrap;
    display: inline-block;
    vertical-align: middle;
    overflow: hidden;
    text-overflow: ellipsis;
  }
  .unit-name{
    display: flex;
    align-items: center;
    &:hover{
      .namecol{
        display: block !important;
      }
    }
  }
  .select-item-nameno{
    color: #999;
    cursor: not-allowed;
  }
}
</style>

