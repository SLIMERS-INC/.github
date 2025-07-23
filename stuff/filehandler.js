function fms(bytes) {
    if (bytes >= 1e9) return (bytes / 1e9).toFixed(2) + ' gb';
    if (bytes >= 1e6) return (bytes / 1e6).toFixed(2) + ' mb';
    if (bytes >= 1e3) return (bytes / 1e3).toFixed(2) + ' kb';
    return bytes + ' bytes';
}

(async () => {
    try {
        const folder = mega.File.fromURL('https://mega.nz/folder/ak5WhZpa#fAD6NBnZi9mfOT5UIeQWhA');
        await folder.loadAttributes();
        document.getElementById('file-list').innerHTML = '';
        let fuh1 = 0; let fuh2 = 0;

        const walk = async (node, depth = 0) => {
            if (node.directory) {
                for (const child of node.children) {
                    await walk(child, depth + 1);
                }
            } else {
                fuh1++;
                fuh2 += node.size;

                const li = document.createElement('li');
                li.className = 'file' + (depth ? ' sub' : '');
                if (depth) li.style.paddingLeft = `${depth * 1.5}rem`;

                const size = fms(node.size);

                const name = document.createElement('div');
                name.className = 'filename-box';
                name.textContent = node.name.replace(/\.(7z|zip|rar)$/i, ''); // ye

                const sizebox = document.createElement('div');
                sizebox.className = 'filesize-box';
                sizebox.textContent = size;

                const btn = document.createElement('button');
                btn.className = 'download-btn';
                btn.textContent = 'download';

                btn.onclick = async () => {
                    if (btn.disabled) return;
                    btn.disabled = true;

                    let dots = 0;
                    btn.textContent = 'downloading';
                    const anim = setInterval(() => {
                        dots = (dots + 1) % 4;
                        btn.textContent = 'downloading' + '.'.repeat(dots);
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
                        console.error('download error:', e);
                        alert('download failed :(');
                    } finally {
                        clearInterval(anim);
                        btn.textContent = 'download';
                        btn.disabled = false;
                    }
                };

                const rightgrp = document.createElement('div');
                rightgrp.className = 'right-group';
                rightgrp.appendChild(sizebox);
                rightgrp.appendChild(btn);

                li.appendChild(name);
                li.appendChild(rightgrp);
                document.getElementById('file-list').appendChild(li);
            }
        };

        await walk(folder);
        console.log(`loaded ${fuh1} files`);
        console.log(`these fuckass files take up ${fms(fuh2)}`);
        console.log(`last updated 23/7/2025`);
        console.log(`Note: files.catbox.moe/9crw55.png`);
    } catch (e) {
        console.error(e);
        document.getElementById('file-list').textContent = 'error loading :( refresh website!!';
    }
})();
