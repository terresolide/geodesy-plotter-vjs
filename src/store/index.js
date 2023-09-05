import Vue from 'vue'
import Vuex from 'vuex'
import user from './user'
import tour from './tour'
export default function makeStore( config ) {
  var defaultConfig = {
    api: 'http://127.0.0.1:8083/api/',
    solution: null,
    sso: null,
    analysisCenter: null,
    query: {name: 'home', query: {}},
    queryList: {},
    codelists: {},
    preview: 'https://spotgins.formater/data/preview/',
    limit: 500,
    batch: 200,
    hopscotch: false,
    zoomMax: 5,
    search: true,
    reseting: false,
    viewMap: false,
   // stations: null,
   // boundsChanged: false,
    drawing: false
  }
  var finalConfig = Object.assign(defaultConfig, config)
  return new Vuex.Store( {
    state: finalConfig,
    mutations: {
      setQuery (state, query) {
        state.query = query
      },
      setQueryList (state, query) {
        state.queryList = query
      },
      setCodeList(state, codelists){
        state.codelists = codelists
      },
      setReset(state, value) {
        state.reseting = value
      },
      setDraw(state, value) {
        state.drawing = value
      },
      setSearching(state, value) {
        state.search = value
      }
//      resetStations (state) {
//        state.stations = null
//      },
//      setStations(state, stations) {
//        state.stations = stations
//      }
//      changeBounds(state, value) {
//        state.boundsChanged = value
//      }
    },
    getters: {
      api (state, getters) {
        return state.api
      },
      networks (state, getters) {
        if (state.codelists.networks) {
          return state.codelists.networks
        }
        return null
      },
      search (state, getters) {
        return state.search
      },
      analysisCentres (state, getters) {
         if (state.codelists.analysisCentres) {
          return state.codelists.analysisCentres
        }
        return null
      },
      request (state, getters) {
        var rq = {}
        if (state.solution) {
          rq.solution = state.solution
        }
        if (state.analysisCenter) {
          rq.analysisCenter= state.analysisCenter
        }
        return rq
      },
      solutions (state, getters) {
         if (state.codelists.solutions) {
          return state.codelists.solutions
        }
        return null
      },
//      stations (state, getters) {
//        return state.stations
//      },
      productTypes (state, getters) {
         if (state.codelists.productTypes) {
          return state.codelists.productTypes
        }
        return null
      },
      constellations (state, getters) {
         if (state.codelists.constellations) {
          return state.codelists.constellations
        }
        return null
      }
    },
    modules: {
      user: user,
      tour: tour
    }
  })
}