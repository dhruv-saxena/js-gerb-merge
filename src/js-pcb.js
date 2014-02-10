var jspcb = (function() {
    var PCB = function(gerbers) {
        // returns an object representing the PCB
        // gerbers is a list of files that describe the pcb. 
        // example: [ ['board.gtl','<contents of board.gtl>'], ['board.gbl','<contents of board.gbl>'] ]
        var gerbs = gerbers;

        // give some random initial offset to reduce the chances of all the pcbs co-inciding
        this.dx = Math.floor(Math.random()*50);
        this.dy = Math.floor(Math.random()*50);

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
            dd = str;
            if( /momm/i.exec(str) || /moin/i.exec(str) ) {
                if(/momm/i.exec(str)) {
                    unitscale *= 0.0393701; // 1 mm = 0.03937 in. This file has dimensions in mm
                }

                var m = /FSLAX(\d)(\d)/i.exec(str);
                if(m) {
                    var re = /^X(-?\d+)Y(-?\d+)/;
                    unitscale *= Math.pow(10, -1 * Number(m[2]));
                    var lines = str.split('\n');
                    for(var j=0; j < lines.length; j++) {
                        var m = re.exec(lines[j]);
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
        
        // get it into the display
        if(boundary[0][0] < 0) {
            this.dx += -boundary[0][0];
        }
        if(boundary[0][1] < 0) {
            this.dy += -boundary[0][1];
        }

        var arr = []; // pre-prepping an array for boundary seems to give a small speedup
        for(var i=0;i<boundary.length;i++) {
            arr[i] = [0,0];
        }
        var origdx = this.dx;
        var origdy = this.dy;
        
                
        // TODO: use some heuristic to get PCB name from the gerbers
        this.name = "PCB"+Math.floor(Math.random()*100000).toString(); // random name for PCB

        this.rotation = 0; // this is in degrees

        this.getGerbers = function() {
            // Translate and rotate the points in the gerber files and give it to the user
            // TODO: Rotation. Currently doing only translation
            var newgerbs = [];

            var tx = (this.dx-origdx);
            var ty = (this.dy-origdy);

            for(var i=0;i < gerbs.length; i++) {
                newgerbs[i] = ['d.txt',''];
                newgerbs[i][0] = gerbs[i][0]; // keep the same file name
                var content = gerbs[i][1];
                var lines = content.split('\n');
                for(var j=0; j < lines.length; j++) {
                    var opline = lines[j];
                    var m = re.exec(opline);
                    if(m) {
                        // We have a (X,Y) here. Translate it by modifying opline
                        var newx = String(Number(m[1]) + tx);
                        var newy = String(Number(m[2]) + ty);
                        var repl = 'X'+newx+'Y'+newy;
                        opline = opline.replace(re,repl);
                    }
                    newgerbs[i][1] += opline + '\n';
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

