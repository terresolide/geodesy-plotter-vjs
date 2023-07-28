<template>
 <div class="page-station gnss-user" style="width:100%;position:relative;overflow:hidden;">
    <div class="station-content" >
     <div class="station-header">
      <span class="close button" @click="close($event)" style="margin-right:20px;"><font-awesome-icon icon="fa-solid fa-close" /></span>
     
      <h2>Your account</h2>
     </div >
     <div v-if="user" style="margin:20px;">
        <div><label>Your email:</label> {{user.email}}</div>
        <div v-if="user['client-roles']"><label>Your roles: </label> {{user['client-roles']}}</div>
        <div><label>Name:</label> {{user.name}}</div>
        <div><label>Given name:</label>{{user.given_name}}</div>
        <div><label>Family name:</label>{{user.family_name}}</div>
        <div v-if="cookie" style="position:relative;"><label>Your cookie:</label> 
            <textarea>{{cookie}}</textarea>
            <button type="button" @click="CopyClipboard" style="position:relative;">
            <font-awesome-icon icon="fa-solid fa-clipboard" /> Copy to clipboard
                 <div class="gnss-tooltip">Your cookie has been copied to clipboard</div>
                      
            </button>
                
         <!--    <button type="button" @click="downloadCookie">
               <font-awesome-icon icon="fa-solid fa-download" /> Cookie.txt
            </button> -->
        </div>
        <h3 >How download a product with command line</h3>
        You must use the session cookie.
        <span v-if="cookie">
        <h4>With curl and cookie string</h4>
        <pre>
curl {{$store.state.env === 'development' ? '-k ':''}}-b "{{cookie}}" {{fileUrl}} -o {{filename}}
curl {{$store.state.env === 'development' ? '-k ':''}}-b "{{cookie}}" {{downloadUrl}} -o {{filename}}</pre>
        <h4>With wget</h4>
        <pre>
wget {{$store.state.env === 'development' ? '--no-check-certificate ':''}}--header="Cookie: {{cookie}}" {{fileUrl}}
wget {{$store.state.env === 'development' ? '--no-check-certificate ':''}}--header="Cookie: {{cookie}}" {{downloadUrl}} </pre>
      </span>
      <span v-else >
        <div>More information on <a :href="$store.state.api.replace('api/1.0/', 'userinfo')" target="_blank">data server</a></div>
      </span>
     </div>
     
     <div v-else style="margin:20px;">
     <em>You are not authenticated.</em>
       <div v-if="$store.state.auth" style="width:250px;text-align:right;">
        <button type="button" @click="$parent.service.login()">
          <font-awesome-icon icon="fa-solid fa-right-to-bracket" /> Login
        </button>
        </div>
     </div>
    </div>
 </div>
</template>
<script>
export default {
  name: 'GnssUser',
  props: {
    top: {
      type: Number,
      default: 5
    }
  },
  computed: {
    user () {
      //return {'name': 'Elisabeth'}
      
      return this.$store.getters['user/get']
    }
  },
  data () {
    return {
      fileUrl: null,
      cookie: null,
      downloadUrl: null,
      filename:'UGA_BRST00FRA.pos'
    }
  },
  created () {
    if (!this.user) {
      
    }
    var station = 'BRST00FRA'
    this.downloadUrl = this.$store.state.api + 'products/' + this.filename + '/download'
    this.fileUrl = this.$store.state.api.replace('api/1.0', 'data') + station + '/' + this.filename
  },
  mounted () {
    this.getCookie()
  },
  methods: {
    getCookie () {
       this.$http.get(this.$store.state.api.replace('api/1.0/', 'cookie') ,
           { credentials: true})
       .then(resp => {if (resp.body.cookie) {
            this.cookie = resp.body.cookie
       }}, resp => {this.cookie = null})
    }, 
    close(e) {
      this.$router.go(-1)
    },
 
    CopyClipboard () {
      var node = this.$el.querySelector('textarea')
      console.log(node)
      node.select();
      // node.setSelectionRange(0, 99999);
      document.execCommand("copy");
      var tooltip = this.$el.querySelector('div.gnss-tooltip')
      tooltip.style.display = 'block'
      setTimeout(function () {
          tooltip.style.display = 'none'
      }, 2000)
    },
    downloadCookie () {
      var cookies = this.user.cookie.split('=')
      var text = cookies.join('\n')
      var element = document.createElement('a');
      element.setAttribute('href', 'data:text/plain;charset=utf-8,' + encodeURIComponent(text));
      element.setAttribute('download', 'cookie.txt');

      element.style.display = 'none';
      document.body.appendChild(element);

      element.click();

      document.body.removeChild(element);
    }
    
  }
}
</script>
<style scoped>

  textarea {
  position:absolute;
  left:-9999px;
}
.gnss-user pre {
  padding:10px;
  color: white;
  background: black;
  overflow-x:scroll;
}
 div.gnss-tooltip {
  position: absolute;
  background-color: #fafafa;
  border: 1px solid #a3a3a3;
  font-size: smaller;
  padding: 4px;
  width: 160px;
  text-align:left;
  display:none;
  -webkit-box-shadow: 2px 2px 3px rgba(0,0,0,.4);
  box-shadow: 2px 2px 3px rgba(0,0,0,.4);
}


</style>