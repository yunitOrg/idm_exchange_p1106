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
                //   logName: 'okZxvxjQS4fP3W/bygvyYdJXizuU0R6kmvEhsGWtSRPcnimRduUbuDc49ejZGssNHqRR9/45fwz8OFDhLi1Rp/acD7Kr5UZns22d89as5F5H/npV8KrIMpPUAzVUr0ewFk2XOcWoNeNI3r3k6bdE6x0aX5sdeum2FFCoSQjES5Q=',
                //   password: 'c4gJqfkk+IJP4qqu1PbzZ0mmMnk9/P3eoIoKHis5BJbZHJDl3Sda4y+bBIVbihqMhnnt7p69rKtpYMF53PMlNtYktMMFS5I/W9CKyk6Fa4K9GcrfX402F9xT2OzeT+MbY+xklmp2bAONgQxUfz91IvFqMZqJ6TwWnHV/43leDco=',
                //   verifyCode: 1,
                //   // unitId: '1912121746591gjCGWEyAnixZD052E9',
                //   verifyCodeKey: '240711153649THZ6CKIWxoAmV9xw81j',
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
