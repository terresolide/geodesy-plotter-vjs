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
  },
  methods: {
    getTour () {
	    var _this = this
	    var markerNode = document.querySelector('div.leaflet-marker-icon[title="FNJM00EWT"]')
	   // _this.$parent.showStation()
	    var tour = {
	        id: "map",
	        zindex:1000,
	        showPrevButton: true,
	        onEnd: function (e) {
	          var node = document.querySelector('.form')
	          node.classList.remove('expand')
	          
              var node = document.querySelector('.lfh-control-legend')
              node.classList.remove('hovered')
	        },
	        steps: [
	         {
	          title: "My Header",
	          content: "This is the header of my page.",
	          target: document.querySelector('.gnss-menu'),
	          xOffset: "-200px",
	          onShow: function (e) {
	            var node = document.querySelector('.form')
	            node.classList.remove('expand')
	            var node = document.querySelector('.gnss-menu .gnss-shortcut')
	            setTimeout(function () {
	              node.classList.add('selected')
	            }, 200)
	            
	          },
	          placement: "left"
	        },
	        {
	          title: "Search criteria",
	          content: "Here is where I put my content.",
	          target: document.querySelector('.form .gnss-shortcut'),
	          placement: "left",
	          xOffset: '-350px',
	         
	         // delay: 450,
	          showPrevButton: true,
	          onShow: function (e) {
	            var node = document.querySelector('.form')
	//            node.classList.remove('expand')
	//            node.classList.add('expand')
	//             var node = document.querySelector('.gnss-menu .gnss-shortcut')
	            setTimeout(function () {
	              node.classList.add('expand')
	            }, 400)
	          },
	          zIndex:20000,
	          onNext: function (e) {
	            var node = document.querySelector('.form')
	            node.classList.remove('expand')
	            // _this.$parent.showStation()
	          },
	          onPrev: function (e) {
	            var node = document.querySelector('.form')
	            node.classList.remove('expand')
	           
	          }
	        },
	        {
	          title: "Station information",
	          content: "machin bidule ",
	          target: markerNode,
	         // delay:1000,
	          yOffset: '-20px',
	          placement: 'right',
	          onShow: function (e) {
	            setTimeout(function () {
	              _this.$parent.showStation()
	            }, 600)
	          }
	          
	        },
	        {
	          title: "Overview all stations",
	          content: "blabla",
	          yOffset: '-15px',
	          target: document.querySelector('.leaflet-overview'),
	          placement: "right" //,
	//           onShow: function (e) {
	//             var node = document.querySelector('.form')
	//             node.classList.remove('expand')
	//           }
	        },
	        {
	          title: "Layers",
	          content: "blabla",
	          xOffset: "150px",
	          target: document.querySelector('.leaflet-control-layers'),
	          placement: "right",
	          onShow: function (e) {
	            console.log('show')
	             var node = document.querySelector('.form')
	            node.classList.remove('expand')
	            var node = document.querySelector('.leaflet-control-layers')
	            node.classList.add('leaflet-control-layers-expanded')
	          },
	          onNext: function (e) {
	            console.log('on next')
	            var node = document.querySelector('.leaflet-control-layers')
	            node.classList.remove('leaflet-control-layers-expanded')
	          },
	          onPrev: function (e) {
	           
	            var node = document.querySelector('.leaflet-control-layers')
	            node.classList.remove('leaflet-control-layers-expanded')
	          }
	        },
	        {
            title: "Legend color",
            content: "blabla",
            xOffset: "120px",
            target: document.querySelector('.lfh-control-legend'),
            placement: "right",
            onShow: function (e) {
               var node = document.querySelector('.lfh-control-legend')
               node.classList.add('hovered')
             
            },
            onNext: function (e) {
              var node = document.querySelector('.lfh-control-legend')
              node.classList.remove('hovered')
            },
            onPrev: function (e) {
              var node = document.querySelector('.lfh-control-legend')
              node.classList.remove('hovered')
            }
          }
	      ]}
	     // Start the tour!
	    // console.log(hopscotch)
	    return tour
	  
	  },

    launch(e) {
//      this.$store.commit('tour/start', 'map')
      var tour = this.getTour()
      var self = this
      setTimeout(function () {
	      if (!this.hopscotch) {
	       
	        import('hopscotch').then(module => {
	          self.hopscotch = module.default
	          self.hopscotch.startTour(tour,0);
	          var node = document.querySelector('.hopscotch-container')
	          if (node)
	          node.addEventListener('click', function (e) {
	            e.stopPropagation()
	            e.preventDefault()
	            return false
	          })
	        })
	      } else {
	        this.hopscotch.startTour(tour,0);
	      }
	   },0)
    }
  }
}
</script>
<style scoped>
 .gnss-tour {
   clear:both;
 }
</style>