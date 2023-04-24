class ElementCollection extends Array {
  ready(cb) {
    const isReady = this.some((e) => {
      return e.readyState != null && e.readyState != "loading";
    });
    if (isReady) {
      cb();
    } else {
      this.on("DOMContentLoaded", cb);
    }
    return this;
  }
  isNotNull() {
    return this[0] != null
  }
  isNull() {
    return this[0] == null
  }
  on(event, cbOrSelector, cb) {
    if (typeof cbOrSelector === "function") {
      this.forEach((e) => e.addEventListener(event, cbOrSelector));
    } else {
      this.forEach((elem) => {
        elem.addEventListener(event, (e) => {
          if (e.target.matches(cbOrSelector)) cb(e.target);
        });
      });
    }
    return this;
  }
  each(cb = () => {}) {
    if (typeof cb === "function") this.forEach((e) => cb(e));
  }
  next() {
    return this.map((e) => e.nextElementSibling).filter((e) => e != null);
  }
  prev() {
    return this.map((e) => e.previousElementSibling).filter((e) => e != null);
  }
  removeClass(removeClass) {
    this.forEach((e) => e.classList.remove(removeClass));
    return this;
  }
  addClass(classes) {
    if(typeof classes === 'object')
    this.each((e) => [...classes].forEach(cls => e.classList.add(cls)))
    // this.forEach((e) => [...classes].forEach(cls => e.classList.add(cls)));
    else this.each((e) => e.classList.add(classes));
    return this;
  }
  text(value) {
    if (value) {
      this.forEach((e) => e.textContent = value);
      return this;
    } else { return this[0].textContent }
  }
  html(value, single=false) {
    if (value) {
      this.forEach((e) => (single == true ? (e.innerHTML = value) : (e.innerHTML += value)));
      return this;
    } else { return this[0].innerHTML }
  }
  toText() {
   return this[0].outerHTML
  }
  attr(attr, property) {
    if (attr && property){
      this.forEach((e) => e.setAttribute(attr, property))
      return this
    } else { return this[0].getAttribute(attr) }
  }
  css(property, value) {
    this.forEach((e) => e.style.setProperty(property, value));
    return this;
  }
  style(property) {
    this.forEach((e) => e.setAttribute("style", property));
    return this;
  }
  data(dataId, value) {
    const dataID = typeof dataId === 'object' ? dataId[0] : dataId
    const id = dataID?.replace(/(-[a-z])/, (g) => {
      return g.replace("-", "").toUpperCase();
    });
    if (dataId && value){
      this.forEach((e) => (e.dataset[id] = value))
      return this
    } else {
      if(typeof dataId === 'object') {
        const data = []
        this.forEach((e) => data.push(e.dataset[id]))
        return data
      } else { return this[0].dataset[id] }
    }
  }
  show(important=false,display='block') {
    this.forEach((e) => e.setAttribute("style", `display:${display}${important == true ? '!important':''}`));
    return this;
  }
  hide(important=false) {
    this.forEach((e) => e.setAttribute("style", `display:none${important == true ? '!important':''}`));
    return this;
  }
  scroll(value) {
    this.forEach((e) => e.scrollIntoView({ behavior: value }));
    return this;
  }
  remove() {
    this.forEach((e) => e.remove());
    return this;
  }
  append(innerHTML, append="last") {
    const insert = append === "first" ? "afterbegin" : "beforeend";
    this.forEach((e) => e.insertAdjacentHTML(insert, innerHTML));
    return this;
  }
  appendAB(innerHTML, append="after") {
    const insert = append === "before" ? "beforebegin" : "afterend";
    this.forEach((e) => e.insertAdjacentHTML(insert, innerHTML));
    return this;
  }
  appendAoB(child, insert) {
    this.forEach((e) =>
      e.parentNode.insertBefore(child, insert === "before" ? e : e.nextSibling)
    );
    return this;
  }
  appendTo(child) {
    this.forEach((e) =>
      e.appendChild(child)
    );
    return this;
  }
  insert(create={}, selectorInsertAB) {
    this[0].parentNode.insertBefore($create(create), $qa(selectorInsertAB)[0])
    return this;
  }
  createChild(create) {
    this.forEach((e) => {
      if (typeof create != "undefined") {
        var $this = $create(create);
        if (e != null) e.appendChild($this);
      }
    });
    return this;
  }
  children() {
    this.forEach((e) => e.children);
    return this;
  }
  find(selector) {
    const _ = this[0]
    const id = _.id ? '#'+_.id : ''
    const cls = _.className ? '.'+_.className.split(' ').join('.') : ''
    const parentSelector = this[0].localName + id + cls
    return $Qs(parentSelector +' '+ selector)
  }
  $find(selector) {
    const _ = this[0]
    const id = _.id ? '#'+_.id : ''
    const cls = _.className ? '.'+_.className.split(' ').join('.') : ''
    const parentSelector = this[0].localName + id + cls
    // const data = (key) => Object[key]($selector.dataset)[0],
    // dataset = {
    //   key: data('keys').replace(/([A-Z][a-z]*)/g, str => '-' + str.toLowerCase()),
    //   value: data('values'),
    // }
    // console.log(`[${dataset.key}="${dataset.value}"]`)
    // console.log(parentSelector)

    return $Qs(parentSelector +' '+ selector)
  }
  match(selector) {
    // this.forEach((e) => e.matches(selector));
    return this[0].matches(selector);
  }
  clone(cloneSelector, insert, boolean=true) {
    this.forEach((e) => {
      const node = $qs(cloneSelector);
      const clone = node.cloneNode(boolean);
      if (insert)
      this.appendAoB(clone, insert)
      else e.appendChild(clone)
    });
    return this;
  }
}
class AjaxPromise {
  constructor(promise) {
    this.promise = promise;
  }
  done(cb) {
    this.promise = this.promise.then((data) => {
      cb(data);
      return data;
    });
    return this;
  }
  fail(cb) {
    this.promise = this.promise.catch(cb);
    return this;
  }
  always(cb) {
    this.promise = this.promise.finally(cb);
    return this;
  }
}
function $Qs(param) {
  if ((typeof param === "string" || param instanceof String) && param !== '<div>') {
    return new ElementCollection(...document.querySelectorAll(param));
  } else if(param === '<div>') {
    const create = document.createElement('div')
    create.querySelectorAll('div')
    return new ElementCollection(create);
  }
}
$Qs.get = function ({ url, type, data, dataType, success = () => {} }) {
  const queryString =
    (data != undefined ? "?" : "") +
    Object.entries(data || {})
      .map(([key, value]) => {
        return `${key}=${value}`;
      })
      .join("&");

  return new AjaxPromise(
    fetch(url + queryString, {
      method: type || "GET",
      headers: {
        "Content-Type": dataType,
      },
    })
      .then((res) => {
        if (res.ok) {
          return res.json();
        } else {
          throw new Error(res.status);
        }
      })
      .then((data) => {
        success(data);
        return data;
      })
  );
};
function appendAOB(attributes, selector, insert = "before", useScrollTop) {
  (Element.prototype.appendAfterOrBefore = function (element) {
    if (element != null) {
      element.appendAoB(this, insert);
    }
  }),
    false;

  var NewElement = $create(attributes),
    $this = $Qs(selector);
  if (useScrollTop) {
    var onScroll = false;
    $Qs(window).on(
      "scroll",
      function () {
        ((0 != document.documentElement.scrollTop && false === onScroll) ||
          (0 != document.body.scrollTop && false === onScroll)) &&
          (!(function () {
            if (attributes?.customElement)
              (attributes?.element).appendAfterOrBefore($this);
            else NewElement.appendAfterOrBefore($this);
          })(),
          (onScroll = true));
      },
      true
    );
  } else {
    if (attributes?.customElement)
      (attributes?.element).appendAfterOrBefore($this);
    else NewElement.appendAfterOrBefore($this);
  }
}
// Element Functions
function $qs(selector) {
  var $this = document.querySelector(selector);
  if ($this != null) return $this;
}
function $qa(selectorAll) {
  var $this = document.querySelectorAll(selectorAll);
  return $this;
}
function getAttr(property, value) {
  return { property, value };
}
function $create(create) {
  const obj = (name) => create?.[name];
  // const iF = (name) => { if(obj(name)) return $this = obj(name) }
  if (typeof create != "undefined") {
    var $this = document.createElement(obj("tagName") || "div");
    if (obj("class")) $this.classList = obj("class");
    if (obj("id")) $this.id = obj("id");
    if (obj("style")) $this.setAttribute("style", obj("style"));
    if (obj("html")) $this.innerHTML = obj("html");
    if (obj("src")) $this.src = obj("src");
    // var attr = obj("attr");
    // if (typeof attr != "undefined")
    // 	$this.setAttribute(attr?.property, attr?.value);
    if (typeof obj("attr") != "undefined")
      obj("attr")?.map((load) => {
        if (load?.property != undefined)
          $this.setAttribute(load?.property, load?.value || "");
      });

    return $this;
  }
}

