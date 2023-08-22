export default {
  getDistanceFromLatLonInKm (lat1, lon1, lat2, lon2) {
    var R = 6371; // Radius of the earth in km
    var dLat = this.deg2rad(lat2-lat1);  // deg2rad below
    var dLon = this.deg2rad(lon2-lon1); 
    var a = 
      Math.sin(dLat/2) * Math.sin(dLat/2) +
      Math.cos(this.deg2rad(lat1)) * Math.cos(this.deg2rad(lat2)) * 
      Math.sin(dLon/2) * Math.sin(dLon/2)
      ; 
    var c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a)); 
    var d = R * c; // Distance in km
    return d;
  },
  deg2rad(deg) {
    return deg * (Math.PI/180)
  },
  pos2tile (latlng) {
    var x = 1 + parseInt((latlng.lng + 180) / 90)
    var y = 1 + parseInt((90 - latlng.lat) / 45)
    return {x:x, y: y}
  },
  maxTiles: {
    x:4,
    y:4
  },
  bounds2tiles (bounds, uncomplete) {
    var corner1 = bounds.getNorthWest()
    var corner2 = bounds.getSouthEast()
    var tile1 = this.pos2tile(corner1)
    var tile2 = this.pos2tile(corner2)
    var center = bounds.getCenter()
    var tile = this.pos2tile(center)
    var tiles = []
    // commence par le milieu
    tiles.push(tile.y + '/' + tile.x)
    for (var k=1; k <=4; k++) {
       var x1 = tile.x - k
       var x2 = tile.x + k
       var x1min = x1
       var y1 = tile.y - k
       var y2 = tile.y + k
       if (x1!= tile.x && x1 > 0) {
         for (var y = Math.max(y1, 1); y <=y2 && y <= this.maxTiles.y; y++) {
           tiles.push(y + '/' + x1)
         }
         x1min = x1 + 1
       } else if (x1 > 0) {
         x1min = x1
       } else {
         x1min = 1
       }
       if (y1!= tile.y && y1 > 0) {
         for (var x = x1min ; x < x2 && x <= this.maxTiles.x; x++) {
           tiles.push(y1 + '/' + x)
         }
       }
       if (x2!= tile.x && x2 <= this.maxTiles.x) {
         for (var y = Math.max(y1, 1); y <=y2 && y <= this.maxTiles.y; y++) {
           tiles.push(y + '/' + x2)
         }
       }
        if (y2!= tile.y && y2 <= this.maxTiles.y) {
         for (var x = x1min; x < x2 && x <= this.maxTiles.x; x++) {
           tiles.push(y2 + '/' + x)
         }
       }
    }
    return tiles
  }
}