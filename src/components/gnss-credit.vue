<template>
  <span v-if="credit" class="gnss-credit">
   <span class="credit-link" title="copyright/credit" @click="toggleShow($event)">
    <font-awesome-icon icon="fa-solid fa-copyright" />
    </span>
    <div class="gdm-tooltip">
      <div>{{credit}}</div>
    </div>
  </span>
</template>
<script>
export default {
  name: 'GnssCredit',
  props: {
    credit: {
	    type: String,
	    default: null
    }
  },
  methods: {
    toggleShow (event) {
     
      var target = event.target.closest('.credit-link')
      target.classList.toggle('tooltip-show')
      event.stopPropagation()
    }
  }
}
</script>
<style scoped>
.gnss-credit {
  position:relative;
}
.gnss-credit .gdm-tooltip {
  color:#333;
  left:0;
  max-width:300px;
}
.credit-link {
  cursor: pointer;
}
</style>