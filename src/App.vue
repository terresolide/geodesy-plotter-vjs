<template>
 <div id="gnss" class="gnss-terresolide" style="position:relative;" @click="removeContextMenu">
 <!--   <spot-gins root="https://catalog.formater/FROST-Server/v1.1/" ></spot-gins>
 -->  <div v-if="msgBack && $store.state.back" class="gnss-hello" @click="msgBack=false">N'oubliez pas de reconstruire le cache après vos modifications!</div>
      <div v-if="hello && email" class="gnss-hello" @click="hello=false">
        Hello {{email}}!
      </div>
      <div v-if="bye" class="gnss-hello" @click="bye=false" style="text-align:left;font-weight:500;" v-html="bye">
      </div>
      <div class="gnss-hello" v-if="pleaseLogin" style="text-align:left;max-width:500px;font-weight:500;">
         To download product you must authenticate.<br><br>
         You can authenticate using an <b>Orcid</b> or <b>Renater</b> account or by creating an account.
        <div style="text-align:right;margin-top:10px;"> 
           <button type="button" @click="cancelPreLogin()">Cancel</button>
           <button type="button" @click="launchLogin()">Login/Register</button>
         
        </div>
      </div>
      <div v-if="maintenance" class="gnss-maintenance">
        <div v-if="message" v-html="message"></div>
        <div v-else>
        SERVICE <b>UNDER MAINTENANCE.</b><br>
        Please come back later.
        </div>
      </div>
 
      <div v-else >
        <div v-if="message && showMessage" class="gnss-message" @click="showMessage=false">
          <div style="position:absolute;top:0px;right:4px;">&times;</div>
          <div  v-html="message"></div>
        </div>
	     <map-component ref="map"></map-component>
	
			 <div  v-if="$route.name !== 'home'" id="page" style="position:absolute;z-index:2;">
			
			     <div class="gnss-attribution">Component by <a href="https://www.poleterresolide.fr" title="FormaTerre"><img :src="require('./assets/img/new_favicon.png').default" width="24" /></a></div>
			     <router-view></router-view>
			 </div>
		 </div>
 </div>
</template>

<script>
import {AuthService} from 'formater-auth-service-js'
import MapComponent from './components/map.vue'
import './assets/fontello/css/fontello.css'
// import { AuthService } from './modules/AuthService.js'
export default {
  name: 'App',
  components: {
    MapComponent //,
   // GnssUser
  },
  computed: {
    email () {
      return this.$store.getters['user/email']
    },
    message () {
      return this.$store.state.message
    }
  },
  data () {
    return {
      maintenance: false,
      showMessage: true,
      hello: false,
      bye: null,
      service: null,
      waitingUrl: null,
      pleaseLogin: false,
      msgBack:true,
      escapeListener: null,
      clickListener: null
    }
  },
  created () {
    this.searchCodeLists()
    this.escapeListener = this.escape.bind(this)
    document.addEventListener('keyup', this.escapeListener)
    // test userinfo
    if (this.$store.state.auth) {
      this.$http.get(this.$store.state.api.replace('api/1.0/', 'userinfo'), {credentials: true})
      .then(resp => {console.log(resp)}, resp => console.log('not authenticated'))
    }
  },
  mounted () {
    this.clickListener = this.closeTooltip.bind(this)
    document.addEventListener('click', this.clickListener)
    // let bokeh = document.createElement('script')
    // bokeh.setAttribute('src', 'https://cdn.bokeh.org/bokeh/release/bokeh-3.4.3.min.js')
    // document.head.appendChild(bokeh)
    // let table = document.createElement('script')
    // table.setAttribute('src', 'https://cdn.bokeh.org/bokeh/release/bokeh-tables-3.4.3.min.js')
    // document.head.appendChild(table)

    // let widget = document.createElement('script')
    // widget.setAttribute('src', 'https://cdn.bokeh.org/bokeh/release/bokeh-widgets-3.4.3.min.js')
    // document.head.appendChild(widget)
    var location = window.location.href
    var pos = location.indexOf('#')
    this.$store.state.location = location.substring(0, pos +2)
    if (this.$store.state.auth) {
	    AuthService.setRedirectUri(this.$store.state.ssoLogin, this.$store.state.ssoLogout)
	    this.service = new AuthService('gnssterresolide',this.$store.state.sso)
	    this.service.add()
	    var self = this
	    this.service.on('authenticated', function (user, serv) {
	       self.$store.commit('user/set', user)
	       self.launchWaiting()
	       self.hello = true
	       setTimeout(function () {
	          self.hello = false
	       }, 6000)
	    })
	    this.service.on('logout', function (resp) {
	      self.$store.commit('user/set', null)
	      if (resp && resp.msg) {
	        self.bye = resp.msg
	      }
	    })
	    this.service.testLogin()
    }
    
  },
  destroyed () {
    if (this.service) {
      this.service.remove()
      this.service = null
    }
    document.removeEventListener('keyup', this.escapeListener)
    this.escapeListener = null
    document.removeEventListener('click', this.clickListener)
    this.clickListener = null
  },
  methods: {
    cancelPreLogin () {
      this.pleaseLogin = false
      this.waitingUrl = null
    },
    closeTooltip (e) {
      var nodes = document.querySelectorAll('.tooltip-show')
      nodes.forEach(function (el) {
        el.classList.remove('tooltip-show')
      })
    },
    escape (e) {
      if (e.keyCode === 27) {
          console.log(this.$route.name)
          this.$router.go(-1)

      }
    },
    launchLogin () {
      this.pleaseLogin = false
      if (this.service) {
        this.service.login()
      }
    },
    launchWaiting () {
      if (!this.waitingUrl) {
        return
      }
      var a = document.createElement('a')
      a.setAttribute('href', this.waitingUrl)
      a.setAttribute('download', 'file')
      document.body.appendChild(a)
      a.click()
      a.remove()
      this.waitingUrl = null
    },
    preLogin (url) {
      this.pleaseLogin = true
      this.waitingUrl = url
    },
    removeContextMenu () {
      if (this.$refs.map) {
        this.$refs.map.selectedContextMenu = null
      }
      var nodes = document.querySelectorAll('.context')
      nodes.forEach(function (node) {
        node.classList.remove('context')
      })
    },
    searchCodeLists () {
      var url = this.$store.getters['api'] + 'codelists/'
      if (this.$store.state.solution) {
        url += this.$store.state.solution
      } else if (this.$store.state.analysisCenter) {
        url += this.$store.state.analysisCenter
      }
      this.$http.get(url)
      .then(resp => {
        this.$store.commit('setCodeList', resp.body)
      }, resp => {this.maintenance = true})
    }
  }
}
</script>

