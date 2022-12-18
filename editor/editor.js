/**
 * editor.js
 * ~ a Force plugin for griding the bulk
 * started at december 4th 2022
 * @requires ForceWebsite, Alpha, TinyMCE, CKEditor
 */
function editor(param){
this.version='1.1.0';
this.pages=[
  'new',
  'edit',
  'foot',
];
this.plug=null;
this.id=null;
this.root=null;
/* init */
this.init=function(plug,id){
  this.plug=plug;
  this.id=typeof id==='string'?id:'kitchen-textarea';
  this.root=plug.hosts.hasOwnProperty('editor')
      ?plug.hosts.editor
      :plug.root;
  var active=localStorage.getItem('editor-active');
  if(!active){return;}
  if(active=='alpha'){
    this.alphaInit(plug); // always works but not for all type
  }else if(active=='tinymce'){
    this.tinymceInit(plug); // works but must be reloaded
  }else if(active=='ckeditor'){
    this.ckeditorInit(plug); // works well for most pages
  }
};
/* kitchen */
this.kitchen=function(plug){
  this.Force=plug.Force;
  var p='',
  actext={
    alpha:"Alpha Editor v1.2.0\n\nMy own text editor, I built it my self and I wrote the codes my self, like it or not, I'm proud of my self, :p",
    tinymce:"TinyMCE v6.3.0\n\nThe most reliable editor.\nStable but not much, because ForceWebsite is using state to load pages, so page MUST BE reloaded to make this editor appear twice or so on.",
    ckeditor:"CKEditor v4.4.7\n\nVery powerful editor and stable in ForceWebsite's Kitchen, although ForceWebsite is using preventing anchor to state pages, this editor works really great.\nWell, I recommend you to choose this editor.",
  },
  active=localStorage.getItem('editor-active'),
  atext=!active?'Activate':'Deactivate',
  aclass=!active?'pink':'soft-green',
  _this=this,
  nselect=ForceWebsite.buildElement('select',null,{
    'class':'select',
  },[
    ForceWebsite.buildElement('option','Alpha',{
      'value':'alpha',
    }),
    ForceWebsite.buildElement('option','TinyMCE',{
      'value':'tinymce',
    }),
    ForceWebsite.buildElement('option','CKEditor',{
      'value':'ckeditor',
    }),
  ]),
  nsave=ForceWebsite.buildElement('button',atext,{
    'class':'button button-'+aclass,
  }),
  nback=ForceWebsite.buildElement('button',null,{
    'class':'button button-blue',
  },[
    ForceWebsite.buildElement('i',null,{
      'class':'fa fa-arrow-left',
    }),
    document.createTextNode('Back'),
  ]),
  nnotive=ForceWebsite.buildElement('div',null,{
    'class':'editor-text-warning',
  });
  ndp=ForceWebsite.buildElement('div',null,{
    'class':'editor-buttons',
  },[
    nback,nsave,nselect,nnotive,
  ]);
  nselect.disabled=active?true:false;
  nselect.value=active?active:'alpha';
  nnotive.innerText=actext[active?active:'alpha'];
  nselect.onchange=function(e){
    nnotive.innerText=actext[this.value];
  };
  nback.onclick=function(e){
    ForceWebsite.go(ForceWebsite.kkey+'=dashboard');
  };
  nsave.onclick=function(e){
    var active=localStorage.getItem('editor-active');
    if(active){
      localStorage.removeItem('editor-active');
      this.classList.replace('button-soft-green','button-pink');
      this.innerText='Activate';
      nselect.disabled=false;
    }else{
      localStorage.setItem('editor-active',nselect.value);
      this.classList.replace('button-pink','button-soft-green');
      this.innerText='Deactivate';
      nselect.disabled=true;
    }
  };
  ndp.appendTo(ForceWebsite.body);
  return ndp;
};
/* check content element by id -- return bool */
this.isContentReady=function(){
  var el=document.getElementById(this.id);
  return el?true:false;
};

/* initialize for ckeditor */
this.ckeditorInit=function(plug){
  clearTimeout(window.EDITOR_TIMEOUT);
  var _this=this,
  kkey=ForceWebsite.config.kitchen.key,
  epath='/editor/ckeditor/ckeditor.js';
  if(ForceWebsite.query.hasOwnProperty(kkey)
    &&this.pages.indexOf(ForceWebsite.query[kkey])>=0){
    if(typeof alpha!=='object'||alpha===null){
      plug.Force.loadScriptFile(this.root+epath);
    }
    this.ckeditorReady(r=>{
      var ed=CKEDITOR.replace(_this.id),
      originData=document.getElementById(_this.id);
      ed.on('key',function(e){
        originData.value=e.editor.getData();
      });
      ed.on('blur',function(e){
        originData.value=e.editor.getData();
      });
      ed.on('change',function(e){
        originData.value=e.editor.getData();
      });
      setTimeout(e=>{
        var ckes=document.getElementsByClassName('cke_contents');
        if(ckes){
          for(var el of ckes){
            el.style.height='400px';
          }
        }
      },1500);
    });
  }
};
/* when ckeditor ready */
this.ckeditorReady=function(cb,i){
  i=i?i:0;
  var _this=this;
  if(typeof window.CKEDITOR==='object'
    &&window.CKEDITOR!==null
    &&this.isContentReady()){
    clearTimeout(window.EDITOR_TIMEOUT);
    return cb(i);
  }
  if(i>=100){
    return cb(false);
  }
  window.EDITOR_TIMEOUT=setTimeout(e=>{
    _this.ckeditorReady(cb,i+1);
  },50);
};

/* initialize for alpha */
this.alphaInit=function(plug){
  clearTimeout(window.EDITOR_TIMEOUT);
  var _this=this,
  kkey=ForceWebsite.config.kitchen.key,
  epath='/editor/alpha/alpha.js';
  if(ForceWebsite.query.hasOwnProperty(kkey)
    &&this.pages.indexOf(ForceWebsite.query[kkey])>=0){
    if(typeof alpha!=='object'||alpha===null){
      plug.Force.loadScriptFile(this.root+epath);
    }
    this.alphaReady(r=>{
      var ed=alpha.editor(_this.id);
    });
  }
};
/* when alpha ready */
this.alphaReady=function(cb,i){
  i=i?i:0;
  var _this=this;
  if(typeof window.alpha==='object'
    &&window.alpha!==null
    &&this.isContentReady()){
    clearTimeout(window.EDITOR_TIMEOUT);
    return cb(i);
  }
  if(i>=100){
    return cb(false);
  }
  window.EDITOR_TIMEOUT=setTimeout(e=>{
    _this.alphaReady(cb,i+1);
  },50);
};

/* init for tinymce */
this.tinymceInit=function(plug){
  clearTimeout(window.EDITOR_TIMEOUT);
  var _this=this,
  kkey=ForceWebsite.config.kitchen.key,
  epath='/editor/tinymce/tinymce.min.js';
  if(ForceWebsite.query.hasOwnProperty(kkey)
    &&this.pages.indexOf(ForceWebsite.query[kkey])>=0){
    if(typeof tinymce!=='object'||tinymce===null){
      plug.Force.loadScriptFile(this.root+epath);
    }
    this.tinymceReady(r=>{
      if(!r){return;}
      var ed=_this.tinymceIgnite('#'+_this.id);
      _this.tinymceAbout();
    });
  }
};
/* value of tinymce */
this.tinymceGetValue=function(){
  return window.tinymce.activeEditor.getContent();
}
/* remove branding link on tinymce */
this.tinymceAbout=function(loaded){
  loaded=loaded?parseInt(loaded):0;
  if(loaded>99){return false;}
  var test=document.querySelector('a[target="_blank"]');
  if(test){
    test.style.display='none';
    return true;
  }loaded++;
  var _this=this;
  return setTimeout(function(){
    return _this.tinymceAbout(loaded);
  },50);
};
/* when tinymce ready */
this.tinymceReady=function(cb,i){
  i=i?i:0;
  var _this=this;
  if(typeof window.tinymce==='object'
    &&window.tinymce!==null
    &&this.isContentReady()){
    clearTimeout(window.EDITOR_TIMEOUT);
    return cb(i);
  }
  if(i>=100){
    return cb(false);
  }
  window.EDITOR_TIMEOUT=setTimeout(e=>{
    _this.tinymceReady(cb,i+1);
  },50);
};
/* ignite tinymce */
this.tinymceIgnite=function(id){
  var _this=this,
  useDarkMode=window
    .matchMedia('(prefers-color-scheme: dark)')
    .matches,
  originData=document.querySelector(id);
  return tinymce.init({
    selector: id,
    setup: function(ed) {
      ed.on('keyup', function(e){
        originData.value=ed.getContent({format:"text"});
      });
    },
    onchange_callback:function(obj){
      return _this.init(_this.plug);
    },
    referrer_policy: 'origin',
    plugins: 'print preview powerpaste casechange importcss tinydrive searchreplace autolink autosave save directionality advcode visualblocks visualchars fullscreen image link media mediaembed template codesample table charmap hr pagebreak nonbreaking anchor toc insertdatetime advlist lists checklist wordcount tinymcespellchecker a11ychecker imagetools textpattern noneditable help formatpainter permanentpen pageembed charmap tinycomments mentions quickbars linkchecker emoticons advtable export',
    tinydrive_token_provider: 'URL_TO_YOUR_TOKEN_PROVIDER',
    tinydrive_dropbox_app_key: 'YOUR_DROPBOX_APP_KEY',
    tinydrive_google_drive_key: 'YOUR_GOOGLE_DRIVE_KEY',
    tinydrive_google_drive_client_id: 'YOUR_GOOGLE_DRIVE_CLIENT_ID',
    mobile: {
      plugins: 'print preview powerpaste casechange importcss tinydrive searchreplace autolink autosave save directionality advcode visualblocks visualchars fullscreen image link media mediaembed template codesample table charmap hr pagebreak nonbreaking anchor toc insertdatetime advlist lists checklist wordcount tinymcespellchecker a11ychecker textpattern noneditable help formatpainter pageembed charmap mentions quickbars linkchecker emoticons advtable'
    },
    menu: {
      tc: {
        title: 'Comments',
        items: 'addcomment showcomments deleteallconversations'
      }
    },
    menubar: 'file edit view insert format tools table tc help',
    toolbar: 'undo redo | bold italic underline strikethrough | fontselect fontsizeselect formatselect | alignleft aligncenter alignright alignjustify | outdent indent |  numlist bullist checklist | forecolor backcolor casechange permanentpen formatpainter removeformat | pagebreak | charmap emoticons | fullscreen  preview save print | insertfile image media pageembed template link anchor codesample | a11ycheck ltr rtl | showcomments addcomment',
    autosave_ask_before_unload: true,
    autosave_interval: '30s',
    autosave_prefix: '{path}{query}-{id}-',
    autosave_restore_when_empty: false,
    autosave_retention: '2m',
    image_advtab: true,
    link_list: [
      { title: 'My page 1', value: 'https://www.tiny.cloud' },
      { title: 'My page 2', value: 'http://www.moxiecode.com' }
    ],
    image_list: [
      { title: 'My page 1', value: 'https://www.tiny.cloud' },
      { title: 'My page 2', value: 'http://www.moxiecode.com' }
    ],
    image_class_list: [
      { title: 'None', value: '' },
      { title: 'Some class', value: 'class-name' }
    ],
    importcss_append: true,
    templates: [
      { title: 'New Table', description: 'creates a new table', content: '<div class="mceTmpl"><table width="98%%"  border="0" cellspacing="0" cellpadding="0"><tr><th scope="col"> </th><th scope="col"> </th></tr><tr><td> </td><td> </td></tr></table></div>' },
      { title: 'Starting my story', description: 'A cure for writers block', content: 'Once upon a time...' },
      { title: 'New list with dates', description: 'New List with dates', content: '<div class="mceTmpl"><span class="cdate">cdate</span><br /><span class="mdate">mdate</span><h2>My List</h2><ul><li></li><li></li></ul></div>' }
    ],
    template_cdate_format: '[Date Created (CDATE): %m/%d/%Y : %H:%M:%S]',
    template_mdate_format: '[Date Modified (MDATE): %m/%d/%Y : %H:%M:%S]',
    height: 600,
    image_caption: true,
    quickbars_selection_toolbar: 'bold italic | quicklink h2 h3 blockquote quickimage quicktable',
    noneditable_noneditable_class: 'mceNonEditable',
    toolbar_mode: 'sliding',
    spellchecker_ignore_list: ['Ephox', 'Moxiecode'],
    tinycomments_mode: 'embedded',
    content_style: '.mymention{ color: gray; }',
    contextmenu: 'link image imagetools table configurepermanentpen',
    a11y_advanced_options: true,
    skin: useDarkMode ? 'oxide-dark' : 'oxide',
    content_css: useDarkMode ? 'dark' : 'default',
  });
};
}


