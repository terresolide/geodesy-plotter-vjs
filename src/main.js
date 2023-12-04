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
import {faAngleLeft, faAnglesLeft, faAngleRight, faAnglesRight, faArrowsAlt, faArrowDownWideShort,
faBars, faBookmark,  faCircle,  faCircleChevronLeft, faCircleChevronRight, faCircleChevronUp,
 faCircleQuestion, faClipboard, faClose, faCopyright, faDownload, faEnvelope, faFile, faHome, faGear,faList, 
faLocationDot, faTriangleExclamation, faMap,faQuestion, faSearch, faRightFromBracket, faRightToBracket, faSpinner, faUser} from '@fortawesome/free-solid-svg-icons'

import {
  faCircle as farCircle
} from '@fortawesome/free-regular-svg-icons'


/* add font awesome icon component */
Vue.component('font-awesome-icon', FontAwesomeIcon)
/* add icons to the library */
library.add(faAngleLeft, faAnglesLeft, faAngleRight, faAnglesRight, faArrowsAlt, faArrowDownWideShort,
 faBars, faBookmark, faCircle, faCircleChevronLeft, faCircleChevronRight, faCircleChevronUp,
 faCircleQuestion, faClipboard, faClose, faCopyright, faDownload, faEnvelope, faFile, faHome, faGear,faList,
 faLocationDot, faMap, faQuestion, faSearch, faTriangleExclamation, faRightFromBracket, faRightToBracket, faSpinner, 
 faUser, farCircle)
import App from './App.vue'
import router from './router'
import makeStore from './store'
var sso = require('./config.js')
console.log(sso)
console.log(process.env.NODE_ENV)
let config = {}
if (typeof geodesyConfig != 'undefined') {
  config = JSON.parse(geodesyConfig.innerHTML)
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
  beforeCreate(e) {
    if (document.location.href.indexOf('/sso-login') > 0) {
      function extractInfoFromURL (url) {
      var split = url.split(/\&|\?|#/)
      var params = []
      var authParams = []
      split.forEach(function(tab) {
        var value = tab.split('=')
        if (value.length > 1) {
          if (['code', 'state', 'session_state', 'error'].indexOf(value[0]) >= 0) {
            authParams[value[0]] = value[1]
          } else {
            params[value[0]] = value[1]
          }
        }
      })
      return {base: split[0], params: params, authParams: authParams}
    }
    var location = extractInfoFromURL(window.location.href)
    if (window.opener) {
      // case window
      window.opener.postMessage(
        {
          code:location.authParams['code'],
          state: location.authParams['state'],
          url: window.location.href
        },
        document.location.origin
      )
      window.close()
    } else if (parent) {
      // case iframe
      parent.postMessage( {
        code:location.authParams['code'],
        state: location.authParams['state'],
        url: window.location.href
      })
      return false
    }
  }},
  router,
  store
}).$mount('#app')
