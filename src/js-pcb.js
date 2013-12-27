var jspcb = (function() {
    var PCB = function(gerbers) {
        // returns an object representing the PCB
        // gerbers is a list of files that describe the pcb. 
        // example: [ ['board.gtl','<contents of board.gtl>'], ['board.gbl','<contents of board.gbl>'] ]
        var gerbs = gerbers;
        // TODO: get x and y from the edge cuts layer of the gerbers
        this.x = 10;
        this.y = 10;
        this.rotation = 0;
        this.getGerbers = function() {
            // TODO: return list of modified gerbers along with their contents
            return [ ['board.gtl','TODO-gtl'], ['board.gbl','TODO-gbl'] ];
        }
        this.addpcb = function(pcb) {
            // TODO: merge all the PCBs in the argument list and return the merged PCB
            return new PCB();
        }
    }

    return {
        PCB: PCB
    }        
}());

