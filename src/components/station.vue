<template>
<div class="page-station" :class="{removed: removed}" style="width:100%;position:relative;overflow:hidden;">
  
   <div style="position:absolute;top:55px;right:0;z-index:2;pointer-events:none;">
   <gnss-menu :top="5"></gnss-menu>
  <file-form v-if="!$store.state.back" mode="station" ></file-form>
  <gnss-tour mode="map" id="station"></gnss-tour> 
  </div>
  <div v-if="scrollY > 400" class="gnss-top" @click="scrollTop"><font-awesome-icon icon="fa-solid fa-circle-chevron-up" /></div>
 <div class="station-content"  >
	 <div class="station-header">
	    <span v-if="!$route.query.newTab" class="close button" @click="close($event)" style="margin-right:20px;"><font-awesome-icon icon="fa-solid fa-close" /></span>
	    <h2 v-if="stationId">Station {{stationName}}</h2>
	    <h2 v-else-if="stations">{{stations.length}} stations with the identifier {{stationName}}</h2>
	    <h2 v-else>UNKNOWN STATION</h2>
	 </div>
  <div class="station-body" @scroll="scroll($event)" >
  <div v-if="$store.state.back && station" class="gnss-admin gnss-admin-box">
    <h3 style="margin-top:0;">Administration</h3>
    <ol>
    <li><span>Suppression de la station </span> <button type="button" @click="removeStation()">Supprimer</button></li>
    <li v-if="duplicate" style="margin-bottom:10px;">
       Il existe une station de même nom. Son identifiant interne est <b>{{duplicate.id}}</b>. 
       Elle se trouve à <b>{{duplicate.distance.toLocaleString()}}</b> km.
       <span v-if="duplicate.properties.m3g">Elle est liée à une station du M<sup>3</sup>G</span><br>
       Ses coordonnées sont : 
       <ul><li><label>Latitude:</label> {{parseFloat(duplicate.latlng[0]).toLocaleString()}}°</li>
         <li><label>Longitude:</label>  {{parseFloat(duplicate.latlng[1]).toLocaleString()}}°</li>
         </ul> 
        Si ce sont la même station, il faut fusionner les 2 références:
        <ol>
         <li>
           Cette station a les bonnes coordonnées: <button  type="button" @click="mergeIn(duplicate.id, stationId)">Fusionner {{duplicate.id}} &rarr; celle-ci</button>
         </li>
         <li>
           L'autre station a les bonnes coordonnées: <button  type="button" @click="mergeIn(stationId, duplicate.id)">Fusionner celle-ci &rarr; {{duplicate.id}}</button>
         </li>
        </ol>
    </li>
    <li v-if="!station.properties.m3g && (!duplicate || !duplicate.properties.m3g)">
       <div style="margin-bottom:3px">Identifiez la station sur le M<sup>3</sup>G </div>
       <ol><li>
       Vérifiez que la station exite bien sur le M<sup>3</sup>G et est identique en consultant <a :href="m3gUrl+ 'sitelog/exportlog?id=' + stationName.toUpperCase()" target="_blank"> {{stationName}} M<sup>3</sup>G sitelog</a>
       </li>
       <li>Si l'erreur provient du M<sup>3</sup>G, liez cette station avec celle du M<sup>3</sup>G: <button type="button" @click="linkToM3G(stationId)" >Lier</button><br>
       Sinon <button type="button" @click="removeStation()">supprimez</button> la station, corrigez ses coordonnées dans votre fichier et repoussez le.</li>
       </ol>
    </li>
  </ol>
  </div>
  <div v-if="location || stations">
	  <div v-if="!station && stations" style="float:left;">
	      <div v-for="st in stations" class="box-station">
		       <router-link class="station-link"  :to="{name: 'station', params: {name: st.name, id: st.id}}">
		       
		       <h3>{{st.name}} N°{{st.id}}</h3>
		        <div>Latitude: {{st.location.geometry.coordinates[1].toLocaleString()}}°</div>
		        <div>Longitude: {{st.location.geometry.coordinates[0].toLocaleString()}}°</div>
		  
		      </router-link>
	      </div>
	  </div>
    <div v-if="location">
      <h3 style="margin-bottom:0;">Approximate position</h3>
      <div style="float:left;margin-left:10px;min-width:600px;margin-top:18px;margin-right:50px;">
       
	       <div><label>Latitude: </label> {{location.geometry.coordinates[1].toLocaleString()}}°</div>
	       <div><label>Longitude: </label> {{location.geometry.coordinates[0].toLocaleString()}}°</div>
	       <div v-if="location.properties.elevation"><label>Elevation: </label> {{location.properties.elevation.toLocaleString()}} m</div>
         <div v-if="location.properties.x"><label>X coordinate: </label> {{location.properties.x.toLocaleString()}} m</div>
         <div v-if="location.properties.y"><label>Y coordinate: </label> {{location.properties.y.toLocaleString()}} m</div>
         <div v-if="location.properties.z"><label>Z coordinate:</label> {{location.properties.z.toLocaleString()}} m</div>
    
    
      <h3 style="margin-left:-10px;position:relative;">Information
        <div style="position:relative;font-size:1.1rem;font-weight:500;display:inline-block;" v-if="station.properties.from || station.properties.m3g">
          <a class="info"   @click="toggle($event)"><font-awesome-icon icon="fa-solid fa-triangle-exclamation" /></a>
          <div class="gdm-tooltip" style="width:350px;max-width:350px;">The station information has been harvested.<br>If you find any errors, please contact the sitelog directory maintainers.</div>
        </div>
      </h3>
         <div v-if="station.properties.domes"><label>IERS DOMES Number:</label> {{station.properties.domes}}</div>
       
        <div v-if="station.MOID"><label>MOID:</label>  <a :href="station.MOID" target="_blank">M<sup>3</sup>G GNSS station page </a></div>
        <div v-if="station.properties.from && station.properties.from.length > 0"><label>Sitelog:</label> 
    
          <a v-for="sitelog in station.properties.from" :href="api + 'stations/' + stationName + '/sitelog?repository=' + sitelog"
          class="gnss-network-item" target="_blank">
            <template v-if="sitelog === 'M3G'">
              M<sup>3</sup>G
            </template>
            <template v-else>
            {{sitelog}}
            </template>
          </a>
        </div>
        <div v-if="station.owner"><label>Site owner: </label> 
           <span v-if="station.owner.ROR"><a :href="station.owner.ROR" target="_blank">{{station.owner.acronym}}</a></span>
           <span v-else-if="station.owner.acronym">{{station.owner.acronym}}</span>
           <span v-else>{{station.owner.agencyName}}</span>
        </div>
        <div v-if="station.onSite"><label>On Site: </label> 
           <span v-if="station.onSite.ROR"><a :href="station.onSite.ROR" target="_blank">{{station.onSite.acronym}}</a></span>
           <span v-else-if="station.onSite.acronym">{{station.onSite.acronym}}</span>
           <span v-else>{{station.owner.agencyName}}</span>
        </div>
       <div v-if="isEPOS"><label>EPOS</label> <a :href="'https://gnssdata-epos.oca.eu/#/metadata/marker='+ stationName.substring(0,4)" target="_blank">EPOS station page</a></div>
       <div v-if="station.properties.networks"><label>Networks:</label> 
	       <span v-for="net in station.properties.networks">
	        <span v-if="networks[net].metadata" class="gnss-network-item">
	          <span v-if="isDoi(networks[net].metadata)">{{net}} 
	              <gnss-credit :credit="networks[net].credit"></gnss-credit>(<a :href="'https://www.doi.org/' + isDoi(networks[net].metadata)" target="_blank">{{networks[net].metadata}}</a>)</span>
	          <span v-else >
	            <a :href="networks[net].metadata" target="_blank">{{net}}</a>
	            <gnss-credit :credit="networks[net].credit"></gnss-credit>
	          </span>
	        </span>
	        <span v-else class="gnss-network-item">{{net}} <gnss-credit :credit="networks[net].credit"></gnss-credit></span>
	       
	        
	        </span>
       </div>
       <div v-if="!station.properties.m3g && !station.properties.from"><em>Sorry, we don't have more information about this station</em></div>
       
      </div>
           
    
  </div>
  <div  id="stationMap"  ></div>
   <div style="clear:left;"> </div>
       <div v-if="station && station.contacts" style="margin-left:10px;">
         <label> Contacts
            <span class="fa button in-title" @click="show.contact = !show.contact">{{show.contact ? '-' : '+'}}</span>
         </label>
         <div :style="{display: show.contact ? 'flex': 'none'}"  style="flex-flow: row wrap;">
	         <div v-for="contact, key in station.contacts" style="width:calc(33% - 5px);margin-left:5px;min-width:300px;"> 
	         <m3g-contact :type="key" :contact="contact"></m3g-contact>
	         </div>
	       </div>
       </div>
       <div v-if="station && (station.monument || station.dateInstalled || station.geological)" style="margin-left:10px;">
         <label> Monument and geological information
            <span class="fa button in-title" @click="show.siteForm = !show.siteForm">{{show.siteForm ? '-' : '+'}}</span>
         </label>
         <div :style="{display: show.siteForm ? 'block': 'none'}" class="more-information">
	         <div v-if="station.monument || station.dateInstalled"  style="width:calc(49% - 10px);vertical-align:top; margin-left:5px;margin-right:10px;min-width:300px;display:inline-block;">
	            <div v-if="station.dateInstalled"><label>Installed/Removed</label> {{date2str(station.dateInstalled)}} &rarr; {{date2str(station.dateRemoved)}}</div>
      
	           <div v-for="key, index in monumentKeys" v-if="station.monument[key]" > 
	           <label>{{translateMonument[index]}}</label> <div class="more-information-line">{{station.monument[key]}}</div>
	           </div>
	         </div>
	         <div v-if="station.geological"  style="width:calc(49% - 10px);vertical-align:top; margin-left:5px;font-size:0.9rem;min-width:300px;display:inline-block;">
	           <div v-for="key, index in geologicalKeys" v-if="station.geological[key]" > 
	           <label>{{translateGeo[index]}}</label><div class="more-information-line">{{station.geological[key]}}</div>
	           </div>
	         </div>
	         </div>
       </div>
       <div v-if="station && (station.antennas|| station.receivers)" style="margin-left:10px;">
         <label> Instruments
            <span class="fa button in-title" @click="show.material = !show.material">{{show.material ? '-' : '+'}}</span>
         </label>
          <div :style="{display: show.material ? 'block': 'none'}" class="more-information" style="margin-left:10px;">
            <gnss-material :antennas="station.antennas" :receivers="station.receivers"></gnss-material>
          </div>
        </div>
        <h3  v-if="stationId" >Nearest stations
            <span class="fa button in-title" @click="show.nearest = !show.nearest">{{show.nearest ? '-' : '+'}}</span>
        </h3>
        <div  v-if="stationId" style="margin-left:10px;" :style="{display: show.nearest ? 'block': 'none'}">
          <div style="margin-bottom:10px;">
	            <input type="number" step="10" min="1" v-model="radius" @change="radiusChanged=true"
	           class="gnss-control" /> km &nbsp;
	           <button type="button" @click="getNeighbours()"
	           style="margin-right:20px;">Search</button>
	           <button type="button" v-if="onMap"
	              value="Remove" @click="removeNeighboursFromMap">Hide <font-awesome-icon icon="fa-solid fa-location-dot" /></button>
	           <button type="button" v-else title="Show on map" @click="addNeighboursToMap">Show on map <font-awesome-icon icon="fa-solid fa-location-dot" /></button>
          </div>
	        <div v-if="neighbours.length > 0">
		        <div  v-for="st in neighbours" class="gnss-neighbour">
		          <span class="station-link" style="position:relative;" @click="goToStation(st)" @contextmenu="menuContext($event)" :title="'Go to station ' + st.name">{{st.name}}
		          <div class="menu-context" >
		            <ul style="display:block;">
		               <li title="Open in new tab">
		                   <a :href="locationUrl + 'station/'+ st.name + '/' + st.id + '?newTab=true'" 
		                   @contextmenu="$event.target.click()" target="_blank">Open in new tab</a>
		               </li></ul>
		           </div>
		          </span>
		          ({{Math.round(st.distance)}} km)
		        </div>
	        </div>
	        <div v-else ><em>No other stations within {{searchRadius}}km radius</em></div>
	        </div>      
      
    </div>
   
   <div v-if="Object.keys(files).length > 0"style="padding-top:10px;position:relative;">
   <div  v-if="selected" class="file-selected">
     <span class="close button" @click="unselect"><font-awesome-icon icon="fa-solid fa-close" /></span>
     <h3 style="margin-left:5px;"> {{stationName}} {{selected.solution }} {{selected.productType}}</h3>
     <div v-if="plot.div" v-html="plot.div">STATION INCONNUE</div>
     <div v-if="plot.div" style="text-align:center;margin-top:10px;font-size:12px;width:100%;">
       Remarquables dates: <span class="line" style="background:green;"></span> Material change
       <span class="line" style="background:red;"></span> Earthquake
       <span class="line" style="background:grey;"></span> Unknown change
     </div>
     <div v-else style="text-align:center;margin-top:45%;font-size:50px;">
        <font-awesome-icon icon="fa-sharp fa-spinner" spin></font-awesome-icon>
     </div>
   </div>
 
   <h3>Data</h3>
     <div style="margin-left:10px;"><label>Product type</label> 
     <select v-model="productType" class="gnss-control" style="max-width:160px;">
       <option v-for="group, key in files" :value="key">{{key}}</option>
     </select></div>
     <div style="width:100%">
       <gnss-carousel :slide-width="530" :width="1380">
          <slot v-for="file, index in files[productType]" >
            <div slot="slide" class="slider-files" >
            <div class="file-container" :class="{removed: file.removed}">
           <!--  <a href="https://spotgins.formater/data/SPOTGINS/GROUP2/RSTL00FRA_SERIE.txt" download >lien truc</a>
             -->
            <div v-if="$store.state.back && !file.removed" class="gnss-admin product-link" >
              <button type="button" @click="removeFile(index)">Supprimer</button>
            </div>
            <div v-else class="product-link">
              <span  v-if="file.productType === 'DISCONTINUITY'" class="expand" @click="toggleMenu($event)">
               <a  :href="api + 'products/' + file.name + '/download'" :download="file.name"  title="Download extracted discontinuities for this station">
               <font-awesome-icon icon="fa-solid fa-arrow-down-wide-short" /></a>
               <div class="menu-content" style="margin-top:3px;" >
               <ul >
                 <li><a @click="downloadDiscontinuities(file.solution, 'txt')">ASCII</a></li>
                 <li><a @click="downloadDiscontinuities(file.solution, 'json')">JSON</a></li>
               </ul>
               </div>
               </span>
               <a v-if="file.solution === 'SPOTGINS' && file.productType === 'POSITION'"
                :href="sari + '?server=formater&station=' + file.station + '&product=spotgins_pos'"
                target="_blank"><font-awesome-icon icon="fa-solid fa-cog" /> SARI</a> 
               <a v-if="(file.solution === 'GAMIT-GLOBK' || file.solution.indexOf('UGA')>=0) && file.productType === 'POSITION'"
                :href="sari + '?server=formater&station=' + file.station + '&product=uga_pos'"
                target="_blank" ><font-awesome-icon icon="fa-solid fa-cog" /> SARI</a> 
               <a v-if="file.solution === 'IGS' && file.productType === 'POSITION'" :href="sari + '?server=formater&station=' + file.station + '&product=igs20'" target="_blank">
                 <font-awesome-icon icon="fa-solid fa-cog" />SARI</a>
               <a v-if="file.solution === 'SOAM_GNSS_solENS' && file.productType === 'POSITION'" :href="sari + '?server=formater&station=' + file.station + '&product=ens'" target="_blank">
                  <font-awesome-icon icon="fa-solid fa-cog" />SARI</a>
             <a v-if="$store.state.auth && !$store.getters['user/email']" @click="$parent.preLogin(api + 'products/' + file.name + '/download')" title="Download file source">
             <font-awesome-icon icon="fa-solid fa-download" /></a>
             <a  v-else :href="api + 'products/' + file.name + '/download'" :download="file.name" title="Download file source">
               <font-awesome-icon icon="fa-solid fa-download" /></a>
            
            </div>
            
            
           <div><label>Name</label> {{file.name}}</div>
           <div v-if="file.productType === 'POSITION'"><label>Ref Frame</label> <span style="letter-spacing: .07em;">{{file.properties.refFrame}}</span></div>
           <div style="font-size:0.8rem;height:175px;">
            <div><label>Solution</label>
             <span class="station-link"  @click="goToSolution(file.solution)" style="position:relative;margin-left:-5px;" @contextmenu="menuContext($event)">{{file.solution}}
                 <div class="menu-context" @click="closeMenuContext($event)">
                     <ul>
                       <li title="Open in new tab">
                         <a :href="locationUrl + 'solution/'+ file.solution + '?newTab=true'" target="_blank"
                         @contextmenu="$event.target.click()">Open in new tab</a>
                       </li>
                     </ul>
                 </div>
             </span>
             </div>
            <div><label>Product Type</label> <span style="letter-spacing: .07em;">{{file.productType}}</span></div>
            <div><label>Product date range</label> {{date2str(file.tempStart)}} &rarr; {{date2str(file.tempEnd)}}</div>
            <div><label>Updated</label> {{date2str(file.creationDate)}}</div>
            <div v-for="value, key in file.properties" v-if="key !== 'img' && key!== 'file' && key!=='fillRate' && key !== 'refFrame'" >
              <span v-if="key === 'doi'"><label>{{labelize(key)}}</label> <a class="station-link" :href="'https://doi.org/' + value" target="_blank">{{value}}</a></span>
              <span v-else-if="key === 'operator'"><label>Analysis center</label> {{value}}</span>
              <span v-else-if="key === 'dataSource'"><label>Data Source</label>
                <span v-for="name in value" class="source">
                 <template v-if="sources[name]"><a :href="sources[name].url" :title="sources[name].name">{{name}}</a></template>
                 <template v-else >{{name}}</template>
                 </span>
              </span>
              <span v-else-if="!(key === 'products' && file.solution === 'GAMIT-GLOBK')"> <label>{{labelize(key)}}</label> {{value}}</span>
            </div>
            <div v-if="file.properties.fillRate"><label>Fill Rate</label> {{Math.round(file.properties.fillRate * 100)}} %</div>
         </div>
         
         <div style="text-align:center;position:relative;">
              <div v-if="file.productType === 'DISCONTINUITY'" class="interactive"  style="position:absolute;width:100%;height:100%;background:rgba(255,255,255,0.4);text-align:center;padding-top:30%;">
                <div style="width:200px;display:inline-block;background:white;">
                     <font-awesome-icon icon="fa-solid fa-arrow-down-wide-short" /> Extract discontinuities for this station
                </div>
              </div>
              <img v-if="file.productType === 'POSITION'" class="interactive" :src="file.properties.img"  title="Click to show interactive graph" @click="getSerie(file)" />
              <img v-else :src="file.properties.img"  class="interactive" />
         </div>
         
         </div>
          </div>
          </slot> 
       </gnss-carousel>
     </div>
     

   </div>
   
   
   <div v-if="!station && !stations">
      No station found with this code
   </div>
 </div>
 </div>
