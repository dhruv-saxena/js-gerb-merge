var jspcb = (function() {
    var PCB = function(gerbers) {
        // returns an object representing the PCB
        // gerbers is a list of files that describe the pcb. 
        // example: [ ['board.gtl','<contents of board.gtl>'], ['board.gbl','<contents of board.gbl>'] ]
        var gerbs = gerbers;
        
        // give some random initial offset to reduce the chances of all the pcbs co-inciding
        this.dx = Math.floor(Math.random()*20);
        this.dy = Math.floor(Math.random()*20);

        this.name = "PCB";

        this.rotation = 0;

        this.getGerbers = function() {
            // TODO: return list of modified gerbers along with their contents
            return gerbs;
        }
        this.addpcb = function(pcb) {
            // TODO: merge all the PCBs in the argument list and return the merged PCB
            return this;
        }
        this.getBoundary = function() {
            // TODO: arr should be a list of vertices that describes the boundary
            var arr = [ [0,0] , [100,0] , [100,200] , [0,200] ];
            for(i=0;i < arr.length; i++) {
                arr[i][0] += this.dx;
                arr[i][1] += this.dy;
            }
            return arr;
        }
    }

    return {
        PCB: PCB
    }        
}());

