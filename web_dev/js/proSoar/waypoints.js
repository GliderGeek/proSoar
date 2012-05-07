/**
 * waypoints.js
 * 
 * This is part of proSoar. 
 * 
 * (c) 2012, Tobias Lohner <tobias@lohner-net.de>
 *
 * Licenced under GPL v2
**/


var Waypoint = new Class({
  initialize: function(options) {
    this.name = options.name;
    this.lat = options.lat;
    this.lon = options.lon;
    this.addType(options.type);
    this.onMap = false;
    this.mapId = -1;
    this.fileId = options.fileId;
    this.display = options.display;
    this.runwayDirection = options.runwayDirection?options.runwayDirection:45;
    this.altitude = options.altitude?options.altitude:0;
    this.comment = options.comment?options.comment:'';
//    console.log("creating new waypoint " + options.name);
  },

  addType: function(types) {
    if (String(types).contains('A'))
      this.airport = true;
    else
      this.airport = false;

    if (String(types).contains('L'))
      this.landable = true;
    else
      this.landable = false;

    if (String(types).contains('T'))
      this.turnpoint = true;
    else
      this.turnpoint = false;
  },

  getName: function() {
    return this.name;
  },

  getLon: function() {
    return this.lon;
  },

  getLat: function() {
    return this.lat;
  },

  getType: function() {
    type  = this.airport?'A':'';
    type += this.landable?'L':'';
    type += this.turnpoint?'T':'';
    return type;
  },

  getRunwayDirection: function() {
    return this.runwayDirection;
  },

  getAltitude: function() {
    return this.altitude;
  },

  getComment: function() {
    return this.comment;
  },

  isAirport: function() {
    return this.airport;
  },

  isLandable: function() {
    return this.landable;
  },

  isTurnpoint: function() {
    return this.turnpoint;
  },

  isTurnpointOnly: function() {
    return this.turnpoint && !this.airport && !this.landable;
  },

  isOnMap: function() {
    return this.onMap;
  },

  setOnMap: function(onMap) {
    this.onMap = onMap;
  },

  setMapId: function(mapId) {
    this.mapId = mapId;
  },

  getMapId: function() {
    return this.mapId;
  },

  // returns if this item should be displayed at all
  isViewable: function() {
    return this.display;
  },


  // set if this item is viewable or not
  setViewable: function(display) {
    this.display = display;
  },

  toggleViewable: function() {
    this.display = !this.display;
  },

  setFileId: function(fileId) {
    this.fileId = fileId;
  },

  getFileId: function() {
    return this.fileId;
  },

});

