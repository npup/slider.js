/*@req []
  @id host-test
  @descr isHostXXX tests á la David Mark
  @author petter.envall@gmail.com
  @version 0.1
*/
var hostTest;

(function () {
  var requirements = [];

  ("undefined" == typeof hostTest) && (hostTest = (function () {
    var typeExpr = /^(function|object)$/i;
    function isHostMethod(o, m) {
      var t = typeof o[m];
      return !!((typeExpr.test(t) && o[m]) || t == "unknown");
    }
    function isHostProp(o, p) {
      return !!(typeExpr.test(typeof o[p]) && o[p]);
    }

    // API
    return {
      "isHostMethod": isHostMethod
      , "isHostProp": isHostProp
    };
  }).apply(this, requirements));

})();

(function () {
  var toExport = {"hostTest": hostTest};
  (function() {
    var undefinedType = "undefined";
    if (undefinedType!=typeof module && undefinedType != typeof module.exports && "function" == typeof require) {
      for (var name in this) {exports[name] = this[name];}
    }
  }).call(toExport);
})();