<!--<style scoped src='./assets/fontello/css/fontello.css' />-->
<style>
.gnss-message {
  position:absolute;
  width: 700px;
  margin:auto;
  color:darkred;
  font-size:26px;
  line-height:2rem;
  top:10%;
  left: calc(50% - 350px);
  text-align:center;
  background: white;
  border: 2px solid darkred;
  padding:20px;
  border-radius: 5px;
  z-index: 1000;
  cursor:pointer;
}
.gnss-terresolide {
  overflow:hidden;
}
.gnss-terresolide  a {
 cursor: pointer;
 color: #b8412c;
}
.gnss-terresolide a:hover {
   color:#7b080e;
}
.gnss-terresolide button a,
.gnss-terresolide button a:hover {
  color: black;
  text-decoration: none;
  background:transparent;
}
.gnss-terresolide  a,
.gnss-terresolide a:hover {
  text-decoration:none;
}
.gnss-terresolide .leaflet-control-container a,
.gnss-terresolide .leaflet-control-container a:hover{
  color:black;
}
.gnss-maintenance {
  color:darkred;
  font-size:26px;
  line-height:2rem;
  margin-top:10%;
  text-align:center;
  pointer-events:none;
}
.gnss-hello {
    position:absolute;
    font-size:16px;
    left: calc(50% - 250px);
     min-width:500px;
    text-align:center;
    top: 20%;
    font-weight:700;
    padding: 30px 20px;;
    background: white;
    border-radius:5px;
    border:1px solid grey;
    cursor: pointer;
    box-shadow: 0 0 10px rgba(0,0,0,0.5);
    z-index:100;
}
.gnss-top {
    position:fixed;
    bottom:30px;
    right: 10px;
    font-size:50px;
    opacity:0.8;
    cursor:pointer;
    z-index:100;
}
@media screen and (min-width: 1440px) {
   .gnss-top {
       right: calc(50% - 690px);
    }
 }
.gnss-top:hover {
  opacity:1;
}
.gnss-terresolide label {
  margin-bottom: 5px;
  font-weight: 700;
}
.gnss-terresolide pre {
   font-family: Consolas,monospace
}
ul[id="shortcuts"] {
 display:none;
}
.gnss-terresolide {
  font-family: sans-serif;
  line-height:1;
}
.gnss-terresolide h3{
  font-family: sans-serif;
  line-height:1;
  margin-top:20px;
}
.wrapper-content .page-station h4 {
  margin: 10px 0;
} 
.gnss-attribution {
  position:absolute;
  bottom:0px;
  left:0px;
  padding: 0 6px;
  font-size:0.8rem;
  background: rgba(255,255,255,0.2);
  z-index:10;
}

