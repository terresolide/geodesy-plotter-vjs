<template>
    <div>
        <h3> Coseismic displacements from IGS
                <span class="fa button in-title" @click="expand = !expand">{{expand ? '-' : '+'}}</span>
        </h3>
        <div style="margin-left:10px;" v-show="expand">show </div>
    </div>
</template>
<script>
export default {
    name: 'IgsCoseismic',
    data () {
        return {
            expand: false
        }
    }
}
</script>