</div>
</template>

<script>
var L = require('leaflet')
import { Icon } from 'leaflet';
import Util from '../modules/util.js'
import moment from 'moment'
delete Icon.Default.prototype._getIconUrl;
Icon.Default.mergeOptions({
  iconRetinaUrl: require('leaflet/dist/images/marker-icon-2x.png').default,
  iconUrl: require('leaflet/dist/images/marker-icon.png').default,
  shadowUrl: require('leaflet/dist/images/marker-shadow.png').default,
});
import FileForm from './file-form.vue'
import GnssMenu from './gnss-menu.vue'
import GnssCarousel from './gnss-carousel.vue'
import M3gContact from './m3g-contact.vue'
import GnssMaterial from './gnss-material.vue'
import GnssCredit from './gnss-credit.vue'
import GnssTour from './gnss-tour.vue'
// import Bokeh from '@bokeh/bokehjs/build/js/bokeh.esm.min.js';
export default {
  name: 'Station',
  components: {FileForm, GnssCarousel, GnssCredit, GnssMaterial, GnssMenu, GnssTour, M3gContact},
  data () {
    return {
      sari: 'https://alvarosg.shinyapps.io/sari/',
      m3gUrl: 'https://gnss-metadata.eu/v1/' ,
      plot: {div: null, script: null},
      script: null,
      stationId: null,
      stationName: null,
      station: null,
      stations: null,
      icon: null,
      stationLayer: null,
      neighboursLayer: null,
      radiusChanged:true,
      radius: 100,
      searchRadius: 100,
      files: [],
      productType: 'POSITION',
      translateX: 0,
      selected: null,
      onMap: false,
      map: null,
      location: null,
      neighbours: [],
      duplicate: null,
      show: {
        material: false,
        filter: false,
        contact: false,
        nearest: false,
        siteForm: false
      },
      scrollY: 0,
      newTab: false,
      removed: false,
      monumentKeys: ['foundation', 'monumentDesc', 'heightVal', 'foundationDepthVal'],
      translateMonument:['Monument foundation', 'Monument description', 'Monument height', 'Monument foundation depth'],
      geologicalKeys: [   'geologicCharacteristic', 
         'bedrockCondition', 'bedrockType', 'fractureSpacingVal', 'faultZonesNearby', 'distance', 'tectonicPlate'],
      translateGeo: ['Geological Characteristic', 'Bedrock condition', 'Bedrock type', 'Fracture spacing', 'Fault zone', 'Distance to fault', 'Tectonic plate']
    }
  },
  computed: {
    api () {
      return this.$store.getters['api']
    },
    locationUrl () {
      return this.$store.state.location
    },
    networks () {
      return this.$store.getters['networks']
    },
    sources () {
      return this.$store.getters['sources']
    },
    isEPOS() {
      if (!this.station) {
        return false
      }
      if (this.station.properties.networks && this.station.properties.networks.indexOf('EPOS') >= 0) {
        return true
      }
      return false
    }
  },
  watch: {
    $route (route) {
      this.initStation()
      this.stationName = route.params.name
      if (route.params.id) {
        this.stationId = route.params.id
      }
      this.removed = false
      this.getStation()
      this.$store.commit('setReset', false)
    }
  },
  created () {
    if (!this.$route.params.name) {
      return
    } 
    if (this.$route.query.newTab) {
      this.newTab = this.$route.query.newTab
    }
    this.stationName = this.$route.params.name
    if (this.$route.params.id) {
      this.stationId = this.$route.params.id
    } else {
      this.stationId = null
    }
    this.getStation()
  },
  destroyed () {
    if (this.script) {
      this.script.remove()
    }
    if (this.map) {
      this.map.off()
      this.map.remove()
      this.map = null
    }
//     if (this.resizeListener) {
//       window.removeEventListener('resize', this.resizeListener)
//       this.resizeListener = null
//     }
  },
  mounted () {
    // this.countNbFiles()
  },
  methods: {
    isDoi (link) {
      link = link.toLowerCase()
      if (link.indexOf('doi') >= 0) {
        return link.split(':')[1]
      }
      return false
    },
    closeMenuContext(e) {
      e.stopPropagation()
      this.$parent.removeContextMenu()
    },
    downloadDiscontinuities (solution, format) {
      var url = this.api + 'stations/' + this.stationName + '/discontinuities?solution=' + solution
      console.log(url)
    },
    menuContext (e) {
      e.preventDefault()
      this.$parent.removeContextMenu()
      var menu = e.target.querySelector('.menu-context')
      if (menu) {
        menu.style.top = '20px'
        menu.style.left = '0px'
      }
      e.target.classList.add('context')
    },
    goToSolution (name) {
      this.$router.push({ name: 'solution', params: {name: name}})
    },
    initStation () {
      this.station = null
      this.stations = null
      this.stationId = null
      this.location = null
      this.neighbours = []
      this.duplicate = null
      this.files = []
      this.map = null
    },
    addNeighboursToMap () {
      if (this.neighboursLayer) {
        this.neighboursLayer.addTo(this.map)
        this.onMap = true
        this.stationLayer.bringToFront()
      }
    },
    date2str(date, small){
      var format = small ? 'll': 'lll'
      if (date ) {
        return moment(date).format('ll')
      }
      return '---'
    },
    initNeighboursLayer () {
      if (this.neighboursLayer) {
        this.neighboursLayer.clearLayers()
        this.neighboursLayer.remove()
      } else {
        this.neighboursLayer = L.featureGroup()
      }
    },
    labelize (label) {
      const result = label.replace(/([A-Z])/g, " $1");
      return result.charAt(0).toUpperCase() + result.slice(1);
    },
    removeNeighboursFromMap () {
      if (this.neighboursLayer) {
        this.neighboursLayer.remove()
        this.onMap = false
      } 
    },
    toggle(event) {
      var node = this.$el.querySelector('a.info')
      node.classList.toggle('tooltip-show')
      event.preventDefault()
      event.stopPropagation()
    },
    mergeIn (id1, id2) {
      this.$http.post(this.$store.state.back + '/entities/merge',{from: id1, to:id2}, {
         headers: {'X-Requested-With': 'XMLHttpRequest'},
         credentials: true,
         emulateJSON: true
      }).then(resp => {
        if (id2 === this.stationId) {
          this.getStation()
        } else {
          this.$router.push({name: 'station', params:{name: this.stationName, id: id2}})
        }
      }, resp => {alert('error status ' + resp.status)})
    },
    linkToM3G(id) {
      this.$http.post(this.$store.state.back + '/entities/link2m3g/' + this.stationId, {
        'id': id,
        'name': this.stationName
      }, {
        headers: {'X-Requested-With': 'XMLHttpRequest'}, 
        credentials: true,
        emulateJSON: true
      }).then(resp => {
         this.station = resp.body.station
         this.getMoreInfo()
      }, resp => {alert('error ' + resp.status + ' - ' + resp.body.error)})
    },
    removeStation () {
      if (!window.confirm("Voulez-vous réellement supprimer la station " + this.stationName + "\navec tous ses produits!")) {
        return
      }
      this.$http.delete(this.$store.state.back + '/entities/removeStation/' + this.stationId, {
        headers: {'X-Requested-With': 'XMLHttpRequest'}, 
        credentials: true
      }).then(resp => {
        this.removed = true
      }, resp => {alert('error status ' + resp.status)})
    },
    removeFile (index) {
      var file = this.files[this.productType][index]
      if (!window.confirm("Voulez-vous réellement supprimer le fichier" + file.name )) {
        return
      }
      
      this.$http.delete(this.$store.state.back + '/entities/removeFile/' + file.id, {
        headers: {'X-Requested-With': 'XMLHttpRequest'}, 
        credentials: true
      }).then(resp => {
        this.files[this.productType][index].removed = true
        this.$forceUpdate()
      }, resp => {alert('error status ' + resp.status)})
    },
    scroll (event) {
      this.scrollY = event.target.scrollTop
    },
    scrollTo(y, d) {
      y = y - d
      if (y > 0) {
        this.$el.querySelector('.station-body').scrollTop = parseInt(y)
        var _this = this
         setTimeout(function () {
            _this.scrollTo(y, d)
        }, 10)
      } else {
        this.$el.querySelector('.station-body').scrollTop = 0
      }
    },
    scrollTop () {
      if (this.$el && this.$el.querySelector('.station-body')) {
        var d = this.scrollY  * 0.05
        this.scrollTo(this.scrollY,d)
      }
    },
//     toggleForm () {
//       var elt = document.querySelector('.form')
//       elt.classList.toggle('expand')
//     },
    toggleMenu (event) {
      console.log(event)
    },
    getNeighbours () {
      if (!this.location) {
        return
      }
      var center = this.location.geometry.coordinates
      this.$http.get(this.api + "stations/?center=" + center.join(',') + "&radius=" + this.radius + '&maxRecords=4000')
      .then(resp => {
        if (resp.body.stations && resp.body.stations.length > 0) {
          this.initNeighboursLayer()
          this.searchRadius = this.radius
          var neighbours = resp.body.stations
          var center = this.location.geometry.coordinates
          neighbours = neighbours.filter(st => st.id !== this.stationId)
          neighbours.forEach(function (st, index) {
            var pos = st.latlng
            var distance  = Util.getDistanceFromLatLonInKm(pos[0], pos[1], center[1], center[0])
            neighbours[index].distance = distance
          })
          neighbours.sort(function (a, b) {
            return a.distance > b.distance ? 1 : -1
          })
          this.neighbours = neighbours

          var self = this
          this.neighbours.forEach(function (st) {
            var layer = L.marker(st.latlng, {id: st.id, title: st.name})
            self.neighboursLayer.addLayer(layer)
          })
          // search duplicate
          if (this.$store.state.back) {
            var duplicates = neighbours.filter(st => st.name == this.stationName)
            if (duplicates.length > 0) {
              this.duplicate = duplicates[0]
            } else {
              this.duplicate = null
            }
          }
          if (this.onMap) {
            this.addNeighboursToMap()
          }
        }      
      })
    },
    getSerie (file) {
      this.selected = file
      this.plot.div = null
      this.plot.script = null
      if (this.script) {
        this.script.remove()
        this.script = null
      }
      this.$http.get(this.api + 'products/' + file.name + '/component' )
      .then(resp => {
        this.plot.div = resp.body.div
        this.plot.script = resp.body.script
        this.script = document.createElement('script')
        
        this.script.append(this.plot.script)
        this.$el.appendChild(this.script)
      })
    },
    getGraph (file) {
      this.selected = file
      this.plot.script = null
      this.$http.get(this.api + 'products/' + file.name + '/graph' )
      .then(resp => {
        // this.plot.div = resp.body.div
        this.plot.div = resp.body.div
        this.plot.script = resp.body.script
        this.script = document.createElement('div')
        
        this.script.innertHTML = this.plot.div
        this.$el.querySelector('.file-selected').appendChild(this.script)
      })
    },
    unselect () {
      this.selected = null
      
    },
    getStation () {
        this.initNeighboursLayer()
        // this.$http.get(this.root + "/Things?$filter=substringof('" + this.stationId + "',name)&$expand=Locations($top=1)")
        var url = this.api + 'stations/' + this.stationName
        if (this.stationId) {
          url += '/' + this.stationId
        }
        this.$http.get(url)
        .then(resp => {
          if (resp.body.id) {
            if (resp.body.name === this.stationName) {
	            this.station = resp.body
	            this.stationId = this.station.id
	            this.location = this.station.location
	            this.getFiles()
	            this.getMoreInfo()
	            // this.getInfo()
	            this.$nextTick(() => this.initMap())
            } else {
              this.setNoStation()
            }
          } else if (resp.body.stations && resp.body.stations.length > 0) {
            this.stations = resp.body.stations
            this.$nextTick(() => this.initMap())
          } else {
            this.setNoStation()
          }
        }, resp => {this.setNoStation()})
    },
    getMoreInfo () {
      if (!this.station.properties.m3g && !this.station.properties.from) {
        return
      }
      
      this.$http.get(this.api + 'stations/' + this.stationName + '/sitelog')
      .then(resp  => {this.updateM3GInfos(resp.body)}, resp => {console.log('Error sitelog: ' + resp.status)})
    },
    updateM3GInfos (data) {
      if (data.MOID) {
        this.station.MOID = data.MOID
      }
      if (data.sitelog) {
        if (!this.location.properties.elevation && data.sitelog.location && data.sitelog.location.approximatePositionGRS80) {
          this.location.properties.elevation = data.sitelog.location.approximatePositionGRS80.elevation
        }
        if (data.sitelog.receivers) {
          this.station.receivers = data.sitelog.receivers
        } 
        if (data.sitelog.antennas) {
          this.station.antennas = data.sitelog.antennas
        }
        this.station.contacts = {}
        console.log(data.sitelog.siteOwner)
        if (data.sitelog.siteOwner && ((data.sitelog.siteOwner.agency && data.sitelog.siteOwner.agency.agencyName)
            || data.sitelog.siteOwner.agencyName)) {
          this.station.contacts.siteOwner = data.sitelog.siteOwner
          if (data.sitelog.siteOwner.agency && data.sitelog.siteOwner.agency.preferedAbbreviation) {
            this.station.owner = { acronym: data.sitelog.siteOwner.agency.preferedAbbreviation}
            if (data.sitelog.siteOwner.agency.ROR) {
              this.station.owner.ROR = data.sitelog.siteOwner.agency.ROR
            }
          }
          if (data.sitelog.siteOwner.preferredAbbreviation) {
            this.station.owner = { acronym: data.sitelog.siteOwner.preferredAbbreviation}
          } else if (data.sitelog.siteOwner.preferedAbbreviation) {
            this.station.owner = { acronym: data.sitelog.siteOwner.preferedAbbreviation}
          } else if (data.sitelog.siteOwner.agencyName) {
            this.station.owner = {agencyName: data.sitelog.siteOwner.agencyName}
          }
        }
        if (data.sitelog.onSiteContact && ((data.sitelog.onSiteContact.agency && data.sitelog.onSiteContact.agency.agencyName)
            || data.sitelog.onSiteContact.agencyName)) {
          this.station.contacts.onSiteContact = data.sitelog.onSiteContact
          if (data.sitelog.onSiteContact.agency && data.sitelog.onSiteContact.agency.preferedAbbreviation) {
            this.station.onSite = { acronym: data.sitelog.onSiteContact.agency.preferedAbbreviation}
            if (data.sitelog.onSiteContact.agency.ROR) {
              this.station.onSite.ROR = data.sitelog.onSiteContact.agency.ROR
            }
          }
          if (data.sitelog.onSiteContact.preferredAbbreviation) {
            this.station.onSite = { acronym: data.sitelog.onSiteContact.preferredAbbreviation}
          } else if (data.sitelog.onSiteContact.preferedAbbreviation) {
            this.station.onSite = { acronym: data.sitelog.onSiteContact.preferedAbbreviation}
          } else if (data.sitelog.onSiteContact.agencyName) {
            this.station.onSite = {agencyName: data.sitelog.onSiteContact.agencyName}
          }
        }
        if (data.sitelog.siteMetadataCustodian && data.sitelog.siteMetadataCustodian.agency &&
            data.sitelog.siteMetadataCustodian.agency.agencyName) {
          this.station.contacts.siteMetadataCustodian = data.sitelog.siteMetadataCustodian
        }
      
        var countG = 0
        var geological = {}
        if (data.sitelog.location && data.sitelog.location.tectonicPlate) {
          geological.tectonicPlate = data.sitelog.location.tectonicPlate
          countG++
        }
       
        if (data.sitelog.siteForm) {
          if (data.sitelog.siteForm.dateInstalled) {
            this.station.dateInstalled = data.sitelog.siteForm.dateInstalled
            this.station.dateRemoved = data.sitelog.siteForm.dateRemoved ? data.sitelog.siteForm.dateRemoved : null
          }
          if (data.sitelog.siteForm.domes) {
            this.station.properties.domes = data.sitelog.siteForm.domes
          }
          this.geologicalKeys.forEach(function (key) {
            if (data.sitelog.siteForm[key]) {
              geological[key] = data.sitelog.siteForm[key]
              countG++
            }
          })
          var countM = 0
          var monument = {}
          this.monumentKeys.forEach(function (key) {
            if (data.sitelog.siteForm[key]) {
              monument[key] = data.sitelog.siteForm[key]
              countM++
            }
          })
          if (countG > 0) {
            this.station.monument = monument
          }
        }
        if (countG > 0) {
          this.station.geological = geological
        }
      }
      this.$forceUpdate()
    },
    getFiles() {
      this.files = {}
      var query = this.$route.query
      if (this.$store.state.back) {
        query = {}
      }
      this.productType = null
      this.$http.get(this.api + 'stations/' + this.stationId + '/products', {params: query})
      .then(resp => {
        var files = resp.body.products
        var self = this
        files.forEach(function (file) {
          if (!self.productType) {
            self.productType = file.productType
          }
          var years = moment(file.tempEnd).diff(file.tempStart, 'years', true)
          file.properties.years = years.toFixed(1)
          if (!self.files[file.productType]) {
            self.files[file.productType] = []
          }
          self.files[file.productType].push(file)
        })
      })
    },
    goToStation (station) {
      this.$router.push({name: 'station', params: {name: station.name, id: station.id}})
    },
    setNoStation () {
      if (this.stationLayer) {
        this.stationLayer.remove()
      }
      this.stationName = null
      this.stationId = null
    },
    
    initMap (map) {
      if (!this.map) {
	      this.map= L.map( "stationMap", {scrollWheelZoom: true})
	      var tile = {
	        name: 'ArcGIS World Topo Map',
	        url: 'https://services.arcgisonline.com/arcgis/rest/services/World_Topo_Map/MapServer/tile/{z}/{y}/{x}',
	        attribution: 'Tiles © <a href="https://services.arcgisonline.com/ArcGIS/rest/services/World_Topo_Map/MapServer">ArcGIS</a>'
	      }
	      this.map.off('resize')
	     L.tileLayer(tile.url, {attribution: tile.attribution})
	     .addTo(this.map)
     }
     if (this.stationLayer) {
       this.stationLayer.remove()
     }
     if (!this.icon) {
       this.icon = new L.Icon({
         // iconRetinaUrl: require('leaflet/dist/images/marker-icon-2x.png'),
          iconUrl: require('../assets/img/marker-icon-red.png').default,
          shadowUrl: require('leaflet/dist/images/marker-shadow.png').default,
          iconRetinaUrl: require('../assets/img/marker-icon-2x-red.png').default,
         // shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png',
          iconSize: [25, 41],
          iconAnchor: [12, 41],
          popupAnchor: [1, -34],
          shadowSize: [41, 41]
        });
     }
     var self = this
	   if (this.location) {
	     this.stationLayer = L.geoJSON(this.location, {
	       pointToLayer: function (feature, latlng) {
	         return L.marker(latlng, {title: self.station.name, icon: self.icon})
	       }
	     }).addTo(this.map)
	     this.map.setView([this.location.geometry.coordinates[1], this.location.geometry.coordinates[0]], 6)
       this.getNeighbours()
     } else if (this.stations) {
       this.stationLayer = L.featureGroup().addTo(this.map)
       var self = this
       this.stations.forEach(function (st) {
         var coords = st.location.geometry.coordinates
         var marker = L.marker([coords[1],coords[0]], {icon: self.icon, title: 'Station N°' + st.id})
         self.stationLayer.addLayer(marker)
       })
       var bounds = this.stationLayer.getBounds()
       this.map.fitBounds(bounds)
     }
     
    },
    close (event) {
      this.$router.push({name: this.$store.state.query.name, query: this.$store.state.query.query})
    }
  }
}
</script>
<style>
 span.source ~ span.source::before {
  content: ', ';
 }