//StyleSheets
function StyleSheets(STYLE) {
  function getInlineStyle(inlineStyle) {
    var id = parseInt(Math.random() * 100000),
      getStyle = $create({ tagName: "style" }),
      head = document.getElementsByTagName("head")[0];
    getStyle.id = `pkb-blocks-${id}-inline-style`;
    getStyle.textContent = inlineStyle;
    head.appendChild(getStyle);
  }

  if (typeof STYLE != "undefined") {
    function replaceLTS(str) {
      return str?.replace(/(\r\n|\n|\r|\s\s+)/gi, "");
    }
    getInlineStyle(
      "".concat(
        iF(replaceLTS(STYLE?.FontFace)),
        iF(replaceLTS(STYLE?.xl)),
        iF(
          replaceLTS(STYLE?.lg),
          `@media only screen and (max-width: ${STYLE?.lgWidth || 999.98}px){`,
          "}"
        ),
        iF(
          replaceLTS(STYLE?.md),
          `@media only screen and (max-width: ${STYLE?.mdWidth || 767}px){`,
          "}"
        ),
        iF(
          replaceLTS(STYLE?.sm),
          `@media only screen and (max-width: ${STYLE?.smWidth || 480}px){`,
          "}"
        ),
        iF(
          replaceLTS(STYLE?.ssm),
          `@media only screen and (max-width: ${STYLE?.ssmWidth || 360}px){`,
          "}"
        )
      )
    );
  }
}
//Conditions
function iF(val, p = "", s = "", d = "") {
  return val ? p + val + s : d;
}
function elseIf(val, val2, o) {
  return val ? iF(o?.p) + val2 + iF(o?.s) : iF(o?.d);
}
// Animations
function $scrollToAction(selector, options, remove = true) {
  let qa = $qa(selector),
    option = (name) => options?.[name],
    o = {
      style: option('style'),
      class: option('class'),
      id: option('id'),
    },
    toStyle = typeof o.style != "undefined";
  $Qs(window).on("scroll", fadeIn);
  function fadeIn() {
    for (var i = 0; i < qa.length; i++) {
      var elem = qa[i];
      var distInView =
        elem.getBoundingClientRect().top - window.innerHeight + 20;
      if (distInView < 0) {
        if (o.class) elem.classList.add(o.class);
        if (o.id) elem.id = o.id;
        if (toStyle) elem.setAttribute("style", o.style?.add || "");
      } else {
        if (remove == true) {
          if (o.class) elem.classList.remove(o.class);
          if (o.id) elem.id = "";
          if (toStyle) elem.setAttribute("style", o.style?.rm || "");
        }
      }
    }
  }
  fadeIn();
}
function $animateDelay(selector, ds = 3) {
  let s = String(selector)
      ?.replace(/\,\s+/g, ",")
      .split(/,(?!\d\d)/),
    qa = $qa(s[0]),
    arr = [...Array(qa.length).keys()],
    style = arr
      .map((i) => {
        let a = `#animate-fade-in:nth-child(${i + 1})`,
          $selector = [...s].map((v) => v + a).join(",");
        if (qa.length > 0)
          return (
            `${$selector} {` +
            `-webkit-animation-delay:.${ds + i}s;animation-delay:.${ds + i}s;}`
          );
      })
      .join("");
  return style?.toString();
}
function awaitLoading(func, counter = 5, to = 0) {
  function timeout(numCounter, endCounter) {
    let timerId;

    function run() {
      if (func?.start) {
        var d = $Qs(func?.selector);
        if (func?.useSkip == true)
          d.html(func?.innerHTML || "Skip after " + numCounter-- + "s");
        setTimeout(func?.start, 0);
      } else {
        //console.log(startFrom++);
        numCounter--;
      }

      if (numCounter < endCounter) {
        if (func?.start) {
          if (func?.useSkip == true) d.html("");
          var getFuncs = setTimeout(func?.ended, 0);
        } else {
          getFuncs = setTimeout(func, 0);
        }
        return getFuncs;
      }
      timerId = setTimeout(run, 1000);
    }
    run();
  }
  timeout(counter, to);
}
function getLabels(stringReplace) {
  var $content = String(stringReplace).toLowerCase();
  function replace(regex1, regex2) {
    var str = $content?.replace(regex1, "");
    str = str?.replace(regex2, "");
    return str;
  }
  // replace(/\b(?!anyWord|anyNumber)([^A-Za-z0-9]+|\S+)\b/g, /[^A-Za-z0-9]/g)
  function split(val) {
    var $value = $content.split(val)[1].split(" ")[0].split("</b>")[0];
    return $value?.replace(/\$/g, " ");
  }
  function contain(val) {
    return $content?.includes(val);
  }
  function span(val, className, upperCase) {
    return val.length > 0
      ? '<span class="' +
          className +
          '">' +
          utils().upperCapital(val, upperCase) +
          "</span>"
      : "";
  }
  function getValue(valSplit, className, upperCase) {
    return contain(valSplit) ? span(split(valSplit), className, upperCase) : "";
  }
  function getMultiValue(valSplit, className, upperCase) {
    return contain(valSplit)
      ? [...split(valSplit).split(",")]
          .map((value) => span(value, className, upperCase))
          .join("")
      : "";
  }

  var $getBadgeTop =
      contain("{quality}=") || contain("{type}=")
        ? '<div class="absolute flex gap-1 z-[5] left-[5px] top-[5px]">' +
          getMultiValue("{type}=", "type") +
          getMultiValue("{quality}=", "quality", true) +
          "</div>"
        : "",
    file = (file) => span(split("{file}="), "file " + file, true),
    $getBadgeLeft = contain("{file}=dub")
      ? file("dub")
      : contain("{file}=sub")
      ? file("sub")
      : contain("{file}=raw")
      ? file("raw")
      : getValue("{year}=", "release"),
    $getBadgeRight = contain("{duration}=")
      ? span(split("{duration}="), "duration")
      : contain("{rating}=")
      ? span(parseFloat(split("{rating}=")) + "<sub> / 10</sub>", "rating")
      : getValue("{episode}=", "episode"),
    status = (status) => span(status, "ribbon " + status + " is-visible", true),
    $completed = replace(/(?![\{]completed\})./g, ""),
    $ongoing = replace(/(?![\{]ongoing\})./g, ""),
    $upcoming = replace(/(?![\{]upcoming\})./g, ""),
    $kh = replace(/(?![\{]khdub\})./g, ""),
    $cc = replace(/(?![\{]cc\})./g, ""),
    $getRibbon =
      contain("{completed}") && $completed.length > 0
        ? status("completed")
        : contain("{ongoing}") && $ongoing.length > 0
        ? status("ongoing")
        : contain("{upcoming}") && $upcoming.length > 0
        ? status("upcoming")
        : contain("{khdub}") && $kh.length > 0
        ? '<span class="ribbon khmer-dubbed is-visible">និយាយខ្មែរ</span>'
        : contain("{cc}") && $cc.length > 0
        ? '<span class="closed-caption"></span>'
        : "",
    $Labels = [$getBadgeTop, $getBadgeLeft, $getBadgeRight, $getRibbon];
  return $Labels;
}
function removeLabels(selector) {
  $(function () {
    $(selector).each(function () {
      var $this = $(this),
        $label = $this.text().trim(),
        $labels =
          "quality,type,file,year,duration,episode,rating,cc,completed,khdub,ongoing,upcoming";
      if (contains($label, $labels) > 0) return $this.remove();
    });
  });
}
function vanillaLazy() {
  // "<script async='async' src='https://cdn.jsdelivr.net/npm/vanilla-lazyload@17.8.3/dist/lazyload.min.js' type='text/javascript'></script>"

  // default :: new LazyLoad({ elements_selector: ".lazy" });
  window.lazyLoadOptions = {
      callback_loading: function() {
        e.getAttribute("data-src")
      },
      callback_loaded: function() {
        e.getAttribute("data-src")
      }
    };
    // Listen to the initialization event
    // and get the instance of LazyLoad
    window.addEventListener(
      "LazyLoad::Initialized",
      function (event) {
        window.lazyLoadInstance = event.detail.instance;
      },
      false
    );
}

