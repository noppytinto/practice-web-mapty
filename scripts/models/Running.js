
import Workout from "./Workout.js";

class Running extends Workout {
    cadence;
    pace;

    constructor(coords, distance, duration, cadence) {
        super('running', coords, distance, duration);
        this.cadence = cadence;
        //
        this.calcPace();
    }

    calcPace() {
        // min/km
        this.pace = this.duration / this.distance;
        return this.pace;
    }

}// Running

export default Running;