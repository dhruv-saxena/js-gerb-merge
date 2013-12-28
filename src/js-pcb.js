var jspcb = (function() {
    var PCB = function(gerbers) {
        // returns an object representing the PCB
        // gerbers is a list of files that describe the pcb. 
        // example: [ ['board.gtl','<contents of board.gtl>'], ['board.gbl','<contents of board.gbl>'] ]
        var gerbs = gerbers;

        // TODO: get x, y and name from the gerbers
        this.x = 10;
        this.y = 10;
        this.name = "PCB";

        this.rotation = 0;

        this.getGerbers = function() {
            // TODO: return list of modified gerbers along with their contents
            return gerbs;
        }
        this.addGerber = function(gerber) {
            // gerber should be of type [ 'board.gtl', '<content of board.gtl>' ]
            gerbs.push(gerber);
        }
        this.addpcb = function(pcb) {
            // TODO: merge all the PCBs in the argument list and return the merged PCB
            return this;
        }
        this.getBoundary = function() {
            // TODO: return a list of vertices that describes the boundary
            return [ [0,0] , [1,0] , [1,2] , [0,2] ];
        }
    }

    return {
        PCB: PCB
    }        
}());

