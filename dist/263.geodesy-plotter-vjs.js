(self.webpackChunkgeodesy_plotter_vjs=self.webpackChunkgeodesy_plotter_vjs||[]).push([[263],{4828:(e,t,o)=>{(t=o(3645)(!1)).push([e.id,"\n.gnss-tour[data-v-67531083] {\n  clear:both;\n}\n",""]),e.exports=t},3263:(e,t,o)=>{"use strict";o.r(t),o.d(t,{default:()=>r});const n={name:"GnssMenu",props:{id:{type:String,default:null},top:{type:Number,default:10}},watch:{$route:function(e){if(this.hopscotch){var t=this.hopscotch.getCurrTour();console.log(t),console.log(e),t&&t.id!==e.name?(this.current=this.hopscotch.getCurrStepNum(),this.hopscotch.endTour()):this.current&&this.hopscotch.startTour(this.tour,this.current)}}},data:function(){return{hopscotch:null,current:null,tours:{map:null,list:null,station:null}}},mounted:function(){},methods:{getTour:function(){document.querySelector('div.leaflet-marker-icon[title="FNJM00EWT"]');return{id:"map",zindex:1e3,showPrevButton:!0,onEnd:function(e){document.querySelector(".form").classList.remove("expand"),document.querySelector(".lfh-control-legend").classList.remove("hovered")},steps:[{title:"My Header",content:"This is the header of my page.",target:document.querySelector(".gnss-menu"),xOffset:"-200px",onShow:function(e){(t=document.querySelector(".form")).classList.remove("expand");var t=document.querySelector(".gnss-menu .gnss-shortcut");setTimeout((function(){t.classList.add("selected")}),200)},placement:"left"},{title:"Search criteria",content:"Here is where I put my content.",target:document.querySelector(".form .gnss-shortcut"),placement:"left",xOffset:"-350px",showPrevButton:!0,onShow:function(e){var t=document.querySelector(".form");setTimeout((function(){t.classList.add("expand")}),400)},zIndex:2e4,onNext:function(e){document.querySelector(".form").classList.remove("expand")},onPrev:function(e){document.querySelector(".form").classList.remove("expand")}},{title:"Overview all stations",content:"blabla",yOffset:"-15px",target:document.querySelector(".leaflet-overview"),placement:"right"},{title:"Layers",content:"blabla",xOffset:"150px",target:document.querySelector(".leaflet-control-layers"),placement:"right",onShow:function(e){console.log("show"),document.querySelector(".form").classList.remove("expand"),document.querySelector(".leaflet-control-layers").classList.add("leaflet-control-layers-expanded")},onNext:function(e){console.log("on next"),document.querySelector(".leaflet-control-layers").classList.remove("leaflet-control-layers-expanded")},onPrev:function(e){document.querySelector(".leaflet-control-layers").classList.remove("leaflet-control-layers-expanded")}},{title:"Legend color",content:"blabla",xOffset:"120px",target:document.querySelector(".lfh-control-legend"),placement:"right",onShow:function(e){document.querySelector(".lfh-control-legend").classList.add("hovered")},onNext:function(e){document.querySelector(".lfh-control-legend").classList.remove("hovered")},onPrev:function(e){document.querySelector(".lfh-control-legend").classList.remove("hovered")}}]}},launch:function(e){var t=this.getTour(),n=this;setTimeout((function(){this.hopscotch?this.hopscotch.startTour(t,0):o.e(556).then(o.t.bind(o,9556,23)).then((function(e){n.hopscotch=e.default,n.hopscotch.startTour(t,0);var o=document.querySelector(".hopscotch-container");o&&o.addEventListener("click",(function(e){return e.stopPropagation(),e.preventDefault(),!1}))}))}),0)}}};o(7572);const r=(0,o(1900).Z)(n,(function(){var e=this,t=e._self._c;return e.$store.state.hopscotch?t("div",{staticClass:"gnss-tour",style:{marginTop:e.top+"px"}},[t("div",{staticClass:"gnss-shortcut gnss-bars",on:{click:function(t){return e.launch(t)}}},[t("font-awesome-icon",{attrs:{icon:"fa-solid fa-question"}})],1)]):e._e()}),[],!1,null,"67531083",null).exports},7572:(e,t,o)=>{var n=o(4828);n.__esModule&&(n=n.default),"string"==typeof n&&(n=[[e.id,n,""]]),n.locals&&(e.exports=n.locals);(0,o(5346).Z)("74f6a290",n,!0,{})}}]);
//# sourceMappingURL=263.geodesy-plotter-vjs.js.map