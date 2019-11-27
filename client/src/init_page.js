// 用户自定义的页面加载完成后的页面
var InitPage = (function ($, window, undefined) {
  var InitPage = function (dispatcher) {
    /* 自动登录 */
    var autoLogin = function () {
      $('#auth_user').val('brat');
      $('#auth_pass').val('brat');
      $("#auth_form-ok").trigger("click");
    };

    dispatcher.on('autoLogin', autoLogin);
  };

  return InitPage;
})(jQuery, window);
