'use strict';

////////////////////////////////////////////////
// IMPORTS
////////////////////////////////////////////////
import MapService from "./MapService.js";
import Running from "./models/Running.js";
import Cycling from "./models/Cycling.js";

////////////////////////////////////////////////
// DOM
////////////////////////////////////////////////
const form = document.querySelector('.form');
const containerWorkouts = document.querySelector('.workouts');
const inputType = document.querySelector('.form__input--type');
const inputDistance = document.querySelector('.form__input--distance');
const inputDuration = document.querySelector('.form__input--duration');
const inputCadence = document.querySelector('.form__input--cadence');
const inputElevation = document.querySelector('.form__input--elevation');

////////////////////////////////////////////////
// DECLARATIONS
////////////////////////////////////////////////
const months =
    ['January', 'February', 'March',
    'April', 'May', 'June', 'July', 'August',
    'September', 'October', 'November', 'December'];

class App {
    // public
    workouts;
    //privates
    mapService
    formOpened;

    constructor(mapService) {
        this.workouts = [];
        this.formOpened = false;

        //
        this._startMapService(mapService);

        // workout type change listener
        inputType.addEventListener('change', this._toggleElevationField)
    }

    obtainPosition() {
        return mapService.obtainPosition();
    }

    addOnMapClickListener(onMapClickListener) {
        mapService.addOnMapClickListener(onMapClickListener);
    }

    openWorkoutCreator(event) {
        if (this.formOpened) return;

        //
        console.log(`clicked on coords, lat:${event.latlng.lat} long:${event.latlng.lng}`);
        mapService.updateCoords(event);
        mapService.addMarker(mapService.coords);

        //
        this._showForm();
    }

    hideForm() {
        form.classList.remove('hidden');
        form.classList.add('hidden');
        this.formOpened = false;

        //
        mapService.removeCurrentMarker();
    }

    restorePreviousData() {
        const localStorageData = localStorage.getItem('workouts');
        this.workouts = JSON.parse(localStorageData) ?? [];
        console.log('restored data', this.workouts);

        // render previous data
        this.workouts.forEach(workout => {
            // fixing date
            workout.date = new Date(workout.date);
            console.log(workout);
            this._addWorkoutMarkerGivenCoords(workout);
            this._renderWorkoutListItem(workout);
        });
    }

    _toggleElevationField(event) {
        event.preventDefault();
        inputCadence.closest('.form__row').classList.remove('form__row--hidden');
        inputElevation.closest('.form__row').classList.remove('form__row--hidden');

        console.log(event.target.value);
        switch (event.target.value) {
            case 'cycling':
                inputCadence.closest('.form__row').classList.add('form__row--hidden');
                break;
            case 'running':
                inputElevation.closest('.form__row').classList.add('form__row--hidden');
                break;
        }
    }

    _startMapService(mapService) {
        this.mapService = mapService;
    }

    _showForm() {
        form.classList.remove('hidden');
        this.formOpened = true;
        inputDistance.focus();

        // clear form data
        inputCadence.value = '';
        inputElevation.value = '';
        inputDistance.value = '';
        inputDuration.value = '';
    }

    _createWorkout(event) {
        // reading data from form
        const workoutType = inputType.value;
        // console.log(workoutType);
        switch (workoutType) {
            case 'cycling':
                this._createCyclingWorkout(event);
                break;
            case 'running':
                this._createRunningWorkout(event);
                break;
        }

        console.log(this.workouts);
    }

    _createCyclingWorkout(event) {
        const distance = Number.parseFloat(inputDistance.value.trim());
        const duration = Number.parseFloat(inputDuration.value.trim());
        const elevation = Number.parseFloat(inputElevation.value.trim());
        console.log('cycling workout mode ', distance,' ', duration,' ', elevation);

        if ( ! this._cyclingDataAreValid(distance, duration, elevation)) {
            alert('the value have to be a positive number')
            return;
        }


        const newWorkout = new Cycling(Object.assign({}, mapService.coords), distance, duration, elevation);
        console.log(newWorkout);
        this.workouts.push(newWorkout);

        // create marker
        this._addWorkoutMarker(newWorkout.type);
        this.formOpened = false;

        // render workout in the list
        this._renderWorkoutListItem(newWorkout, newWorkout.type);

    }

