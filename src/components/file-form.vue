<template>
<div class="form" @click="clickOnForm($event)">
     <div>
		<div class="file-form" :class="{'station-form': mode === 'station'}">
		<div >
		  <div>
		    <label>Station name</label>
		    <input type="text" class="gnss-control" v-model="searchparams.q" placeholder="ex: agd or AGD"/>
		  </div>
		  <div v-if="solutions && !$store.state.solution">
		    <label >Solution  
		       <span class="gnss-question" @click="showTooltip($event)">
		         <font-awesome-icon icon="fa-solid fa-circle-question" />
		        </span>
		        <div class="gdm-tooltip" @click="hideTooltip($event)">
		        <h4 >Solution</h4>
		        <div>more info about solutions here @todo<br>
		        </div>
		     </div>
		    </label>
		    <select class="gnss-control" v-model="searchparams.solution">
		       <option :value="null">---</option>
		       <option v-for="pt in solutions" :value="pt">{{pt}}</option>
		    </select>
		  </div>
		      <div v-if="productTypes">
        <label>Product type</label>
        <select class="gnss-control" v-model="searchparams.productType">
           <option :value="null">---</option>
           <option v-for="pt in productTypes" :value="pt">{{pt}}</option>
        </select>
      </div>
      <div v-if="mode === 'map'" style="position:relative;" >
        <label style="width:auto;">Has several products
         
        </label>
        <input type="checkbox" v-model="searchparams.several" />
        <span class="gnss-question" @click="showTooltip($event)" style="color:#666;">
             <font-awesome-icon icon="fa-solid fa-circle-question" />
        </span>
         <div class="gdm-tooltip" @click="hideTooltip($event)">
            <div>You must select a product type and not a solution to use this setting.
            </div>
        </div> 
      </div>
		  <div class="temp-extent">
		    <label >Temporal extent</label>
			  <div >
			    <label>From</label>
			    <input type="date" v-model="searchparams.start" class="gnss-control" />
			  </div>
			  <div >
			    <label>To</label>
			    <input type="date" v-model="searchparams.end" class="gnss-control" />
			  </div>
		  </div>
		 
		   <div class="fillrate" style="margin-top:12px;">
		    <label >Extent 
		        <span class="gnss-question" @click="showTooltip($event)">
		         <font-awesome-icon icon="fa-solid fa-circle-question" />
		        </span>
		        <div class="gdm-tooltip" @click="hideTooltip($event)">
		          <h4 >Extent in years</h4>
		          <div>Number of years of data<br>
		          </div>
		        </div></label>
		    <div >
		       <vue-slider v-model="length.values" :dot-options="length.dotoptions" 
		       :marks="length.marks"
		       :data="length.points" ></vue-slider>
		      
		    </div>
		  </div>
		  <div class="fillrate">
		      <label>Fill rate <span class="gnss-question"@click="showTooltip($event)">
		         <font-awesome-icon icon="fa-solid fa-circle-question" /></span>
		        <div class="gdm-tooltip" @click="hideTooltip($event)">
			        <h4 >Fill rate</h4>
			        <div>percent of days with data<br>
			        </div>
		        </div>
		      </label>
		      <div> 
		         <vue-slider v-model="fillrate.values" :dot-options="fillrate.dotoptions" 
		         :marks="fillrate.marks"></vue-slider>
		      </div> 
		      
		  </div>
		 </div>
		 <div>
		  <div v-if="analysisCentres && !$store.state.analysisCentre">
		    <label>Analysis centre</label>
		    <select class="gnss-control" v-model="searchparams.analysisCentre">
		       <option :value="null">---</option>
		       <option v-for="pt in analysisCentres" :value="pt">{{pt}}</option>
		    </select>
		  </div>
	
		  <div v-if="networks && mode === 'map'" class="gnss-networks"> 
		     <label>Networks
		     </label>
		    <select class="gnss-control" multiple v-model="searchparams.network">
           <option :value="null">---</option>
           <option v-for="pt in networks" :value="pt">{{pt}}</option>
        </select>
		  </div>   
		   <div v-if="constellations"> 
		      <label>Constellation</label>
		      <select v-model="searchparams.constellation" class="gnss-control" >
		         <option :value="null">---</option>
		         <option v-for="pt in constellations" :value="pt">{{pt}}</option>
		      </select>
		   </div>
		    <div style="margin-top:10px;">
		          <label></label>
		          <button @click="reset()" type="button" >Reset</button>
		          <button @click="search($event)" type="submit" >Search
		          <font-awesome-icon icon="fa-solid fa-search" /></button>
		      </div>
		  </div>
		</div>
    </div>
     <div class="gnss-shortcut"   @click="toggleForm()"><font-awesome-icon icon="fa-solid fa-search" /></div>
 
