// 用户自定义的页面加载完成后的页面
var InitPage = (function ($, window, undefined) {
  var InitPage = function (dispatcher) {
    var fileName = ''; // 文件名称
    var javaAPI = ''; // java后端地址
    var pythonAPI = ''; // python后端地址
    var markAPI = ''; // python后端地址
    var fileId = ''; // 文件ID
    var bratPath = ''; // 当前kipd 的绝对地址

    /**
     * 1. 自动登录
     * */
    var autoLogin = function () {
      $('#auth_user').val('brat');
      $('#auth_pass').val('brat');
      $("#auth_form-ok").trigger("click");
      var search = window.location.href.split('?')[1];
      if (search) {
        var paramArr = search.split('&');
        fileName = window.location.href.split('#/kipf/')[1].split('?')[0];// 文件名字md5编码过后
        var canDecodeName = paramArr[0].split('=')[1];// java地址
        javaAPI = paramArr[1].split('=')[1];// java地址
        pythonAPI = paramArr[2].split('=')[1];// python 地址
        markAPI = paramArr[3].split('=')[1];// 自动标注开关
        fileId = paramArr[4].split('=')[1];// 文件ID
        let path = paramArr[5].split('=')[1];// 绝对路径
        bratPath = `${window.location.hostname}:${path}/`
        // bratPath = `10.201.82.253:${path}/`

        canDecodeName && $("#brat-file-title").html(decodeBratName(canDecodeName));  // 数据解码【解决中文乱码问题】
      }
    };

    /**
     * 2. 右上角的标准开关事件绑定，保存标注事件绑定
     * */
    var topMenuEvent = function () {
      /**
       *  2.1. 预标注开关切换事件
       *  */
      $("#brat-mark-switch").on('click', function () {
        changeCustomSpinner(true);
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
        if (open) {
          /** 打开预标注文档 */
          $.ajax({
            url: markAPI + 'entity_relation_extraction',
            type: 'POST',
            headers: {
              'Accept': 'application/json, text/plain, */*'
            },
            dataType: "JSON",
            contentType: 'application/json;charset=UTF-8',
            processData: false,
            data: JSON.stringify({
              input_path: bratPath + fileName + '.txt',
              output_path: bratPath
            }),
            success: function (response) {
              if (response.errorCode !== 200) {
                dispatcher.post('messages', [[[response.message, 'error']]]);
              } else {
                let dateStr = DateFormat(new Date(), "yyyy年MM月dd日 hh时mm分ss秒");
                $("#footer-update-time").html('最新修改时间：' + dateStr)
                dispatcher.post('reloadAllConfig');
              }
              changeCustomSpinner(false);
            },
            error: function (response, textStatus, errorThrown) {
              dispatcher.post('messages', [[[response.message, 'error']]]);
              changeCustomSpinner(false);
            }
          });
        } else {
          $.ajax({
            url: javaAPI + '/api/kipf/service/business/bratservice/brat/document/v2.1.0',
            type: 'DELETE',
            headers: {
              'Accept': 'application/json, text/plain, */*'
            },
            dataType: "JSON",
            contentType: 'application/json;charset=UTF-8',
            processData: false,
            data: JSON.stringify({
              "id": "",
              "date": "1988-10-25",
              "data": fileName
            }),
            success: function (response) {
              if (response.errorCode !== 200) {
                dispatcher.post('messages', [[[response.message, 'error']]]);
              } else {
                $("#footer-update-time").html('文档尚未标注')
                dispatcher.post('reloadAllConfig');
                dispatcher.post('messages', [[['清空成功', 'comment']]]);
              }
              changeCustomSpinner(false);
            },
            error: function (response, textStatus, errorThrown) {
              dispatcher.post('messages', [[[response.message, 'error']]]);
              changeCustomSpinner(false);
            }
          });
        }

      });

      /**
       * 2.2. 保存标注点击事件
       * */
      $("#save-mark-btn").on('click', function () {
        changeCustomSpinner(true);
        let nowTime = new Date();
        let dateStr = DateFormat(nowTime, "yyyy年MM月dd日 hh时mm分ss秒");
        $("#footer-update-time").html('最新修改时间：' + dateStr)

        /**
         * 先调取java 保存标注接口，成功后调用python的接口
         */
        $.ajax({
          url: javaAPI + '/api/kipf/service/business/bratservice/brat/import/v2.1.0/',
          type: 'POST',
          headers: {
            'Accept': 'application/json, text/plain, */*'
          },
          dataType: "JSON",
          contentType: 'application/json;charset=UTF-8',
          processData: false,
          data: JSON.stringify({
            "id": "",
            "date": DateFormat(nowTime),
            "data": fileName
          }),
          success: function (response) {
            // 调用python保存标注接口
            $.ajax({
              url: pythonAPI + 'save_ann_time',
              type: 'POST',
              headers: {
                'Accept': 'application/json, text/plain, */*'
              },
              dataType: "JSON",
              contentType: 'application/json;charset=UTF-8',
              processData: false,
              data: JSON.stringify({
                nowTime: DateFormat(nowTime),
                fileId: fileId
              }),
              success: function (response) {
                dispatcher.post('messages', [[['保存成功', 'comment']]]);
                changeCustomSpinner(false);
              },
              error: function (response, textStatus, errorThrown) {
                dispatcher.post('messages', [[[response.message, 'error']]]);
                changeCustomSpinner(false);
              }
            });
          },
          error: function (response, textStatus, errorThrown) {
            dispatcher.post('messages', [[[response.message, 'error']]]);
            changeCustomSpinner(false);
          }
        });
      });

      /**
       * 2.3. 格式当前时间为年月日
       */
      var DateFormat = function (time, fmt = 'yyyy-MM-dd hh:mm:ss') {
        if (!time) {
          return ''
        }
        let date = new Date(time); //转化为时间对象
        var o = {
          "M+": date.getMonth() + 1, //月份
          "d+": date.getDate(), //日
          "h+": date.getHours(), //小时
          "m+": date.getMinutes(), //分
          "s+": date.getSeconds(), //秒
          "q+": Math.floor((date.getMonth() + 3) / 3), //季度
          "S": date.getMilliseconds() //毫秒
        };
        if (/(y+)/.test(fmt))
          fmt = fmt.replace(RegExp.$1, (date.getFullYear() + "").substr(4 - RegExp.$1.length));
        for (var k in o) {
          if (new RegExp("(" + k + ")").test(fmt)) {
            fmt = fmt.replace(RegExp.$1, (RegExp.$1.length == 1) ? (o[k]) : (("00" + o[k]).substr(("" + o[k]).length)));
          }
        }
        return fmt;
      }

      // 关闭加载对话框
      setTimeout(function () {
        changeCustomSpinner(false);
      }, 2000);

    };

    /**
     * 3. 自定义加载进度蒙层
     */
    var changeCustomSpinner = function (status) {
      status ? $('#custom-spinner').show() : $('#custom-spinner').hide()
    }

    /**
     * 将转换过后的名称逆向解码
     */
    var decodeBratName = function (bratName) {
      return bratName && decodeURIComponent(bratName.replace(/\$/g, '%'))
    }

    dispatcher.on('autoLogin', autoLogin).on('topMenuEvent', topMenuEvent);
  };

  return InitPage;
})(jQuery, window);
