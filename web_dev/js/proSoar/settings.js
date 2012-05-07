var Settings = new Class({

  Implements: Events,

  initialize: function() {
    this.turnpointFiles = new Array();
    this.taskFiles = new Array();

//    this.getSettingsFromJSON();

//    this.getCookie();
  },
/*
  getCookie: function() {
    this.uid = Cookie.read('uid');

    if (!this.uid) {
      var now = new Date();
      this.uid = now.getTime().toString(16) + "." +
        (Math.round(Math.random()*1000)).toString(16) +
        (Math.round(Math.random()*1000)).toString(16) +
        (Math.round(Math.random()*1000)).toString(16);

      Cookie.write('uid', this.uid, { duration: 180 });
    }
  },
*/
  getUID: function() {
    return this.uid;
  },

  getSettingsFromJSON: function() {
    var jsonRequest = new Request.JSON({
//      url: 'dynamic/bin/get_userconfig.py',
      url: 'settings/load',
      async: true,
      secure: true,
      onSuccess: this.addSettingsFromJSON.bind(this),
//      onError: function(text, error) {
//        console.log("Error: " + text + " " + error);
//      },

    });

    jsonRequest.get();
  },

  addSettingsFromJSON: function(data) {
    this.turnpointFiles.empty();
    Object.each(data.turnpointFiles, function(item, key, object) {
      this.turnpointFiles.push(new Object({
        filename: item.filename,
        fileId: item.id,
        display: item.display,
      }));
    }, this);
    
    this.taskFiles.empty();
    Object.each(data.taskFiles, function(item, key, object) {
      this.taskFiles.push(new Object({
        name: item.name,
        distance: item.distance,
        type: item.type,
        turnpoints: item.turnpoints,
        date: item.date,
      }));
    }, this);

    this.uid = data.uid;
    Cookie.write('uid', this.uid,{
      duration: 180,
      domain: '.prosoar.de'
   });
    
    this.fireEvent('SettingsLoaded');
  },

  getTaskFiles: function() {
    return this.taskFiles;
  },

  getTurnpointFiles: function() {
    return this.turnpointFiles;
  },

  removeTurnpointFile: function(fileId) {
    if (fileId < 1) return;

    var jsonRequest = new Request.JSON({
//      url: 'dynamic/bin/remove_waypoint_file.py?fileId='+fileId,
      url: 'waypoints/'+fileId+'/remove',
      async: true,
      secure: true,
      mode: 'post',
      //onSuccess: this.getSettingsFromJSON.bind(this),
      onSuccess: this.addSettingsFromJSON.bind(this),
    });
    jsonRequest.send('settings=' + JSON.encode(this.turnpointFiles));
   
  },

  getInitialSettings: function() {
    if (typeof(initialSettings) != "undefined") {
      this.addSettingsFromJSON(initialSettings);
    }
  }

});