</div>
</template>
<script>
import VueSlider from 'vue-slider-component'
export default {
  name: 'FileForm',
  components: {VueSlider},
  props: {
    mode: {
      type: String,
      default: 'map'
    }
  },
  computed: {
    networks () {
      if (this.$store.getters['networks']) {
        return Object.keys(this.$store.getters['networks'])
      } else {
        return []
      }
    },
    analysisCentres () {
      return this.$store.getters['analysisCentres']
    },
    solutions () {
     return this.$store.getters['solutions']
    },
    productTypes () {
      return this.$store.getters['productTypes']
    },
    constellations () {
      return this.$store.getters['constellations']
    }
  },
  watch: {
    $route (newroute) {
       this.initSearchParams(newroute.query)
    }
  },
  created () {
    this.length.points = []
    for(var i=0; i < this.length.max + 1; i++) {
      this.length.points.push(i)
    }
    this.length.marks = []
    for (var i=0; i < this.length.max + 1; i=i+10) {
      this.length.marks.push(i)
    }
   
  },
  mounted () {
    this.initSearchParams(this.$route.query, true)
  },
  data () {
    return  {
      fillrate: {
        values: [0,100],
        dotoptions: [{
          disabled: false
        }, {
          disabled: true
        }],
        marks: [0, 25, 50, 75, 100]
      },
      length: {
        values: [0, 30],
        dotoptions: [{
          disabled: false
        }, {
          disabled: false
        }],
        max: 30,
        points: [],
        marks: []
      },
      searchparams: {
        q: null,
	      productType: null,
	      solution: null,
	      several: null,
	      analysisCentre: null,
	      network: [],
	      constellation: null,
	      start: null,
	      end: null,
	      lenMin: null,
	      lenMax: null,
	      fill: null
      }
      
    }
  },
  methods: {
    clickOnForm(event) {
      console.log(event)
      this.$parent.$el.click(event)
    },
    search (event) {
      event.preventDefault()
      var self = this
      if (this.fillrate.values[0] !== 0) {
        this.searchparams.fill = this.fillrate.values[0]
      } else {
        this.searchparams.fill = null
      }
      if (this.length.values[0] !== 0) {
        this.searchparams.lenMin = this.length.values[0] 
      } else {
        this.searchparams.lenMin = null
      }
      if (this.length.values[1] !== this.length.max) {
        this.searchparams.lenMax = this.length.values[1] 
        
      } else {
        this.searchparams.lenMax = null
      }
      this.searchparams.network = this.searchparams.network.filter(nt => self.networks.indexOf(nt) >= 0)
      this.$store.commit('setReset', true)
      this.changeQuery(this.searchparams)
    },
    initSearchParams (query, init) {
      this.length.values = [0, this.length.max]
      this.fillrate.values = [0, 100]
      // console.log(query.expand)
      
      for (var key in query) {
        if (key === 'network') {
          this.searchparams.network = query['network'].split(',')
        } else if (['center', 'radius', 'bbox'].indexOf(key) < 0) {
          this.searchparams[key] = query[key]
        }
        if (key === 'fill') {
          this.fillrate.values[0] = parseInt(query['fill'])
        }
        if (key.toLowerCase() === 'lenmin') {
          this.length.values[0] = parseInt(query[key])
        } 
        if (key.toLowerCase() === 'lenmax') {
          this.length.values[1] = parseInt(query[key])
        } 
      }
      for (var key in this.searchparams) {
        if (!query[key]) {
          if (key === 'network') {
            this.searchparams[key] = []
          } else {
            this.searchparams[key] = null
          }
        }
      }
      if (init && query.expand) {
        this.toggleForm()
        delete query.expand
      }
    },
    changeQuery (params) {
      var newquery = Object.assign({}, this.$route.query)
      newquery = Object.assign(newquery, params)
      // query = query.filter(x => x !== null)
      for (var key in newquery) {
        if (!newquery[key] || newquery[key] ===  null || newquery[key].length == 0) {
          delete newquery[key]
        }
        if (key === 'network' && Array.isArray(newquery['network'])){
            newquery['network'] = newquery['network'].join(',')
        }
      }
      this.$router.push({name: this.$route.name, query: newquery}).catch(()=>{})
    },
    reset() {
      this.$store.commit('setReset', true)
      this.$emit('reset')
      this.$router.push({name:this.$route.name, query: {}}).catch(()=>{})
    },
    hideTooltip (event) {
      document.querySelectorAll('.tooltip-show').forEach(function (node) {
        node.classList.remove('tooltip-show')
      })
    },
    showTooltip (event) {
      var el  = event.target
      while ((el = el.parentElement) && !el.classList.contains('gnss-question'));
  
      event.preventDefault()
      if (el.classList.contains('tooltip-show')) {
        el.classList.remove('tooltip-show')
        return
      }
      document.querySelectorAll('.tooltip-show').forEach(function (node) {
        node.classList.remove('tooltip-show')
      })
      el.classList.add('tooltip-show')
    },
    toggleForm () {
     // var elt = this.$el.querySelector('.form')
      this.$el.classList.toggle('expand')
    }
  }
}

