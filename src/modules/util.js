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
    var x = 1 + parseInt((latlng.lng + 180) / 45)
    var y = 1 + parseInt((90 - latlng.lat) / 90)
    return {x:x, y: y}
  },
  bounds2tiles (bounds) {
    var corner1 = bounds.getNorthWest()
    var corner2 = bounds.getSouthEast()
    var tile1 = this.pos2tile(corner1)
    var tile2 = this.pos2tile(corner2)
    var center = bounds.getCenter()
    var tile = this.pos2tile(center)
    var tiles = []
    // commence par le milieu
     
    for (var i=tile.x; i <= 9; i++) {
        console.log(2 * tile.x - i)
        for (var j= tile.y; j <= tile2.y; j++) {
          if (i <= 8) {
            tiles.push(j + '/' + i)
          }
          if (tile.x < i && 2 * tile.x - i >= 1) {
            tiles.push(j + '/' + (2 * tile.x - i))
          }
          if (tile.y < j && 2 * tile.y - j >= 1 && 2 * tile.y - j >= tile1.y) {
            tiles.push((2 * tile.y - j) + '/' + i)
             if (tile.x < i && 2 * tile.x - i >= 1) {
                tiles.push((2 * tile.y - j) + '/' + (2 * tile.x - i))
             }
          }
        }
    }
    for (var i=1; i <= 8; i++) {
        for (var j= tile.y - 1 ; j > 0 ; j--) {
          tiles.push(j + '/' + i)
        }
        for (var j= tile2.y +1 ; j < 3 ; j++) {
          tiles.push(j + '/' + i)
        }
    }
    return tiles
  }
}