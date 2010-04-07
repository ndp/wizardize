var BlueRidge = BlueRidge || {};

if (typeof BlueRidge.Browser === 'undefined') {

  BlueRidge.Browser = {
    requirements: [], // Queue of all required files and their options

    require: function(url, options) {
      BlueRidge.Browser.requirements.push({url:url, options: options});
    },

    processRequires: function(requirements) {
      requirements = requirements || this.requirements;
      if (requirements.length > 0) {
        var r = requirements.shift();
        var url = this.treatUrl(r.url, r.options && r.options["system"]);
        var onload = function() {
          if (r.options && r.options.onload) r.options.onload();
          BlueRidge.Browser.processRequires(requirements); // next one in queue
        };
        this.createScriptTag(url, onload);
      } else {
        // Done loading every requirement.
        $(Screw.start);
      }
    },

    treatUrl: function(url, relativeToBlueRidge) {
      return relativeToBlueRidge ? this.treatUrlAsRelativeToCurrentFile(url) : this.treatUrlAsRelativeToSpecFile(url);
    },

    treatUrlAsRelativeToSpecFile: function(url) {
      //remove any extra "../" from the start of the URL
      var prefix = "^";
      var depth = this.calculateDepth();
      for (var i = 0; i < (depth - 1); i++) {
        prefix += '../';
      }
      url = url.replace(new RegExp(prefix), "");
      return this.urlCorrection(depth) + url;
    },

    treatUrlAsRelativeToCurrentFile: function(url) {
      return this.urlCorrection(this.calculateDepth()) + url;
    },

    createScriptTag: function(url, onload) {
      var script = document.createElement("script");
      script.src = url;
      script.type = 'text/javascript';
      if (onload) {
        // Note different calling conventions between onload and onreadystatechange.
        script.onload = onload;
        script.onreadystatechange = function() {
          if (this.readyState == 'complete') script.onload();
        };
      }

      var head = document.getElementsByTagName("head")[0];
      head.appendChild(script);
    },

    urlCorrection: function(depth) {
      var correction = "";
      for (var i = 0; i < depth; i++) {
        correction += "../";
      }
      return correction;
    },

    debug: function(message) {
      document.writeln(message + " <br/>");
    },

    currentFile: function() {
      return window.location.toString();
    },

    deriveSpecNameFromCurrentFile: function() {
      return this.currentFile().match(/^.*fixtures\/(.*?)\.html/)[1] + "_spec.js";
    },

    calculateDepth: function() {
      var subDirs = this.currentFile().match(/^.*fixtures\/((.*?\/)*)(.*?)\.html/)[1];
      return subDirs.split("/").length;
    }
  };

  var require = function(url, options) {
    return BlueRidge.Browser.require(url, options);
  };
  var debug = function(message) {
    return BlueRidge.Browser.debug(message);
  };

  var BLUE_RIDGE_PREFIX = BLUE_RIDGE_PREFIX || "../../vendor/plugins/blue-ridge/";
  var BLUE_RIDGE_VENDOR_PREFIX = BLUE_RIDGE_PREFIX + "vendor/";

  require(BLUE_RIDGE_VENDOR_PREFIX + "jquery-1.4.2.js", {system: true});
  require(BLUE_RIDGE_VENDOR_PREFIX + "jquery.fn.js", {system: true});
  require(BLUE_RIDGE_VENDOR_PREFIX + "jquery.print.js", {system: true});
  // We remove Screw.start because it will be called too soon by webkit browsers. Call it explicitly
  // in processRequires (above), after all files are loaded.
  require(BLUE_RIDGE_VENDOR_PREFIX + "screw.builder.js", {system: true, onload: function() { $(window).unbind('load', Screw.start);}});
  require(BLUE_RIDGE_VENDOR_PREFIX + "screw.matchers.js", {system: true});
  require(BLUE_RIDGE_VENDOR_PREFIX + "screw.events.js", {system: true});
  require(BLUE_RIDGE_VENDOR_PREFIX + "screw.behaviors.js", {system: true});
  require(BLUE_RIDGE_VENDOR_PREFIX + "smoke.core.js", {system: true});
  require(BLUE_RIDGE_VENDOR_PREFIX + "smoke.mock.js", {system: true});
  require(BLUE_RIDGE_VENDOR_PREFIX + "smoke.stub.js", {system: true});
  require(BLUE_RIDGE_VENDOR_PREFIX + "screw.mocking.js", {system: true});
  require(BlueRidge.Browser.deriveSpecNameFromCurrentFile());
  BlueRidge.Browser.processRequires();
}