</script>
<style src='vue-slider-component/theme/default.css' />
<style>

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
</style>
<style scoped>
div.form {
  position: absolute;
  transform: translateX(353px);
 
  width: 400px;
  z-index: 1001;
  right: 0px;
  top: 55px;
  background-clip: padding-box;
  transition: transform 330ms ease-in-out;
  font-size: 0.8rem;
  box-sizing: border-box;
  pointer-events:none;
  z-index:2;
 
}
div.form > div:nth-child(1) {
     float:right;
     background: white;
     display:inline-block;
     width:350px;
     margin:0;
     border-radius: 0 0 0 5px;
    padding: 10px;
     box-shadow: 0 0 5px rgba(0,0,0,0.5);
      max-height: calc(100vh - 50px);
       overflow-y: scroll;
}
div.form.expand {
  transform: translateX(0px);
  transition: transform 330ms ease-in-out;
}
.gnss-question{ 
  cursor:pointer;
  opacity:0.8;
}
.gnss-question:hover {
  opacity:1;
}
.file-form {
  clear:both;
}
.file-form > div > div {
  margin: 3px 0;
}
.file-form > div > div > div {
  margin: 0px 0 2px 10px;
  width: calc(100% - 10px);
}

.file-form label {
  width: 110px;
  min-width:110px;
  color:#666;
  position:relative;
  overflow:visible;
  display:inline-block;
  font-weight:700;
  /** vertical-align: baseline;**/
}

 
.temp-extent > label{
  margin-top:15px;display:block;width:auto;
}
.temp-extent > div > label {
  min-width: 95px;
  width: 95px;
  
}

.temp-extent > div {
  margin-left:15px;
}
.extent-years label {
  width: 40px;
  min-width:40px;
}
.extent-years div {
  display: inline-block;
  width:auto;
  min-width:0;
  max-width:none;
}
.extent-years input[type="number"] {
  width:70px;
}
.form-group {
  margin-bottom:0;
  color: #222;
}
div.gnss-networks > label {
  vertical-align:top;
}
.file-form  div.gnss-networks > div {
  display:inline-block;
  width:calc(100% - 150px);
}
span.network-span {
  display:inline-block;
  margin-left:-10px;
  margin-right:20px;
  color:#555;
  font-weight:700;
}
span.network-span span {
  line-height:1.3em;
}
.file-form div.fillrate {
  margin-top: 8px 0;
}
.fillrate > label {
  vertical-align:top;
}
.file-form .fillrate > div {
   display: inline-block;
   max-width: calc(100% - 160px);
   width:calc(100% - 160px);
   height: 40px;
   margin-left: -2px;
   vertical-align:top;
}
.fillrate .vue-slider-mark-label {
  font-size: inherit;
}

input.gnss-checkbox {
	cursor: pointer;
	border-radius: .25em;
	margin-left: 0;
	width: 1.3em;
	height: 1.3em;
	margin-top: .25em;
	vertical-align: top;
	background-color: #fff;
	background-repeat: no-repeat;
	background-position: center;
	background-size: contain;
	border: 1px solid rgba(0,0,0,.25);
	-webkit-appearance: none;
	-moz-appearance: none;
	appearance: none;
	-webkit-print-color-adjust: exact;
	color-adjust: exact;
}
input.gnss-checkbox:checked {
  background-color: #0d6efd;
  border-color: #0d6efd;
   background-image: url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 20 20'%3e%3cpath fill='none' stroke='%23fff' stroke-linecap='round' stroke-linejoin='round' stroke-width='3' d='M6 10l3 3l6-6'/%3e%3c/svg%3e");
}
select {
	display: inline-block;
  font-size: 0.875rem;
  font-weight: 400;
  line-height: 1.5;
  color: #495057;
  vertical-align: middle;
  background: #fff url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' width='4' height='5' viewBox='0 0 4 5'%3e%3cpath fill='%23343a40' d='M2 0L0 2h4zm0 5L0 3h4z'/%3e%3c/svg%3e") right 0.75rem center/8px 10px no-repeat;
  border: 1px solid #ced4da;
  border-radius: 0.25rem;
  -webkit-appearance: none;
  -moz-appearance: none;
  appearance: none;
  transition: background-color 0.15s ease-in-out, border-color 0.15s ease-in-out, box-shadow 0.15s ease-in-out;
 /* height: calc(1.5em + 0.5rem + 2px);
  padding-top: 0.25rem;
  padding-bottom: 0.25rem;
  padding-left: 0.5rem;
  font-size: 0.875rem;*/
  width: calc(100% - 130px);
}
.gnss-control:focus {
  border-color: #80bdff;
  outline: 0;
  box-shadow: 0 0 0 0.2rem rgba(0, 123, 255, 0.25);
}

</style>