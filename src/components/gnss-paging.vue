<template>
 <span class="gnss-paging">
  <div >
  <span :class="{disabled: (currentPage===1 ? 'disabled': ''), 'mtdt-navigation':true}">
    <span  :style="{background:color}" @click="goToFirst()">
        <font-awesome-icon icon="fa-solid fa-angles-left" />
    </span>
    <span :style="{background:color}" @click="changePage(-1)" >
      <font-awesome-icon icon="fa-solid fa-angle-left" />
    </span>
  </span>
  <span style="margin: 0 10px;">
  Results: {{from}} to {{to}} among {{notExactly}}{{totalResults}}
  </span>
   (<select v-model="recordPerPage" @change="nbRecordChange">
      <option v-for="option, key in recordsPerPage" :value="key">{{option}}</option>
   </select>)
   <span :class="{disabled: (!notExactly && (currentPage===nbPage || count=== 0) ? 'disabled': ''), 'mtdt-navigation':true}">
     <span  :style="{background:color}" @click="changePage(1)" >
       <font-awesome-icon icon="fa-solid fa-angle-right" />
     </span>
     <span  :style="{background:color}" @click="goToLast()">
        <font-awesome-icon icon="fa-solid fa-angles-right" />
     </span>
  </span>
 
   </div>
 </span>
</template>
<script>
export default {
  name: 'GnssPaging',
  props: {

    page: {
      type: Number,
      default: 1
    },
    maxRecords: {
      type: Number,
      default: 25
    },
    totalResults: {
      type: Number,
      default: 0
    },
    count: {
      type: Number,
      default: 0
    },
    lang: {
      type: String,
      default: 'en'
    },
    color: {
      type: String,
      default: '#808080'
    }
  },
  computed: {
   
    to () {
      return this.from + this.count - 1
    },
    nbPage () {
      var nbPage = parseInt(this.totalResults / this.recordPerPage) 
      nbPage += (this.totalResults % this.recordPerPage > 0 ? 1 : 0)
      this.currentPage = parseInt(this.from  / this.recordPerPage) + 1
      return nbPage
    },
    recordsPerPage () {
      var list = {};
      var self = this
      this.options.forEach( function (option) {
        list[option] = option + ' per page'
      })
      return list
    },
    defaultRecord () {
      return this.maxRecords
    }
  },
  watch: {
    page (newvalue) {
      this.from = (newvalue - 1) * this.maxRecords + 1
    },
    maxRecords (newvalue) {
      this.recordPerPage = this.maxRecords
    }
  },
  created () {
    this.from = (this.page - 1) * this.maxRecords + 1
    this.recordPerPage = this.maxRecords
  },
  mounted () {
  },
  destroyed () {
  },

  data() {
    return {
      from: 1,
      currentPage : 1,
      recordPerPage: this.maxRecords,
      notExactly: '',
      options: [10, 25, 50, 100, 500]
    }
  },

  methods: {
 
   goToFirst () {
    // this.from = 1
     this.currentPage = 1
     this.emitChange()
   },
   goToLast () {
     console.log(this.nbPage)
    // this.from = (this.nbPage -1) * this.recordPerPage + 1
     this.currentPage = this.nbPage
     this.emitChange()
   },
   handleReset(event) {
    //  this.from = 1
     this.currentPage = 1
   },
   changePage(sens) {
     if (sens < 0 && this.currentPage === 1 ){
       return
     }
     if (sens > 0 && this.currentPage === this.nbPage && !this.notExactly) {
       return;
     }
     this.currentPage += sens
     // this.from = (this.currentPage - 1) * this.recordPerPage +1
     this.emitChange()
   },
   nbRecordChange (value) {
     // this.recordPerPage = parseInt(value)
     this.emitChange()
   },
   emitChange() {
     // var to = this.from + this.recordPerPage - 1
     this.$emit('change', { maxRecords:this.recordPerPage, page: this.currentPage})
   }
  }
}
</script>
<style>
.gnss-paging > div {
   width: 62%;
   height: 33px;
   text-align: right;
   display: inline-block;
   margin-left: 0px;
}
.gnss-paging span.mtdt-navigation span{
  font-size: 1rem;
  cursor: pointer;
  margin: 0 1px;
  padding:5px;
 cursor:pointer;
 border-radius:3px;
 /*background:#8c0209;*/
 background:grey;
 padding:3px 5px;
 color:white;
  vertical-align:middle;
  opacity:0.9;
  line-height:1.2rem;
}
.gnss-paging span.mtdt-navigation.disabled span{
  opacity:0.3;
  cursor:not-allowed;
}
.gnss-paging span.mtdt-navigation:not(.disabled) span:hover{
  opacity:1;
}
 
</style>