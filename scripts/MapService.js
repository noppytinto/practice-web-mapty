
class MapService {
    #map;
    #mapEvent;
    coords;
    #currentTempMarker;

    //
    constructor() {
        this.coords = {
            latitude: 0,
            longitude: 0,
        };


        // getting position for the 1st time
        // this._getPosition();
    }

    obtainPosition() {
        const positionPromise = new Promise((resolve, reject) => {
            navigator.geolocation.getCurrentPosition(
                (position) =>  {
                    this._loadMap(position);
                    resolve(position)
                    // this._loadMapWithListener(position, onSuccess);
                }
                , () => {
                    reject('could not get your position');
                }
            );
        })

        return positionPromise;
    }

    toggleElevationField() {}

    addOnMapClickListener(onMapClickListener) {
        this.#map.on('click', onMapClickListener)
    }

    _getPosition() {
        navigator.geolocation.getCurrentPosition(
            this._loadMap.bind(this)
            , () => {
                alert('could not get your position');
            }
        );
    }

    _loadMap(position) {
        this.coords.latitude = position.coords.latitude;
        this.coords.longitude = position.coords.longitude;
        console.log('position obtained: ', this.coords);

        this.#map = this._createMap(this.coords);

    }

    _loadMapWithListener(position, onPositionObtainedListener) {
        console.log('called');
        this.coords.latitude = position.coords.latitude;
        this.coords.longitude = position.coords.longitude;
        console.log('position obtained: ', this.coords);

        this.#map = this._createMap(this.coords);

        //
        onPositionObtainedListener(position);
    }


    //--------------------

    addMarker(coords) {
        this.#currentTempMarker = L.marker([coords.latitude, coords.longitude])
            .addTo(this.#map)
        return this.#currentTempMarker;
    }

    removeCurrentMarker() {
        this.#currentTempMarker.remove();
    }

    addPopup(marker, label, customClassName = 'running') {
        marker.bindPopup(this._assembleCustomPopup(customClassName))
            .setPopupContent(`<strong>${label}</strong><br><br>lat: ${this.coords.latitude}<br>long: ${this.coords.longitude}`)
            .openPopup();
    }

    updateCoords(event) {
        this.coords.latitude = event.latlng.lat;
        this.coords.longitude = event.latlng.lng;
    }

    centerToCoords(coords) {
        this.#map.setView([coords.latitude, coords.longitude], 13, {duration: 0.5});
    }

    _createMap(coords) {
        const map = L.map('map').setView([coords.latitude, coords.longitude], 13);
        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
            attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        })
            .addTo(map);

        return map;
    }

    _assembleCustomPopup(className) {
        return L.popup({
            maxWidth: 250,
            minWidth: 100,
            autoClose: false,
            closeOnClick: false,
            className: `${className}-popup`,
        });
    }

}// MapService

export default MapService;