/*! For license information please see e50e9c162871c1d91fba5ce567a5656e16dc6783-8c77aea5201430d11e6f.js.LICENSE.txt */
(self.webpackChunksrepollock_ca=self.webpackChunksrepollock_ca||[]).push([[61],{3720:function(e,t,n){"undefined"!=typeof self&&self,e.exports=function(){var e={808:function(e,t,n){var r,o,i;i=function(){function e(){for(var e=0,t={};e<arguments.length;e++){var n=arguments[e];for(var r in n)t[r]=n[r]}return t}function t(e){return e.replace(/(%[0-9A-Z]{2})+/g,decodeURIComponent)}return function n(r){function o(){}function i(t,n,i){if("undefined"!=typeof document){"number"==typeof(i=e({path:"/"},o.defaults,i)).expires&&(i.expires=new Date(1*new Date+864e5*i.expires)),i.expires=i.expires?i.expires.toUTCString():"";try{var c=JSON.stringify(n);/^[\{\[]/.test(c)&&(n=c)}catch(e){}n=r.write?r.write(n,t):encodeURIComponent(String(n)).replace(/%(23|24|26|2B|3A|3C|3E|3D|2F|3F|40|5B|5D|5E|60|7B|7D|7C)/g,decodeURIComponent),t=encodeURIComponent(String(t)).replace(/%(23|24|26|2B|5E|60|7C)/g,decodeURIComponent).replace(/[\(\)]/g,escape);var a="";for(var u in i)i[u]&&(a+="; "+u,!0!==i[u]&&(a+="="+i[u].split(";")[0]));return document.cookie=t+"="+n+a}}function c(e,n){if("undefined"!=typeof document){for(var o={},i=document.cookie?document.cookie.split("; "):[],c=0;c<i.length;c++){var a=i[c].split("="),u=a.slice(1).join("=");n||'"'!==u.charAt(0)||(u=u.slice(1,-1));try{var s=t(a[0]);if(u=(r.read||r)(u,s)||t(u),n)try{u=JSON.parse(u)}catch(e){}if(o[s]=u,e===s)break}catch(e){}}return e?o[e]:o}}return o.set=i,o.get=function(e){return c(e,!1)},o.getJSON=function(e){return c(e,!0)},o.remove=function(t,n){i(t,"",e(n,{expires:-1}))},o.defaults={},o.withConverter=n,o}((function(){}))},void 0===(o="function"==typeof(r=i)?r.call(t,n,t,e):r)||(e.exports=o),e.exports=i()},703:function(e,t,n){"use strict";var r=n(414);function o(){}function i(){}i.resetWarningCache=o,e.exports=function(){function e(e,t,n,o,i,c){if(c!==r){var a=new Error("Calling PropTypes validators directly is not supported by the `prop-types` package. Use PropTypes.checkPropTypes() to call them. Read more at http://fb.me/use-check-prop-types");throw a.name="Invariant Violation",a}}function t(){return e}e.isRequired=e;var n={array:e,bool:e,func:e,number:e,object:e,string:e,symbol:e,any:e,arrayOf:t,element:e,elementType:e,instanceOf:t,node:e,objectOf:t,oneOf:t,oneOfType:t,shape:t,exact:t,checkPropTypes:i,resetWarningCache:o};return n.PropTypes=n,n}},697:function(e,t,n){e.exports=n(703)()},414:function(e){"use strict";e.exports="SECRET_DO_NOT_PASS_THIS_OR_YOU_WILL_BE_FIRED"}},t={};function r(n){var o=t[n];if(void 0!==o)return o.exports;var i=t[n]={exports:{}};return e[n](i,i.exports,r),i.exports}r.n=function(e){var t=e&&e.__esModule?function(){return e.default}:function(){return e};return r.d(t,{a:t}),t},r.d=function(e,t){for(var n in t)r.o(t,n)&&!r.o(e,n)&&Object.defineProperty(e,n,{enumerable:!0,get:t[n]})},r.o=function(e,t){return Object.prototype.hasOwnProperty.call(e,t)},r.r=function(e){"undefined"!=typeof Symbol&&Symbol.toStringTag&&Object.defineProperty(e,Symbol.toStringTag,{value:"Module"}),Object.defineProperty(e,"__esModule",{value:!0})};var o={};return function(){"use strict";r.r(o),r.d(o,{Cookies:function(){return u()},OPTIONS:function(){return g},SAME_SITE_OPTIONS:function(){return T},VISIBLE_OPTIONS:function(){return C},default:function(){return x},getCookieConsentValue:function(){return S},resetCookieConsentValue:function(){return w}});const e=n(7294);var t=r.n(e),i=r(697),c=r.n(i),a=r(808),u=r.n(a);function s(e){return s="function"==typeof Symbol&&"symbol"==typeof Symbol.iterator?function(e){return typeof e}:function(e){return e&&"function"==typeof Symbol&&e.constructor===Symbol&&e!==Symbol.prototype?"symbol":typeof e},s(e)}var l=["children"];function f(){return f=Object.assign||function(e){for(var t=1;t<arguments.length;t++){var n=arguments[t];for(var r in n)Object.prototype.hasOwnProperty.call(n,r)&&(e[r]=n[r])}return e},f.apply(this,arguments)}function p(e,t){var n=Object.keys(e);if(Object.getOwnPropertySymbols){var r=Object.getOwnPropertySymbols(e);t&&(r=r.filter((function(t){return Object.getOwnPropertyDescriptor(e,t).enumerable}))),n.push.apply(n,r)}return n}function d(e){for(var t=1;t<arguments.length;t++){var n=null!=arguments[t]?arguments[t]:{};t%2?p(Object(n),!0).forEach((function(t){O(e,t,n[t])})):Object.getOwnPropertyDescriptors?Object.defineProperties(e,Object.getOwnPropertyDescriptors(n)):p(Object(n)).forEach((function(t){Object.defineProperty(e,t,Object.getOwnPropertyDescriptor(n,t))}))}return e}function y(e,t){for(var n=0;n<t.length;n++){var r=t[n];r.enumerable=r.enumerable||!1,r.configurable=!0,"value"in r&&(r.writable=!0),Object.defineProperty(e,r.key,r)}}function b(e,t){return b=Object.setPrototypeOf||function(e,t){return e.__proto__=t,e},b(e,t)}function h(e,t){if(t&&("object"===s(t)||"function"==typeof t))return t;if(void 0!==t)throw new TypeError("Derived constructors may only return object or undefined");return m(e)}function m(e){if(void 0===e)throw new ReferenceError("this hasn't been initialised - super() hasn't been called");return e}function v(e){return v=Object.setPrototypeOf?Object.getPrototypeOf:function(e){return e.__proto__||Object.getPrototypeOf(e)},v(e)}function O(e,t,n){return t in e?Object.defineProperty(e,t,{value:n,enumerable:!0,configurable:!0,writable:!0}):e[t]=n,e}var g={TOP:"top",BOTTOM:"bottom",NONE:"none"},T={STRICT:"strict",LAX:"lax",NONE:"none"},C={HIDDEN:"hidden",SHOW:"show",BY_COOKIE_VALUE:"byCookieValue"},S=function(){var e=arguments.length>0&&void 0!==arguments[0]?arguments[0]:E,t=u().get(e);return void 0===t?u().get(k(e)):t},w=function(){var e=arguments.length>0&&void 0!==arguments[0]?arguments[0]:E;u().remove(e)},k=function(e){return"".concat(e,"-legacy")},E="CookieConsent",A=function(e){var t=e.condition,n=e.wrapper,r=e.children;return t?n(r):r},j=function(e){!function(e,t){if("function"!=typeof t&&null!==t)throw new TypeError("Super expression must either be null or a function");e.prototype=Object.create(t&&t.prototype,{constructor:{value:e,writable:!0,configurable:!0}}),Object.defineProperty(e,"prototype",{writable:!1}),t&&b(e,t)}(a,e);var n,r,o,i,c=(o=a,i=function(){if("undefined"==typeof Reflect||!Reflect.construct)return!1;if(Reflect.construct.sham)return!1;if("function"==typeof Proxy)return!0;try{return Boolean.prototype.valueOf.call(Reflect.construct(Boolean,[],(function(){}))),!0}catch(e){return!1}}(),function(){var e,t=v(o);if(i){var n=v(this).constructor;e=Reflect.construct(t,arguments,n)}else e=t.apply(this,arguments);return h(this,e)});function a(e){var t;return function(e,t){if(!(e instanceof t))throw new TypeError("Cannot call a class as a function")}(this,a),O(m(t=c.call(this,e)),"handleScroll",(function(){var e=t.props.acceptOnScrollPercentage,n=document.documentElement,r=document.body,o="scrollTop",i="scrollHeight";(n[o]||r[o])/((n[i]||r[i])-n.clientHeight)*100>e&&t.accept(!0)})),O(m(t),"removeScrollListener",(function(){t.props.acceptOnScroll&&window.removeEventListener("scroll",t.handleScroll)})),t.state={visible:!1,style:{alignItems:"baseline",background:"#353535",color:"white",display:"flex",flexWrap:"wrap",justifyContent:"space-between",left:"0",position:"fixed",width:"100%",zIndex:"999"},buttonStyle:{background:"#ffd42d",border:"0",borderRadius:"0px",boxShadow:"none",color:"black",cursor:"pointer",flex:"0 0 auto",padding:"5px 10px",margin:"15px"},declineButtonStyle:{background:"#c12a2a",border:"0",borderRadius:"0px",boxShadow:"none",color:"#e5e5e5",cursor:"pointer",flex:"0 0 auto",padding:"5px 10px",margin:"15px"},contentStyle:{flex:"1 0 300px",margin:"15px"},overlayStyle:{position:"fixed",left:0,top:0,width:"100%",height:"100%",zIndex:"999",backgroundColor:"rgba(0,0,0,0.3)"}},t}return n=a,r=[{key:"componentDidMount",value:function(){var e=this.props.debug;(void 0===this.getCookieValue()||e)&&(this.setState({visible:!0}),this.props.acceptOnScroll&&window.addEventListener("scroll",this.handleScroll,{passive:!0}))}},{key:"componentWillUnmount",value:function(){this.removeScrollListener()}},{key:"accept",value:function(){var e=arguments.length>0&&void 0!==arguments[0]&&arguments[0],t=this.props,n=t.cookieName,r=t.cookieValue,o=t.hideOnAccept,i=t.onAccept;this.setCookie(n,r),i(null!=e&&e),o&&(this.setState({visible:!1}),this.removeScrollListener())}},{key:"overlayClick",value:function(){var e=this.props,t=e.acceptOnOverlayClick,n=e.onOverlayClick;t&&this.accept(),n()}},{key:"decline",value:function(){var e=this.props,t=e.cookieName,n=e.declineCookieValue,r=e.hideOnDecline,o=e.onDecline;e.setDeclineCookie&&this.setCookie(t,n),o(),r&&this.setState({visible:!1})}},{key:"setCookie",value:function(e,t){var n=this.props,r=n.extraCookieOptions,o=n.expires,i=n.sameSite,c=this.props.cookieSecurity;void 0===c&&(c=!location||"https:"===location.protocol);var a=d(d({expires:o},r),{},{sameSite:i,secure:c});i===T.NONE&&u().set(k(e),t,a),u().set(e,t,a)}},{key:"getCookieValue",value:function(){var e=this.props.cookieName;return S(e)}},{key:"render",value:function(){var e=this;switch(this.props.visible){case C.HIDDEN:return null;case C.BY_COOKIE_VALUE:if(!this.state.visible)return null}var n=this.props,r=n.location,o=n.style,i=n.buttonStyle,c=n.declineButtonStyle,a=n.contentStyle,u=n.disableStyles,s=n.buttonText,l=n.declineButtonText,p=n.containerClasses,y=n.contentClasses,b=n.buttonClasses,h=n.buttonWrapperClasses,m=n.declineButtonClasses,v=n.buttonId,O=n.declineButtonId,T=n.disableButtonStyles,S=n.enableDeclineButton,w=n.flipButtons,k=n.ButtonComponent,E=n.overlay,j=n.overlayClasses,x=n.overlayStyle,P=n.ariaAcceptLabel,I=n.ariaDeclineLabel,B=n.customContainerAttributes,L=n.customContentAttributes,D=n.customButtonProps,N=n.customDeclineButtonProps,_=n.customButtonWrapperAttributes,R={},M={},U={},H={},V={};switch(u?(R=f({},o),M=f({},i),U=f({},c),H=f({},a),V=f({},x)):(R=f({},d(d({},this.state.style),o)),H=f({},d(d({},this.state.contentStyle),a)),V=f({},d(d({},this.state.overlayStyle),x)),T?(M=f({},i),U=f({},c)):(M=f({},d(d({},this.state.buttonStyle),i)),U=f({},d(d({},this.state.declineButtonStyle),c)))),r){case g.TOP:R.top="0";break;case g.BOTTOM:R.bottom="0"}var W=[];return S&&W.push(t().createElement(k,f({key:"declineButton",style:U,className:m,id:O,"aria-label":I,onClick:function(){e.decline()}},N),l)),W.push(t().createElement(k,f({key:"acceptButton",style:M,className:b,id:v,"aria-label":P,onClick:function(){e.accept()}},D),s)),w&&W.reverse(),t().createElement(A,{condition:E,wrapper:function(n){return t().createElement("div",{style:V,className:j,onClick:function(){e.overlayClick()}},n)}},t().createElement("div",f({className:"".concat(p),style:R},B),t().createElement("div",f({style:H,className:y},L),this.props.children),t().createElement("div",f({className:"".concat(h)},_),W.map((function(e){return e})))))}}],r&&y(n.prototype,r),Object.defineProperty(n,"prototype",{writable:!1}),a}(e.Component);j.propTypes={location:c().oneOf(Object.keys(g).map((function(e){return g[e]}))),visible:c().oneOf(Object.keys(C).map((function(e){return C[e]}))),sameSite:c().oneOf(Object.keys(T).map((function(e){return T[e]}))),style:c().object,buttonStyle:c().object,declineButtonStyle:c().object,contentStyle:c().object,children:c().any,disableStyles:c().bool,hideOnAccept:c().bool,hideOnDecline:c().bool,onAccept:c().func,onDecline:c().func,buttonText:c().oneOfType([c().string,c().func,c().element]),declineButtonText:c().oneOfType([c().string,c().func,c().element]),cookieName:c().string,cookieValue:c().oneOfType([c().string,c().bool,c().number]),declineCookieValue:c().oneOfType([c().string,c().bool,c().number]),setDeclineCookie:c().bool,debug:c().bool,expires:c().number,containerClasses:c().string,contentClasses:c().string,buttonClasses:c().string,buttonWrapperClasses:c().string,declineButtonClasses:c().string,buttonId:c().string,declineButtonId:c().string,extraCookieOptions:c().object,disableButtonStyles:c().bool,enableDeclineButton:c().bool,flipButtons:c().bool,ButtonComponent:c().elementType,cookieSecurity:c().bool,overlay:c().bool,overlayClasses:c().string,overlayStyle:c().object,onOverlayClick:c().func,acceptOnOverlayClick:c().bool,ariaAcceptLabel:c().string,ariaDeclineLabel:c().string,acceptOnScroll:c().bool,acceptOnScrollPercentage:c().number,customContentAttributes:c().object,customContainerAttributes:c().object,customButtonProps:c().object,customDeclineButtonProps:c().object,customButtonWrapperAttributes:c().object},j.defaultProps={disableStyles:!1,hideOnAccept:!0,hideOnDecline:!0,location:g.BOTTOM,visible:C.BY_COOKIE_VALUE,onAccept:function(){},onDecline:function(){},cookieName:E,cookieValue:!0,declineCookieValue:!1,setDeclineCookie:!0,buttonText:"I understand",declineButtonText:"I decline",debug:!1,expires:365,containerClasses:"CookieConsent",contentClasses:"",buttonClasses:"",buttonWrapperClasses:"",declineButtonClasses:"",buttonId:"rcc-confirm-button",declineButtonId:"rcc-decline-button",extraCookieOptions:{},disableButtonStyles:!1,enableDeclineButton:!1,flipButtons:!1,sameSite:T.LAX,ButtonComponent:function(e){var n=e.children,r=function(e,t){if(null==e)return{};var n,r,o=function(e,t){if(null==e)return{};var n,r,o={},i=Object.keys(e);for(r=0;r<i.length;r++)n=i[r],t.indexOf(n)>=0||(o[n]=e[n]);return o}(e,t);if(Object.getOwnPropertySymbols){var i=Object.getOwnPropertySymbols(e);for(r=0;r<i.length;r++)n=i[r],t.indexOf(n)>=0||Object.prototype.propertyIsEnumerable.call(e,n)&&(o[n]=e[n])}return o}(e,l);return t().createElement("button",r,n)},overlay:!1,overlayClasses:"",onOverlayClick:function(){},acceptOnOverlayClick:!1,ariaAcceptLabel:"Accept cookies",ariaDeclineLabel:"Decline cookies",acceptOnScroll:!1,acceptOnScrollPercentage:25,customContentAttributes:{},customContainerAttributes:{},customButtonProps:{},customDeclineButtonProps:{},customButtonWrapperAttributes:{}};const x=j}(),o}()},2993:function(e){var t="undefined"!=typeof Element,n="function"==typeof Map,r="function"==typeof Set,o="function"==typeof ArrayBuffer&&!!ArrayBuffer.isView;function i(e,c){if(e===c)return!0;if(e&&c&&"object"==typeof e&&"object"==typeof c){if(e.constructor!==c.constructor)return!1;var a,u,s,l;if(Array.isArray(e)){if((a=e.length)!=c.length)return!1;for(u=a;0!=u--;)if(!i(e[u],c[u]))return!1;return!0}if(n&&e instanceof Map&&c instanceof Map){if(e.size!==c.size)return!1;for(l=e.entries();!(u=l.next()).done;)if(!c.has(u.value[0]))return!1;for(l=e.entries();!(u=l.next()).done;)if(!i(u.value[1],c.get(u.value[0])))return!1;return!0}if(r&&e instanceof Set&&c instanceof Set){if(e.size!==c.size)return!1;for(l=e.entries();!(u=l.next()).done;)if(!c.has(u.value[0]))return!1;return!0}if(o&&ArrayBuffer.isView(e)&&ArrayBuffer.isView(c)){if((a=e.length)!=c.length)return!1;for(u=a;0!=u--;)if(e[u]!==c[u])return!1;return!0}if(e.constructor===RegExp)return e.source===c.source&&e.flags===c.flags;if(e.valueOf!==Object.prototype.valueOf&&"function"==typeof e.valueOf&&"function"==typeof c.valueOf)return e.valueOf()===c.valueOf();if(e.toString!==Object.prototype.toString&&"function"==typeof e.toString&&"function"==typeof c.toString)return e.toString()===c.toString();if((a=(s=Object.keys(e)).length)!==Object.keys(c).length)return!1;for(u=a;0!=u--;)if(!Object.prototype.hasOwnProperty.call(c,s[u]))return!1;if(t&&e instanceof Element)return!1;for(u=a;0!=u--;)if(("_owner"!==s[u]&&"__v"!==s[u]&&"__o"!==s[u]||!e.$$typeof)&&!i(e[s[u]],c[s[u]]))return!1;return!0}return e!=e&&c!=c}e.exports=function(e,t){try{return i(e,t)}catch(n){if((n.message||"").match(/stack|recursion/i))return console.warn("react-fast-compare cannot handle circular refs"),!1;throw n}}},4839:function(e,t,n){"use strict";var r,o=n(7294),i=(r=o)&&"object"==typeof r&&"default"in r?r.default:r;function c(e,t,n){return t in e?Object.defineProperty(e,t,{value:n,enumerable:!0,configurable:!0,writable:!0}):e[t]=n,e}var a=!("undefined"==typeof window||!window.document||!window.document.createElement);e.exports=function(e,t,n){if("function"!=typeof e)throw new Error("Expected reducePropsToState to be a function.");if("function"!=typeof t)throw new Error("Expected handleStateChangeOnClient to be a function.");if(void 0!==n&&"function"!=typeof n)throw new Error("Expected mapStateOnServer to either be undefined or a function.");return function(r){if("function"!=typeof r)throw new Error("Expected WrappedComponent to be a React component.");var u,s=[];function l(){u=e(s.map((function(e){return e.props}))),f.canUseDOM?t(u):n&&(u=n(u))}var f=function(e){var t,n;function o(){return e.apply(this,arguments)||this}n=e,(t=o).prototype=Object.create(n.prototype),t.prototype.constructor=t,t.__proto__=n,o.peek=function(){return u},o.rewind=function(){if(o.canUseDOM)throw new Error("You may only call rewind() on the server. Call peek() to read the current state.");var e=u;return u=void 0,s=[],e};var c=o.prototype;return c.UNSAFE_componentWillMount=function(){s.push(this),l()},c.componentDidUpdate=function(){l()},c.componentWillUnmount=function(){var e=s.indexOf(this);s.splice(e,1),l()},c.render=function(){return i.createElement(r,this.props)},o}(o.PureComponent);return c(f,"displayName","SideEffect("+function(e){return e.displayName||e.name||"Component"}(r)+")"),c(f,"canUseDOM",a),f}}},4446:function(e,t,n){"use strict";n.d(t,{Z:function(){return he}});var r,o,i,c,a=n(7294),u=n(5697),s=n.n(u),l=n(4839),f=n.n(l),p=n(2993),d=n.n(p),y=n(6494),b=n.n(y),h="bodyAttributes",m="htmlAttributes",v="titleAttributes",O={BASE:"base",BODY:"body",HEAD:"head",HTML:"html",LINK:"link",META:"meta",NOSCRIPT:"noscript",SCRIPT:"script",STYLE:"style",TITLE:"title"},g=(Object.keys(O).map((function(e){return O[e]})),"charset"),T="cssText",C="href",S="http-equiv",w="innerHTML",k="itemprop",E="name",A="property",j="rel",x="src",P="target",I={accesskey:"accessKey",charset:"charSet",class:"className",contenteditable:"contentEditable",contextmenu:"contextMenu","http-equiv":"httpEquiv",itemprop:"itemProp",tabindex:"tabIndex"},B="defaultTitle",L="defer",D="encodeSpecialCharacters",N="onChangeClientState",_="titleTemplate",R=Object.keys(I).reduce((function(e,t){return e[I[t]]=t,e}),{}),M=[O.NOSCRIPT,O.SCRIPT,O.STYLE],U="data-react-helmet",H="function"==typeof Symbol&&"symbol"==typeof Symbol.iterator?function(e){return typeof e}:function(e){return e&&"function"==typeof Symbol&&e.constructor===Symbol&&e!==Symbol.prototype?"symbol":typeof e},V=function(){function e(e,t){for(var n=0;n<t.length;n++){var r=t[n];r.enumerable=r.enumerable||!1,r.configurable=!0,"value"in r&&(r.writable=!0),Object.defineProperty(e,r.key,r)}}return function(t,n,r){return n&&e(t.prototype,n),r&&e(t,r),t}}(),W=Object.assign||function(e){for(var t=1;t<arguments.length;t++){var n=arguments[t];for(var r in n)Object.prototype.hasOwnProperty.call(n,r)&&(e[r]=n[r])}return e},Y=function(e,t){var n={};for(var r in e)t.indexOf(r)>=0||Object.prototype.hasOwnProperty.call(e,r)&&(n[r]=e[r]);return n},q=function(e){return!1===(!(arguments.length>1&&void 0!==arguments[1])||arguments[1])?String(e):String(e).replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;").replace(/"/g,"&quot;").replace(/'/g,"&#x27;")},F=function(e){var t=Z(e,O.TITLE),n=Z(e,_);if(n&&t)return n.replace(/%s/g,(function(){return Array.isArray(t)?t.join(""):t}));var r=Z(e,B);return t||r||void 0},K=function(e){return Z(e,N)||function(){}},z=function(e,t){return t.filter((function(t){return void 0!==t[e]})).map((function(t){return t[e]})).reduce((function(e,t){return W({},e,t)}),{})},J=function(e,t){return t.filter((function(e){return void 0!==e[O.BASE]})).map((function(e){return e[O.BASE]})).reverse().reduce((function(t,n){if(!t.length)for(var r=Object.keys(n),o=0;o<r.length;o++){var i=r[o].toLowerCase();if(-1!==e.indexOf(i)&&n[i])return t.concat(n)}return t}),[])},X=function(e,t,n){var r={};return n.filter((function(t){return!!Array.isArray(t[e])||(void 0!==t[e]&&te("Helmet: "+e+' should be of type "Array". Instead found type "'+H(t[e])+'"'),!1)})).map((function(t){return t[e]})).reverse().reduce((function(e,n){var o={};n.filter((function(e){for(var n=void 0,i=Object.keys(e),c=0;c<i.length;c++){var a=i[c],u=a.toLowerCase();-1===t.indexOf(u)||n===j&&"canonical"===e[n].toLowerCase()||u===j&&"stylesheet"===e[u].toLowerCase()||(n=u),-1===t.indexOf(a)||a!==w&&a!==T&&a!==k||(n=a)}if(!n||!e[n])return!1;var s=e[n].toLowerCase();return r[n]||(r[n]={}),o[n]||(o[n]={}),!r[n][s]&&(o[n][s]=!0,!0)})).reverse().forEach((function(t){return e.push(t)}));for(var i=Object.keys(o),c=0;c<i.length;c++){var a=i[c],u=b()({},r[a],o[a]);r[a]=u}return e}),[]).reverse()},Z=function(e,t){for(var n=e.length-1;n>=0;n--){var r=e[n];if(r.hasOwnProperty(t))return r[t]}return null},$=(r=Date.now(),function(e){var t=Date.now();t-r>16?(r=t,e(t)):setTimeout((function(){$(e)}),0)}),Q=function(e){return clearTimeout(e)},G="undefined"!=typeof window?window.requestAnimationFrame&&window.requestAnimationFrame.bind(window)||window.webkitRequestAnimationFrame||window.mozRequestAnimationFrame||$:n.g.requestAnimationFrame||$,ee="undefined"!=typeof window?window.cancelAnimationFrame||window.webkitCancelAnimationFrame||window.mozCancelAnimationFrame||Q:n.g.cancelAnimationFrame||Q,te=function(e){return console&&"function"==typeof console.warn&&console.warn(e)},ne=null,re=function(e,t){var n=e.baseTag,r=e.bodyAttributes,o=e.htmlAttributes,i=e.linkTags,c=e.metaTags,a=e.noscriptTags,u=e.onChangeClientState,s=e.scriptTags,l=e.styleTags,f=e.title,p=e.titleAttributes;ce(O.BODY,r),ce(O.HTML,o),ie(f,p);var d={baseTag:ae(O.BASE,n),linkTags:ae(O.LINK,i),metaTags:ae(O.META,c),noscriptTags:ae(O.NOSCRIPT,a),scriptTags:ae(O.SCRIPT,s),styleTags:ae(O.STYLE,l)},y={},b={};Object.keys(d).forEach((function(e){var t=d[e],n=t.newTags,r=t.oldTags;n.length&&(y[e]=n),r.length&&(b[e]=d[e].oldTags)})),t&&t(),u(e,y,b)},oe=function(e){return Array.isArray(e)?e.join(""):e},ie=function(e,t){void 0!==e&&document.title!==e&&(document.title=oe(e)),ce(O.TITLE,t)},ce=function(e,t){var n=document.getElementsByTagName(e)[0];if(n){for(var r=n.getAttribute(U),o=r?r.split(","):[],i=[].concat(o),c=Object.keys(t),a=0;a<c.length;a++){var u=c[a],s=t[u]||"";n.getAttribute(u)!==s&&n.setAttribute(u,s),-1===o.indexOf(u)&&o.push(u);var l=i.indexOf(u);-1!==l&&i.splice(l,1)}for(var f=i.length-1;f>=0;f--)n.removeAttribute(i[f]);o.length===i.length?n.removeAttribute(U):n.getAttribute(U)!==c.join(",")&&n.setAttribute(U,c.join(","))}},ae=function(e,t){var n=document.head||document.querySelector(O.HEAD),r=n.querySelectorAll(e+"["+U+"]"),o=Array.prototype.slice.call(r),i=[],c=void 0;return t&&t.length&&t.forEach((function(t){var n=document.createElement(e);for(var r in t)if(t.hasOwnProperty(r))if(r===w)n.innerHTML=t.innerHTML;else if(r===T)n.styleSheet?n.styleSheet.cssText=t.cssText:n.appendChild(document.createTextNode(t.cssText));else{var a=void 0===t[r]?"":t[r];n.setAttribute(r,a)}n.setAttribute(U,"true"),o.some((function(e,t){return c=t,n.isEqualNode(e)}))?o.splice(c,1):i.push(n)})),o.forEach((function(e){return e.parentNode.removeChild(e)})),i.forEach((function(e){return n.appendChild(e)})),{oldTags:o,newTags:i}},ue=function(e){return Object.keys(e).reduce((function(t,n){var r=void 0!==e[n]?n+'="'+e[n]+'"':""+n;return t?t+" "+r:r}),"")},se=function(e){var t=arguments.length>1&&void 0!==arguments[1]?arguments[1]:{};return Object.keys(e).reduce((function(t,n){return t[I[n]||n]=e[n],t}),t)},le=function(e,t,n){switch(e){case O.TITLE:return{toComponent:function(){return e=t.title,n=t.titleAttributes,(r={key:e})[U]=!0,o=se(n,r),[a.createElement(O.TITLE,o,e)];var e,n,r,o},toString:function(){return function(e,t,n,r){var o=ue(n),i=oe(t);return o?"<"+e+" "+U+'="true" '+o+">"+q(i,r)+"</"+e+">":"<"+e+" "+U+'="true">'+q(i,r)+"</"+e+">"}(e,t.title,t.titleAttributes,n)}};case h:case m:return{toComponent:function(){return se(t)},toString:function(){return ue(t)}};default:return{toComponent:function(){return function(e,t){return t.map((function(t,n){var r,o=((r={key:n})[U]=!0,r);return Object.keys(t).forEach((function(e){var n=I[e]||e;if(n===w||n===T){var r=t.innerHTML||t.cssText;o.dangerouslySetInnerHTML={__html:r}}else o[n]=t[e]})),a.createElement(e,o)}))}(e,t)},toString:function(){return function(e,t,n){return t.reduce((function(t,r){var o=Object.keys(r).filter((function(e){return!(e===w||e===T)})).reduce((function(e,t){var o=void 0===r[t]?t:t+'="'+q(r[t],n)+'"';return e?e+" "+o:o}),""),i=r.innerHTML||r.cssText||"",c=-1===M.indexOf(e);return t+"<"+e+" "+U+'="true" '+o+(c?"/>":">"+i+"</"+e+">")}),"")}(e,t,n)}}}},fe=function(e){var t=e.baseTag,n=e.bodyAttributes,r=e.encode,o=e.htmlAttributes,i=e.linkTags,c=e.metaTags,a=e.noscriptTags,u=e.scriptTags,s=e.styleTags,l=e.title,f=void 0===l?"":l,p=e.titleAttributes;return{base:le(O.BASE,t,r),bodyAttributes:le(h,n,r),htmlAttributes:le(m,o,r),link:le(O.LINK,i,r),meta:le(O.META,c,r),noscript:le(O.NOSCRIPT,a,r),script:le(O.SCRIPT,u,r),style:le(O.STYLE,s,r),title:le(O.TITLE,{title:f,titleAttributes:p},r)}},pe=f()((function(e){return{baseTag:J([C,P],e),bodyAttributes:z(h,e),defer:Z(e,L),encode:Z(e,D),htmlAttributes:z(m,e),linkTags:X(O.LINK,[j,C],e),metaTags:X(O.META,[E,g,S,A,k],e),noscriptTags:X(O.NOSCRIPT,[w],e),onChangeClientState:K(e),scriptTags:X(O.SCRIPT,[x,w],e),styleTags:X(O.STYLE,[T],e),title:F(e),titleAttributes:z(v,e)}}),(function(e){ne&&ee(ne),e.defer?ne=G((function(){re(e,(function(){ne=null}))})):(re(e),ne=null)}),fe)((function(){return null})),de=(o=pe,c=i=function(e){function t(){return function(e,t){if(!(e instanceof t))throw new TypeError("Cannot call a class as a function")}(this,t),function(e,t){if(!e)throw new ReferenceError("this hasn't been initialised - super() hasn't been called");return!t||"object"!=typeof t&&"function"!=typeof t?e:t}(this,e.apply(this,arguments))}return function(e,t){if("function"!=typeof t&&null!==t)throw new TypeError("Super expression must either be null or a function, not "+typeof t);e.prototype=Object.create(t&&t.prototype,{constructor:{value:e,enumerable:!1,writable:!0,configurable:!0}}),t&&(Object.setPrototypeOf?Object.setPrototypeOf(e,t):e.__proto__=t)}(t,e),t.prototype.shouldComponentUpdate=function(e){return!d()(this.props,e)},t.prototype.mapNestedChildrenToProps=function(e,t){if(!t)return null;switch(e.type){case O.SCRIPT:case O.NOSCRIPT:return{innerHTML:t};case O.STYLE:return{cssText:t}}throw new Error("<"+e.type+" /> elements are self-closing and can not contain children. Refer to our API for more information.")},t.prototype.flattenArrayTypeChildren=function(e){var t,n=e.child,r=e.arrayTypeChildren,o=e.newChildProps,i=e.nestedChildren;return W({},r,((t={})[n.type]=[].concat(r[n.type]||[],[W({},o,this.mapNestedChildrenToProps(n,i))]),t))},t.prototype.mapObjectTypeChildren=function(e){var t,n,r=e.child,o=e.newProps,i=e.newChildProps,c=e.nestedChildren;switch(r.type){case O.TITLE:return W({},o,((t={})[r.type]=c,t.titleAttributes=W({},i),t));case O.BODY:return W({},o,{bodyAttributes:W({},i)});case O.HTML:return W({},o,{htmlAttributes:W({},i)})}return W({},o,((n={})[r.type]=W({},i),n))},t.prototype.mapArrayTypeChildrenToProps=function(e,t){var n=W({},t);return Object.keys(e).forEach((function(t){var r;n=W({},n,((r={})[t]=e[t],r))})),n},t.prototype.warnOnInvalidChildren=function(e,t){return!0},t.prototype.mapChildrenToProps=function(e,t){var n=this,r={};return a.Children.forEach(e,(function(e){if(e&&e.props){var o=e.props,i=o.children,c=function(e){var t=arguments.length>1&&void 0!==arguments[1]?arguments[1]:{};return Object.keys(e).reduce((function(t,n){return t[R[n]||n]=e[n],t}),t)}(Y(o,["children"]));switch(n.warnOnInvalidChildren(e,i),e.type){case O.LINK:case O.META:case O.NOSCRIPT:case O.SCRIPT:case O.STYLE:r=n.flattenArrayTypeChildren({child:e,arrayTypeChildren:r,newChildProps:c,nestedChildren:i});break;default:t=n.mapObjectTypeChildren({child:e,newProps:t,newChildProps:c,nestedChildren:i})}}})),t=this.mapArrayTypeChildrenToProps(r,t)},t.prototype.render=function(){var e=this.props,t=e.children,n=Y(e,["children"]),r=W({},n);return t&&(r=this.mapChildrenToProps(t,r)),a.createElement(o,r)},V(t,null,[{key:"canUseDOM",set:function(e){o.canUseDOM=e}}]),t}(a.Component),i.propTypes={base:s().object,bodyAttributes:s().object,children:s().oneOfType([s().arrayOf(s().node),s().node]),defaultTitle:s().string,defer:s().bool,encodeSpecialCharacters:s().bool,htmlAttributes:s().object,link:s().arrayOf(s().object),meta:s().arrayOf(s().object),noscript:s().arrayOf(s().object),onChangeClientState:s().func,script:s().arrayOf(s().object),style:s().arrayOf(s().object),title:s().string,titleAttributes:s().object,titleTemplate:s().string},i.defaultProps={defer:!0,encodeSpecialCharacters:!0},i.peek=o.peek,i.rewind=function(){var e=o.rewind();return e||(e=fe({baseTag:[],bodyAttributes:{},encodeSpecialCharacters:!0,htmlAttributes:{},linkTags:[],metaTags:[],noscriptTags:[],scriptTags:[],styleTags:[],title:"",titleAttributes:{}})),e},c);de.renderStatic=de.rewind;var ye=de,be=n(1082);n(3720);var he=e=>{let t,{children:n,location:r}=e;return t=r&&"/"===r.pathname?a.createElement("div",null,n):a.createElement("div",{id:"wrapper",className:"page"},a.createElement("div",null,n)),a.createElement(be.StaticQuery,{query:"3649515864",render:e=>a.createElement(a.Fragment,null,a.createElement(ye,{title:e.site.siteMetadata.title,meta:[{name:"description",content:"Sample"},{name:"keywords",content:"sample, something"}]},a.createElement("html",{lang:"en"})),t)})}}}]);
//# sourceMappingURL=e50e9c162871c1d91fba5ce567a5656e16dc6783-8c77aea5201430d11e6f.js.map