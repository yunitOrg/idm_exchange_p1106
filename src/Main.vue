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
                //   logName: 'YU4AoMPXsYPyszEzjVahOXK1YWZ8NXeZ7N7CaTGyio0TKGXRkUkyvNRBeqwe/T1MR90AXYkfGO4q3je6ehBJR8r4cuMt1wr33O66D+IVZ2DaEAFc4Wugjlf43anJL/Yg9HCvsd1oFEiOoac1QPKwE27BUs6s3fZctMbk83U8P9s=',
                //   password: 'esG2tLuZf9BYIL/wyb/z3EKZ2lOYHplt9TtLwRzsWWbkzEavqQB9ekZV39O1QRL328grricRsfmd1GbZ7nNzTreziqqHT2UwWIITC8hVDQc5pl6I8LB1NRQcjkWbVGP9QC0oRm0K57kM8V7eHN0QpRoyR3PNR0E/JyZW6ToI4m4=',
                //   verifyCode: 1,
                //   // unitId: '1912121746591gjCGWEyAnixZD052E9',
                //   verifyCodeKey: '240730145908zQc9h3UNybM7ukcTved',
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
