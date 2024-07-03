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
                //   logName: 'M5f0fr4WWCRjVFPP66mZgt8+GZqvcJyfY3LjQ8mXCdnyT8uhssfCUZcnMBCUBnFKflA0VxWMeHmwS3LQCoOD9OseFTdChFju90nVJc1Ys9R9frSqEk7aqT4tcZeQnRHjN9DQGn6444A3I6KDnMkmyDFXKk/6jcMeTTd7u9HwMYw=',
                //   password: 'mVImgwoyyuNpI21wuRK5h46mtnISbc/NRK6n2H2aewqlwU2CUGM5Q01/Wv3V3OJJmcLnIiFcOWpJzfg65Dpt5psBhwzDUg0+dZ+Zp2kD379GkX5RlDBXJpMtk4wDqmDvXKpNeSRSrxljxXEtPvedNrsWNj4R5zM25TUv6C3OEEg=',
                //   verifyCode: 1,
                //   // unitId: '1912121746591gjCGWEyAnixZD052E9',
                //   verifyCodeKey: '240702171952RLIR99p0lY2orkrj6By',
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