var WaypointContainer = new Class({

  Implements: Events,

  initialize: function(settings) {
    this.waypoints = new Array();
    this.chunks = new Object();
    this.settings = settings;
    this.dummyWaypoint = new Waypoint({
      name: "Free turnpoint",
      lat: 0,
      lon: 0,
      type: "ATL",
      fileId: -1,
      display: false,
      altitude: -9999,
      comment: '',
    });
  },

  populateFromJSON: function(fileId, jsonUrl) {
    var jsonRequest = new Request.JSON({
      url: jsonUrl,
      async: true,
      secure: true,
      onSuccess: function(data) {
          this.addWaypointsFromJSON(fileId, data)
        }.bind(this),
      onError: function(text, error) {
//        console.log("Error: " + text + " " + error);
      },
    });

    jsonRequest.get();
  },

  addWaypointsFromJSON: function(fileId, data) {
    if (!this.chunks['lon' + data.chunk.lon_left + 'lat' + data.chunk.lat_lower])
      this.chunks['lon' + data.chunk.lon_left + 'lat' + data.chunk.lat_lower] = new Object();
    if (this.chunks['lon' + data.chunk.lon_left + 'lat' + data.chunk.lat_lower][fileId]) return;

    this.chunks['lon' + data.chunk.lon_left + 'lat' + data.chunk.lat_lower][fileId] = true;
    
    delete data.chunk;

    var display = true;

    if (fileId != 0) {
      for (var i = 1; i < this.settings.getTurnpointFiles().length; i++) {
        if (this.settings.getTurnpointFiles()[i].fileId == fileId)
          display = this.settings.getTurnpointFiles()[i].display;
      }
    }

    Object.each(data, function(item, key, object) {
      item.fileId = fileId;
      item.display = display;
      this.waypoints.push(new Waypoint(item));
//      this.addWaypoint(new Waypoint(item));
    }, this);

//    console.log("fire event: NewWaypointsAdded");
    this.fireEvent('NewWaypointsAdded');
//    document.fireEvent('onNewWaypointsAdded'); //, false, 500);
  },

  removeWaypoints: function(fileId) {
    if (fileId < 1) return;

    Array.each(this.waypoints, function(item, key, object) {
      if (item.getFileId() == fileId) {
        item.setFileId(-1);
        item.setViewable(false);
      }
    });

    Array.each(this.waypoints, function(item, key, object) {
      if (item.getFileId() > fileId) {
        item.setFileId(item.getFileId()-1);
      }
    });

    Object.each(this.chunks, function(item, key, object) {
      item[fileId] = false;
    });
  },
/*
  addWaypoint: function(waypoint) {
    this.waypoints.push(waypoint);
    //console.log("adding new waypoint: " + waypoint.getName() + " type: " + waypoint.getType());
  },
*/
  getById: function(id) {
    if (this.waypoints[id])
      return this.waypoints[id];
    else
      return this.dummyWaypoint;
  },

  getArray: function() {
    return this.waypoints;
  },

  getSize: function() {
    return this.waypoints.length;
  },

  checkChunk: function(lon_left, lat_lower, lon_right, lat_upper) {
    // check if we need to download a new chunk of waypoints...?
    var factor = 5;
    
    // no need to check if lon_right is smaller than lon_left because openlayers
    // always keeps lon_right > lon_left.
    var chunk_lat_lower = Math.floor(lat_lower / factor);
    var chunk_lat_upper = Math.ceil(lat_upper / factor);
    var chunk_lon_left = Math.floor(lon_left / factor);
    var chunk_lon_right = Math.ceil(lon_right / factor);
    
    for (var i = chunk_lon_left; i < chunk_lon_right; i++) {
      for (var j = chunk_lat_lower; j < chunk_lat_upper; j++) {
        if (!this.chunks['lon' + i*factor + 'lat' + j*factor] ||
            !this.chunks['lon' + i*factor + 'lat' + j*factor][0])
          this.getChunk(i*factor, j*factor, 'airports');
        
        Array.each(this.settings.getTurnpointFiles(), function(item, key, object) {
          if (item.display &&
              (!this.chunks['lon' + i*factor + 'lat' + j*factor] ||
               !this.chunks['lon' + i*factor + 'lat' + j*factor][item.fileId] ))
            this.getChunk(i*factor, j*factor, 'turnpoints', item.fileId);
        }, this);
      }
    }
  },

  getChunk: function(lon_left, lat_lower, type, fileId) {
    // download chunk from server
    
    if (type == 'airports')
      this.populateFromJSON(0, 'airports/lon'+lon_left+'/lat'+lat_lower);
//      this.populateFromJSON(0, 'dynamic/waypoints.pl?type=airport&lon='+lon_left+'&lat='+lat_lower);

    else if (type == 'turnpoints')
      this.populateFromJSON(fileId, 'waypoints/'+fileId+'/lon'+lon_left+'/lat'+lat_lower);
//      this.populateFromJSON(fileId, 'dynamic/bin/get_waypoints.py?' +
//        'id=' + fileId + '&lon=' + lon_left + '&lat=' + lat_lower);
/*      this.populateFromJSON(fileId, 'dynamic/waypoints.pl?uid=' +
        this.settings.getUID() + '&type=turnpoint' + 
        '&id=' + fileId + '&lon=' + lon_left + '&lat=' + lat_lower); */
  },

});