    _createRunningWorkout(event) {
        const distance = Number.parseFloat(inputDistance.value.trim());
        const duration = Number.parseFloat(inputDuration.value.trim());
        const cadence = Number.parseFloat(inputDuration.value.trim());
        // let cadence = inputCadence.value.trim();
        // const regEx = /(\d)+(\/)(\d)+/; // selects all patterns 'number/number'
        if ( ! this._runningDataAreValid(distance, duration, cadence)) {
            alert('the value have to be a positive number')
            return;
        }

        console.log('running workout mode ', distance,' ', duration,' ', cadence);

        // [cadence] = cadence.match(regEx);
        const newWorkout = new Running(Object.assign({}, mapService.coords), distance, duration, cadence);
        console.log(newWorkout);
        this.workouts.push(newWorkout);

        // create marker
        this._addWorkoutMarker(newWorkout.type);
        this.formOpened = false;

        // render workout in the list
        this._renderWorkoutListItem(newWorkout);
    }

    _renderWorkoutListItem(workout) {
        switch (workout.type) {
            case 'cycling':
                this._renderCyclingListItem(workout);
                break;
            case 'running':
                this._renderRunningListItem(workout);
                break;
        }
    }

    _renderCyclingListItem(workout) {
        const liWorkout = document.createElement('li');
        const h2WorkoutTitle = document.createElement('h2');
        const divWorkoutDetailsDistance = this._createWorkoutItemDetail('🚴‍♀️', workout.distance, 'KM')
        const divWorkoutDetailsDuration = this._createWorkoutItemDetail('⏱️', workout.duration, 'MIN')
        const divWorkoutDetailsSpeed = this._createWorkoutItemDetail('⚡️', workout.speed.toPrecision(2), 'KM/H')
        const divWorkoutDetailsElevation = this._createWorkoutItemDetail('⛰', workout.elevationGain, 'M')

        // adding classes and attributes
        liWorkout.classList.add('workout', 'workout--cycling');
        liWorkout.setAttribute('data-id', workout.id);
        h2WorkoutTitle.classList.add('workout__title');
        const monthName = new Intl.DateTimeFormat("en-US", { month: "long" }).format;
        const longName = monthName(workout.date); // "July"
        h2WorkoutTitle.textContent = `Cycling on ${longName} ${workout.date.getDay()}`;

        // assembling
        liWorkout.append(h2WorkoutTitle);
        liWorkout.append(divWorkoutDetailsDistance);
        liWorkout.append(divWorkoutDetailsDuration);
        liWorkout.append(divWorkoutDetailsSpeed);
        liWorkout.append(divWorkoutDetailsElevation);

        // add to dom
        containerWorkouts.append(liWorkout);

    }

    _renderRunningListItem(workout) {
        const liWorkout = document.createElement('li');
        const h2WorkoutTitle = document.createElement('h2');
        const divWorkoutDetailsDistance = this._createWorkoutItemDetail('🏃‍♂️', workout.distance, 'KM')
        const divWorkoutDetailsDuration = this._createWorkoutItemDetail('⏱', workout.duration, 'MIN')
        const divWorkoutDetailsPace = this._createWorkoutItemDetail('⚡️', workout.pace.toPrecision(2), 'MIN/KM')
        const divWorkoutDetailsCadence = this._createWorkoutItemDetail('🦶🏼', workout.cadence, 'SPM')

        // adding classes and attributes
        liWorkout.classList.add('workout', 'workout--running');
        liWorkout.setAttribute('data-id', workout.id);
        h2WorkoutTitle.classList.add('workout__title');
        const monthName = new Intl.DateTimeFormat("en-US", { month: "long" }).format;
        const longName = monthName(workout.date); // "July"
        h2WorkoutTitle.textContent = `Running on ${longName} ${workout.date.getDay()}`

        // assembling
        liWorkout.append(h2WorkoutTitle);
        liWorkout.append(divWorkoutDetailsDistance);
        liWorkout.append(divWorkoutDetailsDuration);
        liWorkout.append(divWorkoutDetailsPace);
        liWorkout.append(divWorkoutDetailsCadence);

        // add to dom
        containerWorkouts.append(liWorkout);
    }

