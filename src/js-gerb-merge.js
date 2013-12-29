(function() {
    var pcbs = [];
    var paper;
    
    var dragstart = function () {
        this.dx_start = this.pcb.dx; // keep record of initial(at the start of drag) PCB offset
        this.dy_start = this.pcb.dy;
        this.labelx = this.label.attr("x"); // record of initial(at the start of drag) label position
        this.labely = this.label.attr("y");
        this.attr({stroke: '#000'});
    };
    var dragmove = function (dx, dy) {
        this.pcb.dx = this.dx_start + dx;
        this.pcb.dy = this.dy_start + dy;
        this.attr({path: 'M'+this.pcb.getBoundary().toString()+'Z'}); // move PCB outline
        this.label.attr({x: this.labelx + dx, y: this.labely + dy}); // move label
    };
    var dragstop = function () {
        this.attr({stroke: '#ddd'});
    };
    var rotate = function() {
        this.pcb.rotation += 90;
        this.attr({path: 'M'+this.pcb.getBoundary().toString()+'Z'}); // move PCB outline
        var centre = this.pcb.getTranslatedCentroid();
        this.label.attr({x: centre[0], y: centre[1]});
    };

    var addPCBtoUI = function(pcb) {
        var polygonpoints = pcb.getBoundary();
        var polygonstring = 'M'+polygonpoints.toString()+'Z';
        var polygon = paper.path(polygonstring);
        polygon.attr({fill: '#9cf', stroke: '#ddd', 'stroke-width': 2});
        polygon.drag(dragmove,dragstart,dragstop);
        polygon.pcb = pcb;
        polygon.dblclick(rotate);
        var centre = pcb.getTranslatedCentroid();
        var label = paper.text(centre[0],centre[1],pcb.name); // add PCB name near the left top 
        polygon.label = label;
    };

    function fixDownload() {
        var blobLink = $('#blob').get(0);
        try {
            if(pcbs.length > 0) {
                blobLink.download = "merged.zip";
                var zip = new JSZip();
                var bigpcb = pcbs[0];                 
                for(i=1; i < pcbs.length; i++) {
                    bigpcb = bigpcb.addpcb(pcbs[i]);
                }
                var gerbs = bigpcb.getGerbers();
                for(var i=0; i < gerbs.length; i++) {
                    zip.file(gerbs[i][0],gerbs[i][1]);
                }
                blobLink.href = window.URL.createObjectURL(zip.generate({type:"blob"}));
            }
        } catch(e) {
            blobLink.innerHTML += " (Error ! Refresh the page and try again or try with a different browser)";
        }
        return true;
    }

    function handleFileSelect(evt) {
        var files = evt.target.files; // FileList object
        var nFilesRead = 0;
        var gerbs = []; // array of ['filename.gtl','<content of filename.gtl>']
        var pcbReadCallBack = function(gerber) {
            nFilesRead += 1;
            gerbs.push(gerber);
            if(nFilesRead == files.length) {
                // all gerbers read, now construct PCB
                var pcb = new jspcb.PCB(gerbs);
                pcbs.push(pcb);
                addPCBtoUI(pcb);
            }
        };
        // files is a FileList of File objects. List some properties.
        for (var i = 0, f; f = files[i]; i++) {
            var reader = new FileReader();
            reader.onload = (function(theFile) {
                return function(e) {
                    var bin = e.target.result;
                    // The following code line assumes english only ASCII. To support other characters, different encoding is needed. 
                    var str = String.fromCharCode.apply(null, new Uint8Array(bin)); // convert array buffer to string
                    pcbReadCallBack([theFile.name, str]);
                }
            })(f);
            reader.readAsArrayBuffer(f);
        }
    }

    $(function () {
        fixDownload();
        $("#files").change(handleFileSelect);
		$("#blob").click(fixDownload);
        paper = new Raphael($('#canvas_container').get(0),1920,1080);
    });

}());