// Useful Helper function
class Useful {
  isMobile = {
    max: (width) => this.MediaQuery('max-width:' + width + 'px'),
    min: (width) => this.MediaQuery('min-width:' + width + 'px'),
  }
  url = this.URL()
  debug = this.inspectDetection
  // function
  MediaQuery(width=String){
    return window.matchMedia(`only screen and (${width})`).matches
  }
  //Conditions
  option(value){ return value||'' }
  if(val, options) {
    const o = (v) => this.option(v)
    return val ? o(options?.p) + val + o(options?.s) : o(options?.d);
  }
  elif(val, val2, option) {
    const o = (v) => this.option(v)
    return val ? o(option?.p) + val2 + o(option?.s) : o(option?.d);
  }
  isNumeric(value) {
    var type = typeof value;
    return (type === 'number' || type === 'string') && !Number.isNaN(value - Number.parseFloat(value));
  }
  URL() {
    const win = window.location,
      domain = win.host,
      currentUrl = win.href,
      pathname = new URL(currentUrl).pathname
    return {
      domain: domain,
      current: currentUrl,
      pathname: pathname,
    }
  }
  toArray(str=String, split=','){
    var arr = []
    String(str).split(split).forEach(v => arr.push(v.trim()))
    return arr
  }
  contains(value=String, searchStringSplitByCommas=String, condition='or') {
    const $value = String(value).toLowerCase()
    var arrValues = this.toArray(searchStringSplitByCommas),
    isBoolean;
    switch (condition){
      case 'and': isBoolean = arrValues.every((v) => $value.match(v));
        break;
      case 'eq':
        isBoolean = arrValues.some((v) => $value === v);
        break;
      default:
        isBoolean = arrValues.some((v) => $value.match(v));
    }
    return isBoolean
  }
  capitalized(words = String) {
    return String(words).replace(/(^\w{1})|(\s+\w{1})/g, (letter) =>
      letter.toUpperCase()
    );
  }
  upperCapital(value, upperCase = false) {
    return upperCase == true ? value.toUpperCase() : this.capitalized(value);
  }
  inspectDetection(){
    !function t(){try {
      !(function t(n) {
        (1 === ("" + n / n).length && 0 !== n) ||
          function () {}.constructor("debugger")(),
          t(++n);
      })(0);
    } catch (n) {
      setTimeout(t, 5e3);
    }}();
  }
  GetImageSize(timeout=100) {
    var $Q = {
      data: 'data-src',
      selector: 'img[data-src]'
    }
    function dimensions() {
      return new Promise((resolve, reject) => {
        const img = new Image();
        if($Qs($Q.selector).isNotNull()) {
          img.onload = () => resolve({
            width: img.width,
            height: img.height,
          });
          img.onerror = (error) => reject(error);
          img.src = $Qs($Q.selector).attr($Q.data)
        }
      });
    };
    async function image() {
      const {width, height} = await dimensions();
      await $Qs($Q.selector).attr('width',width).attr('height',height).attr('sizes',`(max-width: ${width}px) 100vw, ${width}px`)
    }
    try {
      setTimeout(image, timeout)
    } catch (e) {
      throw new Error(e)
    }
  }
  createCJS(){
    // CryptoJS
    var scriptUrl = 'https:\/\/cdnjs.cloudflare.com\/ajax\/libs/crypto-js\/4.1.1\/crypto-js.min.js';
    try{
      var ttPolicy=window.trustedTypes.createPolicy("youtube-widget-api",{createScriptURL:function(x){return x}});scriptUrl=ttPolicy.createScriptURL(scriptUrl)
    }catch(e){}
    if(window.location.host){
      (function(){
        var a=document.createElement("script");
        a.crossOrigin="anonymous";
        a.integrity="sha512-E8QSvWZ0eCLGk4km3hxSsNmGWbLtSCSUcewDQPQWZF6pEU8GlT8a5fF32wOl1i8ftdMhssTrF/OhyGWwonTcXA==";
        a.referrerPolicy="no-referrer";
        a.src=scriptUrl;
        var c=document.currentScript;
        if(c){
          var n=c.nonce||c.getAttribute("nonce");if(n)a.setAttribute("nonce",n)
        }
        var b = document.getElementsByTagName("script")[0];
        b.parentNode.insertBefore(a,b)
        var d=document.createElement("script");
        d.type="text/javascript";
        d.id="api-detection-script";
        d.textContent = ''.concat(
          "function getText() {",
          "  const key = [...Array(10).keys()].reverse().join(document.querySelector('[data-copyright-by]').dataset.copyrightBy);",
          "  const plainText = 'U2FsdGVkX18G80iHNwu+uMmcCgTN3d3+wlxWat9PQHcT2f2zh6sZeNnxI6vkSQepmX2Ls7e9lzFEgVYV9pWH4EArV1rka1FdFzyTbjIZraM=';",
          "  const decrypted = CryptoJS.AES.decrypt(plainText, key);",
          "  return decrypted.toString(CryptoJS.enc.Utf8);",
          "};",
          "var cjs = {text: getText()};",
          "var api = Object.keys({ main:'',archive:'',posts:'',movie:'' });",
          "var api = cjs + '/'+ api.join('/') +'/';",
        )
        var e = document.getElementsByTagName("script")[0];
        setTimeout(() => e.parentNode.insertBefore(d,e), 100)
      })()
    };
  }
  Movie() {
    const movie = (postJson) => {
      return fetch(api + postJson, {
          method: 'GET',
          headers: {
            'Accept': 'application/json',
          },
      }).then(response => response.json())
        .then(response => {
          var data = {
            "controls": true,
            "sharing": false,
            "displaytitle": false,
            "displaydescription": true,
            "abouttext": "Buy Me a Coffee",
            "aboutlink": "@mr_ron168",
            "skin": {
              "name": "netflix"
            },
            "captions": {
              "color": "#FFF",
              "fontSize": 16,
              "backgroundOpacity": 100,
              "edgeStyle": "uniform"
            },
            "playlist": [{
              "title": GET("title") ? GET("title") : Qs("meta[property='og:title']"),
              "description": GET("title") ? GET("title") : Qs("meta[property='og:title']"),
              "image": GET("thumbnail") ? GET("thumbnail") : "https://keithandthemovies.files.wordpress.com/2023/03/insidesmall.png",
              "sources": response["sources"],
              "captions": response["captions"],
            }],
            "advertising": {
              "client": "vast"
            }
          }
          plyerInstance(data)
        })
    };
    function GET(data) {
      const qs = $Qs("#video > div[data-post-name]")
      if (data)
        return qs.data(data)
      else
        return qs.isNotNull()
    }
    var timer = setInterval(function() {
      clearInterval(timer);
      if (GET()) {
        new movie(GET("post-name"));
        $Qs('#video').remove()
      }
    }, 100);
  }
}
function utils() {
  return new Useful()
}
