export function calculateEdges(jukeboxData, track) {
    
    console.log(track.track);

    jukeboxData.minLongBranch = track.beats.length / 5;

    if (jukeboxData.currentThreshold === 0) {
        dynamicCalculateNearestNeighbors('beats', track, jukeboxData);
    } else {
        calculateNearestNeighbors('beats', jukeboxData.currentThreshold, jukeboxData, track);
    }
}

function calculateNearestNeighbors(type, threshold, jukeboxData, track) {
    precalculateNearestNeighbors(type, jukeboxData.maxBranches, jukeboxData.maxBranchThreshold, jukeboxData, track);
    let count = collectNearestNeighbors(type, threshold, track, jukeboxData);
    postProcessNearestNeighbors(type, jukeboxData, track);
    return count;
}

function dynamicCalculateNearestNeighbors(type, track, jukeboxData) {
    let count = 0;
    let targetBranchCount = track[type].length / 6;
    let threshold = 10;

    precalculateNearestNeighbors(type, jukeboxData.maxBranches, jukeboxData.maxBranchThreshold, jukeboxData, track);

    for (threshold = 10; threshold < jukeboxData.maxBranchThreshold; threshold += 5) {
        count = collectNearestNeighbors(type, threshold, track, jukeboxData);
        if (count >= targetBranchCount) {
            break;
        }
    }
    jukeboxData.currentThreshold = jukeboxData.computedThreshold = threshold;
    postProcessNearestNeighbors(type, jukeboxData, track);
    return count;
}

function precalculateNearestNeighbors(type, maxNeighbors, maxThreshold, jukeboxData, track) {
    // skip if this is already done
    if ('all_neighbors' in track[type][0]) {
        return;
    }
    jukeboxData.allEdges = [];
    for (let qi = 0; qi < track[type].length; qi++) {
        let q1 = track[type][qi];
        calculateNearestNeighborsForQuantum(type, maxNeighbors, maxThreshold, q1, track, jukeboxData);
    }
}

function calculateNearestNeighborsForQuantum(type, maxNeighbors, maxThreshold, q1, track, jukeboxData) {
    let edges = [];
    let id = 0;
    for (let i = 0; i < track[type].length; i++) {

        if (i === q1.which) {
            continue;
        }

        let q2 = track[type][i];
        let sum = 0;
        for (let j = 0; j < q1.overlappingSegments.length; j++) {
            let seg1 = q1.overlappingSegments[j];
            let distance = 100;
            if (j < q2.overlappingSegments.length) {
                let seg2 = q2.overlappingSegments[j];
                // some segments can overlap many quantums,
                // we don't want this self segue, so give them a
                // high distance
                if (seg1.which === seg2.which) {
                    distance = 100
                } else {
                    distance = get_seg_distances(seg1, seg2);
                }
            }
            sum += distance;
        }
        let pdistance = q1.indexInParent === q2.indexInParent ? 0 : 100;
        let totalDistance = sum / q1.overlappingSegments.length + pdistance;
        if (totalDistance < maxThreshold) {
            let edge = {
                id: id,
                src: q1,
                dest: q2,
                distance: totalDistance,
                curve: null,
                deleted: false
            };
            edges.push(edge);
            id++;
        }
    }

    edges.sort(
        function (a, b) {
            if (a.distance > b.distance) {
                return 1;
            } else if (b.distance > a.distance) {
                return -1;
            } else {
                return 0;
            }
        }
    );

    q1.all_neighbors = [];
    for (let i = 0; i < maxNeighbors && i < edges.length; i++) {
        let edge = edges[i];
        q1.all_neighbors.push(edge);

        edge.id = jukeboxData.allEdges.length;
        jukeboxData.allEdges.push(edge);
    }
}

function get_seg_distances(seg1, seg2) {
    let timbreWeight = 1, pitchWeight = 10,
        loudStartWeight = 1, loudMaxWeight = 1,
        durationWeight = 100, confidenceWeight = 1;

    let timbre = seg_distance(seg1, seg2, 'timbre', true);
    let pitch = seg_distance(seg1, seg2, 'pitches');
    let sloudStart = Math.abs(seg1.loudness_start - seg2.loudness_start);
    let sloudMax = Math.abs(seg1.loudness_max - seg2.loudness_max);
    let duration = Math.abs(seg1.duration - seg2.duration);
    let confidence = Math.abs(seg1.confidence - seg2.confidence);
    let distance = timbre * timbreWeight + pitch * pitchWeight +
        sloudStart * loudStartWeight + sloudMax * loudMaxWeight +
        duration * durationWeight + confidence * confidenceWeight;
    return distance;
}

function seg_distance(seg1, seg2, field, weighted) {
    if (weighted) {
        return weighted_euclidean_distance(seg1[field], seg2[field]);
    } else {
        return euclidean_distance(seg1[field], seg2[field]);
    }
}

