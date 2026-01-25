// code beautified using https://jsonformatter.org/jsbeautifier ok thx bye

function fms(bytes) {
    if (bytes >= 1e9) return (bytes / 1e9).toFixed(2) + ' gb';
    if (bytes >= 1e6) return (bytes / 1e6).toFixed(2) + ' mb';
    if (bytes >= 1e3) return (bytes / 1e3).toFixed(2) + ' kb';
    return bytes + ' bytes';
}

(async () => {
    try {
        const folders = [
            'https://mega.nz/folder/wjdHxA6A#i8uws2cNEWjKODm1Gkzbdw',
            'https://mega.nz/folder/i85QmZ5S#cd3G_u8bIysCTfT_2RfD7w',
            'https://mega.nz/folder/CtJWyY6b#1h4rFkYRERVtMhVnAM1OUA'
        ];

        document.getElementById('file-list').innerHTML = '';
        let totalFiles = 0;
        let totalBytes = 0;

        const walk = async (node, depth = 0) => {
            if (node.directory) {
                for (const child of node.children) {
                    await walk(child, depth + 1);
                }
            } else {
                totalFiles++;
                totalBytes += node.size;

                const li = document.createElement('li');
                li.className = 'file' + (depth ? ' sub' : '');
                if (depth) li.style.paddingLeft = `${depth * 1.5}rem`;

                const size = fms(node.size);

                const name = document.createElement('div');
                name.className = 'filename-box';
                name.textContent = node.name.replace(/\.(7z|zip|rar)$/i, '');

                const sizebox = document.createElement('div');
                sizebox.className = 'filesize-box';
                sizebox.textContent = size;

                const btn = document.createElement('button');
                btn.className = 'download-btn';
                btn.textContent = 'download';

                btn.onclick = async () => {
                    if (btn.disabled) return;
                    btn.disabled = true;

                    const total = node.size;
                    let downloaded = 0;
                    btn.textContent = '0%';

                    try {
                        const stream = node.download();
                        const chunks = [];

                        stream.on('data', chunk => {
                            chunks.push(chunk);
                            downloaded += chunk.length;
                            btn.textContent = ((downloaded / total) * 100).toFixed(1) + '%';
                        });

                        await new Promise((resolve, reject) => {
                            stream.on('end', resolve);
                            stream.on('error', reject);
                        });

                        const blob = new Blob(chunks);
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
                        alert('download failed - check console for more info');
                    } finally {
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

        for (const link of folders) {
            const folder = mega.File.fromURL(link);
            await folder.loadAttributes();
            await walk(folder);
        }

        console.log(`-----------------------`);
        console.log(`loaded ${totalFiles} files, total size: ${fms(totalBytes)}`);
        console.log(`last updated 20/1/2026`);
        console.log(`note: added more files :p`);
    } catch (e) {
        console.error(e);
        document.getElementById('file-list').textContent = 'error loading :( refresh website!!';
    }
})();
