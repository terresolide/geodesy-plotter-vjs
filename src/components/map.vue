<template>
  <div style="position:relative;overflow:hidden;"  >
   <div v-if="searching && !$store.state.adding" style="position:absolute; z-index:1;font-size:50px;top:calc(50% - 50px);left:calc(50% - 50px);text-shadow: 2px 2px 2px #040201;">

    <font-awesome-icon icon="fa-sharp fa-spinner" spin></font-awesome-icon>

   </div>
    <div v-if="noStation" class="msg-alert"  @click="noStation=false">
     No station match search criteria
   </div> 
    <div  v-if="selectedContextMenu" class="menu-context"  style="z-index:10;display:block;" 
    :style="{top: selectedContextMenu.y + 'px', left: selectedContextMenu.x + 'px'}">
       <ul @click="closeMenuContext($event)" >
          <li :title="'Open ' + selectedContextMenu.name + ' in new tab'">
              <a  :href="$store.state.location + 'station/'+ selectedContextMenu.name + '/' + selectedContextMenu.id + '?newTab=true'" 
              @contextmenu="$event.target.click()" target="_blank">Open {{selectedContextMenu.name}} in new tab</a>
          </li></ul>
      </div>
     <div v-show="$route.name==='home'" style="position:absolute;top:10px;right:0;z-index:1;pointer-events:none;">
         <gnss-menu mode="map" v-show="$route.name=='home'"></gnss-menu>
         <file-form mode="map" v-show="$route.name=='home'"></file-form>
        <gnss-tour mode="map" id="map"></gnss-tour>
        
        
    </div>
    <div id="map" class="fullmap" @click="noStation=false"></div>
    <div  id="json" v-show="show" style="background:white;max-width:270px;">
      <div class="gnss-close" @click="closePopup"><font-awesome-icon icon="fa-solid fa-close" /></div>
      <div  style="min-height:100px;cursor:pointer;">
           <h4 style="position:relative;display:inline-block;" v-if="selected" @click="goToStation($event)" title="Go to station page" @contextmenu="menuContext($event)">STATION {{selected[1]}}
               <div  class="menu-context" @click="closeMenuContext($event)">
                <ul>
                   <li title="Open in new tab">
                       <a  :href="$store.state.location + 'station/'+ selected[1] + '/' + selected[0] + '?newTab=true'" 
                       @contextmenu="$event.target.click()" target="_blank">Open in new tab</a>
                   </li></ul>
               </div>
          </h4>
      
      <div v-if="selected ">

	      <div  style="min-width:250px;position:relative;" v-if="selected[4] && selected[4].length > 0">
	        <gnss-carousel  :height="250" :slide-width="260" dot-position="bottom" :id="selected[0]">
	          <slot v-for="img in selected[4]" >
	          <div slot="slide" style="min-width:260px;text-align:center;display:inline-block;position:relative;cursor:unset;">
	           <img :src="$store.state.preview + img" height="250" style="max-width:250px;" />
	           </div>
	          </slot>
	        </gnss-carousel>
	        <div  v-if="$store.state.back" class="gnss-admin">
	        <button @click="removeStation(selected)" type="button"><i class="fa fa-close" ></i>Supprimer la station</button>
	        </div>
	        <div v-else class="link-area" style="cursor:pointer;position:absolute;top:0;width:150px;height:250px;left:65px;" title="Go to station page" @contextmenu="menuContext($event)" @click="goToStation($event)">
             <div  class="menu-context" @click="closeMenuContext($event)">
                <ul>
                   <li title="Open in new tab">
                       <a :href="$store.state.location + 'station/'+ selected[1] + '/' + selected[0] + '?newTab=true'" style="pointer-events:auto;"
                       @contextmenu="$event.target.click()" target="_blank">Open in new tab</a>
                   </li></ul>
               </div>
           </div>
	      </div>
     </div>
      </div>
      <div v-if="selected" style="position:absolute;bottom:3px;right:10px;" title="See the station in full page">
           <span class="fa button"  @click="goToStation($event)" @contextmenu="menuContext($event)"><font-awesome-icon icon="fa-solid fa-arrows-alt" />
            <div  class="menu-context" @click="closeMenuContext($event)">
                <ul>
                   <li title="Open in new tab">
                       <a :href="$store.state.location + 'station/'+ selected[1] + '/' + selected[0] + '?newTab=true'" style="pointer-events:auto;"
                       @contextmenu="$event.target.click()" target="_blank">Open in new tab</a>
                   </li></ul>
               </div>
        </span>
      </div> 
    </div>
   </div>
</template>

