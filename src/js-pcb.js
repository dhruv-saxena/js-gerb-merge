var jspcb = (function() {
    var PCB = function(gerbers) {
        // returns an object representing the PCB
        // gerbers is a list of files that describe the pcb. 
        // example: [ ['board.gtl','<contents of board.gtl>'], ['board.gbl','<contents of board.gbl>'] ]
        var gerbs = gerbers;

        this.dx = 0;
        this.dy = 0;
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
        this.getInitBoundary = function() {
            // TODO: return a list of vertices that describes the boundary
            return [ [0,0] , [100,0] , [100,200] , [0,200] ];
        }
    }

    return {
        PCB: PCB
    }        
}());

