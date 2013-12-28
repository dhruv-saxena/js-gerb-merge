//(function() {
    var pcbs = [];

    function fixDownload() {
        var blobLink = document.getElementById('blob');
        try {
            if(pcbs.length > 0) {
                blobLink.download = "hello.zip";
                var zip = new JSZip();
                zip.file("hi.txt", "Hello world !!!\n");
                var bigpcb = pcbs[0]; // TODO: merge all pcbs in pcbs to get bigpcb
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
        var pcb = new jspcb.PCB([]);
        pcbs.push(pcb);
        // files is a FileList of File objects. List some properties.
        for (var i = 0, f; f = files[i]; i++) {
            var reader = new FileReader();
            reader.onload = (function(theFile) {
                return function(e) {
                    var bin = e.target.result;
                    pcb.addGerber([theFile.name, bin]);
                }
            })(f);
            reader.readAsArrayBuffer(f);
        }
    }

    window.onload = function () {
        fixDownload();
        document.getElementById('files').addEventListener('change', handleFileSelect, false);
        document.getElementById('blob').onclick = fixDownload;
    };

//}());
