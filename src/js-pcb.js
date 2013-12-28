var jspcb = (function() {
    var PCB = function(gerbers) {
        // returns an object representing the PCB
        // gerbers is a list of files that describe the pcb. 
        // example: [ ['board.gtl','<contents of board.gtl>'], ['board.gbl','<contents of board.gbl>'] ]
        var gerbs = gerbers;
        
        // give some random initial offset to reduce the chances of all the pcbs co-inciding
        this.dx = Math.floor(Math.random()*50);
        this.dy = Math.floor(Math.random()*50);
        
        // TODO: use some heuristic to get PCB name from the gerbers
        this.name = "PCB"+Math.floor(Math.random()*100000).toString(); // random name for PCB

        this.rotation = 0; // this is in degrees

        this.getGerbers = function() {
            // TODO: return list of modified gerbers along with their contents
            return gerbs;
        }
        this.addpcb = function(pcb) {
            // TODO: merge all the PCBs in the argument list and return the merged PCB
            return this;
        }
        this.getBoundary = function() {
            // TODO: arr should be a list of vertices that describes the boundary. And yeah, this whole function is a stub
            var arr = [ [0,0] , [100,0] , [100,200] , [0,200] ];
            
            // find centroid. TODO: DRY this out. following code is copied from getCentroid
            var cx = 0;
            var cy = 0;
            for(var i=0; i < arr.length; i++) {
                cx += arr[i][0];
                cy += arr[i][1];
            }
            var centre = [cx/arr.length, cy/arr.length];
            // first rotate w.r.t to centroid
            for(var i=0;i < arr.length; i++) {
                var temp = [arr[i][0]-centre[0],arr[i][1]-centre[1]]; // now point is centred at origin
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
            var polygon = this.getBoundary();
            var cx = 0;
            var cy = 0;
            for(var i=0; i < polygon.length; i++) {
                cx += polygon[i][0];
                cy += polygon[i][1];
            }
            return [cx/polygon.length, cy/polygon.length];
        }
    }

    return {
        PCB: PCB
    }        
}());

