var jspcb = (function() {
    var PCB = function(gerbers) {
        // returns an object representing the PCB
        // gerbers is a list of files that describe the pcb. 
        // example: [ ['board.gtl','<contents of board.gtl>'], ['board.gbl','<contents of board.gbl>'] ]
        var gerbs = gerbers;

        // give some random initial offset to reduce the chances of all the pcbs co-inciding
        this.dx = 0;
        this.dy = 0;

        // boundary should be a list of vertices that describes the boundary as in the gerber
        var boundary = [ [0,0] , [0,0] , [0,0] , [0,0] ];

        // Boundary detection algorithm. Find the extreme (X,Y) locations marked in the gerber
        var xmin = Number.POSITIVE_INFINITY;
        var ymin = Number.POSITIVE_INFINITY;
        var xmax = Number.NEGATIVE_INFINITY;
        var ymax = Number.NEGATIVE_INFINITY;
        for(var i=0; i < gerbs.length; i++) {
            var str = gerbs[i][1];
            var unitscale = 1000; // one inch = 1000 mils
            if( /momm/i.exec(str) || /moin/i.exec(str) ) {
                if(/momm/i.exec(str)) {
                    unitscale *= 0.0393701; // 1 mm = 0.03937 in. This file has dimensions in mm
                }
                var lastx, lasty;
                var m = /FSLAX(\d)(\d)/i.exec(str);
                if(m) {
                    unitscale *= Math.pow(10, -1 * Number(m[2]));
                    var lines = str.split('\n');
                    for(var j=0; j < lines.length; j++) {
                        var m = /^G(\d+)X(-?\d+)Y(-?\d+)I(-?\d+)J(-?\d+)/i.exec(lines[j]);
                        if(m && (m[1] == 3 || m[1] == 2)) {
                            var dir = (m[1] == 3) ? 1 : -1; // clockwise or anti-clockwise arc
                            var sx = lastx; // start point
                            var sy = lasty;
                            var I = Number(m[4]) * unitscale; // distance between start and centre
                            var J = Number(m[5]) * unitscale;
                            var r = Math.sqrt(I*I + J*J); // radius of arc
                            var ex = Number(m[2]) * unitscale; // end of arc
                            var ey = Number(m[3]) * unitscale;
                            var cx = sx + I; // centre of arc
                            var cy = sy + J;
                            
                            // slope of the chord with direction
                            var fullcircle = false;
                            if(sx == ex && sy == ey) {
                                // full circle case
                                fullcircle = true;
                            }
                            var orienttest = function(tx, ty) {
                                return ( dir*((sx-tx)*(ey-ty) - (ex-tx)*(sy-ty)) < 0);
                            };
                           
                            // check if (minx,cy) is covered by the arc
                            var minx = cx - r;
                            if(minx < xmin && ( fullcircle || orienttest(minx,cy) )) {
                                xmin = minx;
                            }
                            // check if (maxx,cy) is covered by the arc
                            var maxx = cx + r;
                            if(maxx > xmax && ( fullcircle || orienttest(maxx,cy) )) {
                                xmax = maxx;
                            }
                            // check if (cx,miny) is covered by the arc
                            var miny = cy - r;
                            if(miny < ymin && ( fullcircle || orienttest(cx,miny) )) {
                                ymin = miny;
                            }
                            // check if (cx,maxy) is covered by the arc
                            var maxy = cy + r;
                            if(maxy > ymax && ( fullcircle || orienttest(cx,maxy) )) {
                                ymax = maxy;
                            }

                            lastx = ex;
                            lasty = ey;
                        }
                        var m =  /^X(-?\d+)Y(-?\d+)/i.exec(lines[j]);
                        if(m) {
                            var x = Number(m[1]) * unitscale;
                            var y = Number(m[2]) * unitscale;

                            if(x < xmin) {
                                xmin = x;
                            }
                            if(x > xmax) {
                                xmax = x;
                            }
                            if(y < ymin) {
                                ymin = y;
                            }
                            if(y > ymax) {
                                ymax = y;
                            }
                            lastx = x;
                            lasty = y;
                        }
                    }

                }
                else {
                    alert("Unrecognized gerber");
                }
            }
            else if( /^M48/i.exec(str) ){
                // drill file. For now this is ignored
            }
            else {
                alert("Unrecognized file");
            }
        }
        boundary = [ [xmin,ymin] , [xmax,ymin], [xmax,ymax], [xmin,ymax] ];
        
       
        var arr = []; // pre-prepping an array for boundary seems to give a small speedup
        for(var i=0;i<boundary.length;i++) {
            arr[i] = [0,0];
        }
        
                
        // TODO: use some heuristic to get PCB name from the gerbers
        this.name = "PCB"+Math.floor(Math.random()*100000).toString(); // random name for PCB

        this.rotation = 0; // this is in degrees

        this.getGerbers = function() {
            // Translate and rotate the points in the gerber files and give it to the user
            // TODO: Rotation. Currently doing only translation
            var newgerbs = [];

            var tx = this.dx;
            var ty = this.dy;
            for(var i=0;i < gerbs.length; i++) {
                newgerbs[i] = ['', ''];
                newgerbs[i][0] = gerbs[i][0]; // keep the same file name
                var content = gerbs[i][1];

                var unitscale = 1000; // one inch = 1000 mils
                if( /momm/i.exec(content) || /moin/i.exec(content) ) {
                    if(/momm/i.exec(content)) {
                        unitscale *= 0.0393701; // 1 mm = 0.03937 in. This file has dimensions in mm
                    }
                    var m = /FSLAX(\d)(\d)/i.exec(str);
                    if(m) {
                        unitscale *= Math.pow(10, -1 * Number(m[2]));
                        var lines = content.split('\n');
                        for(var j=0; j < lines.length; j++) {
                            var opline = lines[j];
                            var m = /^X(-?\d+)Y(-?\d+)/i.exec(opline);
                            if(m) {
                                // We have a (X,Y) here. Translate it by modifying opline
                                var newx = String(Math.round(Number(m[1]) + tx/unitscale));
                                var newy = String(Math.round(Number(m[2]) - ty/unitscale));
                                var repl = 'X'+newx+'Y'+newy;
                                opline = opline.replace(/^X(-?\d+)Y(-?\d+)/i,repl);
                            }
                            var m = /^G03X(-?\d+)Y(-?\d+)/i.exec(opline);
                            if(m) {
                                // We have a (X,Y) here. Translate it by modifying opline
                                var newx = String(Math.round(Number(m[1]) + tx/unitscale));
                                var newy = String(Math.round(Number(m[2]) - ty/unitscale));
                                var repl = 'G03X'+newx+'Y'+newy;
                                opline = opline.replace(/^G03X(-?\d+)Y(-?\d+)/i,repl);
                            }
                            newgerbs[i][1] += opline + '\n';
                        }
                    }
                }
                else {
                    newgerbs[i][1] = content; // cannot translate, so feed-through
                }
            }
            return newgerbs;
        }
        this.addpcb = function(pcb) {
            // TODO: merge all the PCBs in the argument list and return the merged PCB
            return this;
        }
        this.getBoundary = function() {
            var centre = this.getCentroid();
            // first rotate w.r.t to centroid
            for(var i=0;i < boundary.length; i++) {
                var temp = [boundary[i][0]-centre[0],boundary[i][1]-centre[1]]; // now point is centred at origin
                var rcos = Math.cos(this.rotation * Math.PI / 180);
                var rsin = Math.sin(this.rotation * Math.PI / 180);
                arr[i][0] = centre[0] + (rcos*temp[0] - rsin*temp[1]);
                arr[i][1] = centre[1] + (rsin*temp[0] + rcos*temp[1]);
            }

            // after rotation, translate
            for(var i=0;i < arr.length; i++) {
                arr[i][0] += this.dx;
                arr[i][1] += this.dy;
            }
            return arr;
        }
        this.getCentroid = function() {
            var cx = 0;
            var cy = 0;
            for(var i=0; i < boundary.length; i++) {
                cx += boundary[i][0];
                cy += boundary[i][1];
            }
            return [cx/boundary.length, cy/boundary.length];
        }
        this.getTranslatedCentroid = function() {
            var arr = this.getCentroid();
            arr[0] += this.dx;
            arr[1] += this.dy;
            return arr;
        }
    }

    return {
        PCB: PCB
    }        
}());

