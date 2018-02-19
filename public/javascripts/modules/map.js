import axios from "axios";
import { $ } from "./bling";
import autocomplete from "./autocomplete";
const mapOptions = {
    center: { lat: 1, lng: 1 },
    zoom: 2
};
function loadPlaces(map, lat = 1, lng = 1) {
    axios.get(`/api/stores/near?lat=${lat}&lng=${lng}`).then(res => {
        const places = res.data;
        if (!places.length) {
            return;
        }

        const bounds = new google.maps.LatLngBounds();
        const infoWindows = new google.maps.InfoWindow();

        const markers = places.map(place => {
            const [placeLng, placeLat] = place.location.coordinates;
            const position = { lat: placeLat, lng: placeLng };
            bounds.extend(position);
            const marker = new google.maps.Marker({
                map,
                position
            });
            marker.place = place;
            return marker;
        });

        markers.forEach(marker =>
            marker.addListener("click", function() {
                const html = `
                    <div class="popup">
                        <a href="/store/${this.place.slug}">
                            <img src="/uploads/${this.place.photo || "store.png"} alt="${this.place.name}"/>
                            <p>${this.place.name} - ${this.place.location.address}</p>
                        </a>
                    </div>
                `;
                infoWindow.setContent(html);
                infoWindow.open(map, this);
                autocomplete;
            })
        );

        map.setCenter(bounds.getCenter());
        map.fitBounds(bounds);
    });
}

function makeMap(mapDiv) {
    if (!mapDiv) {
        return;
    }

    const map = new google.maps.Map(mapDiv, mapOptions);
    loadPlaces(map);
    const input = $('[name="geolocate"]');
    const autocomplete = new google.maps.places.Autocomplete(input);
    autocomplete.addListener("place_changed", () => {
        const place = autocomplete.getPlace();
        loadPlaces(map, place.geometry.location.lat(), place.geometry.location.lng());
    });
}

export default makeMap;