<script>
// const hopscotch = () => import('hopscotch')
// import hopscotch from 'hopscotch'
import moment from 'moment'
var L = require('leaflet')
import { Icon } from 'leaflet';
L.TilesControl = require('../modules/leaflet.tiles.js')
import {MarkerClusterGroup} from 'leaflet.markercluster'
L.Control.Legend = require('../modules/leaflet.legend.js')
L.Control.Overview = require('../modules/leaflet.overview.js')
delete Icon.Default.prototype._getIconUrl;
Icon.Default.mergeOptions({
  iconRetinaUrl: require('leaflet/dist/images/marker-icon-2x.png').default,
  iconUrl: require('leaflet/dist/images/marker-icon.png').default,
  shadowUrl: require('leaflet/dist/images/marker-shadow.png').default,
});
import Util from '../modules/util.js'
import FileForm from './file-form.vue'
import GnssMenu from './gnss-menu.vue'
const GnssTour = () => import('./gnss-tour.vue')
require('leaflet-draw')
L.modLat = function( lat ){
     lat = lat%180;
     if( lat > 90 ){
          lat -= 180;
     }else if( lat < -90 ){
          lat += 180;
     }
     return lat;
}
L.modLng = function( lng ){
     lng = lng%360;
     if( lng > 180 ){
          lng -= 360;
     }else if( lng < -180 ){
          lng += 360;
     }
     return lng;
}
import GnssCarousel from './gnss-carousel.vue'

