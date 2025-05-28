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
    props: {
        station: {
            type: Object,
            default: null
        }
    },
    data () {
        return {
            expand: false
        }
    },
    created () {
        this.search()
    },
    methods: {
        search () {
            console.log(this.station)
            var pos = this.station.location.geometry.coordinates
            var data = {
                start_date: '1980-01-01',
                end_date: '',
                dmin: 1,
                stations: [{
                    name: this.station.name.substring(0,4),
                    latlng: [pos[1], pos[0]]
                }]
            }
            var headers = {
                'accept': 'application/json',
                'Content-Type': 'application/json'
            }
            this.$http.post('https://webigs-rf.ign.fr/api/coseismic_request',data, {headers: headers})
            .then(resp => {
                if (resp.body.result && resp.body.result[0].stations.length > 0) {
                    console.log(resp.body.result[0].stations[0].coseismic)

                }
            })
        }
    }
}
</script>