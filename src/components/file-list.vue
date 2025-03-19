<template>
<div class="page-station page-list" >
  <div style="position:absolute;top:55px;right:0;z-index:2;pointer-events:none;">
    <gnss-menu></gnss-menu>
    <file-form mode="map" ></file-form>
    <gnss-tour mode="map" id="list"></gnss-tour>    
   
 </div>
 <div class="station-content" >
	 <div class="station-header">
	    <span class="close button" @click="close($event)" style="margin-right:20px;"><font-awesome-icon icon="fa-solid fa-close" /></span>
	    <h2>List of files</h2>
	 </div>
  <div class="station-body" style="min-height:calc(100vh - 70px);max-height:max-content;overflow-x:hidden;">
	   
	   <div ><gnss-paging color="#b8412c" :page="pagination.page" :max-records="pagination.maxRecords" :count="files.length"
	   :total-results="pagination.tot" @change="paginationChange"></gnss-paging>
	   <div style="display:inline-block;width:37%;text-align:right;padding-right:20px;">
	     <button type="button"   >
           <a   :href="exportQuery":download="'exportGnss.csv'" >
           Export CSV
            <font-awesome-icon icon="fa-solid fa-file" />
           </a>
      </button>
      <button type="button"   >
           <a   :href="filesUrl" target="_blanck" >
            List of file URLs
            <font-awesome-icon icon="fa-solid fa-file" />
           </a>
      </button>
	    <button v-if="!$store.state.back" type="button" :disabled="downloading"  title="Download only the files in the page" @click="downloadPage">
          Download All
          <font-awesome-icon icon="fa-solid fa-download" />
      </button>
      </div>
	   </div>
	   <div class="array-list" v-if="files.length > 0">
	    <div class="gnss-file header">
	     <div class="gnss-file-title">Name  
	       <span class="gnss-sort" @click="changeSort('name')" :class="{unactive: !sort.name}" >{{sort.name === 'DESC' ? '&uarr;' : '&darr;' }}</span>
	     </div>
	     <div class="gnss-file-2">Station 
	        <span class="gnss-sort" @click="changeSort('station')" :class="{unactive: !sort.station}" >{{sort.station === 'DESC' ? '&uarr;' : '&darr;' }}</span>
	      </div>
	     <div class="gnss-file-3-header">
	       <div style="margin-top:5px;">Solution 
	         <span class="gnss-sort" @click="changeSort('solution')" :class="{unactive: !sort.solution}" >{{sort.solution === 'DESC' ? '&uarr;' : '&darr;' }}</span>
	       </div>
	       <div>Product type
	          <span class="gnss-sort" @click="changeSort('productType')" :class="{unactive: !sort.productType}" >{{sort.productType === 'DESC' ? '&uarr;' : '&darr;' }}</span>
       
	       </div>
	      </div>
	     <div class="gnss-file-4-header">
	        <div style="margin-top:5px;">Start
	        <span class="gnss-sort" @click="changeSort('start')" :class="{unactive: !sort.start}" >{{sort.start === 'DEC' ? '&uarr;': '&darr;' }}</span>
           End  <span class="gnss-sort" @click="changeSort('end')" :class="{unactive: !sort.end}" >{{sort.end === 'DESC' ? '&uarr;' : '&darr;' }}</span>
	        </div>
	        <div>
	          Years<span class="gnss-sort" @click="changeSort('years')" :class="{unactive: !sort.years}" >{{sort.years === 'DESC' ? '&uarr;' : '&darr;' }}</span>
            Fill rate<span class="gnss-sort" @click="changeSort('fill')" :class="{unactive: !sort.fill}" >{{sort.fill === 'DESC' ? '&uarr;' : '&darr;' }}</span>
         
	        </div>
	     </div>
	     <div class="gnss-file-5">Analysis centre
	       <span class="gnss-sort" @click="changeSort('analysisCentre')" :class="{unactive: !sort.analysisCentre}" >{{sort.analysisCentre === 'DESC' ? '&uarr;' : '&darr;' }}</span>
       
	     </div>
	    </div>
	    
	    <div style="max-height:calc(100vh - 155px);overflow-y:scroll;">
	      <file-row v-for="file, index in files" :key="index" :file="file" @remove="reload()"></file-row>
	    </div>
   </div>
   <div v-else style="text-align:center;padding:30px;"><em>No file match search criteria</em></div>
 </div>
 </div>
