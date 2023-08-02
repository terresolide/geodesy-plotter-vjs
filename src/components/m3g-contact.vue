<template>
   <fieldset v-if="contact" >
      <div id="line"></div>
      <legend>{{labelize(type)}}</legend>
      <div class="contact-info" style="font-size:0.9rem;">
       <div v-if="contact.agency">
          <label>Agency</label>
          <div class="contact-info" >
             <div v-if="contact.agency.agencyName">
                <span v-if="contact.agency.ROR">
                  <a :href="contact.agency.ROR" target="_blank">{{ contact.agency.agencyName}}</a>
                </span>
                <span v-else>{{ contact.agency.agencyName}}</span>
                 <span v-if="contact.agency.preferedAbbreviation">({{contact.agency.preferedAbbreviation}})</span></div> 
             <div v-if="contact.agency.street"><span v-if="contact.agency.houseNumber">{{contact.agency.houseNumber}}</span>
               {{contact.agency.street}}
             </div>
             <div v-if="contact.agency.postOfficeBox">{{contact.agency.postOfficeBox}}</div>
             <div v-if="contact.agency.city">
                <span v-if="contact.agency.postCode">{{contact.agency.postCode}}</span>
                {{contact.agency.city}}
                <span v-if="contact.agency.countryCode">({{contact.agency.countryCode}})</span>
             </div>
            </div>
        </div>
        <div v-else-if="contact.agencyName">
           <label>Agency</label>
           <div class="contact-info" >
              <div v-if="contact.agencyName">
                  {{ contact.agencyName}}
                 <span v-if="contact.preferedAbbreviation || contact.preferredAbbreviation">({{contact.preferedAbbreviation || contact.preferredAbbreviation}})</span></div> 
             <div v-if="contact.mailingAddress" v-html="nl2br(contact.mailingAddress)"></div>
             <div v-if="contact.email">{{contact.email}}</div>
          
           </div>
        </div>
        <div v-for="key in ['primaryContact', 'secondaryContact']" v-if="contact[key] && contact[key]['publicnon-personalContact']">
          <label>{{labelize(key)}}</label>
          <div class="contact-info">
	          <div v-if="contact[key].name" >
	            <span v-if="contact[key].ORCID">
	              <a :href="contact[key].ORCID.substring(0,4) === 'http' ? contact[key].ORCID : 'https://orcid.org/' + contact[key].ORCID" target="_blank">{{contact[key].name}}</a>
	            </span>
	            <span v-else>{{contact[key].name}}</span>
	          </div>
	          <div v-if="contact[key].email">{{contact[key].email}}</div>
	          </div>
	        </div>
	    </div>
   </fieldset>

</template>
<script>
export default {
  name: 'M3gContact',
  props: {
    type: {
      type: String,
      default: 'Contact'
    },
    contact: {
      type: Object,
      default: null
    }
  },
  methods: {
    labelize (label) {
      const result = label.replace(/([A-Z])/g, " $1");
      return result.charAt(0).toUpperCase() + result.slice(1);
    },
    nl2br (text) {
      return text.replace('\n', '<br>')
    }
  }
}
</script>
<style scoped>
.contact-info {
  margin-bottom:10px;
  margin-left:5px;
}
fieldset {
  border:1px solid lightgrey;
  background: #f9f9f9;
  padding:2px 3px;
  height:100%;
}
legend {
  color: #333;
  font-weight:600;
  font-size:1rem;
  width:auto;
  border:none;
  margin: 0 2px 5px 2px;;
}

</style>