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
                //   logName: 'IYi4bc1rAXqWQwWqndnWneMWOF4PtMWaEXeSJcVL7VmTyZwue/JgwsHe58Hqz/2OdMz1z2Qh4XmpndyH96DsXpJ19Cgthx2HM4mcPy5jqRym5y22ujt9Q5LaGB8RWAUnpgfMDRv7NNYu8cQoS26oNqVkd0kCcUOwcboQO6L3M0I=',
                //   password: 'ofSUAxTlG7V4dvE0YSjBcZHcpHbgVt5KReR+NH6mmTlsTsJUCnB2IvF9Lm4Mzzb5v4qj5/8z3v1/XFyifuiYdDc46R3/Dd8sb8IHs7mXro3azm8dsHQCaZ4MZkyKh/+qyGeA6cVrliS/s9pMX2/UezR/AMrQaM3xtifGZkEB08s=',
                //   verifyCode: 1,
                //   // unitId: '1912121746591gjCGWEyAnixZD052E9',
                //   verifyCodeKey: '2407011413431Pkg7wjzCTeIxY2UKrd',
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
