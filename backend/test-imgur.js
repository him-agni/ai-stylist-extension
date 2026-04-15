const fs = require('fs');

async function testImgur() {
    const b64 = "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNkYAAAAAYAAjCB0C8AAAAASUVORK5CYII=";
    const formData = new URLSearchParams();
    formData.append('key', '6d207e02198a847aa98d0a2a901485a5');
    formData.append('action', 'upload');
    formData.append('source', b64);
    formData.append('format', 'json');
    try {
        const res = await fetch('https://freeimage.host/api/1/upload', {
            method: 'POST',
            body: formData
        });
        const text = await res.text();
        console.log("Response:", text);
    } catch(e) {
        console.error(e);
    }
}
testImgur();
