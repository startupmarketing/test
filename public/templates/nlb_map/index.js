// ==ClosureCompiler==
// @compilation_level ADVANCED_OPTIMIZATIONS
// @externs_url http://closure-compiler.googlecode.com/svn/trunk/contrib/externs/maps/google_maps_api_v3_3.js
// ==/ClosureCompiler==

/**
 * @name MarkerClusterer for Google Maps v3
 * @version version 1.0
 * @author Luke Mahe
 * @fileoverview
 * The library creates and manages per-zoom-level clusters for large amounts of
 * markers.
 * <br/>
 * This is a v3 implementation of the
 * <a href="http://gmaps-utility-library-dev.googlecode.com/svn/tags/markerclusterer/"
 * >v2 MarkerClusterer</a>.
 */

/**
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

/**
 * A Marker Clusterer that clusters markers.
 *
 * @param {google.maps.Map} map The Google map to attach to.
 * @param {Array.<google.maps.Marker>=} opt_markers Optional markers to add to
 *   the cluster.
 * @param {Object=} opt_options support the following options:
 *     'gridSize': (number) The grid size of a cluster in pixels.
 *     'maxZoom': (number) The maximum zoom level that a marker can be part of a
 *                cluster.
 *     'zoomOnClick': (boolean) Whether the default behaviour of clicking on a
 *                    cluster is to zoom into it.
 *     'averageCenter': (boolean) Wether the center of each cluster should be
 *                      the average of all markers in the cluster.
 *     'minimumClusterSize': (number) The minimum number of markers to be in a
 *                           cluster before the markers are hidden and a count
 *                           is shown.
 *     'onClick': (function) Callback when cluster icon is clicked.
 *     'styles': (object) An object that has style properties:
 *       'url': (string) The image url.
 *       'height': (number) The image height.
 *       'width': (number) The image width.
 *       'anchor': (Array) The anchor position of the label text.
 *       'textColor': (string) The text color.
 *       'textSize': (number) The text size.
 *       'backgroundPosition': (string) The position of the backgound x, y.
 *       'iconAnchor': (Array) The anchor position of the icon x, y.
 * @constructor
 * @extends google.maps.OverlayView
 */
function MarkerClusterer(map, opt_markers, opt_options) {
  // MarkerClusterer implements google.maps.OverlayView interface. We use the
  // extend function to extend MarkerClusterer with google.maps.OverlayView
  // because it might not always be available when the code is defined so we
  // look for it at the last possible moment. If it doesn't exist now then
  // there is no point going ahead :)
  this.extend(MarkerClusterer, google.maps.OverlayView);
  this.map_ = map;

  /**
   * @type {Array.<google.maps.Marker>}
   * @private
   */
  this.markers_ = [];

  /**
   *  @type {Array.<Cluster>}
   */
  this.clusters_ = [];

  this.sizes = [53, 56, 66, 78, 90];

  /**
   * @private
   */
  this.styles_ = [];

  /**
   * @type {boolean}
   * @private
   */
  this.ready_ = false;

  var options = opt_options || {};

  /**
   * @type {number}
   * @private
   */
  this.gridSize_ = options['gridSize'] || 60;

  /**
   * @private
   */
  this.minClusterSize_ = options['minimumClusterSize'] || 2;

  this.onClick_ = options['onClick'];

  /**
   * @type {?number}
   * @private
   */
  this.maxZoom_ = options['maxZoom'] || null;

  this.styles_ = options['styles'] || [];

  /**
   * @type {string}
   * @private
   */
  this.imagePath_ = options['imagePath'] ||
      this.MARKER_CLUSTER_IMAGE_PATH_;

  /**
   * @type {string}
   * @private
   */
  this.imageExtension_ = options['imageExtension'] ||
      this.MARKER_CLUSTER_IMAGE_EXTENSION_;

  /**
   * @type {boolean}
   * @private
   */
  this.zoomOnClick_ = true;

  if (options['zoomOnClick'] != undefined) {
    this.zoomOnClick_ = options['zoomOnClick'];
  }

  /**
   * @type {boolean}
   * @private
   */
  this.averageCenter_ = false;

  if (options['averageCenter'] != undefined) {
    this.averageCenter_ = options['averageCenter'];
  }

  this.setupStyles_();

  this.setMap(map);

  /**
   * @type {number}
   * @private
   */
  this.prevZoom_ = this.map_.getZoom();

  // Add the map event listeners
  var that = this;
  google.maps.event.addListener(this.map_, 'zoom_changed', function() {
    var zoom = that.map_.getZoom();

    if (that.prevZoom_ != zoom) {
      that.prevZoom_ = zoom;
      that.resetViewport();
    }
  });

  google.maps.event.addListener(this.map_, 'idle', function() {
    that.redraw();
  });

  // Finally, add the markers
  if (opt_markers && opt_markers.length) {
    this.addMarkers(opt_markers, false);
  }
}

/**
 * The marker cluster image path.
 *
 * @type {string}
 * @private
 */
MarkerClusterer.prototype.MARKER_CLUSTER_IMAGE_PATH_ =
    'https://google-maps-utility-library-v3.googlecode.com/svn/trunk/markerclusterer/' +
    'images/m';

/**
 * The marker cluster image extension.
 *
 * @type {string}
 * @private
 */
MarkerClusterer.prototype.MARKER_CLUSTER_IMAGE_EXTENSION_ = 'png';

/**
 * Extends a objects prototype by anothers.
 *
 * @param {Object} obj1 The object to be extended.
 * @param {Object} obj2 The object to extend with.
 * @return {Object} The new extended object.
 * @ignore
 */
MarkerClusterer.prototype.extend = function(obj1, obj2) {
  return (function(object) {
    for (var property in object.prototype) {
      this.prototype[property] = object.prototype[property];
    }
    return this;
  }).apply(obj1, [obj2]);
};

/**
 * Implementaion of the interface method.
 * @ignore
 */
MarkerClusterer.prototype.onAdd = function() {
  this.setReady_(true);
};

/**
 * Implementaion of the interface method.
 * @ignore
 */
MarkerClusterer.prototype.draw = function() {};

/**
 * Sets up the styles object.
 *
 * @private
 */
MarkerClusterer.prototype.setupStyles_ = function() {
  if (this.styles_.length) {
    return;
  }

  for (var i = 0, size; size = this.sizes[i]; i++) {
    this.styles_.push({
      url: this.imagePath_ + (i + 1) + '.' + this.imageExtension_,
      height: size,
      width: size
    });
  }
};

/**
 *  Fit the map to the bounds of the markers in the clusterer.
 */
MarkerClusterer.prototype.fitMapToMarkers = function() {
  var markers = this.getMarkers();
  var bounds = new google.maps.LatLngBounds();
  for (var i = 0, marker; marker = markers[i]; i++) {
    bounds.extend(marker.getPosition());
  }

  this.map_.fitBounds(bounds);
};

