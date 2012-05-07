function loadjsfile(filename){
 var fileref=document.createElement('script')
 fileref.setAttribute("type","text/javascript")
 fileref.setAttribute("src", filename)
 
 if (typeof fileref!="undefined")
  document.getElementsByTagName("head")[0].appendChild(fileref)
}

loadjsfile("js/proSoar/main.js");
loadjsfile("js/proSoar/settings.js");
loadjsfile("js/proSoar/map.js");
loadjsfile("js/proSoar/waypoints.js");
loadjsfile("js/proSoar/sector.js");
loadjsfile("js/proSoar/turnpoint.js");
loadjsfile("js/proSoar/task.js");
loadjsfile("js/proSoar/taskstore.js");
loadjsfile("js/proSoar/fai.js");
loadjsfile("js/proSoar/dialogs.js");
loadjsfile("js/proSoar/init.js");