export default {
	namespaced: true,
	state: {
		types: {},
        colors: {},
        labels: {},
        labelColors: null,
        searching: false
	},
	getters: {
		color: (state, getters) => (type) => {
			if (!state.types[type] ) {
				return 'grey'
			}
			if (!state.colors[state.types[type]]) {
				return 'grey'
			}
			return state.colors[state.types[type]]
		},
        colors (state, getters) {
           return state.colors
        },
		labels (state, getters) {
		   return state.labels
		},
        labelColors (state, getters) {
           return state.labelColors
        }
	},
	mutations: {
		set (state, obj) {
          console.log(obj)
          if (obj.types) {
			state.types = obj.types
            state.colors = obj.colors
            state.labels = obj.labels
            state.labelColors = {}
            for (var key in state.colors) {
                state.labelColors[state.colors[key]] = state.labels[key]

            }
          }
		}
	},
    actions: {
        load ({ state, commit, rootState }, params) {
           
            return new Promise(function(resolve, reject) {
                if (state.searching) {
                 resolve({loaded: false})
                 return
                }            
                if (Object.keys(state.types).length > 0) {
                    resolve({loaded: true})
                    return
                }
                state.searching = true
                fetch(rootState.api + 'codelists/offsets')
                .then(resp => {
                    if (resp.ok) {
                    return resp.json()
                    } else {
                    if (resp.status === "404") {
                        commit('set', null)
                        
                    }
                    return {error : resp.status + ' - ' + resp.statusText}
                    }
                })
                .then(json => {
                    state.searching = false
                    if (json.error && reject) {
                    reject(json.error)
                    } else if (json.types) {
                      commit('set', json)
                    if (resolve) {
                        resolve(json)
                    }
                    } else if (reject) {
                            reject('unknown error')
                    }
                })
        })
    }
  }
}