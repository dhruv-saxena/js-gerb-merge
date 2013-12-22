var zip = new JSZip();
zip.file("hi.txt", "Hello world !!!\n");

function fixDownload() {
    var blobLink = document.getElementById('blob');
    try {
        blobLink.download = "hello.zip";
        blobLink.href = window.URL.createObjectURL(zip.generate({type:"blob"}));
    } catch(e) {
        blobLink.innerHTML += " (not supported on this browser)";
    }
    return true;
}

function handleFileSelect(evt) {
    var files = evt.target.files; // FileList object

    // files is a FileList of File objects. List some properties.
    var output = [];
    for (var i = 0, f; f = files[i]; i++) {
        output.push('<li><strong>', escape(f.name), '</strong></li>');
        var reader = new FileReader();
        reader.onload = (function(theFile) {
            return function(e) {
                var bin = e.target.result;
                zip.file(theFile.name,bin);
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


