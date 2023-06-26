import Vue from 'vue'
import Vuex from 'vuex'
Vue.use(Vuex)
import VueResource from 'vue-resource';
Vue.use(VueResource);
/* import the fontawesome core */
import { library } from '@fortawesome/fontawesome-svg-core'

/* import font awesome icon component */
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome'
/* import specific icons */
import {faAngleLeft, faAnglesLeft, faAngleRight, faAnglesRight, faArrowsAlt, 
faBars, faBookmark,  faCircle,  faCircleChevronLeft, faCircleChevronRight,
 faCircleQuestion, faClipboard, faClose, faDownload, faFile, faHome, faGear,faList, 
faLocationDot, faTriangleExclamation, faMap,faSearch, faRightFromBracket, faRightToBracket, faSpinner, faUser} from '@fortawesome/free-solid-svg-icons'

import {
  faCircle as farCircle
} from '@fortawesome/free-regular-svg-icons'


/* add font awesome icon component */
Vue.component('font-awesome-icon', FontAwesomeIcon)
/* add icons to the library */
library.add(faAngleLeft, faAnglesLeft, faAngleRight, faAnglesRight, faArrowsAlt,
 faBars, faBookmark, faCircle, faCircleChevronLeft, faCircleChevronRight, 
 faCircleQuestion, faClipboard, faClose, faDownload, faFile, faHome, faGear,faList,
 faLocationDot, faMap, faSearch, faTriangleExclamation, faRightFromBracket, faRightToBracket, faSpinner, 
 faUser, farCircle)
import App from './App.vue'
import router from './router'
import makeStore from './store'
var sso = require('./config.js')
console.log(sso)
console.log(process.env.NODE_ENV)
let config = {}
if (typeof gnssConfig != 'undefined') {
  config = JSON.parse(gnssConfig.innerHTML)
} 
if (process.env.NODE_ENV === 'development') {
  config.sso = sso.dev
} else {
  config.sso = sso.prod
}
config.env = process.env.NODE_ENV
const store = makeStore(config)

//import vueCustomElement from 'vue-custom-element';
//Vue.use(vueCustomElement);

//Vue.customElement('json-div', () => new Promise((resolve) => {
//  require(['./components/json-div.vue'], (JsonDiv) => resolve(JsonDiv.default))
//}))

//Vue.customElement('spot-gins', () => new Promise((resolve) => {
//  require(['./components/spot-gins.vue'], (SpotGins) => resolve(SpotGins.default))
//}))
//Vue.config.productionTip = false
//

new Vue({
  render: h => h(App),
  router,
  store
}).$mount('#app')
