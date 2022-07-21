
import Workout from "./Workout.js";

class Cycling extends Workout{
    elevationGain;
    speed;

    constructor(coords, distance, duration, elevationGain) {
        super('cycling', coords, distance, duration);
        this.elevationGain = elevationGain;
        //
        this.calcSpeed();
    }

    calcSpeed() {
        // km/h
        this.speed = this.distance / (this.duration / 60); // speed is in h
        return this.speed;
    }

}// Cycling

export default Cycling;