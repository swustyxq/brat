// 用户自定义的页面加载完成后的页面
var InitPage = (function ($, window, undefined) {
  var InitPage = function (dispatcher) {
    /* 自动登录 */
    var autoLogin = function () {
      $('#auth_user').val('brat');
      $('#auth_pass').val('brat');
      $("#auth_form-ok").trigger("click");
    };

    /* 右上角的标准开关事件绑定 */
    var switchChange = function () {
      $("#brat-mark-switch").on('click', function () {
        var _this = $(this);
        var open = false
        if (this.className === 'switch-wrap-off switch-off') { // 打开自动标注
          open = true;
          _this.removeClass('switch-wrap-off switch-off').addClass("switch-wrap-on switch-on");
          _this.parent().removeClass('switch-wrap-off').addClass('switch-wrap-on');
        } else {
          _this.removeClass('switch-wrap-on switch-on').addClass("switch-wrap-off switch-off");
          _this.parent().removeClass('switch-wrap-on').addClass('switch-wrap-off')
        }
        console.log(open ? "打开标注" : "关闭标注")
      });
    };

    dispatcher.on('autoLogin', autoLogin).on('switchChange', switchChange);
  };

  return InitPage;
})(jQuery, window);
