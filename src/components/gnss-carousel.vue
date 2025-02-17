<template>
 <span>
 <div style="overflow:hidden;position:relative;" v-if="$slots.slide" :style="{width: containerWidth}" ><!--:style="{width:(nbSlides * slideWidth) + 'px'}"-->
    <div style="text-align:center;" v-if="dotPosition === 'top' && nbSlides < $slots.slide.length" >
           <span v-for="file, index in $slots.slide" style="padding: 0 3px;">
              <span v-if="index >= curSlide && index < curSlide + nbSlides">
               <font-awesome-icon :icon="['fas', 'circle']" />
              </span>
              <span v-else>
                <font-awesome-icon :icon="['far', 'circle']" />
              </span>
           </span>
         </div>
       <div v-if="nbSlides < $slots.slide.length" class="btn-navigation" :class="{disabled: curSlide === 0}" @click="curSlide= curSlide - 1" >
           <font-awesome-icon :icon="['fas', 'circle-chevron-left']" />
       </div>
        <div v-if="nbSlides < $slots.slide.length" class="btn-navigation"  :class="{disabled: curSlide + nbSlides >= $slots.slide.length}" 
        style="right:0;" @click="curSlide = curSlide + 1">
           <font-awesome-icon :icon="['fas', 'circle-chevron-right']" />
       </div>
       <div style="position:relative;">
	      <div class="slider-container" :style="{width: $slots.slide.length * slideWidth + 'px',  transform: 'translateX(' + ((index - curSlide) * slideWidth) + 'px)'}">
	         <slot name="slide" ></slot>
	      </div>
      </div>
       <div  style="text-align:center;bottom:0;" v-if="dotPosition === 'bottom' && nbSlides < $slots.slide.length" >
           <span v-for="file, index in $slots.slide" style="padding: 0 3px;">
              <span v-if="index >= curSlide && index < curSlide + nbSlides">
               <font-awesome-icon :icon="['fas', 'circle']" />
              </span>
              <span v-else>
                <font-awesome-icon :icon="['far', 'circle']" />
              </span>
           </span>
         </div>
 </div>
 </span>
</template>
<script>
export default {
  name: 'GnssCarousel',
  components: {
  },
  
  props: {
    id: {
      type: String|Number,
      default: null
    },
    dotPosition: {
      type: String,
      default: 'top'
    },
    width: {
      type:Number,
      default: 350
    },
    slideWidth: {
      type: Number,
      default: 300
    },
    height: {
      type: Number,
      default: 300
    }
  },
  data () {
    return {
      nbSlides: 1,
      curSlide: 0,
      resizeListener: null,
      containerWidth: '350px',
      index:0
    }
  },
  watch: {
    id (newvalue) {
      this.$forceUpdate()
      this.curSlide = 0
    }
  },
  created () {
    this.resizeListener = this.countNbSlides.bind(this)
    window.addEventListener('resize', this.resizeListener)
  },
  mounted () {
    this.countNbSlides()
  },
  destroyed () {
    if (this.resizeListener) {
      window.removeEventListener('resize', this.resizeListener)
      this.resizeListener = null
    }
  },
  methods: {
    countNbSlides () {
      var width = this.$el.parentNode.offsetWidth
      this.nbSlides = parseInt(width / this.slideWidth)
      if (this.nbSlides === 0) {
        this.nbSlides = 1
      }
      if (this.nbSlides === 1) {
        this.containerWidth = '100%'
      } else {
        this.containerWidth = 'calc(100% - 20px)'
      }
      this.curSlide = 0
    }
  }
}
</script>
<style scoped>
div.slider {
  position:relative;
  min-height: 660px;
  margin-left:0px;
  margin-top:5px;
  overflow-x:visible;
  overflow-y: hidden;
  }
  div.slider-container {
    transition: all 0.5s;
  }
  div.btn-navigation {
    position:absolute; 
    top:45%;
    z-index:4;
    font-size:40px;
    opacity:0.8;
    cursor:pointer;
  }
  div.btn-navigation.disabled {
    opacity:0.5;
    pointer-events:none;
  }
  div.btn-navigation:hover {
    opacity:1;
  }
</style>
