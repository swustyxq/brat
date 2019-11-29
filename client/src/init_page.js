// 用户自定义的页面加载完成后的页面
var InitPage = (function ($, window, undefined) {
  var InitPage = function (dispatcher) {
    /* 自动登录 */
    var autoLogin = function () {
      $('#auth_user').val('brat');
      $('#auth_pass').val('brat');
      $("#auth_form-ok").trigger("click");
      let search = window.location.href.split('?')[1];
      if (search) {
        let fileTitle = search.split('=')[1];
        // 数据解码【解决中文乱码问题】
        fileTitle && $("#brat-file-title").html(decodeURIComponent(fileTitle));
      }

    };

    /* 右上角的标准开关事件绑定，保存标注事件绑定 */
    var topMenuEvent = function () {
      /* 开关切换事件 */
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

      var DateFormat = function (date) {
        var month = date.getMonth() + 1 < 10 ? "0" + (date.getMonth() + 1) : date.getMonth() + 1;
        var currentDate = date.getDate() < 10 ? "0" + date.getDate() : date.getDate();
        var Hour = date.getHours() + 1 < 10 ? "0" + date.getHours() : date.getHours();
        var Min = date.getMinutes() + 1 < 10 ? "0" + date.getMinutes() : date.getMinutes();
        var Sen = date.getSeconds() + 1 < 10 ? "0" + date.getSeconds() : date.getSeconds();
        return `${date.getFullYear()}年${month}月${currentDate}日 ${Hour}时${Min}分${Sen}秒`;
      }

      /* 保存标注点击事件 */
      $("#save-mark-btn").on('click', function () {
        let dateStr = DateFormat(new Date())
        $("#footer-update-time").html('最新修改时间：'+ dateStr)
        console.log("点击保存标注")
      });
    };

    dispatcher.on('autoLogin', autoLogin).on('topMenuEvent', topMenuEvent);
  };

  return InitPage;
})(jQuery, window);
