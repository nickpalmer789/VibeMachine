export class Driver {
    constructor(track, seekCallback, jukeboxData) {
        this.track = track;
        this.jukeboxData = jukeboxData;
        this.queue = [];
        this.seekCallback = seekCallback;

        this.keyPoints = this.findKeyPoints(4);
        console.log(this.keyPoints);

        this.timer = this.calculate();
    }

    calculate() {
        this.curBeat = this.track.beats[0];
        for(let i = 0; i < 10000; i++) {
            this.calculateAdvance();
            if (this.curBeat.next === null) {
                console.log('finished');
                break;
            }
        }
        console.log('de');
        let timer = this.start();
        return timer;
    }

    // Fuck this function
    start() {
        this.seekCallback(0);
        let start = new Date().getTime();
        let timer = setInterval(() => {
            let time = new Date().getTime() - start;
            if (this.queue[0][0]* 1000 < time) {
                start = new Date().getTime() - this.queue[0][1] * 1000;
                this.seekCallback(this.queue[0][1] * 1000);
                this.queue.shift();
                if (this.queue.length === 0) {
                    clearInterval(timer)
                }
            }
        }, 10)
        return timer
    }

    //Find the n last backward skips in the song
    findKeyPoints(n) {
        let keyPoints = [];
        //Loops over all beats in the song backwards
        for(let i = this.track.beats.length-1; i >= 0; i--) {
            //Loop over the neighbors of the current beat
            for(let neighbor of this.track.beats[i].neighbors) {
                //Detect whether the current neighbor is a backward edge
                if(neighbor.dest.start < this.track.beats[i].start) {
                    keyPoints.push(neighbor.src.which);
                }
                
                //Break if we have found n keypoints
                if(keyPoints.length === n) {
                    break;
                }
            }
            //Break if we have found n keypoints
            if(keyPoints.length === n) {
                break
            }
        }
        
        return keyPoints;
    }

    calculateAdvance() {
        let jumpChance = Math.random();
        //console.log(this.curBeat.start);
        //console.log(this.jukeboxData.curRandomBranchChance);

        //Always take the last available backwards skip
        //Minus 1 to look ahead at the next beat
        if(this.curBeat.which === this.keyPoints[0]-1) {
            let next = this.curBeat.next.neighbors.shift();
            this.jukeboxData.lastThreshold = next.distance;
            console.log(this.curBeat, next.distance, next.dest);
            this.curBeat.next.neighbors.push(next);
            this.queue.push([this.curBeat.start, next.dest.start]);
            this.curBeat = next.dest;
            this.jukeboxData.curRandomBranchChance = this.jukeboxData.minRandomBranchChance;
            return;
        }

        if (jumpChance < this.jukeboxData.curRandomBranchChance) {
            if (this.curBeat.next.neighbors.length === 0) {
                this.curBeat = this.curBeat.next;
            } else {
                let next = this.curBeat.next.neighbors.shift();

                //Don't skip to the point of no return
                if(next.which > this.keyPoints[0]) {
                    this.curBeat = this.curBeat.next;
                    return;
                }

                this.jukeboxData.lastThreshold = next.distance;
                console.log(this.curBeat, next.distance, next.dest);
                this.curBeat.next.neighbors.push(next);
                this.queue.push([this.curBeat.start, next.dest.start]);
                this.curBeat = next.dest;
                this.jukeboxData.curRandomBranchChance = this.jukeboxData.minRandomBranchChance;
            }
        } else {
            this.curBeat = this.curBeat.next;
            this.jukeboxData.curRandomBranchChance += this.jukeboxData.randomBranchChanceDelta;
            this.jukeboxData.curRandomBranchChance =
                Math.min(this.jukeboxData.curRandomBranchChance + this.jukeboxData.randomBranchChanceDelta,
                    this.jukeboxData.maxRandomBranchChance);
        }
    }
}
