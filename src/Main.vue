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
                //   logName: 'i5YAG7vF8h9L8S0yRDqtXtpRpWE274bHqf9nBmjP0AA+d+2+5g5gPxA9xuAf7vZmjSl969gtwmoCMA80SngaksdLzC+TJivCiK1G7pCXIef9VuI7+nqoRuUF6pVWfVFaD/X5NVhCA64vclEe/2OvjJYo14Zk0iZyF/DgEhPVuqM=',
                //   password: 'cXOwsiZFEpNJ1128vTQS9Mo9il7m1wFf8PFOZYyvRCLqtIwkndE4qUgucUxp135XftjCnQACfxHHvmqDzxlv2nxTnSuG0yfTAcvuv7vlukHoAYO0Nd3YO/zYoFSvHlnGhsa4O9Jcno10//Mqo/uolSt3Jx2N90xKs1mj5noZVck=',
                //   verifyCode: 1,
                //   // unitId: '1912121746591gjCGWEyAnixZD052E9',
                //   verifyCodeKey: '240827104917HDdAe3NBdO3PitM2gpU',
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
