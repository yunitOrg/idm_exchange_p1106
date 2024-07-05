<template>
    <component :is="`${componentName}`" :ref="`${componentName}`" />
</template>

<script>
export default {
    name: 'Main',
    components: {},
    data() {
        return {
            componentName: '',
        }
    },
    props: {},
    created() {
        this.login()
    },
    methods: {
        login() {
            if ( process.env.NODE_ENV == "development" ) {
                // IDM.http.post('/ctrl/login', {
                //   logName: 'fXIqwLdKsyJrnYjJ5+O7VWSN6rpW42ROHWP9/yzAtRXzwtFGYLD5MiyPYRN9qnIXo1qFYMsrBtRvmo46oSTFhJEZ1yxMcbFuYBYyVkXcbQ40IdyIDRTT0B4e6RhLlzhmsfp/OCF8ICJJ0tqkqZTCJlLJfneSeWz99bLwzdCPiHM=',
                //   password: 'vSvXWGlIMB5CY7Cqcn47YDE6DT7f96h/FZ2wSNs3huvPAuhG4pHewGDFPFkVXLHq54R1bhYxE8bd5yJ4JncXL6ZnODefd3NklNfzqPjRmFcAtnLEWDVbj6lhxNrKz4+ijeC+9IByY62m6aMNmYpIvZjlVQloubUdH7vq9eNsf2k=',
                //   verifyCode: 1,
                //   // unitId: '1912121746591gjCGWEyAnixZD052E9',
                //   verifyCodeKey: '240704173040Is8zIjUXU3u4PsTApqS',
                //   w: '1920',
                //   h: '1032',
                //   decrypt: 'RSA',
                // })
            }
        }
    },
    mounted() {
        //这里需要把属性传递，并且把组件注册到核心框架提供的方法，然后这里接收固定的平台提供的几个方法，从而实现双向绑定刷新
        // alert(`${process.env.CodeVar}`)
        this.componentName = this.$root.componentName
        console.log(this.componentName)
    }
}
</script>

<style lang="scss">
@import './style/flex.scss';
</style>
