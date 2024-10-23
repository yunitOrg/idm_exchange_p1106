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
                //   logName: 'cKq1hT70H2X74UWxS9nfL5WrjJ4erC7jdJCKfaPzdpbg9obHZYRuZ0limje+uNiLqfX67NquqYLrGo673EZy3O2wf/L8WRfnRV0lGMU+YGhxF1cirq1r0ncmDH2GVoHYpK7Ou6Lb6I16zzaf4T6BadUHd7086l18HV0TTS+wK/Y=',
                //   password: 'YV8cqkCNDI7e6FFqVQOSab4BLibmmwt/VuYNaWhMhsIW5qAE6CrxeqApJ/JLcWO50onFsRcDdxY5759Voz9wq1nPy6md//HEnuHNezPEffTppYfsGthlCEuJHJEbCre6Pk49r3yNJ3C7UZ+utk1/0XKp4Em3aam6i7pwy+o0EbY=',
                //   verifyCode: 1,
                //   // unitId: '1912121746591gjCGWEyAnixZD052E9',
                //   verifyCodeKey: '241023151817sRItGMC7JtBwfyK3y55',
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
