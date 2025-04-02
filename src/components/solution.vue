<template>
 <div class="page-station" style="width:100%;position:relative;overflow:hidden;">
 
  <div style="position:absolute;top:55px;right:0;z-index:2;pointer-events:none;">
    <gnss-menu></gnss-menu>
  </div>
   <div v-if="scrollY > 400" class="gnss-top" @click="scrollTop"><font-awesome-icon icon="fa-solid fa-circle-chevron-up" /></div>
  
 <div class="station-content"  >
     <div class="station-header">
      <span v-if="!$route.query.newTab" class="close button" @click="close($event)" style="margin-right:20px;"><font-awesome-icon icon="fa-solid fa-close" /></span>
     
      <h2>Solution {{name}}</h2>
     </div>
      <div class="station-body" @scroll="scroll($event)" >
        <span v-if="solution && !metadata" >
          <div><label>Description</label> <div style="display:inline-block;width:calc(100% - 200px);">{{solution.description}}</div></div>
          <div style="text-align:center;"><a :href="solution.metadata" target="_blank"><font-awesome-icon icon="fa-solid fa-file" /> {{solution.metadata}}</a></div>
       </span>
       <span v-if="metadata">
        <pre v-if="metadata" style="width:auto;white-space: pre-wrap;">{{metadata}}</pre>
       </span>
       <div v-if="pdf" style="border:1px solid grey;max-width:1000px;margin:auto;"> <vue-pdf-embed :source="pdf" />
       </div>
      
      </div>
 </div>
 </div>
</template>
<script>
import GnssMenu from './gnss-menu.vue'
import VuePdfEmbed from 'vue-pdf-embed/dist/vue2-pdf-embed'
export default {
  name: 'Solution',
  components: {GnssMenu, VuePdfEmbed},
  created () {
    this.name = this.$route.params.name
    this.pdf = null
    this.get()
    window.scrollTo(0, 0)
  },
  computed: {
    api () {
      return this.$store.getters['api']
    }
  },
  data () {
    return {
      name: null,
      metadata: null,
      solution: null,
      scrollY: 0,
      pdf: null
    }
  },
  methods: {
    close (e) {
      if (window.history.length <= 2) {
        this.$router.push({name: 'home'})
      } else {
        this.$router.go(-1)
      }
    },
    isLocalFile () {
      var domain = this.$store.state.api
      
      return this.metadata.indexOf()
    },
    get () {
      this.$http.get(this.api + 'solutions/' + this.name)
      .then(resp => {
        if (resp.body && resp.body.name) {
          this.solution = resp.body
          if (this.solution.metadata) {
           switch (this.solution.encodingType) {
            case 'text/plain':
              this.getMetadata()
              break
            case 'application/pdf':
              console.log(this.pdf)
              this.pdf = this.solution.metadata
              break
           } 
          }
        } 
      }, resp => {console.log('NOT FOUND')})
    },
    isLocalFile (url) {
      var api = new URL(this.$store.state.api)
      return url.indexOf(api.origin >= 0)
    },
    getMetadata () {
      if (!this.isLocalFile(this.solution.metadata) && this.solution.encodingType === 'text/plain') {
        return
      }
      if (this.solution.encodingType === 'text/plain')
      this.$http.get(this.solution.metadata)
      .then(resp => {this.metadata = resp.body})
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
    }
  }
}
</script>
<style>

</style>