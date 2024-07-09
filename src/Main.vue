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
                //   logName: 'Mq8xDzobcp79+edBfpEHS3S5Z0XVwsn+VXCZksuKP73rJBjOKb/WTxrYDtYIXCmiEI9PJajt5NPvvSH4l5Kq33p3h1RszZi0ZCjBJOJUHxUMB6TVG4bvx3u5lADIjG7sP/OXoUtMHCOlEoIqbbcmVgbv1DPGMu9GDdi4EicFpww=',
                //   password: 'fKUfOnXVz5lmzQiHqpLjEFsW/sQGG6eTl5X4/WLPpITJ7nr3JLqP8X2qEYPk3cXvEwEzmEOMKIQcOKZBKtgQDm20fxjJmXhIo1EHkiQbSB8t7uYqid7j8Hje7KmCg2jn2sc98iTRTKbBlAgSQBO1wQDLIctqhu5GA2fRksQQ9Q4=',
                //   verifyCode: 1,
                //   // unitId: '1912121746591gjCGWEyAnixZD052E9',
                //   verifyCodeKey: '240708163605kK83q4Hvp2KJZrzXQnu',
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
