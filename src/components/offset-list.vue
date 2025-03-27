<template>
    <div v-if="offsets" style="position:relative;width:450px;text-align:right;">
       
        <div v-show="show" class="offset-box"> 
            <div style="position:absolute;top:3px;right:5px;" class="close button" @click="show=false">&times;</div>
        <div style="text-align:left;font-weight:700;padding:5px 0 10px 0;">Offsets for this station and solution: <a :href="url" target="_blank">
            <font-awesome-icon icon="fa-solid fa-download"></font-awesome-icon> offset.dat</a> </div>
       
        <table style="border:1px solid grey;">
           <thead >
            <tr >
                <th v-for="key, i in columns" v-if="i == 1 || i == 9 || i == 10" style="text-transform:capitalize;">{{ key }}</th>
            </tr>
           </thead>
           <tbody >
            <tr v-for="item in offsets" style="display:table;" >
                <td v-for="value, i in item"  v-if="i == 1 || i == 9 || i == 10" :style="{color: color(item)}">{{ value }}</td>
            </tr>
           </tbody>
        </table></div>
        <a class="button-link" title="Offset list" @click="show=!show"><font-awesome-icon icon="fa-solid fa-calendar-days" /> </a>
       
    </div>
</template>
<script>
export default {
    name: 'OffsetList',
    props: {
        offsets: {
            type: Array,
            default: null
        },
        columns: {
            type: Array,
            default: () => []
        },
        station: {
            type: String,
            default: null
        }
    },
    computed: {
        url() {
          return this.$store.state.api + 'stations/' + this.station + '/offsets?solution=' + this.offsets[0][0]
        }
    },
    data () {
        return {
            show:false
        }
    },
    methods: {
        color(item) {
            if (item[9] === 'CHANGE') {
                return 'darkgreen';
            } else if (item[9].indexOf('EQ') >=0 ) {
                return 'darkred'
            } else {
                return 'darkgrey';
            }
        }
    }
}
</script>
<style scoped>

table {
    width:100%;
}
table th {
    border: 1px solid grey;
    padding: 2px 3px;
}
table td {
    border: 1px dotted grey;
    text-align: left;
    padding: 2px;
    vertical-align:top;
}


tbody {
    display: block;
    max-height: 135px;
    overflow: auto;
}
tr {
    display: table;
    width: 100%;
    table-layout: fixed;/* even columns width , fix width of table too*/
}

td:first-child,
th:first-child {
    width:80px;
}
td:nth-child(2),
th:nth-child(2) {
    width:70px;
}

td:nth-child(3),
th:nth-child(3) {
    width:250px;
}
.offset-box {
    position:absolute;
    z-index:10;
    font-size:.8rem;
    bottom:25px;
    right:-30px;
    background:white;
    padding:6px;
    line-height:1;
    -webkit-box-shadow: 0 0 3px rgba(0,0,0,.8);
    box-shadow: 0 0 3px rgba(0,0,0,.8);
}
</style>