export default {
  name: 'MapComponent',
  components: {
    FileForm,
    GnssCarousel,
    GnssMenu,
    GnssTour
  },
  props: {
    top: {
      type: Number,
      default: 20
    }
  },  
  computed: {
    api () {
      return this.$store.getters['api']
    },
    defaultRequest() {
      return this.$store.getters['request']
    },
    searching () {
      return this.$store.getters['search']
    } // ,
//     maxRecords () {
//       return this.$store.state.limit
//     }
  },
  watch: {
    $route (newroute, oldroute) {
        if (newroute.name !== 'home') {
          return
        }
        if (oldroute.name !== 'home') {
          if (!this.initialized) {
            var bounds = this.initTiles()
            this.initialize(bounds)
          }
          if (!this.$store.state.viewMap) {
            return
          } else {
            this.$store.state.viewMap = false
          }
        }
       
        if (!this.routeChanged(oldroute, newroute)) {
        if (parseInt(newroute.query.selected) !== parseInt(oldroute.query.selected)) {
          // open popup
          if (!newroute.query.selected) {
            this.selected = null
            this.closePopup()
          } else if (this.stations[parseInt(this.$route.query.selected)]){
	          var station = this.stations[parseInt(this.$route.query.selected)]
		        if (station) {
		           this.openPopup(station)
		        }
          }
         
        }
        if (newroute.query.bounds &&  newroute.query.bounds !== oldroute.query.bounds ) {
          var tab = newroute.query.bounds.split(',')
          if (tab.length === 4) {
            var bounds = L.latLngBounds(
              L.latLng(parseFloat(tab[1]), parseFloat(tab[0])),
              L.latLng(parseFloat(tab[3]), parseFloat(tab[2]))
            )
            this.map.fitBounds(bounds)
           }
        }
        // this.$store.commit('changeBounds', false)
       return
      }
      this.treatmentQuery(newroute.query)
      this.$store.commit('setReset', false)
     // this.$store.commit('changeBounds', false)
    }
  },
  data () {
    return {
      map: null,
      stationId: null,
      tourStation: 3010,
      stations: [],
//       scheme: {},
      json: null,
//      baseUrl: null,
      layerControl: null,
      bounds: null,
      mode: 'graph',
      selected: null,
//      dataJsonUrl: null,
      show: false,
      markers: {},
      popup: null,
    //  groups: [],
    // groupLayers: [],
      tiles: null,
      classnames: {
        1: 'blue',
        2: 'red',
        3: 'orange'
      },
      drawControl: null,
      drawLayers: null,
      init: false,
      wait: false,
      noStation: false,
      initialized: false,
      selectedContextMenu: null,
      closingPopup: false,
      zoomMax: 5,
      tour: null
    }
  },
  created () {
    console.log('create map')
    
  },
  destroyed () {
    if (this.map) {
      this.map.off()
      this.map.remove()
      this.map = null
    }
  },
  mounted () {
    if (this.$route.name === 'home') {
       var bounds = this.initTiles()
       this.initialize(bounds)
       
     } 
  },
  methods: {
    showStation () {
      if (this.tourStation) {
        var query = Object.assign({}, this.$route.query) 
        query.selected = this.tourStation
        this.$router.push({name: 'home', query: query}).catch(()=>{})
        
        return 'truc'
      }
      return null
    },
    removeStation (selected) {
       if (!window.confirm("Voulez-vous réellement supprimer la station " + selected[1] + "\navec tous ses produits!")) {
         return
       }
       this.$http.delete(this.$store.state.back + '/entities/removeStation/' + selected[0], {
         headers: {'X-Requested-With': 'XMLHttpRequest'},
         credentials: true
       }).then(resp => {
           this.load(false)
       }, resp => {alert('error status:' + resp.status)})
    },
    closeMenuContext(e) { 
      e.stopPropagation()
      this.selectedContextMenu = null
      this.$parent.removeContextMenu()
    },
    menuContext (e) {
      e.preventDefault()
      var target = e.target
      while (target.tagName === 'svg' || target.tagName === 'path') {
        target = target.parentNode
      }

     // if (target.classList.contains('link-area')) {
        var menu = target.querySelector('.menu-context')
        if (menu) {
        menu.style.top = e.offsetY + 'px'
        menu.style.left = e.offsetX + 'px'
       }
     // }
      this.$parent.removeContextMenu()
      target.classList.add('context')
    },
    getQuery () {
      var query = Object.assign({}, this.$route.query)
      var bbox = this.map.getBounds().toBBoxString()
      query.bounds = bbox
      var expand = this.$el.querySelector('.expand')
      if (expand) {
        query['expand'] = 1
      } else {
        delete query['expand']
      }
      if (!this.map.hasLayer(this.drawLayers)) {
        query['nodraw'] = 1
      } else {
        delete query['nodraw']
      }
      return query
    },
    routeChanged(oldroute, newroute) {
      if (oldroute.name !== newroute.name) {
        return true
      }
      if (this.$store.state.reseting) {
        return true
      }
      var oldquery = Object.assign({}, oldroute.query)
      var newquery = Object.assign({}, newroute.query)
      var exclud = ['bounds', 'selected', 'nodraw', 'expand']
      for (var key in exclud) {
        delete oldquery[exclud[key]]
        delete newquery[exclud[key]]
      }

      var aKeys = Object.keys(oldquery).sort();
      var bKeys = Object.keys(newquery).sort();
      if (JSON.stringify(aKeys) != JSON.stringify(bKeys)) {

        return true
      }
      // compare route key by key
      for (var key in aKeys) {
        if (!newquery[aKeys[key]] || newquery[aKeys[key]] !== oldquery[aKeys[key]]) {
          return true
        }
      }
      return false
    },
    getUrl () {
      var queryString = new URLSearchParams(this.getQuery()).toString();

      var base = window.location.href.split(/#/)[0] + '#'
      var url = base + this.$route.path + '?' + queryString
      return url
    },

    changeQuery (params) {
      var newquery = Object.assign({}, this.$route.query)
      newquery = Object.assign(newquery, params)
      // query = query.filter(x => x !== null)
      for (var key in newquery) {
        if (newquery[key] ===  null || newquery[key].length == 0) {
          delete newquery[key]
        }
      }
      this.$router.push({name: 'home', query: newquery}).catch(()=>{})
    },
    treatmentQuery (query, first) {
      
      if (this.drawLayers) {
         this.drawLayers.clearLayers()
      }
      if (query.center && query.radius) {
        var point = query.center.split(',')
        var circle = L.circle([point[1],point[0]], query.radius * 1000, {color: 'red', weight: 1, fillOpacity:0.1})
        this.drawLayers.addLayer(circle)
        var bounds = circle.getBounds()
        this.tiles = Util.bounds2tiles(bounds, true)
      } else if (query.bbox) {
        var tab = query.bbox.match(/\-{0,1}\d+(?:\.\d+)?/g).map(Number)
        if (tab.length == 4) {
          var rectangle = L.rectangle([[tab[1], tab[0]], [tab[3], tab[2]]], {color: 'red', weight: 1, fillOpacity:0.1})
          this.drawLayers.addLayer(rectangle)
          var bounds = rectangle.getBounds()
          this.tiles = Util.bounds2tiles(bounds, true)
        } else {
          // remove query bbox?
        }
      }
      this.load(first)

    },
   
    initDrawControl () {
        if (this.drawControl) {
          return
        }
        this.drawLayers = new L.FeatureGroup()
        this.map.addLayer(this.drawLayers)
        this.drawControl = new L.Control.Draw({
          draw: {
            rectangle: {
              shapeOptions: {
                color: '#ff0000',
                weight: 1,
                fillOpacity:0.2
              }
            },
            circlemarker: false,
            circle: {
              shapeOptions: {
                color: '#ff0000',
                weight: 1,
                fillOpacity:0.2
              }
            },
            marker: false,
            polygon: false,
            polyline: false
          },
          edit: {
            featureGroup: this.drawLayers
          }
        })
        this.drawControl.addTo(this.map)
        this.layerControl.addOverlay(this.drawLayers, 'Selected area')
        var self = this
        this.map.on(L.Draw.Event.CREATED, function (e) {
          self.$store.commit('setDraw', true)
          switch (e.layerType) {
	          case 'rectangle':
		          let layer = e.layer
		          let bounds = e.layer.getBounds()
		          self.changeQuery({bbox: bounds.toBBoxString(), center: null, radius: null})
		          return
		          break
	          case 'circle':
	            var center = e.layer.getLatLng()
	            var radius = e.layer.getRadius()
	            self.changeQuery({bbox: null, center: center.lng + ',' + center.lat, radius: Math.round(radius)/1000})
              return
	            break
          }
   
        
        })
//         this.map.on(L.Draw.Event.EDITSTART, function (e) {
//           console.log(e)
//          self.drawLayers.eachLayer(function (layer) {
//            layer.setStyle({fillOpacity: 0.1})
//          })
//         })
      
        this.map.on(L.Draw.Event.EDITED, function (e) {
          let bounds
          self.$store.commit('setDraw', true)
          e.layers.eachLayer(function (layer) {
            if (layer instanceof L.Circle) {
              var center = layer.getLatLng()
              var radius = layer.getRadius()
              self.changeQuery({center: center.lng + ',' + center.lat, radius: Math.round(radius)/1000})
              // self.$router.push({name: 'home', query: {center: center.lng + ',' + center.lat, radius: Math.round(radius)/1000}})
           
            } else if (layer instanceof L.Rectangle) {
              let bounds = layer.getBounds()
              self.changeQuery({bbox: bounds.toBBoxString(), center: null, radius: null})
            }
          })
         
          
        })
      
        this.map.on(L.Draw.Event.DELETED , function (e) {
          self.$store.commit('setDraw', true)
          self.drawLayers.clearLayers()
          self.changeQuery({bbox: null, center: null, radius: null})
     
        })
    },
    animationEnd () {
      if (this.init || this.wait) {
        this.init = false
        return
      }
      
      var bbox = this.map.getBounds().toBBoxString()
      var query = Object.assign({}, this.$route.query)
      query.bounds = bbox
      this.tiles = Util.bounds2tiles(this.map.getBounds())
      // this.$store.commit('changeBounds', true)
      var self = this
      // self.$store.commit('setReset', true)
       setTimeout(function (e) {
        self.wait = false
      }, 2000)
      this.$router.push({name: 'home', query: query}).catch(()=>{})
     
    },
    initTiles () {
      var self = this
      var bounds = null
      if (this.$route.query.bounds ) {
        console.log('hasBounds')
        var tab = this.$route.query.bounds.split(',')
        if (tab.length === 4) {
          bounds = L.latLngBounds(
            L.latLng(parseFloat(tab[1]), parseFloat(tab[0])),
            L.latLng(parseFloat(tab[3]), parseFloat(tab[2]))
          )
        }
        this.init = true
      } 
      if (!bounds || !bounds.isValid()) {
        var bounds =  L.latLngBounds([50, 0.01],[41, 10.5])
      }
      this.tiles = Util.bounds2tiles(bounds)
      // this.map.fitBounds(bounds)
      
      
      return bounds
    },
    initialize (bounds) {
      this.map = L.map( "map", {scrollWheelZoom: true, maxZoom:18}).setView(bounds.getCenter(), 6);
      this.map.fitBounds(bounds)
      var overview = new L.Control.Overview(this.overview)
      overview.addTo(this.map)
      
      this.layerControl = new L.TilesControl(null, null, {position: 'topleft'})
      this.layerControl.tiles.osm.layer.addTo(this.map)
      this.layerControl.addTo(this.map)
      if (this.$store.state.adding) {
        var self = this
        var url = this.api.replace('api/1.0', 'admin') + 'entities/add'
        this.map.on('click', function (e) {
          console.log(e.latlng)
          L.marker(e.latlng)
          .addTo(self.map)
          self.$http.post(url, e.latlng, {credentials: true, emulateJSON:true})
          .then(resp => {console.log(resp.body)})
        })
       
      }
      var legend = new L.Control.Legend()
      legend.addTo(this.map)
//       var control = new L.Control.Form()
//       control.addTo(this.map)
      this.popup = L.popup({
        autoPan:true, 
        minWidth: 250, 
        autoPanPaddingTopLeft: [0,0], 
        minHeight:250, 
        maxHeight: this.$store.state.back ? 310 : 270, 
        closeButton: false
      })
      this.initDrawControl()
      this.treatmentQuery(this.$route.query, true)
      var self = this

      
       this.map.on('popupclose', function (e) {
        // self.selected = null
        //  console.log('event popupclose')
        
         var query = Object.assign({}, self.$route.query) 
        
         self.closingPopup = query['selected']
         delete query['selected']
         
         setTimeout(function () {
           self.closingPopup = false
         }, 300)
         self.$router.push({name: 'home', query: query}).catch(()=>{})
         return false
       })
       this.map.on('zoomstart movestart', function (e) {
         // console.log(self.map.getZoom())
          self.selectedContextMenu = null
       })
	     this.map.on('zoomend moveend', function (e) {
	       // console.log(self.map.getZoom())
	       if (self.$route.name === 'home') {
	        self.animationEnd()
	       }
	       
	     })
	     this.map.on('zoomstart', function (e) {
           this.closePopup()
       })
	     this.map.on('autopanstart', function (e) {
	       self.wait = true
	     })
      var node = document.querySelector('#json')
      this.popup.setContent(node)
//       var self = this
//       var bounds = null
//       if (this.$route.query.bounds ) {
//         console.log('hasBounds')
//         var tab = this.$route.query.bounds.split(',')
//         if (tab.length === 4) {
//           bounds = L.latLngBounds(
//             L.latLng(parseFloat(tab[1]), parseFloat(tab[0])),
//             L.latLng(parseFloat(tab[3]), parseFloat(tab[2]))
//           )
//         }
//         this.init = true
//       } 
//       if (!bounds || !bounds.isValid()) {
//         var bounds =  L.latLngBounds([50, 0.01],[41, 10.5])
//       }
//       this.tiles = Util.bounds2tiles(bounds)
//       this.map.fitBounds(bounds)
      
//       this.treatmentQuery(this.$route.query, true)
      this.initialized = true
     
    },
    closePopup() {
      this.map.closePopup()
//       this.selected = null
//       var query = Object.assign({}, this.$route.query) 
//       delete query['selected']
//       this.$router.push({name: 'home', query: query}).catch(()=>{})
    },

    goToStation (e) {
      e.preventDefault()
      e.stopPropagation()
      var query = Object.assign({}, this.$route.query)
      var bbox = this.map.getBounds().toBBoxString()
      this.$store.commit('setQuery',{name: 'home', query: this.getQuery()})
     // this.$store.commit('setStations', this.stations)
      var query = Object.assign({}, this.$route.query)
      delete query.network
      delete query.selected
      delete query.bounds
      delete query.bbox
      delete query.center
      delete query.radius
      delete query.several
      this.$router.push({ name: 'station', params: { name: this.selected[1], id: this.selected[0]}, query: query})
    },
    loadTile(index, tiles, params, first) {
      
      if (index >= tiles.length) {
        return
      }
      var url = this.api + 'stations/' + tiles[index]
//       var params = Object.assign({}, this.defaultRequest)
//       params = Object.assign(params, this.$route.query)
      this.$http.get(url, {params: params})
      .then(
          resp => {
            this.displayByTile(resp.body, index, tiles, params, true)
            // this.loadTile(index + 1, tiles, params, first)
          },
          resp => {console.log('Erreur de chargement')}
       )
    },
    load (first) {
      if (!this.api) {
        console.log('Service unvailable!')
      }
      // remove all layers
      for (var x in this.markers) {
         this.markers[x].off()
         this.markers[x].clearLayers()
         this.markers[x].remove(this.map)
         this.markers[x] = null
       }
       
       this.markers = {}

       this.stations = []
       // this.bounds = null
     
      this.$store.commit('setSearching', true)
      var tiles = this.tiles
      var params = Object.assign({}, this.defaultRequest)
      params = Object.assign(params, this.$route.query)
      this.loadTile(0, tiles, params, first)
      return
     
    },
//     displayByPart (data, index, keys, init) {
//       var self = this
      
//       if (index === 0) {
//            for (var region in this.markers) {
//              this.markers[region].off()
//              this.markers[region].clearLayers()
//              this.markers[region].remove(this.map)
//              this.markers[region] = null
//            }
//            keys = Object.keys(data)
//            this.markers = {}
//         this.groupLayers = []
//         this.stations = []
//         this.groups = []
//         this.bounds = null
//       }
//       if (index === 0 && keys.length === 0) {
//      // if (index === 0 && data.stations.length === 0) {
//         this.noStation = true
//         this.$store.commit('setSearching', false)
//         return
//      }
//      this.addRegion(keys[index],data[keys[index]] )

// //       for(var i= index; i < index + this.$store.state.batch && i < data.stations.length ; i++) {
// //           this.addStation(data.stations[i])
// //       }
    
//        if (keys.length -1 > index ) {
//         setTimeout(function () {
//           self.displayByPart(data, index + 1 , keys, init)
//         }, 0)
// //       if (data.stations.length > index + this.$store.state.batch ) {
// //         setTimeout(function () {
// //           self.displayByPart(data, index + self.$store.state.batch , init)
// //         }, 0)
//          return
//       }
//       this.displayEnd(init)
      
//     },
//     display (data, index, init) {
//       var self = this
//       if (index === 0) {
//            for (var region in this.markers) {
//              this.markers[region].off()
//              this.markers[region].clearLayers()
//              this.markers[region].remove(this.map)
//              this.markers[region] = null
//            }
//            this.markers = {}

//         this.groupLayers = []
//         this.stations = []
//         this.groups = []
//         this.bounds = null
//       }
//       if (index === 0 && data.stations.length === 0) {
//         this.noStation = true
//         this.$store.commit('setSearching', false)
//         return
//       }
//       data.stations.forEach(function (value) {

// 	        self.addStation(value)
//       })
    
     
//       if (data.stations.length === this.maxRecords ) {
//          this.load(index + 1, init)
//          return
//       }
//       this.displayEnd(init)
      
//     },
    displayByTile (stations, index, tiles, params, init) {
      var self = this
      
//       if (index === 0) {
//            for (var x in this.markers) {
//              this.markers[x].off()
//              this.markers[x].clearLayers()
//              this.markers[x].remove(this.map)
//              this.markers[x] = null
//            }
           
//            this.markers = {}
           
//         for (var key in this.groupLayers) {
//           if (this.groupLayers[key]) {
//            this.groupLayers[key].clearLayers()
//            this.groupLayers[key].remove(this.map)
//            this.layerControl.removeLayer(this.groupLayers[key])
//            this.groupLayers[key] = null
//           }
//        }
       // this.groupLayers = []
//         this.stations = []
//        // this.groups = []
//         this.bounds = null
//       }
      // var tile = tiles[index]
//       if (index === ) {
//      // if (index === 0 && data.stations.length === 0) {
//         this.noStation = true
//         this.$store.commit('setSearching', false)
//         return
//      }
     this.addTile(index, tiles,stations, params, init)
     if (index === tiles.length - 1) {
      this.displayEnd(init)
     }
    },
    
    displayEnd (init) {
//       if (this.markers['W_EU']) {
//         this.markers['W_EU'].addTo(this.map)
//       }
      this.$store.commit('setSearching', false)
      if (this.stations.length === 0) {
        this.noStation = true
      }
      if (init && this.$route.query.nodraw) {
        this.drawLayers.remove()
      }
      var bounds = this.bounds
      if (this.$route.query.bounds ) {
        console.log('hasBounds')
        var tab = this.$route.query.bounds.split(',')
        if (tab.length === 4) {
          bounds = L.latLngBounds(
            L.latLng(parseFloat(tab[1]), parseFloat(tab[0])),
            L.latLng(parseFloat(tab[3]), parseFloat(tab[2]))
          )
        }
        this.init = true
      } 
      if (!bounds && this.drawLayers.getBounds()) {
          this.bounds = this.drawLayers.getBounds()
          bounds = this.bounds
          this.init = false
      }
      if (this.$store.state.drawing) {
        if (this.drawLayers.getBounds() && this.drawLayers.getBounds().isValid()) {
           bounds = this.drawLayers.getBounds()
        }
        this.init = true
        this.$store.commit('setDraw', false)
      }
      // this.$store.commit('resetStations')
      if (bounds && bounds.isValid()) {
          console.log('fit bounds')
          this.map.fitBounds(bounds)
      }
      if (this.$route.query.selected) {
        var station = this.stations[parseInt(this.$route.query.selected)]
        if (station) {
           this.openPopup(station)
        } else {
           this.closePopup()
        }
      }
    },
    getClassname (year) {
      if (year < 1) {
        return 'blue'
      }
      if (year < 5) {
        return 'orange'
      }
      return 'red'
    },

    openStationContextMenu (e) {
      if (e.layer.options.title.length === 9) {
        this.selectedContextMenu = {
            name: e.layer.options.title,
            id: e.layer.options.id,
            x: e.containerPoint.x,
            y: e.containerPoint.y
        }
      }
    },

    addTile (index, tiles, features, params, init) {
      var self = this
      var tile = tiles[index]
      
      if (index === 0) {
        this.zoomMax = 5
        if (features.length > 1000) {
            this.zoomMax = 7
        }
      } 
      var zoomMax = this.zoomMax
      console.log('tile=' + index + '..ie ' + tiles[index])
      this.markers[tile] = L.markerClusterGroup({
        polygonOptions:{weight:1, color: '#00008b', opacity:1, fillOpacity:0.1},
        disableClusteringAtZoom: null,
        chunkedLoading: true,
        removeOutsideVisibleBounds:true,
        spiderfyOnMaxZoom: true,
        chunkInterval: 200,
        chunkDelay: 50,
        maxClusterRadius:function(zoom) {
          if (zoom > zoomMax) {
            return 3
          }
          return 80
        },
        animateAddingMarkers:false})
//        this.markers[tile].on('animationend', function () {
//          //self.loadTile(index + 1, tiles, params, init)
//         // self.animationEnd()
//       })
      
      features.forEach(function (feature) {
        self.stations[feature[0]] = feature
        var html = '<span></span>'
        var className = self.getClassname(feature[2])
        var icon = L.divIcon({
          className: 'icon-marker marker-' + className, 
          iconSize: [15,15],
          html: html})

          var marker = L.marker(feature[3], {icon: icon, id: feature[0], title: feature[1]})
          // marker.on('click', self.getData)
          self.markers[tile].addLayer(marker)
      })
      this.markers[tile].addTo(this.map)
      this.markers[tile].on('click', function (e) {
          self.getData(e.layer)
       })
       this.markers[tile].on('contextmenu', function (e) {
          self.openStationContextMenu(e)
       })
       if (!this.bounds) {
        this.bounds = L.latLngBounds()
      }
      this.bounds.extend(this.markers[tile].getBounds())
      this.loadTile(index + 1, tiles, params, init)
         
    },
    addStation (feature) {
      this.stations[feature[0]] = feature
      var region = this.getRegion(feature)
     // var groupId = this.(feature)
      var html = '<span></span>'
      var className = this.getClassname(feature[2])
      var icon = L.divIcon({
        className: 'icon-marker marker-' + className, 
        iconSize: [15,15],
        html: html})

      var self = this
      var marker = L.marker(feature[3], {icon: icon, id: feature[0], title: feature[1]})
      if (!this.markers[region]) {
        
        this.markers[region] = L.markerClusterGroup({
          polygonOptions:{weight:1, color: '#00008b', opacity:1, fillOpacity:0.1},
          disableClusteringAtZoom: null, 
          maxClusterRadius:function (zoom) {
            if (zoom > 5 && region !== 'OHIATA' && region !== 'ATF') {
                return 3
            }
            return 40
          },
          animateAddingMarkers:false})
        this.markers[region].on('animationend', function () {
          self.animationEnd()
        })
         this.markers[region].on('click', function (e) {
            self.getData(e.layer)
           })
        this.markers[region].on('contextmenu', function (e) {
          self.openStationContextMenu(e)
       })
        if (region !== 'W_EU') {
          this.markers[region].addTo(this.map)
        }
 
      }
      this.markers[region].addLayer(marker)
      
      if (!this.bounds) {
        this.bounds = L.latLngBounds()
      }
      this.bounds.extend(feature[3])
    },
    openPopup (station) {
	      this.selected = station
	      this.mode = 'image'
	      this.show = true
	      var self = this
	     
	      this.popup.setLatLng(station[3])
	      this.wait = true
	      this.popup.openOn(this.map)
	       
        //wait before movend and other
        setTimeout(function () {
          self.wait = false
        }, 1000)
    },
    overview () {
      if (this.bounds && this.bounds.isValid()) {
        this.map.fitBounds(this.bounds)
      }
    },
    getData (e) {
      var query = Object.assign({}, this.$route.query)
      if (this.closingPopup === e.options.id) {
        this.closingPopup = false
        return
      }
      this.mode = 'image'
      this.selected = e.options
      console.log(this.selected)
      this.show = true
//       this.popup.setLatLng(e.target.getLatLng())
//       this.popup.openOn(this.map)
      query.selected = e.options.id
      this.$router.push({name: 'home', query: query}).catch(()=>{})
      return false
    },

//     getStation () {
//       this.mode = 'station'

//       if (!this.json || this.json['@datastream.id'] !== this.datastreamId) {
//         this.json = null
//         this.$http.get(this.feature.properties['Thing@iot.navigationLink'])
//         .then(resp => {
//           this.json = resp.body
//           this.json['@datastream.id'] = this.datastreamId})
//       }
//     },
    createPopup(marker) {
      this.mode = 'graph'
    }
  }
}
</script>
<style src='leaflet/dist/leaflet.css' />

    /* global styles */
</style> 
<style src="leaflet-draw/dist/leaflet.draw.css"></style>
<style src="leaflet.markercluster/dist/MarkerCluster.Default.css"></style>
<style src="hopscotch/dist/css/hopscotch.css"></link>
<!--  <style src='../assets/css/leaflet.divicon.arrow.css'></style>-->

<style>
.tour-hello-hopscotch {
  z-index:1000;
}
/** .gnss-bars:hover + .gnss-bars-content {
  display:block;
}
.gnss-bars-content:hover {
  display:block;
} **/

.msg-alert {
  position:absolute;
  left:calc(50% - 150px);
  top:calc(50% - 50px);
  box-shadow: 0 0 5px rgba(0,0,0,0.5);
  border-radius:5px;
  
  z-index:1;
  background:rgba(255,255,255, .8);
  padding:30px;
}
.leaflet-touch .leaflet-control-layers-toggle {
  width: 30px;
  height: 30px;
}
 a.leaflet-form-link {
   width: 44px;
  height: 44px;
  line-height:44px;
  font-size: 1.2rem;
  cursor: pointer;
}

div.leaflet-marker-icon {
  margin-left: -7px;
margin-top: -7px;
width: 15px;
height: 15px;
transform: translate3d(255px, -215px, 0px);
z-index: -215;
outline: none;
}
div[id="map"] a.icon-palette:before {
  content:"\E802";
  font-size:16px;
  font-family: "fontello";
}
div[id="map"] div.leaflet-overview {
  margin-top:1px;
  background:white;
  cursor: pointer;
}
div[id="map"] div.leaflet-overview div {
  max-width: 20px;
  margin: 5px;
  
}
div[id="map"] div.lfh-control-legend {
  background: white;
}
div[id="map"] div.lfh-control-legend:hover {
   height:auto;
   background: white;
   width:auto;
}
div[id="map"] div.lfh-control-legend:hover  a,
div[id="map"] div.lfh-control-legend.hovered  a  {
  display:none;
}

div[id="map"] div.lfh-control-legend  > div{
  display:none;
  width:auto;
  padding:5px;
  background:white;
}
div.leaflet-draw-section > .leaflet-draw-toolbar.leaflet-bar {
  margin-top:2px;
}
div[id="map"] div.lfh-control-legend:hover > div,
div[id="map"] div.lfh-control-legend.hovered > div {
  display:block;
}
div[id="map"] a.leaflet-draw-draw-circle:before {
  content:"\2B24";
}

div[id="map"] a.leaflet-draw-draw-rectangle:before{
  content:"\2B1B";
}
div[id="map"] a.leaflet-draw-edit-edit:before{
  content:"\e800";
  font-size:14px;
  font-family: "fontello"
}
div[id="map"] a.leaflet-draw-edit-remove:before{
  content:"\f1f8";
  font-size:14px;
   font-family: "fontello"
}
 /** menu leaflet draw */
  div[id="map"] .leaflet-container .leaflet-draw-section a {
    color: #fff;
    font-weight: 700;
  }
    div[id="map"] .leaflet-draw-actions li a {
    color: #fff;
  }
  div[id="map"] .leaflet-draw-actions li {
    display: block;
    margin: 0 0 1px 0;
    border-radius: 0;
  }
  div[id="map"] .leaflet-draw-actions {
    background: #555;
    margin-left:5px;
    padding: 2px;
    -webkit-border-radius: 0 4px 4px 4px;
    border-radius: 0 4px 4px 4px;
  }
  div[id="map"] .leaflet-draw-actions li:first-child a{
    -webkit-border-radius: 0 4px 0 0;
    border-radius: 0 4px 0 0;
  }
  div[id="map"] .leaflet-draw-actions li:last-child a{
    -webkit-border-radius: 0 0px 4px 4px;
    border-radius: 0 0px 4px 4px;
  }
div[id="json"] .gnss-close {
  padding:3px;
  border: 1px dotted white;
  border-radius: 3px;
  cursor: pointer;
  position: absolute;
  top:5px;
  right:10px;font-size:14px;
}
div[id="json"] .gnss-close:hover {
 border-color: grey;
}
.step {
 /* margin-right:45px;*/
  text-align: left;
  font-size:10px;
  width:30px;height:5px;
}
.step:first-child:after {
 content:' 350';
 /* margin-right: -30px;*/
  margin-left:35px;
 }
 .step:nth-child(15):before {
 content:'0';
 width:40px;
 margin-left:35px;
 }
 .step:last-child:before {
 content:'-350';
margin-left:35px;
 }
#map {
  min-height:500px;
  height:100vh;
  width:100%;
  z-index:0;
}
#map .leaflet-popup-scrolled {
  border: none;
  padding-top: 0;
}
#map h4 {
  margin:0;
  color:black;
}
#map h4:hover {
  font-weight:600;
}
div.navigator {
 position: fixed;
   bottom:5px;
   width:auto;
   left:50%;
   -webkit-transform: translateX(-50%);
    -moz-transform: translateX(-50%);
    -ms-transform: translateX(-50%);
    -o-transform: translateX(-50%);
    transform: translateX(-50%);
   text-align:center;
   z-index:1000;
   pointer-events:none;
}
 
