(function() {
    var pcbs = [];
    var paper,grid;
    
    var dragstart = function () {
        this.dx_start = this.pcb.dx; // keep record of initial(at the start of drag) PCB offset
        this.dy_start = this.pcb.dy;
        this.labelx = this.label.attr("x"); // record of initial(at the start of drag) label position
        this.labely = this.label.attr("y");
        this.attr({stroke: '#000'});
    };
    var dragmove = function (dx, dy) {
        var dx = paper.scale * dx;
        var dy = paper.scale * dy;
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
    var mousewheel = function(event, delta) {
        if(!event.ctrlKey) { // Make sure the user is not zooming the browser. This check was not needed for Chrome.
            var posx = event.clientX - $("#canvas_container").offset().left; // mouse position relative to the paper div
            var posy = event.clientY -  $("#canvas_container").offset().top;
            var SCALE_FACTOR = 1.25;
            var scale = delta > 0 ? 1.0/SCALE_FACTOR : SCALE_FACTOR; // relative scale
        
            // Original viewbox
            var x0 = paper.viewbox[0];
            var y0 = paper.viewbox[1];
            var w0 = paper.viewbox[2];
            var h0 = paper.viewbox[3];
            // new viewbox
            var x1 = x0 + posx/paper.width * w0 * (1 - scale);
            var y1 = y0 + posy/paper.height * h0 * (1 - scale);
            var w1 = w0 * scale;
            var h1 = h0 * scale;
            paper.viewbox = [x1, y1, w1, h1];
            // apply the viewbox
            paper.scale *= scale;
            paper.setViewBox.apply(paper, paper.viewbox);
        }
    };
    var drawGrid = function() {
        r = paper.rect(0,0,5000,10000);
        $(r.node).attr("fill","url(#mygrid)");
    }
    var zoomtofit = function(e) {
        var EXTRA_FACTOR = 1.1;

        var xlist = [].concat.apply([], pcbs.map(function(pcb){ return pcb.getBoundary().map(function(p){return p[0]}) }));
        var ylist = [].concat.apply([], pcbs.map(function(pcb){ return pcb.getBoundary().map(function(p){return p[1]}) }));

        var xmin = Math.min.apply(Math, xlist);
        var xmax = Math.max.apply(Math, xlist);
        var ymin = Math.min.apply(Math, ylist);
        var ymax = Math.max.apply(Math, ylist);

        var wtarg = EXTRA_FACTOR * (paper.width/window.innerWidth) * (xmax - xmin); // target width
        var htarg = EXTRA_FACTOR * (paper.height/(window.innerHeight - $("#canvas_container").offset().top)) * (ymax - ymin); // target height
        var w0 = paper.viewbox[2]; // current width
        var h0 = paper.viewbox[3]; // current height
        var scale = Math.max.apply(Math, [wtarg*1.0/w0, htarg*1.0/h0]); // chose scale while maintaining aspect ratio
        // new viewbox
        paper.viewbox = [xmin, ymin, w0 * scale , h0 * scale];
        paper.scale *= scale;
        paper.setViewBox.apply(paper, paper.viewbox);
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
        var label = paper.text(centre[0],centre[1],pcb.name); // add PCB name 
        label.attr('font-size',150);
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
                try {
                    var pcb = new jspcb.PCB(gerbs);
                    pcbs.push(pcb);
                    addPCBtoUI(pcb);
                } catch(e) {
                    // TODO: Error message
                }
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
        // detect browser
        if(!(navigator.userAgent.match(/firefox/i) || navigator.userAgent.match(/chrome/i))) {
            alert('This application works best in Firefox and Chrome web browsers');
        }

        // Now, the download link
        fixDownload();
        $("#files").change(handleFileSelect);
		$("#blob").click(fixDownload);

        // Create SVG for the PCBs
        var w = 10000;
        var h = 5000;
        paper = new Raphael('canvas_container', w, h); // units = mil
        paper.scale = 1.0;
        paper.viewbox = [0, 0, w, h];

        // define the grid pattern and include it in the SVG. May not work in old IE which might be using VML !
        pattern = '<pattern id="mygrid" width="12" height="12" patternUnits="userSpaceOnUse"><path d="M 12 0 L 0 0 0 12" fill="none" stroke="gray" stroke-width="0.5"/></pattern>';
        pattern = $.parseHTML('<svg>'+pattern+'</svg>')[0].firstChild; //or childNodes
        $('svg defs').append(pattern);

        grid = paper.rect(-20000, -20000, 40000, 40000); // 1m x 1m, centred at origin
        $(grid.node).attr("fill","url(#mygrid)");

        $("#canvas_container").bind('mousewheel', mousewheel);
        $("#zoomtofit").bind("click", zoomtofit);
    });

}());
