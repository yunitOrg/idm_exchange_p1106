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
                //   logName: 'IZARzgywgf1ITKIOr54DAJ4hrPg/UTkF2YHrd3Dk2nruausIm3QbiXOfs0lAORYd3+zU0wwbplG+LuAFHpzn4g73+h99iMo6hMO0EJdupi2lwJibgvfRULGRHQuNUc0CSsZx7rAeYDy33RIRq7nvAtJCJ0oR0eJ/fLhhc1c6sgQ=',
                //   password: 'm0DLdtZ7RwfS/209yKC3nyFARUeNS/EYQnrVsCmed43ts7T5960j84wE9TocAbWvktKz/AKZnDqPr62EcviMx3lUHDQUh6QqQYdzzS3gobL6I20SOXtJfNHYSl9Cc6s4zLkwv7hNiAlJMJZ2HLteqGkoVdqbHQ83O61SeOrMqzA=',
                //   verifyCode: 1,
                //   // unitId: '1912121746591gjCGWEyAnixZD052E9',
                //   verifyCodeKey: '2407181413160dbbRuCUJ6OgYFdkqx7',
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