    _createWorkoutItemDetail(icon, value, unit) {
        const divWorkoutDetails = document.createElement('div');
        const spanIcon = document.createElement('span');
        const spanValue = document.createElement('span');
        const spanUnit = document.createElement('span');
        divWorkoutDetails.classList.add('workout__details');
        spanIcon.classList.add('workout__icon');
        spanIcon.textContent = `${icon}`
        spanValue.classList.add('workout__value');
        spanValue.textContent = `${value}`
        spanUnit.classList.add('workout__unit');
        spanUnit.textContent = `${unit}`

        // assembling
        divWorkoutDetails.append(spanIcon);
        divWorkoutDetails.append(spanValue);
        divWorkoutDetails.append(spanUnit);

        return divWorkoutDetails;
    }

    _addWorkoutMarker(workoutType) {
        const marker = mapService.addMarker(mapService.coords);
        mapService.addPopup(marker, workoutType, workoutType);
    }

    _addWorkoutMarkerGivenCoords(workout) {
        const marker = mapService.addMarker(workout.coords);
        mapService.addPopup(marker, workout.type, workout.type);
    }

    _cyclingDataAreValid(distance, duration, elevation) {
        const isValidDistance = (distance && (distance > 0)) ? true : false;
        const isValidDuration = (duration && (duration > 0)) ? true : false;
        const isValidElevation = (elevation && (elevation > 0)) ? true : false;

        return isValidDistance && isValidDuration && isValidElevation;
    }

    _runningDataAreValid(distance, duration, cadence) {
        const isValidDistance = (distance && (distance > 0)) ? true : false;
        const isValidDuration = (duration && (duration > 0)) ? true : false;
        const isValidCadence = (cadence && (cadence > 0)) ? true : false;
        // const regEx = /(\d)+(\/)(\d)+/; // selects all patterns 'number/number'
        // console.log('reg expr: ', inputCadence.value.trim().match(regEx));
        // const isValidCadence = regEx.test(cadence);

        return isValidDistance && isValidDuration && isValidCadence;
    }

}// App


////////////////////////////////////////////////
// MAIN
////////////////////////////////////////////////
const mapService = new MapService();
const app = new App(mapService);

// start map service AND get initial position
const position = await app.obtainPosition();

// restore any previous workouts data saved in local storage
app.restorePreviousData();

//
app.addOnMapClickListener((event) => {
    app.openWorkoutCreator(event)
});


// get data from form
// check if data is valid
// if workout running, create running object
// if workout cycling, create cycling object
// add new object to workout array
// render workout on map as marker
// form listener
form.addEventListener('submit', (event) => {
    event.preventDefault();
    console.log(`current position, lat:${app.mapService.coords.latitude} long:${app.mapService.coords.longitude}`);
    app._createWorkout(event);

    // hide form
    form.classList.toggle('hidden');
});

// add on click listener on list item
// add click listener
containerWorkouts.addEventListener('click', ev => {
    if (ev.target.closest('.workout')) {
        const liItem = ev.target.closest('.workout');
        const workoutId = liItem.dataset.id;
        console.log(`workout id: ${workoutId}`);
        const workout = app.workouts.find(element => element.id === workoutId);
        mapService.centerToCoords(workout.coords);
    }
});


// listen for ESC keydown event, to abort workout creation
form.addEventListener('keydown', ev => {
    if (ev.key === 'Escape' && app.formOpened) {
        app.hideForm();
    }
});

window.addEventListener('beforeunload', ev => {
    localStorage.setItem('workouts', JSON.stringify(app.workouts));
});



