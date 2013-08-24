var pan=pan||{};(function(){"use strict";pan.version='@@version';pan.settings={"debug_init":true,"enable_player":false,"draw_fps":false,"font_color":"cyan","font_style":"13px 'Calibri','Courier'","enable_hit_testing":false,"draw_hit_regions":false,"log_key_input":false,"auto_resize":true,toString:function(){return"[debug_init:"+this.debug_init+",enable_player:"+this.enable_player+",draw_fps:"+this.draw_fps+",font_color:"+this.font_color+",font_style:"+this.font_style+",enable_hit_testing:"+this.enable_hit_testing+",draw_hit_regions:"+this.draw_hit_regions+",log_key_input:"+this.log_key_input+",auto_resize:"+this.auto_resize+"]";}};}());(function(){"use strict";var lastTime=0,vendors=['ms','moz','webkit','o'],x,currTime,timeToCall,id,onFullscreenChange;for(x=0;x<vendors.length&&!window.requestAnimationFrame;++x){window.requestAnimationFrame=window[vendors[x]+'RequestAnimationFrame'];window.cancelAnimationFrame=window[vendors[x]+'CancelAnimationFrame']||window[vendors[x]+'CancelRequestAnimationFrame'];}
if(!window.requestAnimationFrame){window.requestAnimationFrame=function(callback,element){currTime=new Date().getTime();timeToCall=Math.max(0,16-(currTime-lastTime));id=window.setTimeout(function(){callback(currTime+timeToCall);},timeToCall);lastTime=currTime+timeToCall;return id;};}
if(!window.cancelAnimationFrame){window.cancelAnimationFrame=function(id){clearTimeout(id);};}
if(pan.settings.auto_resize){onFullscreenChange=function(){var c=document.getElementById("canvas");if(document.fullscreen||document.mozFullScreen||document.webkitIsFullScreen){pan.util.tempSize={w:pan.canvas.width,h:pan.canvas.height};pan.canvas.width=screen.width;pan.canvas.height=screen.height;}else{if(pan.util.tempSize){pan.canvas.width=pan.util.tempSize.w;pan.canvas.height=pan.util.tempSize.h;}}
c.width=pan.canvas.width;c.height=pan.canvas.height;};document.addEventListener("fullscreenchange",onFullscreenChange);document.addEventListener("mozfullscreenchange",onFullscreenChange);document.addEventListener("webkitfullscreenchange",onFullscreenChange);}}());(function(){"use strict";pan.util=pan.util||{};pan.util.DeltaTimer=function(){var startTime,frames=0,frameRate=0,last=0,target=0,overflow=0,resetThreshold=100,resetCount=0;return{start:function(fps){last=new Date().getTime();target=1000/fps;startTime=new Date().getTime();},ready:function(){var diff=(new Date().getTime()-last)+overflow;if(diff>=target){overflow=diff-target;if(overflow>resetThreshold){overflow=0;frames=0;startTime=new Date().getTime();resetCount+=1;if(resetCount>25){resetThreshold+=20;resetCount=0;}}
last=new Date().getTime();frames++;if((frames%10)===0){frameRate=frames/((new Date().getTime()-startTime)/1000);}
return true;}
return false;},getFrameRate:function(){return Math.round(frameRate*1000,10)/1000;}};};pan.util.Player=function(x,y,w,h){var c,bc,cx,cy;x=x||0;y=y||0;w=w||32;h=h||32;cx=x;cy=y;c="rgba(0, 98, 174, 0.75)";bc="rgba(255, 64, 64, 1)";return{color:c,bordercolor:bc,speed:3,update:function(){var key,rate,bounds;if(pan.util.keyboard.stack.length>0){rate=pan.util.keyboard.shift?this.speed*2:this.speed;key=pan.util.keyboard.peek();bounds=pan.canvas.map.clamp;if(key==="w"){cy-=rate;}else if(key==="a"){cx-=rate;}else if(key==="s"){cy+=rate;}else if(key==="d"){cx+=rate;}
cx=cx.clamp(0,(pan.canvas.map.width*32)-w);cy=cy.clamp(0,(pan.canvas.map.height*32)-h);if(cx>=bounds.x&&cx<=bounds.w){pan.canvas.map.offsetx=-(cx-bounds.x);x=bounds.x;}else{x=(cx>=bounds.x)?cx-(bounds.w-bounds.x):cx;x=x.clamp(0,pan.canvas.width-w);}
if(cy>=bounds.y&&cy<=bounds.h){pan.canvas.map.offsety=-(cy-bounds.y);y=bounds.y;}else{y=(cy>=bounds.y)?cy-(bounds.h-bounds.y):cy;y=y.clamp(0,pan.canvas.height-h);}}},draw:function(context){context.beginPath();context.rect(x,y,w,h);context.strokeStyle=this.bordercolor;context.stroke();context.fillStyle=this.color;context.fill();context.closePath();}};};pan.util.keyboard={stack:[],shift:false,peek:function(){var temp=this.stack.pop();this.stack.push(temp);return temp;},keydown:function(code){if(this.stack.length>0){if(this.peek()!==code){this.stack.push(code);}}else{this.stack.push(code);}},keyup:function(code){this.stack=this.stack.filter(function(item){return item!==code;});},clear:function(){this.stack=[];this.shift=false;},bind:function(){document.onkeydown=function(event){event=event||window.event;var code=event.keyCode;if(code===16){pan.util.keyboard.shift=true;}else if(code===87){pan.util.keyboard.keydown("w");}else if(code===65){pan.util.keyboard.keydown("a");}else if(code===83){pan.util.keyboard.keydown("s");}else if(code===68){pan.util.keyboard.keydown("d");}
if(pan.settings.log_key_input){console.log("keybown.keycode: "+code+"; keyboard: "+
pan.util.keyboard.toString());}};document.onkeyup=function(event){event=event||window.event;var code=event.keyCode;if(code===16){pan.util.keyboard.shift=false;}else if(code===87){pan.util.keyboard.keyup("w");}else if(code===65){pan.util.keyboard.keyup("a");}else if(code===83){pan.util.keyboard.keyup("s");}else if(code===68){pan.util.keyboard.keyup("d");}
if(pan.settings.log_key_input){console.log("keyup.keycode: "+code+"; keyboard: "+
pan.util.keyboard.toString());}};window.onblur=function(){pan.util.keyboard.clear();};},toString:function(){return"[stack.length:"+this.stack.length+",shift:"+this.shift+"]";}};Number.prototype.clamp=function(min,max){return Math.min(Math.max(this,min),max);};}());(function(){"use strict";pan.canvas={width:800,height:544,backcolor:"#000",context:null,atlases:[],spritesheets:[],layers:[],tilesets:[],map:{tileheight:0,tilewidth:0,width:0,height:0,offsetx:0,offsety:0,clamp:{x:0,y:0,w:0,h:0}},frameId:null,onupdate:null,onrender:null,ready:false,loadMap:function(json){var i;if(!json){throw{name:"paramError",message:"Required parameter not supplied."};}
pan.canvas.map.tilewidth=json.tilewidth;pan.canvas.map.tileheight=json.tileheight;pan.canvas.map.width=json.width;pan.canvas.map.height=json.height;pan.canvas.map.clamp.x=pan.canvas.width/2;pan.canvas.map.clamp.y=pan.canvas.height/2;pan.canvas.map.clamp.w=(pan.canvas.map.width*pan.canvas.map.tilewidth)-pan.canvas.map.clamp.x;pan.canvas.map.clamp.h=(pan.canvas.map.height*pan.canvas.map.tileheight)-pan.canvas.map.clamp.y;for(i=0;i<json.layers.length;i++){pan.canvas.layers.push(new pan.Layer(json.layers[i].data,json.layers[i].name,json.layers[i].type,json.layers[i].x,json.layers[i].y,json.layers[i].width,json.layers[i].height));}
pan.canvas.tilesets=json.tilesets;},attach:function(element,updateCallback,renderCallback){var canvasElement=document.createElement("canvas");canvasElement.setAttribute("id","canvas");canvasElement.setAttribute("width",pan.canvas.width);canvasElement.setAttribute("height",pan.canvas.height);pan.canvas.context=canvasElement.getContext("2d");if(!element.appendChild){element=document.getElementById(element);}
element.appendChild(canvasElement);if(updateCallback){pan.canvas.onupdate=updateCallback;}
if(renderCallback){pan.canvas.onrender=renderCallback;}},start:function(){pan.canvas.prerender();pan.canvas.last=Date.now();if(pan.settings.draw_fps||pan.settings.debug_init){pan.canvas.deltaTimer=new pan.util.DeltaTimer();pan.canvas.deltaTimer.start(60);}
if(pan.settings.enable_player||pan.settings.debug_init){pan.canvas.player=new pan.util.Player(pan.canvas.width/2-16,pan.canvas.height/2-16);}
if(!pan.canvas.frameId){pan.canvas.frame();}},stop:function(){pan.canvas.ready=false;},frame:function(){if(pan.canvas.ready){pan.canvas.update();pan.canvas.render();}
pan.canvas.frameId=window.requestAnimationFrame(pan.canvas.frame);},update:function(){var i,key;for(i=0;i<pan.canvas.layers.length;i++){pan.canvas.layers[i].update();}
if(pan.canvas.onupdate){pan.canvas.onupdate();}
if(pan.settings.enable_player){pan.canvas.player.update();}
if(pan.settings.draw_fps){pan.canvas.deltaTimer.ready();}},prerender:function(){var i;for(i=0;i<pan.canvas.layers.length;i++){pan.canvas.layers[i].prerender();}},render:function(){var x,i,layer,tileIndex,record,coords,xpos,ypos;pan.canvas.clear();for(x=0;x<pan.canvas.layers.length;x++){layer=pan.canvas.layers[x]||{};if(layer.type==="tilelayer"){for(i=0;i<layer.data.length;i++){tileIndex=layer.data[i];coords=layer.coords[i];if(tileIndex>0&&coords){record=pan.canvas.table[tileIndex];xpos=coords.xpos+pan.canvas.map.offsetx;ypos=coords.ypos+pan.canvas.map.offsety;if(xpos+record.w>pan.canvas.map.offsetx&&xpos<pan.canvas.width&&ypos+record.h>pan.canvas.map.offsety&&ypos<pan.canvas.height){pan.canvas.context.drawImage(pan.canvas.atlases[record.aindex].image,record.srcx,record.srcy,record.w,record.h,xpos,ypos,record.w,record.h);}}}}}
if(pan.canvas.onrender){pan.canvas.onrender();}
if(pan.settings.enable_player){pan.canvas.player.draw(pan.canvas.context);}
if(pan.settings.draw_fps){pan.canvas.context.font=pan.settings.font_style;pan.canvas.context.fillStyle=pan.settings.font_color;pan.canvas.context.fillText("FPS: "+
pan.canvas.deltaTimer.getFrameRate(),6,14);}},clear:function(){pan.canvas.context.fillStyle=pan.canvas.backcolor;pan.canvas.context.fillRect(0,0,pan.canvas.width,pan.canvas.height);}};pan.canvas.print=function(text,x,y,font,color){x=x||12;y=y||16;pan.canvas.context.font=font||"10pt Calibri";pan.canvas.context.fillStyle=color||"cyan";pan.canvas.context.fillText(text,x,y);};}());(function(){"use strict";pan.Layer=function(data,name,type,left,top,width,height){var map=pan.canvas.map;data=data||[];name=name||"";type=type||"undefined";left=left||0;top=top||0;return{name:name,type:type,left:left,top:top,width:map.width,height:map.height,data:data,coords:[],update:function(){},render:function(canvas){},prerender:function(){var i,x,y,tileIndex,tileset,atlas,atlasindex,frame,srcx,srcy,length,xpos,ypos,localindex,localwidth;if(this.type==="tilelayer"){for(i=0;i<this.data.length;i++){tileIndex=this.data[i];if(tileIndex===0){continue;}
for(x=pan.canvas.tilesets.length;x>=0;x){x--;if(pan.canvas.tilesets[x].firstgid<=tileIndex){tileset=pan.canvas.tilesets[x];x=-1;}}
for(y=0;y<pan.canvas.atlases.length;y++){atlas=pan.canvas.atlases[y];atlasindex=y;frame=(function(){var z;for(z=0;z<atlas.frames.length;z++){if(atlas.frames[z].filename===tileset.image){return atlas.frames[z];}}
return null;}());if(frame){break;}}
localindex=tileIndex-tileset.firstgid;localwidth=frame.frame.w/map.tilewidth;srcx=Math.round(((localindex/localwidth)%1)*localwidth)*map.tilewidth;srcx=srcx+frame.frame.x;srcy=Math.floor(localindex/localwidth)*map.tileheight;srcy=srcy+frame.frame.y;xpos=Math.round(((i/map.width)%1)*map.width*map.tilewidth);ypos=Math.floor(i/map.width)*map.tileheight;this.coords[i]={xpos:xpos,ypos:ypos};if(!pan.canvas.table){length=Math.ceil((this.width/map.tilewidth)*(this.height/map.tileheight));pan.canvas.table=[length];}
pan.canvas.table[tileIndex]={aindex:0,srcx:srcx,srcy:srcy,w:tileset.tilewidth,h:tileset.tileheight};pan.canvas.ready=true;}}}};};}());(function(){"use strict";pan.loadAtlas=function(json){var name,imagePath,image,atlas;if(!json){throw{name:"paramError",message:"Required parameter not supplied."};}
name=json.meta.image;imagePath="assets/"+name;image=new Image();image.src=imagePath;atlas=new pan.Atlas(image,name,json.meta.size,json.frames);return atlas;};pan.loadAtlasAsync=function(json,onloadCallback){if(!json||!onloadCallback){throw{name:"paramError",message:"Required parameter not supplied."};}
var image,name=json.meta.image,imagePath="assets/"+name,size=json.meta.size,frames=json.frames;image=new Image();image.onload=function(){var atlas=new pan.Atlas(image,name,size,frames);if(onloadCallback){onloadCallback(atlas);}};image.src=imagePath;};pan.Atlas=function(image,name,size,frames){return{image:image,name:name,size:size,frames:frames,update:function(){},draw:function(context){}};};}());