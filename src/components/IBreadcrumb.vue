<template>
    <div idm-ctrl="idm_module" :id="moduleObject.id" :idm-ctrl-id="moduleObject.id">
        <div class="flex items-center menu-list">
            <svg-icon iconClass="location" />
            <div>当前页：</div>
            <div class="flex items-center">
                <div v-for="nav in navs" :key="nav.id" class="flex items-center menu-item">
                    <div>{{ nav.menuName }}</div>
                </div>
            </div>
        </div>
    </div>
</template>
<script>
export default {
    data() {
        return {
            menus: [],
            current: null,
            moduleObject: this.$root.moduleObject,
            propData: this.$root.propData.compositeAttr || {}
        }
    },
    computed: {
        navs() {
            if (this.current == null) {
                return [
                    {
                        menuName: '首页'
                    }
                ]
            }
            return this.menus.reduce((carry, current) => {
                const subNav = current.children.find((n) => n.id == this.current.id)
                if (subNav) {
                    return [current, subNav]
                }
                if (current.id == this.current.id) {
                    return [current]
                }
                return carry.concat([])
            }, [])
        }
    },
    mounted() {
        this.initData()
    },
    methods: {
        initData() {
            window.IDM.http.get('ctrl/archive/portal/getMenuInfo').then(({ data }) => {
                this.menus = data.data.menu
            })
        },
        receiveBroadcastMessage(event) {
            console.log('IBreadcrumb receive', event)
            switch (event.type) {
                case 'addTab':
                    this.current = event.message
                    break
            }
        }
    }
}
</script>
<style lang="scss" scoped>
@use '../style/common.scss';
.menu {
    &-list {
        font-size: 16px;
        color: rgba(0, 115, 202, 1);
        padding: 5px 10px;
        > svg {
            fill: rgba(0, 115, 202, 1);
            margin-right: 10px;
        }
    }
    &-item {
        &:after {
            display: block;
            content: '/';
            color: #999;
            padding: 5px;
        }
        &:first-child {
            font-weight: bold;
        }
        &:last-child {
            &:after {
                display: none;
            }
        }
    }
}
</style>
