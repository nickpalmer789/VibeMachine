function preprocessTrack(track) {
    const types = ['sections', 'bars', 'beats', 'tatums', 'segments'];

    for (let i in types) {
        let type = types[i];
        for (let j in track[type]) {
            let qlist = track[type];

            j = parseInt(j);

            let q = qlist[j];
            q.track = track;
            q.which = j;
            if (j > 0) {
                q.prev = qlist[j-1];
            } else {
                q.prev = null
            }

            if (j < qlist.length - 1) {
                q.next = qlist[j+1];
            } else {
                q.next = null
            }
        }
    }

    connectQuanta(track, 'sections', 'bars');
    connectQuanta(track, 'bars', 'beats');
    connectQuanta(track, 'beats', 'tatums');
    connectQuanta(track, 'tatums', 'segments');

    connectFirstOverlappingSegment(track, 'bars');
    connectFirstOverlappingSegment(track, 'beats');
    connectFirstOverlappingSegment(track, 'tatums');

    connectAllOverlappingSegments(track, 'bars');
    connectAllOverlappingSegments(track, 'beats');
    connectAllOverlappingSegments(track, 'tatums');


    filterSegments(track);
}

function connectQuanta(track, parent, child) {
    let last = 0;
    let qparents = track[parent];
    let qchildren = track[child];

    for (let i in qparents) {
        let qparent = qparents[i];
        qparent.children = [];

        for (let j = last; j < qchildren.length; j++) {
            let qchild = qchildren[j];
            if (qchild.start >= qparent.start
                && qchild.start < qparent.start + qparent.duration) {
                qchild.parent = qparent;
                qchild.indexInParent = qparent.children.length;
                qparent.children.push(qchild);
                last = j;
            } else if (qchild.start > qparent.start) {
                break;
            }
        }
    }
}

function connectFirstOverlappingSegment(track, quanta_name) {
    let last = 0;
    let quanta = track[quanta_name];
    let segs = track.segments;

    for (let i = 0; i < quanta.length; i++) {
        let q = quanta[i];

        for (let j = last; j < segs.length; j++) {
            let qseg = segs[j];
            if (qseg.start >= q.start) {
                q.oseg = qseg;
                last = j;
                break
            }
        }
    }
}

function connectAllOverlappingSegments(track, quanta_name) {
    let last = 0;
    let quanta = track[quanta_name];
    let segs = track.segments;

    for (let i = 0; i < quanta.length; i++) {
        let q = quanta[i];
        q.overlappingSegments = [];

        for (let j = last; j < segs.length; j++) {
            let qseg = segs[j];
            // seg starts before quantum so no
            if ((qseg.start + qseg.duration) < q.start) {
                continue;
            }
            // seg starts after quantum so no
            if (qseg.start > (q.start + q.duration)) {
                break;
            }
            last = j;
            q.overlappingSegments.push(qseg);
        }
    }
}

function filterSegments(track) {
    let threshold = .3;
    let fsegs = [];
    fsegs.push(track.segments[0]);
    for (let i = 1; i < track.segments.length; i++) {
        let seg = track.segments[i];
        let last = fsegs[fsegs.length - 1];
        if (isSimilar(seg, last) && seg.confidence < threshold) {
            fsegs[fsegs.length -1].duration += seg.duration;
        } else {
            fsegs.push(seg);
        }
    }
    track.fsegments = fsegs;
}

function isSimilar(seg1, seg2) {
    let threshold = 1;
    let distance = timbral_distance(seg1, seg2);
    return (distance < threshold);
}

function euclidean_distance(v1, v2) {
    let sum = 0;
    for (let i = 0; i < 3; i++) {
        let delta = v2[i] - v1[i];
        sum += delta * delta;
    }
    return Math.sqrt(sum);
}

function timbral_distance(s1, s2) {
    return euclidean_distance(s1.timbre, s2.timbre);
}