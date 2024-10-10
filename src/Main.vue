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
                //   logName: 'WbWKl3YAUVK+ZUSpEH0c0/2Lb/cImWu6WMbJyRlOBJ+wg1Cd+ikutyKO1PHDwGiZrg3ohe6NGHz407lzVFrjx+XkcAPoGZSegBRYmtKSwPs4mUDs99TVmryYOY4s4bZr6U2KGw233aYA2YwFOHMI6VBHtFynEkOxV1XwZ7colx0=',
                //   password: 'iw1qsGMhtlhzb5BvTnRnco9dAiau9zSodsYJmCsruzqMxMuckXNyd8tWoAat/Xy8iRuH95NY6FNWAO2UNitRByGsp3BEb2oUHDKe50RW/9DtbIDdqKS5RSzlGpZC5WY6EKmbv9JtxEETr7gyKX8BY4/mzIuWryRSyTBitTJH5eo=',
                //   verifyCode: 1,
                //   // unitId: '1912121746591gjCGWEyAnixZD052E9',
                //   verifyCodeKey: '241010142329sPkjV0pPNcJYevozhPe',
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
