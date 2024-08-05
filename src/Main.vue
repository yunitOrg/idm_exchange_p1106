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
                //   logName: 'PV11lZNR6YCca2OfBfWGl70QSguG/cGFi5kMisoiRQhdWXJyeKP8uESGlup/sJjtbz//z+MBkiK6KSXE8ypOYYYSe7009LiBvhu/3hrrk5bo2eBVtC0Jj/usioWLbUCV8yN/BfrJnMZwGdNGdxXdYePWz9FEKcPhstHuWY1DkKQ=',
                //   password: 'eHiwhSBs2iVUjY8PGuBC28a40j2m+ya+CvjiPiJddqlB0SNQUgBsFqs/wpBHQK77QccksueitQ3dPw/zqsreODLjVQpKIvEguzksIH2JDqeRXj7J6ixUoSIjecpvhmtBIytkPOd1n7F3Np2ifs/NuSlavztxkRUlicixdwWzP8E=',
                //   verifyCode: 1,
                //   // unitId: '1912121746591gjCGWEyAnixZD052E9',
                //   verifyCodeKey: '240805152448HbkAdnV00BTvaD2uYM9',
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
