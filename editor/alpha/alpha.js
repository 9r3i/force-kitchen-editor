/* alpha.js
, ~ text editor
, authored by 9r3i
, https://github.com/9r3i
, started at august 30th 2018
, continued at december 4th 2022 -- version 1.2.0
*/
window.alpha={
on:true,
version:'1.2.0',
root:null,
tool:null,
preview:null,
element:null,
cursorStart:0,
cursorEnd:0,
selected:null,
origin:null,
buttons:[
  'bold','italic','del','xup','xcode',
  ['head','1'],['head','2'],['head','3'],
  ['head','4'],['head','5'],['head','6'],
  'separator',
  'view','viewRAW',
  'external','about','separator',
  'separator',
],
pattern:/@\[locode(:(ldb|php|js|html))?\[([^~]+(~?[^~]+)*?)~\]\]\n?/g,
getValue:function(){
  return this.generate(this.element.value,true);
},
editor:function(id){
  this.root=document.createElement('div');
  this.tool=document.createElement('div');
  this.preview=document.createElement('div');
  this.element=document.createElement('textarea');
  var el=document.querySelector('textarea#'+id);
  if(!el){this.on=false;return false;}
  if(!this.prepare()){this.on=false;return false;}
  el.parentElement.insertBefore(this.root,el);
  el.style.display='none';
  this.element.name=el.name;
  el.name+='-hidden';
  this.origin=el;
  var raw=el.value.toString();
  this.root.appendChild(this.tool);
  this.root.appendChild(this.preview);
  this.root.appendChild(this.element);
  this.element.spellcheck=false;
  this.element.onkeyup=this.keyup;
  this.element.onmouseup=this.keyup;
  this.element.onblur=this.blur;
  this.element.oncontextmenu=this.absorbEvent;
  raw=this.reverse(raw);
  this.element.value=raw;
  this.preview.innerHTML=this.generate(raw);
  document.fonts.ready.then(function(e){
    setTimeout(e=>{
      alpha.scrollMax();
    },1000);
  }).catch();
  this.element.blur();
  return true;
},
prepare:function(){
  if(!this.loadCSS()){this.on=false;return false;}
  this.root.classList.add('alpha-editor');
  this.tool.classList.add('alpha-editor-tool');
  this.preview.classList.add('alpha-editor-preview');
  this.element.classList.add('alpha-editor-textarea');
  this.element.dataset.height=150;
  /* register tool buttons */
  for(var tbut of this.buttons){
    if(typeof tbut==='string'
      &&this.hasOwnProperty(tbut)){
      this.tool.appendChild(this[tbut]());
    }else if(Array.isArray(tbut)
      &&this.hasOwnProperty(tbut[0])){
      this.tool.appendChild(this[tbut[0]](tbut[1]));
    }
  }return true;
},
keyup:function(e){
  alpha.preview.innerHTML=alpha.generate(this.value);
  alpha.scrollMax();
},
separator:function(s){
  s=typeof s==='string'?s:'&middot;';
  var view=document.createElement('div');
  view.classList.add('alpha-editor-tool-button');
  view.classList.add('alpha-editor-tool-button-separator');
  view.innerHTML=s;
  view.title='Separator';
  return view;
},
about:function(){
  var view=document.createElement('div');
  view.classList.add('alpha-editor-tool-button');
  view.innerHTML='&#x1d6fc;';
  view.title='Alpha';
  view.onclick=function(e){
    var id='alpha-editor-about';
    var pre=document.getElementById(id);
    if(pre){
      pre.parentElement.removeChild(pre);
      return false;
    }
    var h=alpha.element.dataset.height;
    pre=document.createElement('div');
    pre.id='alpha-editor-about';
    pre.classList.add('alpha-editor-preview');
    pre.classList.add('alpha-editor-preview-about');
    pre.style.height=h+'px';
    pre.innerHTML='Version '+alpha.version+'\n';
    alpha.root.appendChild(pre);
    return true;
  };return view;
},
external:function(){
  var view=document.createElement('div');
  view.classList.add('alpha-editor-tool-button');
  view.classList.add('alpha-external');
  view.innerHTML='';
  view.title='9r3i';
  view.onclick=function(e){
    window.open('https://github.com/9r3i','_blank');
  };return view;
},
viewRAW:function(){
  var view=document.createElement('div');
  view.classList.add('alpha-editor-tool-button');
  view.innerHTML='{}';
  view.title='RAW';
  view.onclick=function(e){
    if(alpha.element.classList.contains('alpha-editor-textarea-raw')){
      alpha.element.classList.remove('alpha-editor-textarea-raw');
    }else{
      alpha.element.classList.add('alpha-editor-textarea-raw');
    }
    return true;
  };return view;
},
view:function(){
  var view=document.createElement('div');
  view.classList.add('alpha-editor-tool-button');
  view.innerHTML='&#x3d8;';
  view.title='Preview';
  view.onclick=function(e){
    var id='alpha-editor-preview';
    var pre=document.getElementById(id);
    if(pre){
      pre.parentElement.removeChild(pre);
      return false;
    }
    var h=alpha.element.dataset.height;
    pre=document.createElement('div');
    pre.id='alpha-editor-preview';
    pre.classList.add('alpha-editor-preview');
    pre.classList.add('alpha-editor-preview-view');
    pre.style.height=h+'px';
    pre.innerHTML=alpha.getValue();
    alpha.root.appendChild(pre);
    return true;
  };return view;
},
xcode:function(){
  var xcode=document.createElement('div');
  xcode.classList.add('alpha-editor-tool-button');
  xcode.innerHTML='&lt;/&gt;';
  xcode.title='Code';
  xcode.onclick=function(e){
    var el=document.getElementById('alpha-cursor-selection');
    if(!alpha.selected||!el){return false;}
    var raw=alpha.element.value;
    var t=alpha.selected[0];
    var p=alpha.selected[1];
    var z=alpha.selected[2];
    var is=t.match(/^`.*`$/ig);
    var tr=is?t.substr(1,t.length-2):'`'+t+'`';
    var r=raw.substr(0,p)+tr+raw.substr(z);
    alpha.element.value=r
    el.parentElement.removeChild(el);
    alpha.selected=null;
    alpha.element.selectionStart=p;
    alpha.element.selectionEnd=z+(is?-2:2);
    alpha.preview.innerHTML=alpha.generate(r);
  };return xcode;
},
xdown:function(){
  var xdown=document.createElement('div');
  xdown.classList.add('alpha-editor-tool-button');
  xdown.innerHTML='X<sub>n</sub>';
  xdown.title='Submision';
  xdown.onclick=function(e){
    var el=document.getElementById('alpha-cursor-selection');
    if(!alpha.selected||!el){return false;}
    var raw=alpha.element.value;
    var t=alpha.selected[0];
    var p=alpha.selected[1];
    var z=alpha.selected[2];
    var is=t.match(/^\^.*\^$/ig);
    var tr=is?t.substr(1,t.length-2):'^'+t+'^';
    var r=raw.substr(0,p)+tr+raw.substr(z);
    alpha.element.value=r
    el.parentElement.removeChild(el);
    alpha.selected=null;
    alpha.element.selectionStart=p;
    alpha.element.selectionEnd=z+(is?-2:2);
    alpha.preview.innerHTML=alpha.generate(r);
  };return xdown;
},
xup:function(){
  var xup=document.createElement('div');
  xup.classList.add('alpha-editor-tool-button');
  xup.innerHTML='X<sup>&#x99;</sup>';
  xup.title='Super';
  xup.onclick=function(e){
    var el=document.getElementById('alpha-cursor-selection');
    if(!alpha.selected||!el){return false;}
    var raw=alpha.element.value;
    var t=alpha.selected[0];
    var p=alpha.selected[1];
    var z=alpha.selected[2];
    var is=t.match(/^\^.*\^$/ig);
    var tr=is?t.substr(1,t.length-2):'^'+t+'^';
    var r=raw.substr(0,p)+tr+raw.substr(z);
    alpha.element.value=r
    el.parentElement.removeChild(el);
    alpha.selected=null;
    alpha.element.selectionStart=p;
    alpha.element.selectionEnd=z+(is?-2:2);
    alpha.preview.innerHTML=alpha.generate(r);
  };return xup;
},
del:function(){
  var del=document.createElement('div');
  del.classList.add('alpha-editor-tool-button');
  del.innerHTML='<del>S</del>';
  del.title='Streak';
  del.onclick=function(e){
    var el=document.getElementById('alpha-cursor-selection');
    if(!alpha.selected||!el){return false;}
    var raw=alpha.element.value;
    var t=alpha.selected[0];
    var p=alpha.selected[1];
    var z=alpha.selected[2];
    var is=t.match(/^~.*~$/ig);
    var tr=is?t.substr(1,t.length-2):'~'+t+'~';
    var r=raw.substr(0,p)+tr+raw.substr(z);
    alpha.element.value=r
    el.parentElement.removeChild(el);
    alpha.selected=null;
    alpha.element.selectionStart=p;
    alpha.element.selectionEnd=z+(is?-2:2);
    alpha.preview.innerHTML=alpha.generate(r);
  };return del;
},
italic:function(){
  var italic=document.createElement('div');
  italic.classList.add('alpha-editor-tool-button');
  italic.innerText='I';
  italic.style.fontStyle='italic';
  italic.title='Italic';
  italic.onclick=function(e){
    var el=document.getElementById('alpha-cursor-selection');
    if(!alpha.selected||!el){return false;}
    var raw=alpha.element.value;
    var t=alpha.selected[0];
    var p=alpha.selected[1];
    var z=alpha.selected[2];
    var is=t.match(/^_.*_$/ig);
    var tr=is?t.substr(1,t.length-2):'_'+t+'_';
    var r=raw.substr(0,p)+tr+raw.substr(z);
    alpha.element.value=r
    el.parentElement.removeChild(el);
    alpha.selected=null;
    alpha.element.selectionStart=p;
    alpha.element.selectionEnd=z+(is?-2:2);
    alpha.preview.innerHTML=alpha.generate(r);
  };return italic;
},
bold:function(){
  var bold=document.createElement('div');
  bold.classList.add('alpha-editor-tool-button');
  bold.innerText='B';
  bold.title='Bold';
  bold.onclick=function(e){
    var el=document.getElementById('alpha-cursor-selection');
    if(!alpha.selected||!el){return false;}
    var raw=alpha.element.value;
    var t=alpha.selected[0];
    var p=alpha.selected[1];
    var z=alpha.selected[2];
    var is=t.match(/^\*.*\*$/ig);
    var tr=is?t.substr(1,t.length-2):'*'+t+'*';
    var r=raw.substr(0,p)+tr+raw.substr(z);
    alpha.element.value=r
    el.parentElement.removeChild(el);
    alpha.selected=null;
    alpha.element.selectionStart=p;
    alpha.element.selectionEnd=z+(is?-2:2);
    alpha.preview.innerHTML=alpha.generate(r);
  };return bold;
},
head:function(digit){
  digit=digit?parseInt(digit,10).toString():'1';
  var bold=document.createElement('div');
  bold.classList.add('alpha-editor-tool-button');
  bold.innerText='H'+digit;
  bold.title='Header '+digit;
  bold.onclick=function(e){
    var el=document.getElementById('alpha-cursor-selection');
    if(!alpha.selected||!el){return false;}
    var raw=alpha.element.value;
    var t=alpha.selected[0];
    var p=alpha.selected[1];
    var z=alpha.selected[2];
    var is=t.match(/^\[h\d\].*\[\/h\d\]$/ig);
    var tr=is?t.substr(4,t.length-9)
      :'[h'+digit+']'+t+'[/h'+digit+']';
    var r=raw.substr(0,p)+tr+raw.substr(z);
    alpha.element.value=r
    el.parentElement.removeChild(el);
    alpha.selected=null;
    alpha.element.selectionStart=p;
    alpha.element.selectionEnd=z+(is?-9:9);
    alpha.preview.innerHTML=alpha.generate(r);
  };return bold;
},
generate:function(r,real){
  var r=r.toString(),
      p=this.element.selectionStart,
      z=this.element.selectionEnd,
      l=r.length,
      lo=r.match(this.pattern),
      lob=lo?btoa(lo[0]):'',
      cursor='<span class="alpha-cursor-blink"></span>';
  if(!real){if(p!==z){
    this.selected=[r.substr(p,z-p),p,z];
    r=this.leftTag(r.substr(0,p))
      +(p<this.cursorStart?cursor:'')
      +'<span class="alpha-cursor-selection" id="alpha-cursor-selection">'
      +this.leftTag(r.substr(p,z-p))+'</span>'
      +(z>this.cursorEnd?cursor:'')
      +this.leftTag(r.substr(z,l));
  }else{
    r=this.leftTag(r.substr(0,p))+cursor+this.leftTag(r.substr(p,l));
  }}
  this.cursorStart=p;
  this.cursorEnd=z;
  r=r.replace(this.pattern,lob)
  .split(/\n\n/g).map(e=>{
    if(e==''){return '\n\n';}
    e=e.replace(/\n/g,'<br />\n');
    return '<p>'+e+'</p>\n\n';
  }).join('')
  .replace(/\[h\d\][^\[]+\[\/h\d\]/ig,function(m){
    var v=real?m.substr(4,m.length-9):m,
    hd=m.match(/^\[h(\d)/i)[1];
    return '<h'+hd+'>'+v+'</h'+hd+'>';
  })
  .replace(/\*[^\*\n]+\*/ig,function(m){
    var v=real?m.substr(1,m.length-2):m;
    return '<strong>'+v+'</strong>';
  })
  .replace(/_[^_\n]+_/ig,function(m){
    var v=real?m.substr(1,m.length-2):m;
    return '<em>'+v+'</em>';
  })
  .replace(/~[^~\n]+~/ig,function(m){
    var v=real?m.substr(1,m.length-2):m;
    return '<del>'+v+'</del>';
  })
  .replace(/`[^`\n]+`/ig,function(m){
    var v=real?m.substr(1,m.length-2):m;
    return '<code>'+v+'</code>';
  })
  .replace(/\^[^\^\n]+\^/ig,function(m){
    var v=real?m.substr(1,m.length-2):m;
    return '<sup>'+v+'</sup>';
  });
  if(lo){
    r=r.replace(lob,lo[0]);
  }
  return r;
},
reverse:function(r){
  var r=r.toString()
  .replace(/&lt;/ig,function(m){
    return '<';
  }).replace(/&amp;/ig,function(m){
    return '&';
  }).replace(/&nbsp;/ig,function(m){
    return ' ';
  })
  .split(/<\/p>\n*/ig).map(e=>{
    return e.replace(/<p[^>]*>/ig,'');
  }).join('\n\n')
  .replace(/(<br>|<br \/>)\n?/ig,function(m){
    return '\n';
  })
  .replace(/<h\d>[^<]+<\/h\d>/ig,function(m){
    var v=m.substr(4,m.length-9),
    hd=m.match(/^<h(\d)/i)[1];
    return '[h'+hd+']'+v+'[/h'+hd+']';
  })
  .replace(/<strong>[^<\r\n]+<\/strong>/ig,function(m){
    return '*'+m.substr(8,m.length-17)+'*';
  })
  .replace(/<em>[^<\r\n]+<\/em>/ig,function(m){
    return '_'+m.substr(4,m.length-9)+'_';
  })
  .replace(/<del>[^<\r\n]+<\/del>/ig,function(m){
    return '~'+m.substr(5,m.length-11)+'~';
  })
  .replace(/<code>[^<\r\n]+<\/code>/ig,function(m){
    return '`'+m.substr(6,m.length-13)+'`';
  })
  .replace(/<sup>[^<\r\n]+<\/sup>/ig,function(m){
    return '^'+m.substr(5,m.length-11)+'^';
  });
  return r;
},
scrollMax:function(){
  var max=0;
  if(typeof alpha.element.scrollTopMax==='number'){
    max=this.element.scrollTopMax;
  }else{
    var top=this.element.scrollTop;
    this.element.scrollTop=Math.pow(1024,5);
    max=parseInt(this.element.scrollTop);
    this.element.scrollTop=top;
  }
  if(max===0){return false;}
  var h=this.element.dataset.height;
  var nh=parseInt(h)+parseInt(max)+12;
  this.element.dataset.height=nh;
  this.element.style.height=nh+'px';
  this.preview.style.height=nh+'px';
  return true;
},
scroll:function(e){
  alpha.preview.scrollTop=this.scrollTop;
},
blur:function(e){
  alpha.origin.value=alpha.getValue();
  alpha.preview.innerHTML=alpha.removeCursor(alpha.preview.innerHTML);
},
removeCursor:function(r){
  return r.toString().replace(/<span class="alpha\-cursor\-blink"><\/span>/g,'');
},
absorbEvent:function(event){
  var e=event||window.event;
  e.preventDefault&&e.preventDefault();
  e.stopPropagation&&e.stopPropagation();
  e.cancelBubble=true;
  e.returnValue=false;
  return false;
},
leftTag:function(r,reverse){
  r=r.toString();
  if(reverse){
    return r.replace(/&lt;/ig,function(m){
      return '<';
    }).replace(/&amp;/ig,function(m){
      return '&';
    });
  }
  return r.replace(/&/g,function(){
    return '&amp;';
  }).replace(/</g,function(m){
    return '&lt;';
  });
},
stripTags:function(d){
  return d.toString().replace(/<[^>]+>/ig,'');
},
loadCSS:function(){
  var s=document.getElementsByTagName('script');
  var i=s.length;
  var p='alpha.css';
  while(i--){
    var t=s[i].src.split('?')[0];
    if(!t.match(/alpha\.js$/g)){continue;}
    p=t.replace(/\.js$/g,'.css');
    break;
  }
  var l=document.createElement('link');
  l.rel='stylesheet';
  l.type='text/css';
  l.media='screen,print';
  l.href=p+'?v='+this.version;
  document.head.appendChild(l);
  return true;
},
temp:function(){
  return false;
}};
/*
Object.defineProperty(window,'alpha',{
  value:alpha,
  writable:false,
});
*/


