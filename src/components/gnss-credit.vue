<template>
  <span v-if="credit" class="gnss-credit">
   <span class="credit-link tooltip-show" title="copyright/credit">
    <font-awesome-icon icon="fa-solid fa-copyright" />
    </span>
    <div class="gdm-tooltip">
       {{credit}}
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
  }
}
</script>
<style scoped>
.gnss-credit {
  position:relative;
}
.gnss-credit .gdm-tooltip {
  color:#333;
}
.credit-link {
  cursor: pointer;
}
</style>