.leaflet-div-icon {
  /**  position: relative;
    top: -50%;
    left: -50%; **/
 
}
.lfh-control-legend span,
div.icon-marker span {
  color: white;
  width: 15px;
  height: 15px;
  display: inline-block;
  border: 1px solid rgba(0,0,0,1);
  border-radius:3px;
  text-align:center;
  line-height:15px;
  vertical-align:middle;
  font-family:Arial;
}

div.icon-marker span {
  line-height:12px;
  font-weight:700;
  vertical-align: middle;
}
div.fullmap div.icon-marker span.fra {
  width:10px;
  height:11px;
  font-size:12px;
  line-height:9px;
  border-radius:2px;
  border: 1px solid rgba(0,0,0,0.2);
  padding-top:0;
}
.lfh-control-legend span.marker-red,
div.marker-red span{
  background-color: darkred;
}
.lfh-control-legend span.marker-blue,
div.marker-blue span {
  background-color: rgba(0, 0, 205, 0.9);
}
.lfh-control-legend span.marker-orange,
div.marker-orange span {

  background-color: darkorange;

}
div.arrow-down {
  width: 20px;
  height: 20px;
  
  background-size: 50% 100%;
  background-repeat: no-repeat;
  background-position: left, right;
  line-height:20px;
  vertical-align: middle;
  color:white;
  text-align:center;
}
div.a-red {
  background-image:
    linear-gradient(to bottom right, transparent 50%, darkred 0),
    linear-gradient(to top right, darkred 50%, transparent 0);
}
div.a-orange {
  background-image:
    linear-gradient(to bottom right, transparent 50%, darkorange 0),
    linear-gradient(to top right, darkorange 50%, transparent 0);
}
div.a-blue {
  background-image:
    linear-gradient(to bottom right, transparent 50%,  #0000CD 0),
    linear-gradient(to top right,  #0000CD 50%, transparent 0);
}
div.leaflet-control-layers-overlays div.marker-red,
div.leaflet-control-layers-overlays div.marker-blue, 
div.leaflet-control-layers-overlays div.marker-orange {
  display:inline-block;
  width: 15px;
  height: 15px;
  vertical-align: middle;
} 
 ul.menu-content {
  font-size: 0.8rem;
  border-bottom: 1px solid #adadad;
  margin:5px 0;
  padding: 5px 0 0 0;
 }
 ul.menu-content li {
  display: inline-block;
   min-width: 50px;
  font-family: "Helvetica Neue", Helvetica, Arial, sans-serif;
  border: 1px solid #adadad;
  border-bottom: none;
  text-align: center;
  color: black;
  height: 30px;
  padding:0;
  vertical-align: middle;
  margin: 0;
  background: #efefef;
  text-transform: capitalize;
  vertical-align:top;
}
.wrapper-content ul.menu-content li:last-child, 
.wrapper-layout ul.menu-content li:last-child {
  margin-bottom:0;
}
ul.menu-content li span {
    text-transform: capitalize;
    vertical-align: middle;
    height: 30px;
    min-width:50px;
    color:black;
    padding: 5px 10px 0 10px;
    text-decoration: none;
    display:inline-block;
    cursor:pointer;
}
ul.menu-content li span:hover {
  color:#b8412c;
}
ul.menu-content li span.selected {
  background:white;
  color:#b8412c;
}

</style>
