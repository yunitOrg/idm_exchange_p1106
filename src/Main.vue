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
                //   logName: 'xF5abJF3g19Ax5L3EG7u6+jZm8aHB1rYNnmhpslKhKlPrf7fgNPGFN7ot2qmaHlbKmHGpo+Fnl7I5MdT3fjW/yTaEXvG/wraEjbadJ/HILVcQ9km6OzW2jgdAN8UgWaxFECVp+0uJipIXG8GHweK1SEtdin7S2mdj5KBgjOv62c=',
                //   password: 'OzSffR8nSObjmQ+wtZHtno8GD5j/CAIS6zUdfmXgLN9m7iXOwZJb5UPmfuXe5HDwBFCZnHWHi4aO8CTlS6MK/ACjNAgIDNffJgI5Ywhv5aC5txVl3uWtvUH4lJvqFL98RRuTpXDyRmnX6rG/NMTdKkzjLznJyHeekVn6Xlu0+6c=',
                //   verifyCode: 1,
                //   // unitId: '1912121746591gjCGWEyAnixZD052E9',
                //   verifyCodeKey: '240709144040XlA6WL5SPvMu3tLJZhT',
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