.gnss-admin-box {
   border:2px solid darkgrey;
   border-radius:5px;
   background: #f3f3f3;
   padding: 10px;
   margin-right:50px;
}
.removed .gnss-admin-box {
  display:none;
}
.removed .station-body,
.file-container.removed {
  opacity: 0.5;
}
.line {
  border:0;
  display:inline-block;
  vertical-align:middle;
  height:2px;
  width:15px;
  margin-left:10px;
}


div.box-station {
  display: inline-block;
overflow: hidden;
padding: 5px 20px 20px 20px;
margin:20px;
 border: 1px solid grey;
 border-radius: 10px;
-webkit-box-shadow: 0 0 3px rgba(0,0,0,.5);
box-shadow: 0 0 3px rgba(0,0,0,.5);
}
div.box-station h3 {
  margin-top: 10px;
}
div.box-station a.station-link {
  margin: 5px;
  line-height: 1.1;
  text-decoration: none;
  color: #000;
  cursor:pointer;
}
.file-container label {
  margin-bottom:1px;
}
div[id="stationMap"] {
  position: relative;
  width:300px;
  height:200px;
  z-index:0;
  float:left;
}
</style>
<style scoped>
span.gnss-network-item::after,
a.gnss-network-item::after {
  content: ", "
}

/**  div.page-station {
    width:100%;
    background: url('./../assets/img/background-gnss.png') no-repeat center center fixed;
     -webkit-background-size: cover;
  -moz-background-size: cover;
  -o-background-size: cover;
  background-size: cover;
  } **/
 
