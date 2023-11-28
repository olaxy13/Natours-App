/* eslint-disable */

export const displayMap = (locations) => {
  
  mapboxgl.accessToken = 'pk.eyJ1Ijoib2xheHkxMyIsImEiOiJjbG41dnpma3QwNHZ6MnJtaG02cGJ3bjEzIn0.CqT9pP4KSp75mfcDU2tDzg';
  var map = new mapboxgl.Map({
    container: 'map',
    style: 'mapbox://styles/olaxy13/cln5xtlyp01ih01qn9hm63vj1',
    // center: [-118.113491, 34.111745],
     scrollZoom: false
  });

  const bounds = new mapboxgl.LngLatBounds(); // the mapboxgl is accessed due to the scrit in theheader in our tour.pug line6

  locations.forEach(location => {
    //Create marker
    const element = document.createElement('div');
    element.className = 'marker'  //we have is designed in the CSS

    //Add Marker
    new mapboxgl.Marker({
      element: element,
      anchor: 'bottom' //it's where would be pointing
    })
    .setLngLat(location.coordinates)
    .addTo(map);

    //Add POP_UP
    new mapboxgl.Popup({
      offset: 30
    })
    .setLngLat(location.coordinates)
    .setHTML(`<p>Day ${location.day}: ${location.description}</p>`)
    .addTo(map);
//Extend map bounds to inlude current location
    bounds.extend(location.coordinates,)
  });

  map.fitBounds(bounds, {
    padding: {
      top: 200,
      bottom: 150,
      left:100,
      right:100
 
    }
  })
}