/**
 *  Sets the styles.
 *
 *  @param {Object} styles The style to set.
 */
MarkerClusterer.prototype.setStyles = function(styles) {
  this.styles_ = styles;
};

/**
 *  Gets the styles.
 *
 *  @return {Object} The styles object.
 */
MarkerClusterer.prototype.getStyles = function() {
  return this.styles_;
};

/**
 * Whether zoom on click is set.
 *
 * @return {boolean} True if zoomOnClick_ is set.
 */
MarkerClusterer.prototype.isZoomOnClick = function() {
  return this.zoomOnClick_;
};

/**
 * Whether average center is set.
 *
 * @return {boolean} True if averageCenter_ is set.
 */
MarkerClusterer.prototype.isAverageCenter = function() {
  return this.averageCenter_;
};

/**
 *  Returns the array of markers in the clusterer.
 *
 *  @return {Array.<google.maps.Marker>} The markers.
 */
MarkerClusterer.prototype.getMarkers = function() {
  return this.markers_;
};

/**
 *  Returns the number of markers in the clusterer
 *
 *  @return {Number} The number of markers.
 */
MarkerClusterer.prototype.getTotalMarkers = function() {
  return this.markers_.length;
};

/**
 *  Sets the max zoom for the clusterer.
 *
 *  @param {number} maxZoom The max zoom level.
 */
MarkerClusterer.prototype.setMaxZoom = function(maxZoom) {
  this.maxZoom_ = maxZoom;
};

/**
 *  Gets the max zoom for the clusterer.
 *
 *  @return {number} The max zoom level.
 */
MarkerClusterer.prototype.getMaxZoom = function() {
  return this.maxZoom_;
};

/**
 *  The function for calculating the cluster icon image.
 *
 *  @param {Array.<google.maps.Marker>} markers The markers in the clusterer.
 *  @param {number} numStyles The number of styles available.
 *  @return {Object} A object properties: 'text' (string) and 'index' (number).
 *  @private
 */
MarkerClusterer.prototype.calculator_ = function(markers, numStyles) {
  var index = 0;
  var count = markers.length;
  var dv = count;
  while (dv !== 0) {
    dv = parseInt(dv / 10, 10);
    index++;
  }

  index = Math.min(index, numStyles);
  return {
    text: count,
    index: index
  };
};

/**
 * Set the calculator function.
 *
 * @param {function(Array, number)} calculator The function to set as the
 *     calculator. The function should return a object properties:
 *     'text' (string) and 'index' (number).
 *
 */
MarkerClusterer.prototype.setCalculator = function(calculator) {
  this.calculator_ = calculator;
};

/**
 * Get the calculator function.
 *
 * @return {function(Array, number)} the calculator function.
 */
MarkerClusterer.prototype.getCalculator = function() {
  return this.calculator_;
};

/**
 * Add an array of markers to the clusterer.
 *
 * @param {Array.<google.maps.Marker>} markers The markers to add.
 * @param {boolean=} opt_nodraw Whether to redraw the clusters.
 */
MarkerClusterer.prototype.addMarkers = function(markers, opt_nodraw) {
  for (var i = 0, marker; marker = markers[i]; i++) {
    this.pushMarkerTo_(marker);
  }
  if (!opt_nodraw) {
    this.redraw();
  }
};

/**
 * Pushes a marker to the clusterer.
 *
 * @param {google.maps.Marker} marker The marker to add.
 * @private
 */
MarkerClusterer.prototype.pushMarkerTo_ = function(marker) {
  marker.isAdded = false;
  if (marker['draggable']) {
    // If the marker is draggable add a listener so we update the clusters on
    // the drag end.
    var that = this;
    google.maps.event.addListener(marker, 'dragend', function() {
      marker.isAdded = false;
      that.repaint();
    });
  }
  this.markers_.push(marker);
};

/**
 * Adds a marker to the clusterer and redraws if needed.
 *
 * @param {google.maps.Marker} marker The marker to add.
 * @param {boolean=} opt_nodraw Whether to redraw the clusters.
 */
MarkerClusterer.prototype.addMarker = function(marker, opt_nodraw) {
  this.pushMarkerTo_(marker);
  if (!opt_nodraw) {
    this.redraw();
  }
};

/**
 * Removes a marker and returns true if removed, false if not
 *
 * @param {google.maps.Marker} marker The marker to remove
 * @return {boolean} Whether the marker was removed or not
 * @private
 */
MarkerClusterer.prototype.removeMarker_ = function(marker) {
  var index = -1;
  if (this.markers_.indexOf) {
    index = this.markers_.indexOf(marker);
  } else {
    for (var i = 0, m; m = this.markers_[i]; i++) {
      if (m == marker) {
        index = i;
        break;
      }
    }
  }

  if (index == -1) {
    // Marker is not in our list of markers.
    return false;
  }

  marker.setMap(null);

  this.markers_.splice(index, 1);

  return true;
};

/**
 * Remove a marker from the cluster.
 *
 * @param {google.maps.Marker} marker The marker to remove.
 * @param {boolean=} opt_nodraw Optional boolean to force no redraw.
 * @return {boolean} True if the marker was removed.
 */
MarkerClusterer.prototype.removeMarker = function(marker, opt_nodraw) {
  var removed = this.removeMarker_(marker);

  if (!opt_nodraw && removed) {
    this.resetViewport();
    this.redraw();
    return true;
  } else {
   return false;
  }
};

/**
 * Removes an array of markers from the cluster.
 *
 * @param {Array.<google.maps.Marker>} markers The markers to remove.
 * @param {boolean=} opt_nodraw Optional boolean to force no redraw.
 */
MarkerClusterer.prototype.removeMarkers = function(markers, opt_nodraw) {
  var removed = false;

  for (var i = 0, marker; marker = markers[i]; i++) {
    var r = this.removeMarker_(marker);
    removed = removed || r;
  }

  if (!opt_nodraw && removed) {
    this.resetViewport();
    this.redraw();
    return true;
  }
};

/**
 * Sets the clusterer's ready state.
 *
 * @param {boolean} ready The state.
 * @private
 */
MarkerClusterer.prototype.setReady_ = function(ready) {
  if (!this.ready_) {
    this.ready_ = ready;
    this.createClusters_();
  }
};

/**
 * Returns the number of clusters in the clusterer.
 *
 * @return {number} The number of clusters.
 */
MarkerClusterer.prototype.getTotalClusters = function() {
  return this.clusters_.length;
};

/**
 * Returns custom click handler.
 *
 * @return {MarkerClusterer} The associated marker clusterer.
 */
MarkerClusterer.prototype.getClickHandler = function() {
  return this.onClick_;
};

/**
 * Returns the google map that the clusterer is associated with.
 *
 * @return {google.maps.Map} The map.
 */