/**  div.station-content {
    background:white;
    margin:auto;
    max-width:1400px;
    min-height:100vh;
    padding-bottom:20px;
    box-shadow: 0 0 3px rgba(0,0,0,.5);
  } **/
  div.gnss-neighbour {
    margin:3px 20px 3px 0;
    display:inline-block;
    width:200px;
  }
  div.file-selected {
     position:absolute;background:white;top:0;
     border:1px solid lightgrey;
     border-radius:10px;
     padding:10px;
     left:calc(50% - 400px);
     min-width:800px;
     min-height:800px;
     width:fit-content;
     height:fit-content;
     z-index: 5;
     top:-100px;
     box-shadow: 0 0 3px rgba(0,0,0,.5);
  }
 div.slider-files {
    max-width:525px;padding:0 5px;display:inline-block;vertical-align:top;
  }
  div.slider-files label {
    min-width:150px;
  }
  label{
    display: inline-block;
    min-width:138px;
    text-transform: capitalize;
  }
  .more-information {
  font-size:0.9rem;
}
.more-information label {
  min-width:250px;
  width:250px;
  vertical-align:top;
  text-transform:none;
}
.more-information-line {
  display:inline-block;
  width:calc(100% - 255px);
  min-width:200px;
}
  div.file-container {
    position:relative;
    margin:5px;
    padding:10px;
    border: 1px solid grey;
    border-radius:10px;
    width:520px;
    line-height:1;
    max-width:520px;
    min-height:630px;
    vertical-align:top;
    display:block;
    cursor:pointer;
    transition: all 0.5s;
  }
  div.file-container div.product-link {
    position: absolute;
    right:5px;
    top:5px;
    
  }
  div.product-link a,
  a.button-link {
    display: inline-block;
    padding: 2px 5px;
    margin-right: 5px;
    border-radius: 3px;
    text-decoration:none;
    color: #b8412c;
    border: 1px dotted grey;
    background:#f3f3F3; 
  }
  div.product-link a:hover {
    text-decoration: none;
    color:#7b080e;
    background: #e5e5e5;
  }
  div.file-container img {
    max-width:96%;
  }
 
  div.file-container img.interactive:hover {
    max-width:98%;
    border: 1px solid lightgrey;
    border-radius:10px;
  }
  
  /**  div.station-header {
    position:relative;
    background: lightgrey;
    margin: 0;
    padding: 3px 5px;
  }
   div.station-body {
    padding: 3px 10px;
  }
  div.station-header h2 {
    padding:0;
    margin:5px;
  } **/
  span.station-link {
    color: #b8412c;
    padding: 2px 3px;
    cursor: pointer;
    line-height:1.5rem;
    border:1px dotted white;
  }
  span.station-link:hover {
    border-color: grey;
    color:#7b080e;
  }
  span.in-title {
    font-size: 1rem;
  }
  

</style>
