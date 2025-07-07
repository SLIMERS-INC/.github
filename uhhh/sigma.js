function fms(bytes) {
    if (bytes >= 1e9) return (bytes / 1e9).toFixed(2) + ' GB';
    if (bytes >= 1e6) return (bytes / 1e6).toFixed(2) + ' MB';
    if (bytes >= 1e3) return (bytes / 1e3).toFixed(2) + ' KB';
    return bytes + ' bytes';
}

(async () => {
    try {
        const folder = mega.File.fromURL('https://mega.nz/folder/ak5WhZpa#fAD6NBnZi9mfOT5UIeQWhA');
        await folder.loadAttributes();
        document.getElementById('file-list').innerHTML = '';

        const walk = async (node, depth = 0) => {
            if (node.directory) {
                const fold = document.createElement('li');
                fold.textContent = node.name + '/';
                fold.className = 'folder';
                if (depth) fold.style.paddingLeft = `${depth * 1.5}rem`;
                document.getElementById('file-list').appendChild(fold);

                for (const child of node.children) {
                    await walk(child, depth + 1);
                }
            } else {
                const li = document.createElement('li');
                li.className = 'file' + (depth ? ' sub' : '');
                if (depth) li.style.paddingLeft = `${depth * 1.5}rem`;

                const size = fms(node.size);

                const name = document.createElement('div');
                name.className = 'filename-box';
                name.textContent = node.name;

                const sizebox = document.createElement('div');
                sizebox.className = 'filesize-box';
                sizebox.textContent = size;

                const btn = document.createElement('button');
                btn.className = 'download-btn';
                btn.textContent = 'Download';

                btn.onclick = async () => {
                    if (btn.disabled) return;
                    btn.disabled = true;

                    let dots = 0;
                    btn.textContent = 'Downloading';
                    const anim = setInterval(() => {
                        dots = (dots + 1) % 4;
                        btn.textContent = 'Downloading' + '.'.repeat(dots);
                    }, 500);

                    try {
                        const buf = await node.downloadBuffer();
                        const blob = new Blob([buf]);
                        const url = URL.createObjectURL(blob);
                        const a = document.createElement('a');
                        a.href = url;
                        a.download = node.name;
                        document.body.appendChild(a);
                        a.click();
                        a.remove();
                        URL.revokeObjectURL(url);
                    } catch (e) {
                        console.error('download error:', e);alert('download failed :(');
                    } finally {
                        clearInterval(anim);
                        btn.textContent = 'Download';
                        btn.disabled = false;
                    }
                };

                const right = document.createElement('div');
                right.className = 'right-group';
                right.appendChild(sizebox);
                right.appendChild(btn);

                li.appendChild(name);
                li.appendChild(right);
                document.getElementById('file-list').appendChild(li);
            }
        };

        for (const child of folder.children) {
            await walk(child);
        }
    } catch (err) {
        console.error(err);
        document.getElementById('file-list').innerHTML =
            '<li style="color:#b91c1c; text-align:center;">error loading :(.</li>';
    }
})();

document.getElementById('info-link').addEventListener('click', (e) => {
    e.preventDefault();alert("\nCreated by discord.gg/E8dbWyYpPH\n\nWe can't guarantee these files are safe. Download them at your own risk.");
});
