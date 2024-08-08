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
                //   logName: 'HlpxBlUMCjPDKM2FrTB1mQfxnX9xqKI3jCHTuSBrvNcoZalfNhEtBV8zXZIGMEuH/wDeKdjEWbPb+A3vU74UlUO6oUGtAX7Y8CY8yPhWSngSySmB53ghQeHi/NXsWORtmppN7t/d1hA15NOPVJ0OTGGef/4mD57IHQkdn3RRRyU=',
                //   password: 'MKvYCRn73cOsQvMiZBzHMB5c9/Gs9f8U9soT5laD3IwYyxx2Tgf89RB+19eIOa6SKLrVzsECOJCXt9MTH/49nbZAqYSArhkvPQcZ07BJRuxCgjxsmy6eSi2t4V8SWpm6J3fmXOrdogeMA+EgJdodzT5ijQkz8RHbMnZY+H2FKQ4=',
                //   verifyCode: 1,
                //   // unitId: '1912121746591gjCGWEyAnixZD052E9',
                //   verifyCodeKey: '240807174507EeScdB6hg4cLtYny8jn',
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
