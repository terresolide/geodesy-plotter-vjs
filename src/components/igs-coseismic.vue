<template>
    <div v-show="list.length > 0">
        <h3> Coseismic displacements from IGS
                <span class="fa button in-title" @click="expand = !expand">{{expand ? '-' : '+'}}</span>
        </h3>
        <div style="margin-left:10px;" v-show="expand">
           <div>
                <label> Request
                    <span class="fa button in-title" @click="showRequest = !showRequest">{{showRequest ? '-' : '+'}}</span>
                </label>
                <div v-show="showRequest">
                    <div> @see <a href="https://webigs-rf.ign.fr/api/doc/#/Seismic/post_coseismic_request" target="_blank">https://webigs-rf.ign.fr/api/doc/#/Seismic/post_coseismic_request</a></div>
                </div>
            </div>
            <div class="coseismic-row" style="margin-top:10px;font-weight:700;border-top:1px solid lightgray;">
                <div>Date</div>
                <div>Description</div>
                <div>Earthquake location</div>
                <div>Distance</div>
                <div v-for="key, index in keys">{{ key.replace('_', ' ') }}</div>
            </div>
            <div class="coseismic-row" v-for="item  in list" style="color:darkred;">
                <div>{{item['datetime'].substring(0,10)}}</div>
                <div>{{ item['description'] }}</div>
                <div>lat: {{item['position'][0]}}°<br>lng: {{ item.position[1] }}°</div>
                <div>{{ item['distance'].toLocaleString() }}km</div>
                <div v-for="key in keys">{{ item[key] }}</div>
            </div>
            
        </div>
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
            expand: false,
            showRequest: false,
            list: [],
            keys: []
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
                    var result = resp.body.result[0].stations[0].coseismic
                    this.keys = []
                    for (var i in result) {
                        var item = {
                            datetime: result[i].earthquake_date,
                            position: [result[i]['earthquake_lat[deg]'], result[i]['earthquake_lon[deg]']],
                            description: result[i].earthquake_location + ', Mw ' + result[i].earthquake_mw,
                            distance: result[i]['dist[km]'] 
                        }
                        
                        for (var key in result[i]) {
                            console.log(key)
                            console.log(key.indexOf('earthquake'))
                            if (key.indexOf('earthquake') < 0) {
                                console.log(i)
                                if (i === '0' && key !== 'dist[km]') {
                                    console.log(key)
                                    this.keys.push(key)
                                }
                                item[key] = result[i][key]
                            }
                        }
                        this.list.push(item)
                    }
                    console.log(this.list)
                    console.log(this.keys)
                }
            })
        }
    }
}
</script>
<style scoped>
.coseismic-row {
  display: grid;
  grid-template-columns: 90px minmax(250px,2fr) 90px 90px 90px 90px 90px 90px 90px 90px;
  grid-gap: 0px;
  grid-template-rows: 30px;
  grid-auto-rows: minmax(100px, auto);
  font-size: 0.8em;
   border-left: 1px solid lightgrey;
    border-bottom:1px solid lightgrey;
   max-width:calc(100% - 10px);
   
}
.coseismic-row > div {
   
     border-right:1px solid lightgrey;
    border-bottom:0;
    padding: 0 3px;
}
</style>