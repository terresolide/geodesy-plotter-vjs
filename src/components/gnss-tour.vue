<template>
  <div class="gnss-tour" :style="{marginTop: top + 'px'}">
       <div class="gnss-shortcut gnss-bars" @click="launch($event)"><font-awesome-icon icon="fa-solid fa-question" /></div>
       
 </div>
</template>
<script>
// import hopscotch from 'hopscotch'
// const hopscotch = () => import('hopscotch')
export default {
  name: 'GnssMenu',
  props: {
    id: {
      type: String,
      default: null
    },
    top: {
      type: Number,
      default: 10
    }
  },
  watch: {
    $route (newroute) {
      if (this.hopscotch) {
        var hp = this.hopscotch.getCurrTour() 
        console.log(hp)
        console.log(newroute)
        if (hp && hp.id !== newroute.name) {
          this.current = this.hopscotch.getCurrStepNum() 
          this.hopscotch.endTour()
        } else {
          if (this.current) {
            this.hopscotch.startTour(this.tour, this.current)
          }
        }
      }
    }
  },
  data () {
    return {
      hopscotch: null,
      current: null,
      tours: {
        'map': null,
        'list': null,
        'station': null
      }
    }
  },
  mounted () {
    this.tour = {
        id: "map",
        zindex:1000,
        showPrevButton: true,
        onEnd: function (e) {
          var node = document.querySelector('.form')
          node.classList.remove('expand')
        },
        steps: [
          {
            title: "Overview all stations",
            content: "blabla",
            target: document.querySelector('.leaflet-overview'),
            placement: "right",
            
          },{
          title: "My Header",
          content: "This is the header of my page.",
          target: document.querySelector('.gnss-menu'),
          xOffset: "-200px",
          onShow: function (e) {
            var node = document.querySelector('.gnss-menu .gnss-shortcut')
            setTimeout(function () {
              node.classList.add('selected')
            }, 200)
            
          },
          placement: "left"
        },
        {
          title: "layer",
          content: "blabla",
          target: document.querySelector('.leaflet-control-layers-toggle'),
          placement: "right",
          onNext: function (e) {
            var node = document.querySelector('.form')
            node.classList.add('expand')
          }
          
        },
        {
          title: "My content",
          content: "Here is where I put my content.",
          target: document.querySelector('.form .gnss-shortcut'),
          placement: "left",
         // xOffset: '-350px',
         
          delay: 400,
          showPrevButton: true,
          onShow: function (e) {
            var node = document.querySelector('.form')
            node.classList.add('expand')
          },
          onNext: function (e) {
            var node = document.querySelector('.form')
            node.classList.remove('expand')
          },
          onPrev: function (e) {
            var node = document.querySelector('.form')
            node.classList.remove('expand')
          }
        }
        ]
      }
     // Start the tour!
    // console.log(hopscotch)
    
  
  },
  methods: {
    launch(e) {
//      this.$store.commit('tour/start', 'map')
      if (!this.hopscotch) {
        var self = this
        import('hopscotch').then(module => {
          self.hopscotch = module.default
          self.hopscotch.startTour(this.tour,0);
          var node = document.querySelector('.hopscotch-container')
          if (node)
          node.addEventListener('click', function (e) {
            e.stopPropagation()
            e.preventDefault()
            return false
          })
        })
      } else {
        this.hopscotch.startTour(this.tour,0);
      }
      
    }
  }
}
</script>
<style scoped>
 .gnss-tour {
   clear:both;
 }
</style>