div.menu-context,
div.menu-content {
  display:none;
  position: absolute;
  border-radius: 5px;
  font-size:1rem;
  font-weight:400;
  left:0;
  top:20px;
  background: #444;
  color: #f9f9f9;

  padding:0px;
  z-index:1;
   border:1px solid white;
   box-shadow: 0 0 5px rgba(0,0,0,0.5);
}
div.menu-context {
    min-width:200px;
}
.context > div.menu-context,
.expand > div.menu-content {
  display:block;
}
div.menu-context ul,
div.menu-content ul {
  margin:0;
  padding:0;
  list-style-type:none;
}
div.menu-context ul li,
div.menu-content ul li {
  padding:2px 5px;
  border-radius:5px;
  margin:2px
}
div.menu-context ul li a,
div.menu-content ul li a,
div.product-link div.menu-content ul li a{
  text-decoration:none;
  color: #f9f9f9;
   min-width:55px;
  display:inline-block;
  background: transparent;
  border:none;
}
div.menu-context ul li a {
  min-width:200px;
}
div.menu-context ul li:hover,
div.product-link div.menu-content ul li:hover {
  background:#f4661b;
}
div.product-link div.menu-content ul li a:hover {
    color:inherit;
    background: inherit;
}
 div.page-station {
    width:100%;
    background: url('./assets/img/background-gnss.png') no-repeat center center fixed;
     -webkit-background-size: cover;
  -moz-background-size: cover;
  -o-background-size: cover;
  background-size: cover;
   overflow:hidden;
  }
  div.station-content {
    background:white;
    margin:auto;
    max-width:1400px;
    min-height:100vh;
    padding-bottom:20px;
    box-shadow: 0 0 3px rgba(0,0,0,.5);
  }
   div.station-header {
    position:relative;
    background: lightgrey;
    margin: 0;
    padding: 3px 5px;
  }
   div.station-body {
    padding: 3px 10px;
    max-height:calc(100vh - 80px);
    overflow-x:hidden;
  }
  div.station-header h2 {
    padding:0;
    margin:5px;
  }
  span.button.close {
    position: absolute;
    right: 15px;
    top:5px;
    opacity:1;
    border: 1px dotted transparent;
   
  }
  span.button.close:hover {
    border-color:grey;
  }