function euclidean_distance(v1, v2) {
    let sum = 0;

    for (let i = 0; i < v1.length; i++) {
        let delta = v2[i] - v1[i];
        sum += delta * delta;
    }
    return Math.sqrt(sum);
}

function weighted_euclidean_distance(v1, v2) {
    let sum = 0;

    //for (let i = 0; i < 4; i++) {
    for (let i = 0; i < v1.length; i++) {
        let delta = v2[i] - v1[i];
        //let weight = 1.0 / ( i + 1.0);
        let weight = 1.0;
        sum += delta * delta * weight;
    }
    return Math.sqrt(sum);
}

function collectNearestNeighbors(type, maxThreshold, track, jukeboxData) {
    let branchingCount = 0;
    for (let qi = 0; qi < track[type].length; qi++) {
        let q1 = track[type][qi];
        q1.neighbors = extractNearestNeighbors(q1, maxThreshold, jukeboxData);
        if (q1.neighbors.length > 0) {
            branchingCount += 1;
        }
    }
    return branchingCount;
}

function extractNearestNeighbors(q, maxThreshold, jukeboxData) {
    let neighbors = [];

    for (let i = 0; i < q.all_neighbors.length; i++) {
        let neighbor = q.all_neighbors[i];

        if (neighbor.deleted) {
            continue;
        }

        if (jukeboxData.justBackwards && neighbor.dest.which > q.which) {
            continue;
        }

        if (jukeboxData.justLongBranches && Math.abs(neighbor.dest.which - q.which) < jukeboxData.minLongBranch) {
            continue;
        }

        let distance = neighbor.distance;
        if (distance <= maxThreshold) {
            neighbors.push(neighbor);
        }
    }
    return neighbors;
}

function postProcessNearestNeighbors(type, jukeboxData, track) {
    removeDeletedEdges(jukeboxData);

    if (jukeboxData.addLastEdge) {
        if (longestBackwardBranch(type, track) < 50) {
            insertBestBackwardBranch(type, jukeboxData.currentThreshold, 65, track);
        } else {
            insertBestBackwardBranch(type, jukeboxData.currentThreshold, 55, track);
        }
    }
    calculateReachability(type, track);
    jukeboxData.lastBranchPoint = findBestLastBeat(type, jukeboxData, track);
    filterOutBadBranches(type, jukeboxData.lastBranchPoint, track);
    if (jukeboxData.removeSequentialBranches) {
        filterOutSequentialBranches(type, track, jukeboxData);
    }
}

function removeDeletedEdges(jukeboxData) {
    for (let i = 0; i < jukeboxData.deletedEdges.length; i++) {
        let edgeID = jukeboxData.deletedEdges[i];
        if (edgeID in jukeboxData.allEdges) {
            let edge = jukeboxData.allEdges[edgeID];
            deleteEdge(edge, jukeboxData);
        }
    }
    jukeboxData.deletedEdges = [];
}

function deleteEdge(edge, jukeboxData) {
    if (!edge.deleted) {
        jukeboxData.deletedEdgeCount++;
        edge.deleted = true;
        if (edge.curve) {
            edge.curve.remove();
            edge.curve = null;
        }
        for (let j = 0; j < edge.src.neighbors.length; j++) {
            let otherEdge = edge.src.neighbors[j];
            if (edge === otherEdge) {
                edge.src.neighbors.splice(j, 1);
                break;
            }
        }
    }
}

function longestBackwardBranch(type, track) {
    let longest = 0;
    let quanta = track[type];
    for (let i = 0; i < quanta.length; i++) {
        let q = quanta[i];
        for (let j = 0; j < q.neighbors.length; j++) {
            let neighbor = q.neighbors[j];
            let which = neighbor.dest.which;
            let delta = i - which;
            if (delta > longest) {
                longest = delta;
            }
        }
    }
    let lbb = longest * 100 / quanta.length;
    return lbb;
}

function insertBestBackwardBranch(type, threshold, maxThreshold, track) {
    let branches = [];
    let quanta = track[type];
    for (let i = 0; i < quanta.length; i++) {
        let q = quanta[i];
        for (let j = 0; j < q.all_neighbors.length; j++) {
            let neighbor = q.all_neighbors[j];

            if (neighbor.deleted) {
                continue;
            }

            let which = neighbor.dest.which;
            let thresh = neighbor.distance;
            let delta = i - which;
            if (delta > 0 && thresh < maxThreshold) {
                let percent = delta * 100 / quanta.length;
                let edge = [percent, i, which, q, neighbor];
                branches.push(edge);
            }
        }
    }

    if (branches.length === 0) {
        return;
    }

    branches.sort(
        function (a, b) {
            return a[0] - b[0];
        }
    );
    branches.reverse();
    let best = branches[0];
    let bestQ = best[3];
    let bestNeighbor = best[4];
    let bestThreshold = bestNeighbor.distance;
    if (bestThreshold > threshold) {
        bestQ.neighbors.push(bestNeighbor);
        // console.log('added bbb from', bestQ.which, 'to', bestNeighbor.dest.which, 'thresh', bestThreshold);
    } else {
        // console.log('bbb is already in from', bestQ.which, 'to', bestNeighbor.dest.which, 'thresh', bestThreshold);
    }
}

