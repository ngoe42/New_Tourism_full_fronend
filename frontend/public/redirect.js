(function() {
  var host = window.location.hostname;
  var path = window.location.pathname;
  var search = window.location.search;
  var prodHost = 'nelsontoursandsafaris.com';
  var isProduction = host === prodHost || host === 'www.' + prodHost;
  var isRailway = host.indexOf('.up.railway.app') !== -1;

  // Localhost / LAN / self-hosted hosts: never redirect.
  if (!isProduction && !isRailway) {
    return;
  }

  var url = 'https://' + prodHost;

  if (isRailway) {
    window.location.replace(url + path + search);
    return;
  }

  if (host === 'www.' + prodHost) {
    window.location.replace(url + path + search);
    return;
  }

  if (path !== path.toLowerCase()) {
    window.location.replace(url + path.toLowerCase() + search);
    return;
  }

  if (path.length > 1 && path.endsWith('/')) {
    window.location.replace(url + path.replace(/\/+$/, '') + search);
    return;
  }
})();
