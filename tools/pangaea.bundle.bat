@echo off
cd..
cd src
type core.js layer.js atlas.js spritesheet.js sprite.js canvas.js util.js > ..\tools\temp-output.js
cd..
cd tools
echo Minifying scripts...
jsmin < temp-output.js > ..\test\js\pangaea-bundle.min.js "pangaea 2d tile renderer areologist.com/pangaea"
del temp-output.js
echo Done