MarkerClusterer.prototype.getMap = function() {
  return this.map_;
};

/**
 * Sets the google map that the clusterer is associated with.
 *
 * @param {google.maps.Map} map The map.
 */
MarkerClusterer.prototype.setMap = function(map) {
  this.map_ = map;
};

/**
 * Returns the size of the grid.
 *
 * @return {number} The grid size.
 */
MarkerClusterer.prototype.getGridSize = function() {
  return this.gridSize_;
};

/**
 * Sets the size of the grid.
 *
 * @param {number} size The grid size.
 */
MarkerClusterer.prototype.setGridSize = function(size) {
  this.gridSize_ = size;
};

/**
 * Returns the min cluster size.
 *
 * @return {number} The grid size.
 */
MarkerClusterer.prototype.getMinClusterSize = function() {
  return this.minClusterSize_;
};

/**
 * Sets the min cluster size.
 *
 * @param {number} size The grid size.
 */
MarkerClusterer.prototype.setMinClusterSize = function(size) {
  this.minClusterSize_ = size;
};

/**
 * Extends a bounds object by the grid size.
 *
 * @param {google.maps.LatLngBounds} bounds The bounds to extend.
 * @return {google.maps.LatLngBounds} The extended bounds.
 */
MarkerClusterer.prototype.getExtendedBounds = function(bounds) {
  var projection = this.getProjection();

  // Turn the bounds into latlng.
  var tr = new google.maps.LatLng(bounds.getNorthEast().lat(),
      bounds.getNorthEast().lng());
  var bl = new google.maps.LatLng(bounds.getSouthWest().lat(),
      bounds.getSouthWest().lng());

  // Convert the points to pixels and the extend out by the grid size.
  var trPix = projection.fromLatLngToDivPixel(tr);
  trPix.x += this.gridSize_;
  trPix.y -= this.gridSize_;

  var blPix = projection.fromLatLngToDivPixel(bl);
  blPix.x -= this.gridSize_;
  blPix.y += this.gridSize_;

  // Convert the pixel points back to LatLng
  var ne = projection.fromDivPixelToLatLng(trPix);
  var sw = projection.fromDivPixelToLatLng(blPix);

  // Extend the bounds to contain the new bounds.
  bounds.extend(ne);
  bounds.extend(sw);

  return bounds;
};

/**
 * Determins if a marker is contained in a bounds.
 *
 * @param {google.maps.Marker} marker The marker to check.
 * @param {google.maps.LatLngBounds} bounds The bounds to check against.
 * @return {boolean} True if the marker is in the bounds.
 * @private
 */
MarkerClusterer.prototype.isMarkerInBounds_ = function(marker, bounds) {
  return bounds.contains(marker.getPosition());
};

/**
 * Clears all clusters and markers from the clusterer.
 */
MarkerClusterer.prototype.clearMarkers = function() {
  this.resetViewport(true);

  // Set the markers a empty array.
  this.markers_ = [];
};

/**
 * Clears all existing clusters and recreates them.
 * @param {boolean} opt_hide To also hide the marker.
 */
MarkerClusterer.prototype.resetViewport = function(opt_hide) {
  // Remove all the clusters
  for (var i = 0, cluster; cluster = this.clusters_[i]; i++) {
    cluster.remove();
  }

  // Reset the markers to not be added and to be invisible.
  for (var i = 0, marker; marker = this.markers_[i]; i++) {
    marker.isAdded = false;
    if (opt_hide) {
      marker.setMap(null);
    }
  }

  this.clusters_ = [];
};

/**
 *
 */
MarkerClusterer.prototype.repaint = function() {
  var oldClusters = this.clusters_.slice();
  this.clusters_.length = 0;
  this.resetViewport();
  this.redraw();

  // Remove the old clusters.
  // Do it in a timeout so the other clusters have been drawn first.
  window.setTimeout(function() {
    for (var i = 0, cluster; cluster = oldClusters[i]; i++) {
      cluster.remove();
    }
  }, 0);
};

/**
 * Redraws the clusters.
 */
MarkerClusterer.prototype.redraw = function() {
  this.createClusters_();
};

/**
 * Calculates the distance between two latlng locations in km.
 * @see http://www.movable-type.co.uk/scripts/latlong.html
 *
 * @param {google.maps.LatLng} p1 The first lat lng point.
 * @param {google.maps.LatLng} p2 The second lat lng point.
 * @return {number} The distance between the two points in km.
 * @private
*/
MarkerClusterer.prototype.distanceBetweenPoints_ = function(p1, p2) {
  if (!p1 || !p2) {
    return 0;
  }

  var R = 6371; // Radius of the Earth in km
  var dLat = (p2.lat() - p1.lat()) * Math.PI / 180;
  var dLon = (p2.lng() - p1.lng()) * Math.PI / 180;
  var a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(p1.lat() * Math.PI / 180) * Math.cos(p2.lat() * Math.PI / 180) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  var c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  var d = R * c;
  return d;
};

/**
 * Add a marker to a cluster, or creates a new cluster.
 *
 * @param {google.maps.Marker} marker The marker to add.
 * @private
 */
MarkerClusterer.prototype.addToClosestCluster_ = function(marker) {
  var distance = 40000; // Some large number
  var clusterToAddTo = null;
  var pos = marker.getPosition();
  for (var i = 0, cluster; cluster = this.clusters_[i]; i++) {
    var center = cluster.getCenter();
    if (center) {
      var d = this.distanceBetweenPoints_(center, marker.getPosition());
      if (d < distance) {
        distance = d;
        clusterToAddTo = cluster;
      }
    }
  }

  if (clusterToAddTo && clusterToAddTo.isMarkerInClusterBounds(marker)) {
    clusterToAddTo.addMarker(marker);
  } else {
    var cluster = new Cluster(this);
    cluster.addMarker(marker);
    this.clusters_.push(cluster);
  }
};

/**
 * Creates the clusters.
 *
 * @private
 */
MarkerClusterer.prototype.createClusters_ = function() {
  if (!this.ready_) {
    return;
  }

  // Get our current map view bounds.
  // Create a new bounds object so we don't affect the map.
  var mapBounds = new google.maps.LatLngBounds(this.map_.getBounds().getSouthWest(),
      this.map_.getBounds().getNorthEast());
  var bounds = this.getExtendedBounds(mapBounds);

  for (var i = 0, marker; marker = this.markers_[i]; i++) {
    if (!marker.isAdded && this.isMarkerInBounds_(marker, bounds)) {
      this.addToClosestCluster_(marker);
    }
  }
};

/**
 * A cluster that contains markers.
 *
 * @param {MarkerClusterer} markerClusterer The markerclusterer that this
 *     cluster is associated with.
 * @constructor
 * @ignore
 */
