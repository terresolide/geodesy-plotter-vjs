<template>
    <div v-show="list.length > 0">
        <h3> Possible coseismic displacements
                <span class="fa button in-title" @click="expand = !expand">{{expand ? '-' : '+'}}</span>
        </h3>
        <div style="margin-left:10px;" v-show="expand">
            <div>
                <label> Disclaimer
                    <span class="fa button in-title" @click="showDisclaimer = !showDisclaimer">{{showDisclaimer ? '-' : '+'}}</span>
                </label>
                <div v-show="showDisclaimer" class="disclaimer" >
            Possible coseismic displacements are predicted using Okada (1985)'s approach relying on the Global Centroid-Moment-Tensor (CMT) catalog. 
            They are calculated based on several coarse approximations, and are subject to various sources of uncertainty. 
            Thus, they should not be used for a rigorous quantification of the actual coseismic displacements, but only as rough orders of magnitude of the expected displacements. 
            Please refer to the IGS-RF API for more information (<a href="https://webigs-rf.ign.fr/api/doc/#/Seismic/post_coseismic_request" target="_blank">https://webigs-rf.ign.fr/api/doc/#/Seismic/post_coseismic_request</a>).
                </div>
            </div>
           <div>
                <label> Request
                    <span class="fa button in-title" @click="showRequest = !showRequest">{{showRequest ? '-' : '+'}}</span>
                </label>
                <div v-show="showRequest">
                    <div> @see <a href="https://webigs-rf.ign.fr/api/doc/#/Seismic/post_coseismic_request" target="_blank">https://webigs-rf.ign.fr/api/doc/#/Seismic/post_coseismic_request</a></div>
                    <pre>curl -X 'POST' \
  'https://webigs-rf.ign.fr/api/coseismic_request' \
  -H 'accept: application/json' \
  -H 'Content-Type: application/json' \
  -d '{
    "start_date": "{{startDate}}",
    "dmin": 2,
    "stations": [{
      "name": "{{station.name.substring(0,4)}}",
      "latlng": [{{latlng[0]}},{{latlng[1]}}]
    }]
  }'</pre>
                </div>
            </div>
            <div class="coseismic-row" style="margin-top:10px;font-weight:700;border-top:1px solid lightgray;">
                <div>Date</div>
                <div>Description</div>
                <div>Earthquake location</div>
                <div style="text-align:center;">Distance</div>
                <div v-for="key, index in keys" style="text-align:center;">{{ key.replace('_', ' ') }}</div>
            </div>
            <div class="coseismic-row" v-for="item  in list" v-if="item['datetime'].substring(0,10) >= startDate" style="color:darkred;">
                <div>{{item['datetime'].substring(0,10)}}</div>
                <div>{{ item['description'] }}</div>
                <div>lat: {{item['position'][0]}}°<br>lng: {{ item.position[1] }}°</div>
                <div  style="text-align:right;">{{ item['distance'].toLocaleString() }}&nbsp;km</div>
                <div v-for="key in keys" style="text-align:right;">{{ item[key] }}</div>
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
        },
        startDate: {
            type: String,
            default: '1980-01-01'
        }
    },
    data () {
        return {
            expand: false,
            showRequest: false,
            showDisclaimer: true,
            latlng: null,
            list: [],
            keys: []
        }
    },
    created () {
        this.search()
    },
    methods: {
        search () {
            var pos = this.station.location.geometry.coordinates
            this.latlng = [pos[1], pos[0]]
            var data = {
                start_date: this.startDate ,
                dmin: 2,
                stations: [{
                    name: this.station.name.substring(0,4),
                    latlng: this.latlng
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
                }
            })
        }
    }
}
</script>
<style scoped>
.coseismic-row {
    display: grid;
    grid-template-columns: minmax(90px, 0.5fr) minmax(250px,2fr) minmax(90px, 0.5fr)  minmax(90px, 0.5fr)  minmax(90px, 0.5fr)  minmax(90px, 0.5fr)  minmax(90px, 0.5fr)  minmax(90px, 0.5fr) minmax(90px, 0.5fr)  minmax(90px, 0.5fr) ;
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
.disclaimer {
    border:1px solid grey;
    border-radius:5px;padding:5px;
    background-color: #fafafa;
    border: 1px solid #a3a3a3;
    font-size: smaller;
    line-height:1.3
}
</style>