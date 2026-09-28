import {build} from 'esbuild';
import {readFile,writeFile,copyFile} from 'node:fs/promises';
await build({entryPoints:['src/app.js'],bundle:true,minify:true,outfile:'dist/app.js',format:'iife',target:'es2020',legalComments:'eof'});
await copyFile('src/style.css','dist/style.css');
await copyFile('src/index.html','dist/index.html');
const html=await readFile('src/index.html','utf8'),css=await readFile('src/style.css','utf8'),js=await readFile('dist/app.js','utf8');
await writeFile('dist/pixel-rail-offline.html',html.replace('<link rel="stylesheet" href="style.css">',`<style>${css}</style>`).replace('<script src="app.js"></script>',`<script>${js.replaceAll('</script','<\\/script')}</script>`));
console.log('Built hosted and offline demos.');