function Cluster(markerClusterer) {
  this.markerClusterer_ = markerClusterer;
  this.map_ = markerClusterer.getMap();
  this.gridSize_ = markerClusterer.getGridSize();
  this.minClusterSize_ = markerClusterer.getMinClusterSize();
  this.averageCenter_ = markerClusterer.isAverageCenter();
  this.center_ = null;
  this.markers_ = [];
  this.bounds_ = null;
  this.clusterIcon_ = new ClusterIcon(this, markerClusterer.getStyles(),
      markerClusterer.getGridSize());
}

/**
 * Determins if a marker is already added to the cluster.
 *
 * @param {google.maps.Marker} marker The marker to check.
 * @return {boolean} True if the marker is already added.
 */
Cluster.prototype.isMarkerAlreadyAdded = function(marker) {
  if (this.markers_.indexOf) {
    return this.markers_.indexOf(marker) != -1;
  } else {
    for (var i = 0, m; m = this.markers_[i]; i++) {
      if (m == marker) {
        return true;
      }
    }
  }
  return false;
};

/**
 * Add a marker the cluster.
 *
 * @param {google.maps.Marker} marker The marker to add.
 * @return {boolean} True if the marker was added.
 */
Cluster.prototype.addMarker = function(marker) {
  if (this.isMarkerAlreadyAdded(marker)) {
    return false;
  }

  if (!this.center_) {
    this.center_ = marker.getPosition();
    this.calculateBounds_();
  } else {
    if (this.averageCenter_) {
      var l = this.markers_.length + 1;
      var lat = (this.center_.lat() * (l-1) + marker.getPosition().lat()) / l;
      var lng = (this.center_.lng() * (l-1) + marker.getPosition().lng()) / l;
      this.center_ = new google.maps.LatLng(lat, lng);
      this.calculateBounds_();
    }
  }

  marker.isAdded = true;
  this.markers_.push(marker);

  var len = this.markers_.length;
  if (len < this.minClusterSize_ && marker.getMap() != this.map_) {
    // Min cluster size not reached so show the marker.
    marker.setMap(this.map_);
  }

  if (len == this.minClusterSize_) {
    // Hide the markers that were showing.
    for (var i = 0; i < len; i++) {
      this.markers_[i].setMap(null);
    }
  }

  if (len >= this.minClusterSize_) {
    marker.setMap(null);
  }

  this.updateIcon();
  return true;
};

/**
 * Returns the marker clusterer that the cluster is associated with.
 *
 * @return {MarkerClusterer} The associated marker clusterer.
 */
Cluster.prototype.getMarkerClusterer = function() {
  return this.markerClusterer_;
};

/**
 * Returns the bounds of the cluster.
 *
 * @return {google.maps.LatLngBounds} the cluster bounds.
 */
Cluster.prototype.getBounds = function() {
  var bounds = new google.maps.LatLngBounds(this.center_, this.center_);
  var markers = this.getMarkers();
  for (var i = 0, marker; marker = markers[i]; i++) {
    bounds.extend(marker.getPosition());
  }
  return bounds;
};

/**
 * Removes the cluster
 */
Cluster.prototype.remove = function() {
  this.clusterIcon_.remove();
  this.markers_.length = 0;
  delete this.markers_;
};

/**
 * Returns the center of the cluster.
 *
 * @return {number} The cluster center.
 */
Cluster.prototype.getSize = function() {
  return this.markers_.length;
};

/**
 * Returns the center of the cluster.
 *
 * @return {Array.<google.maps.Marker>} The cluster center.
 */
Cluster.prototype.getMarkers = function() {
  return this.markers_;
};

Cluster.prototype.getMarkerIds = function() {
  var markers = this.markers_;
  var len = markers.length;
  var r = [];
  for(var i = 0; i < len; i++) { r.push(markers[i].myIndex); }
  return r;
};

/**
 * Returns the center of the cluster.
 *
 * @return {google.maps.LatLng} The cluster center.
 */
Cluster.prototype.getCenter = function() {
  return this.center_;
};

/**
 * Calculated the extended bounds of the cluster with the grid.
 *
 * @private
 */
Cluster.prototype.calculateBounds_ = function() {
  var bounds = new google.maps.LatLngBounds(this.center_, this.center_);
  this.bounds_ = this.markerClusterer_.getExtendedBounds(bounds);
};

/**
 * Determines if a marker lies in the clusters bounds.
 *
 * @param {google.maps.Marker} marker The marker to check.
 * @return {boolean} True if the marker lies in the bounds.
 */
Cluster.prototype.isMarkerInClusterBounds = function(marker) {
  return this.bounds_.contains(marker.getPosition());
};

/**
 * Returns the map that the cluster is associated with.
 *
 * @return {google.maps.Map} The map.
 */
Cluster.prototype.getMap = function() {
  return this.map_;
};

/**
 * Updates the cluster icon
 */
Cluster.prototype.updateIcon = function() {
  var zoom = this.map_.getZoom();
  var mz = this.markerClusterer_.getMaxZoom();

  if (mz && zoom > mz) {
    // The zoom is greater than our max zoom so show all the markers in cluster.
    for (var i = 0, marker; marker = this.markers_[i]; i++) {
      marker.setMap(this.map_);
    }
    return;
  }

  if (this.markers_.length < this.minClusterSize_) {
    // Min cluster size not yet reached.
    this.clusterIcon_.hide();
    return;
  }

  var numStyles = this.markerClusterer_.getStyles().length;
  var sums = this.markerClusterer_.getCalculator()(this.markers_, numStyles);
  this.clusterIcon_.setCenter(this.center_);
  this.clusterIcon_.setSums(sums);
  this.clusterIcon_.show();
};

/**
 * A cluster icon
 *
 * @param {Cluster} cluster The cluster to be associated with.
 * @param {Object} styles An object that has style properties:
 *     'url': (string) The image url.
 *     'height': (number) The image height.
 *     'width': (number) The image width.
 *     'anchor': (Array) The anchor position of the label text.
 *     'textColor': (string) The text color.
 *     'textSize': (number) The text size.
 *     'backgroundPosition: (string) The background postition x, y.
 * @param {number=} opt_padding Optional padding to apply to the cluster icon.
 * @constructor
 * @extends google.maps.OverlayView
 * @ignore
 */
function ClusterIcon(cluster, styles, opt_padding) {
  cluster.getMarkerClusterer().extend(ClusterIcon, google.maps.OverlayView);

  this.styles_ = styles;
  this.padding_ = opt_padding || 0;
  this.cluster_ = cluster;
  this.center_ = null;
  this.map_ = cluster.getMap();
  this.div_ = null;
  this.sums_ = null;
  this.visible_ = false;

  this.setMap(this.map_);
}

/**
 * Triggers the clusterclick event and zoom's if the option is set.
 *
 * @param {google.maps.MouseEvent} event The event to propagate
 */
