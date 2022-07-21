
class Workout {
    id;
    distance;
    duration;
    coords;
    date;
    type;

    constructor(type, coords, distance, duration) {
        this.id = (Date.now().toString()).slice(-5);
        this.type = type;
        this.coords = coords;
        this.duration = duration; // in km
        this.distance = distance; // in min
        this.date = new Date();
    }


}// Workout

export default Workout;

