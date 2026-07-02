(function() {
  var host = window.location.hostname;
  var path = window.location.pathname;
  var search = window.location.search;
  var url = 'https://nelsontoursandsafaris.com';

  if (host.indexOf('.up.railway.app') !== -1) {
    window.location.replace(url + path + search);
    return;
  }

  if (host === 'www.nelsontoursandsafaris.com') {
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