</div>
</template>

<script>



import FileForm from './file-form.vue'
import GnssMenu from './gnss-menu.vue'
import FileRow from './file-row.vue'
import GnssPaging from './gnss-paging.vue'
import GnssTour from './gnss-tour.vue'
export default {
  name: 'FileList',
  components: {FileForm, FileRow, GnssMenu, GnssPaging, GnssTour},
  data () {
    return {
     
    }
  },
  computed: {
    api () {
      return this.$store.getters['api']
    },
    defaultRequest () {
      var obj = Object.assign({page: 1, maxRecords: 25, orderBy: 'station ASC,solution ASC'}, this.$store.getters['request'] )
      return obj
    },
    exportQuery () {
      var query = Object.assign({output: 'csv'}, this.$route.query)
      var queryString = new URLSearchParams(query).toString()
      var url = this.api + 'products/?' + queryString
      console.log(url)
      
      return url
    },
    filesUrl () {
      var query = Object.assign({output: 'list'}, this.$route.query)
      query.maxRecords = 50000
      query.page = 1
      var queryString = new URLSearchParams(query).toString()
      var url = this.api + 'products/?' + queryString
      console.log(url)
      
      return url
    }
  },
  watch: {
    $route (newroute, oldroute) {
      console.log(newroute)
      this.treatmentQuery(newroute.query)
    }
  },
  data () {
    return {
      files: [],
      sort: {
        station: 'ASC',
        solution: 'ASC',
        name: null,
        productType: null,
        analysisCentre: null,
        start: null,
        end: null,
        fill: null,
        years: null
      },
      downloading:false,
      pagination: {
        page: 1,
        maxRecords: 25
      },
      orderBy: [{name: 'station',
                value: 'ASC'}, 
               {name: 'solution',
                value: 'ASC'}
              ]
    }
  },
  created () {
    if (this.$route.query.page) {
      this.pagination.page = parseInt(this.$route.query.page)
    }
    if (this.$route.query.maxRecords) {
      this.pagination.maxRecords = parseInt(this.$route.query.maxRecords)
    }
    this.treatmentQuery(this.$route.query)
  },
  destroyed () {
    
  },
  methods: {
    downloadPage () {
      if (this.$store.state.auth && !this.$store.getters['user/email']) {
        this.$parent.preLogin(null)
        return
      }
      var nodes = this.$el.querySelectorAll('.gnss-file a[download]')
      this.download(0, nodes)
      this.downloading = true
//       nodes.forEach(function (node) {
//         window.open(node.href)
//       })
    },
    download (i, nodes) {
      // windown.open(file.properties.file)
      if (!nodes[i]) {
        this.downloading = false
        return
      }
      nodes[i].click()
      var self = this
      setTimeout(function() {
        self.download(i + 1, nodes)
      }, 300)
    },
    downloadAll (url) {
      
      
    },
    changeSort(name) {
      var index = this.orderBy.findIndex(el => el.name === name)
      if (index >= 0) {
        this.orderBy[index].value = this.orderBy[index].value === 'ASC' ? 'DESC' : 'ASC'
        if (index == 1) {
           this.orderBy = this.orderBy.reverse()
        }
      } else {
        this.orderBy.pop()
        this.orderBy.unshift({name: name, value: 'ASC'})
      }
      var orderBy = this.orderBy.map(el => el.name + ' ' + el.value).join(',')
      var query = Object.assign({}, this.$route.query)
      query.orderBy = orderBy
      this.$router.push({name: 'files', query: query}).catch(()=>{})
    },
//     copyClipboard () {
//       var tooltip = this.$el.querySelector('.bookmark-tooltip')
//       tooltip.style.display = 'block'
//       setTimeout(function () {
//           tooltip.style.display = 'none'
//       }, 2000)
//       var base = window.location.href.split(/#/)[0] + '#'
//       var url = base + this.$route.fullPath
//       navigator.clipboard.writeText(url);
//     },
    display (data) {
      this.files = data.products
      this.pagination.tot = data.query.tot
      this.pagination.page = data.query.page
      this.pagination.maxRecords = data.query.maxRecords
    },
//     goToMap () {
//       var query = Object.assign({}, this.$route.query)
//       delete query.page
//       delete query.maxRecords
//       this.$router.push({name: 'home', query: query})
//     },
    getQuery () {
      var query = Object.assign({}, this.$route.query)
     
      var expand = this.$el.querySelector('.expand')
      if (expand) {
        query['expand'] = 1
      } else {
        delete query['expand']
      }
      return query
    },
    paginationChange (event) {
      var query = Object.assign({}, this.$route.query)
      query.page = event.page
      query.maxRecords = event.maxRecords
      this.$router.push({name: this.$route.name, query: query})
    },
    reload () {
      this.treatmentQuery(this.$route.query)
    },
    treatmentQuery (query) {
      if (!this.api) {
         console.log('Pas de service SensorThings!')
      }
      var url = this.api + 'products/'
      var params = Object.assign({}, this.defaultRequest)
      if (query.orderBy) {
        var sorts = query.orderBy.split(/\s*,\s*/)
        var sort = {}
        this.orderBy = []
        sorts.forEach(function (el) {
          console.log(el)
          var tab = el.split(/\s+/)
          sort[tab[0]] = tab[1].toUpperCase()
        })
        for (var key in this.sort) {
          if (sort[key]) {
            this.sort[key] = sort[key]
            this.orderBy.push({name: key, value: sort[key]})
          } else {
            this.sort[key] = null
          }
        }
      }
     
      var params = Object.assign({}, this.defaultRequest)
      params = Object.assign(params, query)
      // provisoire
//       params['productType'] = 'POSITION'
//        if (params['start'] && !params['end']) {
//         params['end'] = params['start']
//       } else if (params['end'] && ! params['start']) {
//         params['start'] = params['end']
//       }
      this.$http.get(url, {params: params})
      .then(
          resp => {this.display(resp.body)},
          resp => {console.log('Erreur de chargement: ' + resp.status)}
       )
    },
//     toggle () {
//       var el  = event.target
//       while ( !el.classList.contains('gnss-shortcut') && el.parentElement) {
//         el = el.parentElement
//       };
      
//       if (el.classList.contains('selected')) {
//         el.classList.remove('selected')
//         return
//       }
     
//       el.classList.add('selected')
//     },

   
    close (event) {
      console.log(event)
      this.$router.push({name: 'home', query: this.$store.state.queryList})
    }
  }
}
</script>
<style>
button[disabled] {
  pointer-events: none;
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

</style>
<style scoped>
  div.gnss-file:nth-child(2n) {
   background: #eee;
  }
 /** div.station-content {
    background:white;
    margin:auto;
    max-width:1400px;
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
  }
  div.station-header h2 {
    padding:0;
    margin:5px;
  }**/
  div.array-list {
    border:1px solid grey;
  }
  span.station-link {
    color: #b8412c;
    padding: 2px 3px;
    cursor: pointer;
    line-height:1.5rem;
    border:1px dotted white;
  }
  span.station-link:hover {
    border-color: grey;
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
  span.gnss-sort{
    padding: 0 3px;
    cursor: pointer;
    border: 1px dotted transparent;
  }
  span.gnss-sort.unactive {
    color: #555555;
  }
  span.gnss-sort:hover {
    border-color: black;
  }
</style>
