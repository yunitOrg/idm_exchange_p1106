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
                //   logName: 'hiH3ip+h/MtQZRh9Xf173GAbUtDGIk78W7x0zQSck/rCkIVGxaGx+4nXNuzF5WTjecVJbMRwF/0JRtmMyyvl7P5pwKiDcMImEMCENWKZoPAFQvw4saXIdQRXV4CLiQGfc40XKa3xFoh/rXHMlniLddR/TlIWjmDpCo3QxNgIWTk=',
                //   password: 'lNM332SHqecLEmRz+LZhI67C+38HZDOAa9bNr+UskcgZRcf0uai2Nj1cbLtc7lDMWseo+ZTBj4SBeYPdozKt2MnR+cdQzffeDXcSatR6OujkfuJz4pMTZkbr+3m5846xoQv1VJV/bwxvSZ261G6IyaJK/N81vFjUqFBnJXbcMQ==',
                //   verifyCode: 1,
                //   // unitId: '1912121746591gjCGWEyAnixZD052E9',
                //   verifyCodeKey: '240530153611FFX0LCX8nrssmIu7pLt',
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
