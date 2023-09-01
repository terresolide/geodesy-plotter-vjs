<template>
  <div class="gnss-menu" :style="{top: top + 'px'}">
       <div class="gnss-shortcut gnss-bars" @click="toggle($event)"><font-awesome-icon icon="fa-solid fa-bars" /></div>
       <div class="gnss-bars-content" >
         <ul>
            <li v-if="$store.state.auth && email" class="gnss-bars-link" @click="goTo($event, 'account')">  <font-awesome-icon icon="fa-solid fa-user" /> 
             Your Account
           </li>
            <li v-if="$store.state.auth && email" class="gnss-bars-link" @click="logout" :title="'You are authenticated as ' + email"> 
            <font-awesome-icon icon="fa-solid fa-right-from-bracket" /> Logout
           </li>
           <li v-if="$store.state.auth && !email" class="gnss-bars-link" @click="login">
            <font-awesome-icon icon="fa-solid fa-right-to-bracket" /> Login</li>
           <li v-if="$store.state.auth" class="gnss-hr" style="margin-bottom:5px;"><hr /></li>
         
           <li class="gnss-bars-link" title="Record state in clipboard" @click="copyClipboard($event)">
                <font-awesome-icon icon="fa-solid fa-bookmark" />
           
               Record state url
                <div class="bookmark-tooltip" >The url has been copied to clipboard</div>
           </li>
          
           <li v-if="$route.name === 'home'" class="gnss-bars-link"  @click="goToList()">
             <font-awesome-icon icon="fa-solid fa-list" />
             View list</li>
           <li v-if="$route.name === 'files'" class="gnss-bars-link" style="margin-top:5px;" @click="goToMap()">
             <font-awesome-icon icon="fa-solid fa-map" />
             View Map</li> 
          <li class="gnss-hr" style="margin-bottom:5px;"><hr /></li>
           <li v-if="$route.query.newTab" class="gnss-bars-link" @click="goTo($event, 'home')" >
              <font-awesome-icon icon="fa-solid fa-home"  /> Home
           </li>
       <!--    <li class="gnss-bars-link disabled" @click="goTo($event,'solutions')">Solutions</li>
          <li class="gnss-bars-link disabled" @click="goTo($event, 'productTypes')">Product Types</li>
          <li class="gnss-bars-link disabled" @click="goTo($event, 'about')">About</li>
          <li class="gnss-hr" style="margin-bottom:5px;"><hr /></li>
         -->
          <li class="gnss-bars-link" @click="goTo($event, 'contact')">
           <font-awesome-icon icon="fa-solid fa-envelope" /> Contact</li>
           <li class="gnss-bars-link" ><a :href="$store.state.api" target="_blank">
           <font-awesome-icon icon="fa-solid fa-gear" /> Geodesy Plotter Api</a></li>
         
         </ul>
   </div>
 </div>
</template>
<script>
export default {
  name: 'GnssMenu',
  props: {
    top: {
      type: Number,
      default: 0
    }
  },
  computed: {
    email () {
      return this.$store.getters['user/email']
    }
  },
  data () {
    return {
      clickListener: null
    }
  },
  created () {
    this.clickListener = this.closeMenu.bind(this) 
    document.addEventListener('click', this.clickListener)
  },
  destroyed () {
    if (this.clickListener) {
      document.removeEventListener('click', this.clickListener)
      this.clickListener = null
    }
  },
  methods: {
    closeMenu() {
      var node = this.$el.querySelector('.gnss-shortcut.selected')
      if (node) {
        node.classList.remove('selected')
        return
      }
    },
    login () {
      console.log(this.$parent.$parent.service)
      this.$parent.$parent.service.login()
    },
    logout () {
      this.$parent.$parent.service.logout()
    },
    copyClipboard (event) {
      event.stopPropagation()
      var tooltip = this.$el.querySelector('.bookmark-tooltip')
      tooltip.style.display = 'block'
      var self = this
      setTimeout(function () {
          tooltip.style.display = 'none'
          self.closeMenu()
      }, 2000)
      if (this.$route.name === 'home') {
        var url = this.$parent.getUrl()
      } else {
        var base = window.location.href.split(/#/)[0] + '#'
        var url = base + this.$route.fullPath
      }
      navigator.clipboard.writeText(url);
    },
    goTo(event, name) {
//       if (name === 'home') {
//          this.$router.push({name: name})
//       }
//       // event.stopPropagation()
//       return
//       var query = Object.assign({}, this.$route.query)
//       if (this.$route.name === 'home') {
//         query = this.$parent.getQuery()
//       }
//       this.$store.commit('setQuery',{name: this.$route.name, query: query})
// //       if (this.$route.name === 'home') {
// //          this.$store.commit('setStations', this.$parent.stations)
// //       }
//       return
      this.$router.push({name: name})
    },
    goToList () {
     // var query = Object.assign({}, this.$route.query)
      var totQuery = this.$parent.getQuery()
      this.$store.commit('setQueryList', totQuery)
//       if (this.$route.name === 'home') {
//          this.$store.commit('setStations', this.$parent.stations)
//       }
      var query = Object.assign({}, this.$route.query)
      delete query.selected
      delete query.bounds
      if (totQuery.expand) {
        query.expand = 1
      }
      this.$router.push({ name: 'files', params: {}, query: query})
    },
    goToMap () {
      var query = this.$parent.getQuery()
     // this.$store.commit('resetStations')
      delete query.page
      delete query.maxRecords
      if (this.$store.state.queryList.bounds) {
        query.bounds = this.$store.state.queryList.bounds
      } 
      if (this.$store.state.queryList.selected) {
        query.selected = this.$store.state.queryList.selected
      }
     
      this.$store.state.viewMap = true
      this.$router.push({name: 'home', query: query})
    },
    toggle (event) {
      event.stopPropagation()
      var el  = event.target
      while ( !el.classList.contains('gnss-shortcut') && el.parentElement) {
        el = el.parentElement
      };
      console.log(el)
      
      if (el.classList.contains('selected')) {
        el.classList.remove('selected')
        return
      }
     
      el.classList.add('selected')
    },
  }
}
</script>
<style scoped>
  .gnss-menu {
    float:right;
    margin-top:0px;
    right:0;
    z-index:2
  }
  .gnss-bars-content {
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
  z-index:3;
  pointer-events:auto;
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
  cursor: not-allowed;
}
.gnss-bars-content ul li.gnss-bars-link:not(.disabled):hover {
  background: #777;
}
.gnss-bars-content a {
  color:inherit;
}
.gnss-bars-content a:hover {
  color:inherit;
  text-decoration:none;
}
.gnss-hr hr {
  margin:0;
  color:#919187;
  margin-top:5px;
}
</style>