function calculateReachability(type, track) {
    let maxIter = 1000;
    let quanta = track[type];
    let qi = 0;

    for (qi = 0; qi < quanta.length; qi++) {
        let q = quanta[qi];
        q.reach = quanta.length - q.which;
    }

    for (let iter = 0; iter < maxIter; iter++) {
        let changeCount = 0;
        for (qi = 0; qi < quanta.length; qi++) {
            let q = quanta[qi];
            let changed = false;

            for (let i = 0; i < q.neighbors.length; i++) {
                let q2 = q.neighbors[i].dest;
                if (q2.reach > q.reach) {
                    q.reach = q2.reach;
                    changed = true;
                }
            }

            if (qi < quanta.length - 1) {
                let q2 = quanta[qi + 1];
                if (q2.reach > q.reach) {
                    q.reach = q2.reach;
                    changed = true;
                }
            }

            if (changed) {
                changeCount++;
                for (let j = 0; j < q.which; j++) {
                    let q2 = quanta[j];
                    if (q2.reach < q.reach) {
                        q2.reach = q.reach;
                    }
                }
            }
        }
        if (changeCount === 0) {
            break;
        }
    }

    if (false) {
        for (let qi = 0; qi < quanta.length; qi++) {
            let q = quanta[qi];
            console.log(q.which, q.reach, Math.round(q.reach * 100 / quanta.length));
        }
    }
    // console.log('reachability map converged after ' + iter + ' iterations. total ' + quanta.length);
}

function findBestLastBeat(type, jukeboxData, track) {
    let reachThreshold = 50;
    let quanta = track[type];
    let longest = 0;
    let longestReach = 0;
    for (let i = quanta.length - 1; i >= 0; i--) {
        let q = quanta[i];
        //let reach = q.reach * 100 / quanta.length;
        let distanceToEnd = quanta.length - i;

        // if q is the last quanta, then we can never go past it
        // which limits our reach

        let reach = (q.reach - distanceToEnd) * 100 / quanta.length;

        if (reach > longestReach && q.neighbors.length > 0) {
            longestReach = reach;
            longest = i;
            if (reach >= reachThreshold) {
                break;
            }
        }
    }
    // console.log('NBest last beat is', longest, 'reach', longestReach, reach);

    jukeboxData.totalBeats = quanta.length;
    jukeboxData.longestReach = longestReach;
    return longest
}

function filterOutBadBranches(type, lastIndex, track) {
    let quanta = track[type];
    for (let i = 0; i < lastIndex; i++) {
        let q = quanta[i];
        let newList = []; //Good neighbors
        for (let j = 0; j < q.neighbors.length; j++) {
            let neighbor = q.neighbors[j];
            
            //Don't push edges that are less than 5 seconds long
            //Don't push edges that are greater than 2 minutes
            let edgeDuration = Math.abs(q.start - neighbor.start);
            if(edgeDuration < 10) {
                continue;
            }

            //Keep 4 beats in 
            console.log(q.which % track.track.time_signature);
            console.log(neighbor.dest.which % track.track.time_signature);
            console.log(neighbor);
            console.log("==================");
            if(q.which % track.track.time_signature !== neighbor.dest.which % track.track.time_signature) {
                continue;
            }

            if (neighbor.dest.which < lastIndex) {
                newList.push(neighbor);
            } else {
                // console.log('filtered out arc from', q.which, 'to', neighbor.dest.which);
            }
        }
        q.neighbors = newList;
    }
}

function filterOutSequentialBranches(type, track, jukeboxData) {
    let quanta = track[type];
    for (let i = quanta.length - 1; i >= 1; i--) {
        let q = quanta[i];
        let newList = [];

        for (let j = 0; j < q.neighbors.length; j++) {
            let neighbor = q.neighbors[j];
            if (hasSequentialBranch(q, neighbor, jukeboxData)) {
                // skip it
            } else {
                newList.push(neighbor);
            }
        }
        q.neighbors = newList;
    }
}

function hasSequentialBranch(q, neighbor, jukeboxData) {
    if (q.which === jukeboxData.lastBranchPoint) {
        return false;
    }

    let qp = q.prev;
    if (qp) {
        let distance = q.which - neighbor.dest.which;
        for (let i = 0; i < qp.neighbors.length; i++) {
            let odistance = qp.which - qp.neighbors[i].dest.which;
            if (distance === odistance) {
                return true;
            }
        }
    }
    return false;
}