ClusterIcon.prototype.triggerClusterClick = function(event) {
  var markerClusterer = this.cluster_.getMarkerClusterer();

  // Trigger the clusterclick event.
  //google.maps.event.trigger(markerClusterer, 'clusterclick', this.cluster_, event);
  // What is this?!

  // Custom click handler.
  var f = markerClusterer.getClickHandler();
  var stop_actions = false;
  if("function" === typeof f) { stop_actions = f(this.cluster_); }

  // Zoom into the cluster.
  if (!stop_actions && markerClusterer.isZoomOnClick()) {
    this.map_.fitBounds(this.cluster_.getBounds());
  }

  // Stop underlying labels opening their own info windows.
  event.stopPropagation();
};

/**
 * Adding the cluster icon to the dom.
 * @ignore
 */
ClusterIcon.prototype.onAdd = function() {
  this.div_ = document.createElement('DIV');
  if (this.visible_) {
    var pos = this.getPosFromLatLng_(this.center_);
    this.div_.style.cssText = this.createCss(pos);
    this.div_.innerHTML = this.sums_.text;

    // Anchor debugging.
    //new google.maps.Circle({
    //        strokeWeight: 0,
    //        fillColor: '#f00',
    //        fillOpacity: 1.0,
    //        map: this.map_,
    //        center: this.center_,
    //        radius: 1000
    //    });
  }

  var panes = this.getPanes();
  panes.overlayMouseTarget.appendChild(this.div_);

  var that = this;
  google.maps.event.addDomListener(this.div_, 'click', function(event) {
    that.triggerClusterClick(event);
  });
};

/**
 * Returns the position to place the div dending on the latlng.
 *
 * @param {google.maps.LatLng} latlng The position in latlng.
 * @return {google.maps.Point} The position in pixels.
 * @private
 */
ClusterIcon.prototype.getPosFromLatLng_ = function(latlng) {
  var pos = this.getProjection().fromLatLngToDivPixel(latlng);

  if (typeof this.iconAnchor_ === 'object' && this.iconAnchor_.length === 2) {
    pos.x -= this.iconAnchor_[0];
    pos.y -= this.iconAnchor_[1];
  } else {
    pos.x -= parseInt(this.width_ / 2, 10);
    pos.y -= parseInt(this.height_ / 2, 10);
  }
  return pos;
};

/**
 * Draw the icon.
 * @ignore
 */
ClusterIcon.prototype.draw = function() {
  if (this.visible_) {
    var pos = this.getPosFromLatLng_(this.center_);
    this.div_.style.top = pos.y + 'px';
    this.div_.style.left = pos.x + 'px';
  }
};

/**
 * Hide the icon.
 */
ClusterIcon.prototype.hide = function() {
  if (this.div_) {
    this.div_.style.display = 'none';
  }
  this.visible_ = false;
};

/**
 * Position and show the icon.
 */
ClusterIcon.prototype.show = function() {
  if (this.div_) {
    var pos = this.getPosFromLatLng_(this.center_);
    this.div_.style.cssText = this.createCss(pos);
    this.div_.style.display = '';
  }
  this.visible_ = true;
};

/**
 * Remove the icon from the map
 */
ClusterIcon.prototype.remove = function() {
  this.setMap(null);
};

/**
 * Implementation of the onRemove interface.
 * @ignore
 */
ClusterIcon.prototype.onRemove = function() {
  if (this.div_ && this.div_.parentNode) {
    this.hide();
    this.div_.parentNode.removeChild(this.div_);
    this.div_ = null;
  }
};

/**
 * Set the sums of the icon.
 *
 * @param {Object} sums The sums containing:
 *   'text': (string) The text to display in the icon.
 *   'index': (number) The style index of the icon.
 */
ClusterIcon.prototype.setSums = function(sums) {
  this.sums_ = sums;
  this.text_ = sums.text;
  this.index_ = sums.index;
  if (this.div_) {
    this.div_.innerHTML = sums.text;
  }

  this.useStyle();
};

/**
 * Sets the icon to the styles.
 */
ClusterIcon.prototype.useStyle = function() {
  var index = Math.max(0, this.sums_.index - 1);
  index = Math.min(this.styles_.length - 1, index);
  var style = this.styles_[index];
  this.url_ = style['url'];
  this.height_ = style['height'];
  this.width_ = style['width'];
  this.textColor_ = style['textColor'];
  this.anchor_ = style['anchor'];
  this.textSize_ = style['textSize'];
  this.backgroundPosition_ = style['backgroundPosition'];
  this.iconAnchor_ = style['iconAnchor'];
};

/**
 * Sets the center of the icon.
 *
 * @param {google.maps.LatLng} center The latlng to set as the center.
 */
ClusterIcon.prototype.setCenter = function(center) {
  this.center_ = center;
};

/**
 * Create the css text based on the position of the icon.
 *
 * @param {google.maps.Point} pos The position.
 * @return {string} The css style text.
 */
ClusterIcon.prototype.createCss = function(pos) {

  var style = [];
  style.push('background-image:url(' + this.url_ + ');');
  var backgroundPosition = this.backgroundPosition_ ? this.backgroundPosition_ : '0 0';
  style.push('background-position:' + backgroundPosition + ';');

  if (typeof this.anchor_ === 'object') {
    var ah = this.anchor_[0];
    var aht = typeof ah;
    if (aht === 'number' && ah > 0 && ah < this.height_) {
      style.push(
              'height:' + (this.height_ - ah) + 'px; ' +
              'padding-top:' + ah + 'px;');
    } else if (aht === 'number' && ah < 0 && -ah < this.height_) {
      style.push(
              'height:' + this.height_ + 'px; ' +
              'line-height:' + (this.height_ + ah) + 'px;');
    } else {
      style.push('height:' + this.height_ + 'px; ' +
              'line-height:' + this.height_ + 'px;');
    }

    var aw = this.anchor_[1];
    var awt = typeof aw;
    if (awt === 'number' && aw > 0 && aw < this.width_) {
      style.push(
//              'width:' + (this.width_ - aw) + 'px; ' +
              'width: 100px; ' +
              'padding-left:' + aw + 'px;');
    } else {
      style.push(
              'width:' + this.width_ + 'px; ' +
              'text-align:center;');
    }
  } else {
    // XXX Quick fix!
    style.push(
            'height:' + this.height_ + 'px; ' +
            'line-height:35px; ' +
            'width:' + this.width_ + 'px; ' +
            'text-align:center;' +
            'padding-right:16px;');
    //style.push(
    //        'height:' + this.height_ + 'px; ' +
    //        'line-height:' + this.height_ + 'px; ' +
    //        'width:' + this.width_ + 'px; ' +
    //        'text-align:center;');
  }

  var txtColor = this.textColor_ ? this.textColor_ : 'black';
  var txtSize = this.textSize_ ? this.textSize_ : 11;

  style.push(
          'cursor:pointer; top:' + pos.y + 'px; ' +
          'left:' + pos.x + 'px; ' +
          'color:' + txtColor + '; ' +
          'position:absolute; ' +
          'font-size:' + txtSize + 'px; ' +
          'font-family:Arial,sans-serif; ' +
          'font-weight:bold');

  return style.join('');
};

