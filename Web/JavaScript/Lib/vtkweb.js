/**
 * vtkWeb JavaScript Library.
 *
 * This main module just gathers all the modules into a single namespace.
 *
 * This module registers itself as: 'vtkweb-base'
 *
 * @class vtkWeb
 *
 * @mixins vtkWeb.launcher
 * @mixins vtkWeb.connect
 * @mixins vtkWeb.viewport
 * @mixins vtkWeb.viewport.image
 * @mixins vtkWeb.viewport.webgl
 *
 * @singleton
 */
(function (GLOBAL, $) {

    // VERSION field that store the current version of the library.
    // WampSessions field used to store a map of the active sessions
    // Default Viewport options values
    var VERSION = "2.0.0",
    fallBackStorage = {},
    isMobile = (function(a){
        return (/android.+mobile|avantgo|bada\/|blackberry|blazer|compal|elaine|fennec|hiptop|iemobile|ip(hone|od)|iris|kindle|lge |maemo|midp|mmp|netfront|opera m(ob|in)i|palm( os)?|phone|p(ixi|re)\/|plucker|pocket|psp|symbian|treo|up\.(browser|link)|vodafone|wap|windows (ce|phone)|xda|xiino/i).test(a)||/1207|6310|6590|3gso|4thp|50[1-6]i|770s|802s|a wa|abac|ac(er|oo|s\-)|ai(ko|rn)|al(av|ca|co)|amoi|an(ex|ny|yw)|aptu|ar(ch|go)|as(te|us)|attw|au(di|\-m|r |s )|avan|be(ck|ll|nq)|bi(lb|rd)|bl(ac|az)|br(e|v)w|bumb|bw\-(n|u)|c55\/|capi|ccwa|cdm\-|cell|chtm|cldc|cmd\-|co(mp|nd)|craw|da(it|ll|ng)|dbte|dc\-s|devi|dica|dmob|do(c|p)o|ds(12|\-d)|el(49|ai)|em(l2|ul)|er(ic|k0)|esl8|ez([4-7]0|os|wa|ze)|fetc|fly(\-|_)|g1 u|g560|gene|gf\-5|g\-mo|go(\.w|od)|gr(ad|un)|haie|hcit|hd\-(m|p|t)|hei\-|hi(pt|ta)|hp( i|ip)|hs\-c|ht(c(\-| |_|a|g|p|s|t)|tp)|hu(aw|tc)|i\-(20|go|ma)|i230|iac( |\-|\/)|ibro|idea|ig01|ikom|im1k|inno|ipaq|iris|ja(t|v)a|jbro|jemu|jigs|kddi|keji|kgt( |\/)|klon|kpt |kwc\-|kyo(c|k)|le(no|xi)|lg( g|\/(k|l|u)|50|54|e\-|e\/|\-[a-w])|libw|lynx|m1\-w|m3ga|m50\/|ma(te|ui|xo)|mc(01|21|ca)|m\-cr|me(di|rc|ri)|mi(o8|oa|ts)|mmef|mo(01|02|bi|de|do|t(\-| |o|v)|zz)|mt(50|p1|v )|mwbp|mywa|n10[0-2]|n20[2-3]|n30(0|2)|n50(0|2|5)|n7(0(0|1)|10)|ne((c|m)\-|on|tf|wf|wg|wt)|nok(6|i)|nzph|o2im|op(ti|wv)|oran|owg1|p800|pan(a|d|t)|pdxg|pg(13|\-([1-8]|c))|phil|pire|pl(ay|uc)|pn\-2|po(ck|rt|se)|prox|psio|pt\-g|qa\-a|qc(07|12|21|32|60|\-[2-7]|i\-)|qtek|r380|r600|raks|rim9|ro(ve|zo)|s55\/|sa(ge|ma|mm|ms|ny|va)|sc(01|h\-|oo|p\-)|sdk\/|se(c(\-|0|1)|47|mc|nd|ri)|sgh\-|shar|sie(\-|m)|sk\-0|sl(45|id)|sm(al|ar|b3|it|t5)|so(ft|ny)|sp(01|h\-|v\-|v )|sy(01|mb)|t2(18|50)|t6(00|10|18)|ta(gt|lk)|tcl\-|tdg\-|tel(i|m)|tim\-|t\-mo|to(pl|sh)|ts(70|m\-|m3|m5)|tx\-9|up(\.b|g1|si)|utst|v400|v750|veri|vi(rg|te)|vk(40|5[0-3]|\-v)|vm40|voda|vulc|vx(52|53|60|61|70|80|81|83|85|98)|w3c(\-| )|webc|whit|wi(g |nc|nw)|wmlb|wonu|x700|xda(\-|2|g)|yas\-|your|zeto|zte\-/i.test(a.substr(0,4));
    })(navigator.userAgent||navigator.vendor||window.opera), module = {}, registeredModules = [];

    // ----------------------------------------------------------------------

    extractURLParameters = function() {
        var data = location.search.substr(1).split("&"), parameters = {};
        for(var i=0; i<data.length; i++) {
            var item = data[i].split("=");
            parameters[item[0]] = item[1];
        }
        return parameters;
    }

    // ----------------------------------------------------------------------

    isSecured = function() {
        return location.protocol === 'https';
    }

    // ----------------------------------------------------------------------

    udpateConnectionFromURL = function(connection) {
        var params = extractURLParameters();
        for(var key in params) {
            connection[key] = decodeURIComponent(params[key]);
        }
    }

    supportsLocalStorage = function() {
        try {
            return 'localStorage' in window && window['localStorage'] !== null;
        } catch(e) {
            return false;
        }
    }

    storeApplicationDataObject = function(key, jsonObj) {
        var storage = fallBackStorage;
        if (supportsLocalStorage()) {
            storage = localStorage;
        }
        storage[key] = JSON.stringify(jsonObj);
    }

    retrieveApplicationDataObject = function(key) {
        var storage = fallBackStorage;
        if (supportsLocalStorage()) {
            storage = localStorage;
        }
        var storedData = storage[key];
        if (storedData) {
            try {
                return JSON.parse(storedData);
            } catch(e) {
                console.error('Failed to parse stored data object as JSON: '+ storedData);
                console.error(e);
            }
        }
        return {};  // if not supported, we could store in a map in vtkweb
    }

    // ----------------------------------------------------------------------
    // Init vtkWeb module if needed
    // ----------------------------------------------------------------------
    if (GLOBAL.hasOwnProperty("vtkWeb")) {
        module = GLOBAL.vtkWeb || {};
    } else {
        GLOBAL.vtkWeb = module;
    }

    // ----------------------------------------------------------------------
    // Export internal methods to the vtkWeb module
    // ----------------------------------------------------------------------
    module.version = VERSION;
    module.isMobile = isMobile;
    module.extractURLParameters = extractURLParameters;
    module.udpateConnectionFromURL = udpateConnectionFromURL;
    module.supportsLocalStorage = supportsLocalStorage;
    module.storeApplicationDataObject = storeApplicationDataObject;
    module.retrieveApplicationDataObject = retrieveApplicationDataObject;
    module.properties = {
        'sessionManagerURL': location.protocol + "//" + location.hostname + ":" + location.port + "/paraview/",
        'sessionURL': (isSecured() ? "wss" : "ws") + "://" + location.hostname + ":" + location.port + "/ws"
    };
    module.NoOp = function() {};
    module.errorCallback = function(code, reason) {
        alert(reason);
        GLOBAL.close();
    }

    // ----------------------------------------------------------------------
    // Module registration hooks.
    // ----------------------------------------------------------------------

    /**
     * Javascript libraries can call this function to register themselves.
     *
     * @member vtkWeb
     * @method registerModule
     *
     * @param {String} The module name to use when registering a module.
     *
     */
    module.registerModule = function(moduleName) {
      if (module.modulePresent(moduleName) === false) {
        registeredModules.push(moduleName);
      }
    };

    /**
     * Javascript libraries call this function to determine whether a
     * particular module is loaded.
     *
     * @member vtkWeb
     * @method modulePresent
     *
     * @param {String} The name of the module name to check.
     *
     * @return {Boolean} True if the module specified by the given name
     * is registered, false otherwise.
     */
    module.modulePresent = function(moduleName) {
      for (var i = 0; i < registeredModules.length; ++i) {
        if (moduleName === registeredModules[i]) {
          return true;
        }
      }
      return false;
    };

    /**
     * Javascript libraries call this function to determine whether an
     * entire list of modules is loaded.
     *
     * @member vtkWeb
     * @method allModulesPresent
     *
     * @param {Array} An array of module names to check.
     *
     * @return {Boolean} True if all modules names supplied are registered,
     * false otherwise.
     */
    module.allModulesPresent = function(moduleNameList) {
      if (! moduleNameList instanceof Array) {
        throw "allModulesPresent() takes an array, passed " + typeof(moduleNameList);
      }

      for (var i = 0; i < moduleNameList.length; ++i) {
        if (module.modulePresent(moduleNameList[i]) === false) {
          return false;
        }
      }

      return true;
    }

    /**
     * Javascript libraries call this function to get a list of the
     * currently registered modules.
     *
     * @member vtkWeb
     * @method getRegisteredModules
     *
     * @return {Array} An array of the registered module names.
     */
    module.getRegisteredModules = function() {
      return registeredModules;
    };

    // ----------------------------------------------------------------------
    // Local module registration
    // ----------------------------------------------------------------------
    try {
      // Tests for presence of jQuery, then registers this module
      if ($ !== undefined) {
        module.registerModule('vtkweb-base');
      } else {
        console.error('Module failed to register, jQuery is missing: ' + err.message);
      }
    } catch(err) {
      console.error('Caught exception while registering module: ' + err.message);
    }

}(window, jQuery));