.gnss-attribution img {
  vertical-align:middle;
}
/** .gnss-bars-content {
  display:none;
  background:white;
  position:absolute;
  top:0px;
  right:50px;
  padding:5px;
  background: #555;
  padding: 2px;
  -webkit-border-radius: 0 4px 4px 4px;
  border-radius: 4px 0px 4px 4px;
  box-shadow: 0 0 5px rgba(0,0,0,0.5);
}
.gnss-shortcut.selected + .gnss-bars-content {
  display:block;
}
.gnss-bars-content ul {
  list-style: none;
  margin: 0;
  padding: 0;
  left: 26px;
  top: 0;
  padding: 4px;
  color: white;
  white-space: nowrap
}
.gnss-bars-content ul li.gnss-bars-link{
  background: #919187;
  color: white;
  padding: 4px 6px ;
  margin:2px 0;
  cursor: pointer;
  border-radius:0;
}
.gnss-bars-content ul li.gnss-bars-link.disabled{
  opacity:0.7;
  cursor: pointer;
  pointer-events:none;
}
.gnss-bars-content ul li.gnss-bars-link:hover {
  background: #777;
}
/** .gnss-bars:hover + .gnss-bars-content {
  display:block;
}
.gnss-bars-content:hover {
  display:block;
} 
.gnss-hr hr {
  margin:0;
  color:#919187;
  margin-top:5px;
}*/
#page {
  width:100%;
  height: auto;
  min-height:500px;
  top:0;
  left:0;
  margin:0;
  padding:0;
  background: white;
}
.fa.button {
  color:black;
  cursor: pointer;
  padding: 5px;
  min-width:25px;
  text-align: center;
  display: inline-block;
  border: 1px dotted lightgrey;
}
.fa.button:hover {
   border-color:black;
}
.gnss-terresolide [type="text"],
.gnss-control {
   display: inline-block;
   color: #495057;
   vertical-align: middle;
   background-color: #fff;
   background-clip: padding-box;
   border: 1px solid #ced4da;
   transition: border-color 0.15s ease-in-out, box-shadow 0.15s ease-in-out;
   height: calc(1.3em + 0.5rem + 2px);
   padding: 0.2rem 0.5rem;
  font-size: 0.875rem;
   line-height: 1.5;
  border-radius: 0.2rem;
   max-width: calc(100% - 140px);
   width:calc(100% - 140px);
   cursor:pointer;
}
.sedoo-component input[type="text" ].gnss-control {
   border: 1px solid #ced4da;
   height: calc(1.3em + 0.1rem + 2px);
   width:calc(100% - 158px);
}
.gnss-terresolide [type="button"],
.gnss-terresolide [type="submit"] {
  display: inline-block;
  font-weight: 400;
  line-height: 1.5;
  color: #212529;
  text-align: center;
  text-decoration: none;
  vertical-align: middle;
  cursor: pointer;
  -webkit-user-select: none;
  -moz-user-select: none;
  user-select: none;
  background-color: transparent;
  border: 1px solid transparent;
  border-top-color: transparent;
  border-right-color: transparent;
  border-bottom-color: transparent;
  border-left-color: transparent;
  padding: .35rem .7rem;
  font-size: 0.9rem;
  border-radius: .25rem;
  transition: color .15s ease-in-out,background-color .15s ease-in-out,border-color .15s ease-in-out,box-shadow .15s ease-in-out;
  color: #000;
  background-color: #f8f9fa;
  border-color: #f0F0F0;
  cursor: pointer;
}
.gnss-terresolide [type="button"].btn-sm,
.gnss-terresolide [type="submit"].btn-sm {
  padding: .25rem .5rem;
  font-size: .875rem;
  line-height: 1.5;
  border-radius: .2rem;
}
.gnss-terresolide .gnss-admin [type="button"],
.gnss-terresolide .gnss-admin [type="submit"] {
   color: white;
   background:#337ab7;
}
[type="button"]:hover,
[type="submit"]:hover{
  color: #000;
  background-color: #f0F0F0;
  border-color: #f9fafb;
}
.gnss-terresolide .gnss-admin [type="button"]:hover,
.gnss-terresolide .gnss-admin [type="submit"]:hover {
   background-color: #0069d9;
   border-color: #0062cc;
}
[type="button"]:active,
[type="submit"]:active {
  color: #212529;
  background-color: #dae0e5;
  border-color: #d3d9df;
}
.bookmark-tooltip,
.gdm-tooltip {
  position:absolute;

  padding:5px;
  z-index:10;
  background-color: #fafafa;
  border: 1px solid #a3a3a3;
  font-size: smaller;
  box-shadow: 2px 2px 3px rgba(0, 0, 0, 0.4);
  color:#666;
  display:none;
  pointer-events: none;
 
}
.bookmark-tooltip {
  max-width:180px;
  white-space: normal;
}
.gdm-tooltip {
  top:18px;
  max-width:270px;
  min-width: 200px;
  
}
.gdm-tooltip > div {
  font-weight: 500;
}
.gdm-tooltip h4 {
  margin: 3px 0;
  text-align:left;
  font-weight:800;
  font-size:1em;
  color:black;
  opacity:1;
}

.tooltip-show + .gdm-tooltip {
  display:block;
   pointer-events:none;
}
div.gnss-shortcut {
  float:right;
  cursor:pointer;
  font-size:22px;
  background:#b8412c;
  color:white;
  padding:12px 15px 12px 12px;
  margin-right:-1px;
  font-weight:700;
  border-radius: 5px 0 0 5px;
  vertical-align:top;
  pointer-events:auto;
  width:46px;
  text-align:center;
  box-shadow: -1px 1px 5px rgba(0,0,0,0.5);
}

div.form.expand div.gnss-shortcut,
div.gnss-shortcut.selected {
  background: #8c0209;
}
div.gnss-shortcut:hover
 {
  background:#7b080e;
}
/*.gnss-hr hr {
  margin:0;
  color:#919187;
  margin-top:5px;
}*/

div.custom-checkbox label.custom-control-label {
  width:auto;
  min-width:0;
}
input[type="number"].gnss-control{
  width:100px;
}
input[id="fillrate"]::after {
  content: '%';
}
button[disabled] {
  pointer-events: none;
  opacity: 0.5;
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
/** MAP */
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
/** STATION */
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
  span.in-title {
    font-size: 1rem;
  }
</style>