// ------------------------------------------------------------------------

var NLB = NLB || {};
var jQuery = jQuery || {};
var google = google || {};
var litebox = litebox || function(){};

NLB.PoslovnaMreza2 = {
    poslovalnice: [],
    opremaSifrant: [], // Oprema poslovalnic.
    infoWindow: null,
    map: null,
    refreshing: false,
    needsRefreshing: false,
    myLat: 0,
    myLng: 0,
    circle: null,
    filterHeight: 340,
    resultsHeight: null
};

(function(ns, App, $){

    App.addInitPage(function() {

        ns.setDefaultFilterFromHash();
        ns.initMap();
        $(".poslovna-mreza-iskalnik-2 .nlb-checkbox").click(function(e){
            ns.refreshPoslovalnice(true);
        });
        $(".poslovna-mreza-iskalnik-2 .icon-iskanje").click(function(e){
            ns.refreshPoslovalnice();
        });
        $(".poslovna-mreza-iskalnik-2 .forma").submit(function(e){
            e.preventDefault();
            return false;
        });
        $(".poslovna-mreza-iskalnik-2 .search_box").keyup(function(e) {
            if(13 == e.which) {
                return false;
            } else {
                ns.closeInfoPoslovalnica(false);
                ns.refreshPoslovalnice();
            }
        });
        ns.loadPoslovalnice();

        // Accordion events are handled in nlb-main.js. Here we attach another
        // click handler, to proportionaly resize the results below.
        $(".poslovna-mreza-iskalnik-2 .full-width-accordian").click(function(e) {
            var clas = e.target.className;
            var bubble = /icon-kljukica|nlb-checkbox/i.test(clas);
            // Don't handle bubbled events.
            if(!bubble) {
                var c = $(".poslovna-mreza-iskalnik-2 .rezultati");
                var filters_visible = (10 < $(this).find(".content").height());
                if(!filters_visible) { ns.resultsHeight = c.height(); }
                var fh = ns.filterHeight;
                var rh = ns.resultsHeight;
                var th = (filters_visible ? rh : rh-fh);
                c.animate({height: th + "px"}, 200)
            }
        });
    });

    ns.initMap = function(){

        var mapOptions = {
            center: { lat: 46.049, lng: 14.50079 },
            zoom: 8,
            minZoom: 6,
            maxZoom: 18,
            scrollwheel: true
        };
        ns.map = new google.maps.Map(document.getElementById('gmap'),mapOptions);

        ns.map.addListener('zoom_changed', function() {
            // Remove circle and close the info window.
            ns.circle && ns.circle.setMap(null);
            ns.infoWindow && ns.infoWindow.close();
        });
    };

    // If page was called with #ot-N hash, turn on filter N.
    ns.setDefaultFilterFromHash = function() {

        var h = window.location.hash;
        if(!h) return;
        var i = h.indexOf("ot-");
        if(i == -1) return;

        var ap = $('.poslovna-mreza-iskalnik-2 .filtri a[data-off]');
        ap.trigger("click");

        var to = h.substr(i+3);
        var name = "office-type-"+to;
        var inp = $(".poslovna-mreza-iskalnik-2 .filtri input[name='" + name +"']");
        inp.val(to);

        var a = $(".poslovna-mreza-iskalnik-2 .filtri a[data-name='" + name +"']");
        a.addClass("checked");
    };

    ns.loadPoslovalnice = function() {

        // Pri FO se poslovni centri kaĹžejo na koncu.
        var sort = function(pe) {

            var pc = [];
            var drugo = [];
            for(var i = 0, len = pe.length; i < len; i++) {
                var p = pe[i];
                if(43 == p.vrsta) {
                    pc.push(p);
                } else {
                    drugo.push(p);
                }
            }

            if(/podjet/.test(document.location.href)) {
                return pc.concat(drugo);
            } else {
                return drugo.concat(pc);
            }
        }

        $.ajax({
            type:"GET",
            url:"/ajax/poslovalnice",
            success: function(r) {
                ns.poslovalnice = sort(r.data.poslovalnice);
                ns.oprema = r.data.opremaSifrant;
                ns.showPoslovalnice();
            },
            error: function(r) {
                alert(r.message || "Poslovalnice niso naloĹžene!");
            }
        });
    };

    // Some events trigger before DOM is changed, so there is the delay
    // parameter to postpone processing. Variable needsrefreshing is for cases
    // where changes happened while processing and procedure must be redone.
    ns.refreshPoslovalnice = function(delay) {

        function refresh(delay) {

            if(!delay) {
                ns.refreshing = true;
                ns.needsRefreshing = false;

                ns.hidePoslovalnice();
                ns.showPoslovalnice();
            }

            if(delay || ns.needsRefreshing) {
                setTimeout(function() { refresh(); }, 200);
            } else {
                ns.refreshing = false;
            }
        }

        if(ns.refreshing) {
            ns.needsRefreshing = true;
        } else {
            refresh(delay);
        }
    };

    ns.hidePoslovalnice = function() {
        for(var f = 0; f < ns.poslovalnice.length; f++) {
            var pos = ns.poslovalnice[f];
            if(!pos.marker) { continue; }
            var m = pos.marker;
            m.setMap(null);
            google.maps.event.clearInstanceListeners(m);
            pos.marker = null;
        }
        $(".poslovna-mreza-iskalnik-2 .count").html(0);
    };

    ns.showPoslovalnice = function() {

        var bounds = new google.maps.LatLngBounds();
        var latLng = null;
        var fil = ns.getFilter();
        var searchBox = $(".poslovna-mreza-iskalnik-2 .search_box");
        var sstr = $.trim(searchBox.val());
        var phold = searchBox.data("placeholder");
        if(sstr === phold || sstr === "") { sstr = null; }
        else { sstr = sstr.toLowerCase(); }
        var markers = [];

        var rowstart = '<div>';
        var rowend = '</div>';
        var zadetki = '';
        var count = 0;
        var len = ns.poslovalnice.length;

        for(var f = 0; f < len; f++) {
            var pos = ns.poslovalnice[f];
            if(!pos.lat || !pos.lng) { continue; }
            if(fil != null && !ns.checkPoslovalnicaFilter(pos, fil)) { continue; }
            if(sstr != null && !ns.checkPoslovalnicaSearch(pos,sstr)) { continue; }

            var m = ns.createMarker(f);
            markers.push(m);
            bounds.extend(pos.marker.getPosition());

            var s =
                rowstart +
                '<div class="zadetek">' +
                '<a href="#map" data-i="' + f + '">' + pos.naziv + '</a>' +
                '<div class="naslov">' + pos.naslov + ', ' + pos.posta + ' ' + pos.kraj + '</div>' +
                '<div class="vec"><a href="#">VeÄ</a></div>' +
                '</div>' +
                rowend;

            zadetki += s;
            count++;
        }

        $(".poslovna-mreza-iskalnik-2 .count").html(count);
        $(".poslovna-mreza-iskalnik-2 .rezultati").html(zadetki);
        $(".poslovna-mreza-iskalnik-2 .rezultati .zadetek a").click(function() {

            var mark = "clicked";
            $(".rezultati .zadetek").removeClass(mark);

            var box = $(this).closest(".zadetek");
            box.addClass(mark);

            var i = $(this).data("i") || box.find("a").data("i");
            ns.clickPoslovalnica(i);
        });

        if(!bounds.isEmpty()) { ns.map.fitBounds(bounds); }

        var mcOptions = {
            averageCenter: true,
            gridSize: 45,
            styles: [{
                url: '/nlb/nlb-portal/slo/poslovna-mreza/nlb-pin-c.png',
                width: 47,
                height: 40,
                textColor: '#ffffff',
                textSize: 13,
                iconAnchor: [15, 40]
            }],
            onClick: ns.clusterClick
        };

        if(ns.clusterer) {
            ns.clusterer.clearMarkers();
            //ns.clusterer.addMarkers(markers); // ZbriĹĄe opcije.
            ns.clusterer = new MarkerClusterer(ns.map, markers, mcOptions);
        }else{
            ns.clusterer = new MarkerClusterer(ns.map, markers, mcOptions);
        }
    };

    ns.createMarker = function(i) {
        var pos = ns.poslovalnice[i];
        var latLng = new google.maps.LatLng(pos.lat, pos.lng);
        var marker = new google.maps.Marker({
            'position': latLng,
            'icon': "/nlb/nlb-portal/slo/poslovna-mreza/nlb-pin.png"
        });
        marker.myIndex = i;
        pos.marker = marker;
        google.maps.event.addListener(marker, 'click', ns.markerClick);
        return marker;
    };

    ns.markerClick = function() {
        ns.clickPoslovalnica(this.myIndex);
    };

    ns.clusterClick = function(cluster) {
        var ids = cluster.getMarkerIds();
        var len = ids.length;
        if(10 > len)
        {
            var round = function(n) { return Number((n).toFixed(3)); }

            var id = ids[0];
            var b =  ns.poslovalnice[id];
            var lat = round(b.lat);
            var lng = round(b.lng);
            var poslovalnice = [b];

            for(var i = 1; i < len; i++) {
                id = ids[i];
                b =  ns.poslovalnice[id];
                if (lat != round(b.lat) || lng != round(b.lng)) return false;
                poslovalnice.push(b);
            }

            // Multiple units on the same location.
            ns.openUnitInfo(poslovalnice, false);
            return true;
        }
    };

    ns.openUnitInfo = function(units) {

        // First parameter can be a single object or an array.
        var unit = null;
        if(Object.prototype.toString.call(units) === '[object Array]') {
            unit = units[0];
        } else {
            unit = units;
            units = [unit];
        }

        var build_phonenums = function(nums) {
            var a = (nums || "").split(",");
            var html = [];
            for(i in a) {
                var num = $.trim(a[i]);
                var clean = num.replace(/[^0-9]/g, "");
                if(clean) {
                    clean = (("0" == clean[0]) ? "+386" + clean.substr(1) : clean);
                    var numh = '<a href="tel:' + clean + '">' + num + '</a>';
                    html.push(numh);
                }
            }
            return html.join(", ");
        }

        var build_emails = function(addresses) {
            var a = (addresses || "").split(",");
            var html = [];
            for(i in a) {
                var address = $.trim(a[i]);
                if(address) {
                    var h = '<a href="mailto:' + address + '">' + address + '</a>';
                    html.push(h);
                }
            }
            return html.join(", ");
        }

        var infobox = $(".poslovna-mreza-iskalnik-2 .infobox");
        var poslbox = infobox.find(".poslovalnica");
        var vodjabox = infobox.find(".vodja");
        var mapbox = $("#gmap");
        mapbox.css("width", "60%");
        infobox.css("width", "40%");

        infobox.data("poslovalnica", unit);

        // XXX ZaÄasna reĹĄitev za pokvarjen sistem telefonskih ĹĄtevilk.
        // XXX Odstrani v naslednji verziji.
        // XXX 2017-10-11: ĹĄe vedno prihajajo napaÄni podatki?!
        if(unit.fax_vodja != undefined) {
            switch(unit.oe + "|" + unit.id) {
                case "4184|141": // PC Severovzhod Celje
                    unit.tel = "(03) 424 01 33";
                    unit.fax = "(03) 424 01 73";
                    break;
                case "4184|142": // PC Severovzhod Slovenj Gradec
                    unit.tel = "(02) 884 91 73";
                    unit.fax = "(02) 884 20 50";
                    break;
                case "4184|143": // PC Severovzhod Murska Sobota
                    unit.tel = "(02) 515 41 98";
                    unit.fax = "(02) 515 43 80";
                    break;
                case "4184|144": // PC Severovzhod Maribor
                    unit.tel = "(02) 234 45 44";
                    unit.fax = "(02) 234 45 55";
                    break;
                case "4080|131": // PC Jugovzhod KrĹĄko
                    unit.tel = "(07) 490 46 05";
                    unit.fax = "(07) 490 46 42";
                    break;
                case "4080|134": // PC Jugovzhod Novo mesto
                    unit.tel = "(07) 339 11 39";
                    unit.fax = "(07) 393 38 04";
                    break;
                case "4080|136": // PC Jugovzhod Ribnica
                    unit.tel = "(01) 893 93 63";
                    unit.fax = "(01) 893 93 56";
                    break;
                case "4101|132": // PC Zahod Kranj
                    unit.tel = "(04) 287 41 17";
                    unit.fax = "(04) 287 41 40";
                    break;
                case "4101|145": // PC Zahod Koper
                    unit.tel = "(05) 610 30 23";
                    unit.fax = "(05) 610 30 78";
                    break;
                case "4101|201": // PC Zahod Cerknica
                    unit.tel = "(05) 709 04 11";
                    unit.fax = "(05) 709 22 46";
                    break;
                case "4101|146": // PC Zahod Nova Gorica
                    unit.tel = "(05) 610 30 11";
                    unit.fax = "(031) 320 610";
                    break;
                case "4254|182": // PC mobilnega banÄniĹĄtva Ljubljana
                    unit.tel = "(01) 587 41 25";
                    unit.fax = "(01) 477 46 39";
                    break;
                case "4003|130": // PC Osrednja Slovenija LJ Trg republike
                    unit.tel = "(01) 476 21 04, (01) 476 21 58";
                    unit.fax = "(01) 476 23 26";
                    break;
                case "4003|138": // PC Osrednja Slovenija LJ TrĹžaĹĄka
                    unit.tel = "(01) 477 46 04, (01) 786 60 70";
                    unit.fax = "(01) 477 46 19";
                    break;
                case "4003|139": // PC Osrednja Slovenija DomĹžale
                    unit.tel = "(01) 831 83 83, (01) 724 53 31";
                    unit.fax = "(01) 724 55 06";
                    break;
                case "4003|140": // PC Osrednja Slovenija Trbovlje
                    unit.tel = "(03) 565 86 12, (01) 724 54 70";
                    unit.fax = "(03) 563 12 31";
                    break;
                case "4003|147": // PC Osrednja Slovenija LJ FuĹžine
                    unit.tel = "(01) 587 41 18, (01) 587 41 16";
                    unit.fax = "(01) 477 46 09";
                    break;
            }
        }

        // Polnjenje DOM predloge s podatki o poslovalnici.
        var data = [
            [ "h2", unit.naziv ],
            [ ".naslov p:first", unit.naslov ],
            [ ".naslov > p + p", unit.posta + " " + unit.kraj ],
            [ ".ime p", unit.vodja ],
            [ ".fone:first span", build_phonenums(unit.tel), ".fone:first" ],
            [ ".fax:first span", build_phonenums(unit.fax), ".fax:first" ],
            [ ".fone:last span", build_phonenums(unit.tel_vodja), ".fone:last" ],
            [ ".fax:last span", build_phonenums(unit.fax_vodja), ".fax:last" ],
            [ ".email span", build_emails(unit.email), ".email" ],
            [ ".urnik > p + p", unit.del_cas, ".urnik" ]
        ];
        for(d in data) {
            var selector = data[d][0];
            var content = data[d][1] || "";
            var holder = data[d][2] || "";
            if(content) {
                infobox.find(holder).show();
                infobox.find(selector).html(content);
            } else if(holder) {
                infobox.find(holder).hide();
            }
        }

        var img = poslbox.find("img");
        if(unit.thumb) {
            var url =
                window.location.origin +
                unit.thumb;
            img.show().attr("src", url);
        } else {
            img.hide();
        }

        img = vodjabox.find("img");
        if(unit.vodja_thumb) {
            var url =
                window.location.origin +
                unit.vodja_thumb;
            img.show().attr("src", url);
        } else {
            img.hide();
        }

        // Nastavitev zamljevida.
        var zoom = 18;
        var url = "https://www.google.com/maps/@" +
            unit.lat + "," + unit.lng + "," +
            zoom + "z";
        infobox.find("a.newmap").attr("href", url);

        ns.spotlight(unit);

        // Preklapljanje informacij o vodji in poslovalnici s klikom.
        if(unit.vodja) {
            infobox.find(".page_box").show();
            infobox.find(".page_flip").off().click(function() {
                poslbox.toggle();
                vodjabox.toggle();
                return false;
            });
        } else {
            infobox.find(".page_box").hide();
        }

        infobox.find(".icon-zapri").off().click(ns.closeInfoPoslovalnica);
        infobox.find(".calltoaction").off().click(ns.showForm);

        // Izbor ustreznih elementov za prikaz.
        poslbox.show();
        vodjabox.hide();
        infobox.removeClass("hidden").show();
    };

    ns.showForm = function() {

        var infobox = $(".poslovna-mreza-iskalnik-2 .infobox");
        var poslovalnica = infobox.data("poslovalnica");
        $('html,body').scrollTop(0);
        $("#narocite-se-obrazec input[name='poslovalnica']").val(poslovalnica.oe);
        $("#narocite-se-obrazec h1").text(poslovalnica.naziv);
        litebox('narocite-se-obrazec');
        return true;
    }

    ns.closeInfoPoslovalnica = function(refocus) {
        var infobox = $(".poslovna-mreza-iskalnik-2 .infobox");
        if(infobox.is(":visible")) {
            var mapbox = $("#gmap");
            var poslovalnica = infobox.data("poslovalnica");
            infobox.animate(
                { width: "0px" }, 200, null,
                function() { $(this).hide(); });
            mapbox.animate(
                { width: "100%" }, 250, null,
                function() {
                    if(refocus) {
                        ns.spotlight(poslovalnica);
                    }else{
                        google.maps.event.trigger(ns.map, 'resize');
                    }
                }
            );
        }
    };

    ns.spotlight = function(poslovalnica, zoom) {
        var zoom = (("undefined" !== typeof zoom) ? zoom : 17);
        google.maps.event.trigger(ns.map, 'resize');
        var p = new google.maps.LatLng(poslovalnica.lat, poslovalnica.lng);
        ns.map.setCenter(p);
        ns.map.setZoom(zoom);

        // Redraw a spotlight circle.
        ns.circle && ns.circle.setMap(null);
        
        ns.circle = new google.maps.Circle({
            strokeWeight: 0,
            fillColor: '#7a7594',
            fillOpacity: 0.25,
            map: ns.map,
            center: p,
            radius: 80
        });

        // Redraw an info window, if it makes sense.
        ns.infoWindow && ns.infoWindow.close();

        if(poslovalnica.komentar) {
            ns.infoWindow = new google.maps.InfoWindow({
                position: p,
                content:
                    '<div style="margin-top: 5px; font-family: Roboto,Arial,sans-serif;">' +
                    '<div style="font-size: 16px; font-weight: bold;">' + poslovalnica.naziv + '</div>' +
                    '<div style="font-size: 14px; margin-top: 10px;">' + poslovalnica.komentar + '</div>' +
                    '</div>',
                pixelOffset: new google.maps.Size(-9, -44),
                maxWidth: "275"
            });
            ns.infoWindow.open(ns.map);
        }
    }

    ns.clickPoslovalnica = function(i) {
        var p = ns.poslovalnice[i];
        ns.openUnitInfo(p);
    };

    ns.getFilter = function() {
        var fil = [];
        var a = $(".poslovna-mreza-iskalnik-2 .filtri .checked");
        a.each(function(i){
            var name = $(this).data("name");
            if(name.substr(0,12) === "office-type-") {
                fil.push(parseInt(name.substr(12)));
            }
        });
        return (fil.length > 0 ? fil : null);
    };

    ns.checkPoslovalnicaFilter = function(pos, fil) {
        for(var f = 0; f < fil.length; f++) {
            var t = fil[f];
            if(pos.oprema.indexOf(t) === -1) { return false; }
        }
        return true;
    };

    ns.checkPoslovalnicaSearch = function(pos, sstr) {
        var s = pos.naziv+" "+pos.naslov+" "+pos.posta+" "+pos.kraj;
        s = s.toLowerCase();
        return s.indexOf(sstr) !== -1;
    };

})(NLB.PoslovnaMreza2, NLB, jQuery);