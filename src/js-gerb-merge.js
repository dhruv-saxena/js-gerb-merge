//(function() {
    var pcbs = [];
    var paper;
    
    var start = function () {
        this.startpath = this.attr("path").slice(0);
        this.attr({stroke: '#000'});
    };
    var move = function (dx, dy) {
        var path = this.attr("path")
        for(var i=0; i < path.length - 1; i++) {
            path[i][1] = this.startpath[i][1] + dx;
            path[i][2] = this.startpath[i][2] + dy;
        }
        this.attr({path: path});
    };
    var up = function () {
        this.attr({stroke: '#ddd'});
    };

    var addPCBtoUI = function(pcb) {
        var polygonpoints = pcb.getBoundary();
        polygonstring = 'M'+polygonpoints.toString()+'Z';
        polygon = paper.path(polygonstring);
        polygon.attr({fill: '#9cf', stroke: '#ddd', 'stroke-width': 2});
        polygon.drag(move,start,up); 
    };

    function fixDownload() {
        var blobLink = document.getElementById('blob');
        try {
            if(pcbs.length > 0) {
                blobLink.download = "hello.zip";
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
            blobLink.innerHTML += " (not supported on this browser)";
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

    window.onload = function () {
        fixDownload();
        document.getElementById('files').addEventListener('change', handleFileSelect, false);
        document.getElementById('blob').onclick = fixDownload;

        paper = new Raphael(document.getElementById('canvas_container'),1920,1080);
        
    };

//}());
