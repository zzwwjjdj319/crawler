/* 
 全局的工具函数库
 包含以下函数：
 -- url字符串处理函数：获取请求参数，删除请求参数；
 -- 当前页面的微信分享地址生成；
 -- 当前时间的格式化字符串；
 -- 生成随机整数
 */

var http = require("http");
var urltool = require('url');
var fs = require('fs');
var request = require('request');
var path = require('path');

var Ut = {
    /*
    从当前页面url中解析请求参数
    示例： var radioid = Ut.QueryString("radioid");
    */
    queryString: function (key) {
        return (document.location.search.match(new RegExp("(?:^\\?|&)" + key + "=(.*?)(?=&|$)")) || ['', null])[1];
    },

    /*
    删除url中包含的某个请求参数
    示例： var href = Ut.deleteParam(href, 'openid');
    */
    deleteParam: function (url, name) {
        var i = url;
        var reg = new RegExp("([&\?]?)" + name + "=[^&]+(&?)", "g");

        var newUrl = i.replace(reg, function (a, b, c) {
            if (c.length === 0) {
                return '';
            } else {
                return b;
            }
        });
        return newUrl;
    },

    /*
    从当前页面url地址中去除openid，comopenid参数，生成用于微信分享的地址
    示例： var share_url = Ut.genShareUrl();
    */
    genShareUrl: function () {
        var href = document.location.href;

        href = Ut.deleteParam(href, 'openid');
        href = Ut.deleteParam(href, 'comopenid');

        return href;
    },

    /*
    生成格式化的当前时间: yyyy-MM-dd HH:mm:ss
    示例： var str = Ut.now();
    */
    now: function () {
        return Ut.fmtDate(new Date());
    },

    /** 将Date格式的时间，转换为格式化的字符串：yyyy-MM-dd HH:mm:ss
    * @param {Date} date
    */
    fmtDate: function (date) {
        // 将数字格式化为两位长度的字符串
        var fmtTwo = function (number) {
            return (number < 10 ? '0' : '') + number;
        };

        var yyyy = date.getFullYear();
        var MM = fmtTwo(date.getMonth() + 1);
        var dd = fmtTwo(date.getDate());

        var HH = fmtTwo(date.getHours());
        var mm = fmtTwo(date.getMinutes());
        var ss = fmtTwo(date.getSeconds());

        return '' + yyyy + '-' + MM + '-' + dd + ' ' + HH + ':' + mm + ':' + ss;
    },

    // 生成格式化的当天日期： yyyyMMdd
    today: function () {
        // 将数字格式化为两位长度的字符串
        var fmtTwo = function (number) {
            return (number < 10 ? '0' : '') + number;
        };

        var date = new Date();

        var yyyy = date.getFullYear();
        var MM = fmtTwo(date.getMonth() + 1);
        var dd = fmtTwo(date.getDate());

        return yyyy + MM + dd;
    },
    
    // 获取当前时间的Unix时间戳
    NowForUnix: function () {
        return Math.round(new Date().getTime() / 1000);
    },

    /** 
    * 生成一个 1 ~ K 的随机数
    * @param {number} K 请求地址
    * @returns {number} 
    */
    random: function (K) {
        return Math.ceil(Math.random() * K);
    },

    /**
    * 从某个url地址获取html代码,返回html callback(err, html)
    * @param {string} url 请求地址
    * @param {function} next 回调函数，callback(err, html); 
    * 
    **/
    getHTML: function(url, next){
      http.get(url, function (result) {
          var html = '';

          result.setEncoding('utf8');

          result.on('data', function (chunk) {
            html += chunk;
          });

          result.on('end', function () {
            next(null, html);
          });

        }).on('error', function (e) {
          console.log("Got error: " + e.message);
          next(e.message, null);
        });
    },

    /**
    * 从某个url地址获取json数据，返回数据 callback(err, json)
    * @param {string} url 请求地址
    * @param {function} next 回调函数，callback(err, json); 
    **/
    getJSON: function (url, next) {
        http.get(url, function (res) {
            var data = '';

            res.setEncoding('utf8');

            res.on('data', function (chunk) {
                data += chunk;
            });

            res.on('end', function () {
                var obj = null;

                try {
                    obj = JSON.parse(data);
                }
                catch (e) {
                    console.log('postJSON 返回json异常: ' + data);
                    next('返回的JSON数据格式异常: ' + e.message);
                    return;
                }

                if (obj.errmsg) {
                  next(obj.errmsg);
                }
                else {
                    next(null, obj);
                }
            });
        }).on('error', function (err) {
          
            next(err, null);
        });
    },

    /**
    * 向某个url地址post发送json数据，返回数据 callback(err, json)
    * @param {string} url 请求地址
    * @param {string} postData 请求地址
    * @param {function} next 回调函数，callback(err, json); 
    **/
    postJSON: function (url, postData, next) {
        var url_info = urltool.parse(url);
        var options = {
            hostname: url_info.hostname,
            port: url_info.port,
            path: url_info.path,
            method: 'POST',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded;charset=utf-8',
                'Content-Length': Buffer.byteLength(postData, 'utf8')
            }
        };

        var req = http.request(options, function (res) {
            var data = '';

            res.setEncoding('utf8');

            res.on('data', function (chunk) {
                data += chunk;
            });

            res.on('end', function () {
                var obj = null;

                try {
                    obj = JSON.parse(data);
                }
                catch (e) {
                    console.log('postJSON 返回json异常: ' + data);
                    next('返回的JSON数据格式异常: ' + e.message);
                    return;
                }

                if (obj.errmsg && obj.errmsg != 'ok') {
                    next(obj.errmsg);
                }
                else {
                    next(null, obj);
                }
            });
        });

        req.on('error', function (err) {
          
        });

        // write data to request body
        req.write(postData);
        req.end();
    },

    // 判断一个时间值是否过期（超过当前时间）
    isExpire: function (exp) {
        if (!exp) return true;

        var t1 = Number(exp);
        if (!t1) return true;

        return t1 < new Date().getTime();
    },

    // 数字格式化为两位小数的形式
    fmt2Decimal: function (x) {
        var f_x = parseFloat(x);
        if (isNaN(f_x)) {
            return 'Null';
        }
        f_x = Math.round(x * 100) / 100;
        var s_x = f_x.toString();
        var pos_decimal = s_x.indexOf('.');
        if (pos_decimal < 0) {
            pos_decimal = s_x.length;
            s_x += '.';
        }
        while (s_x.length <= pos_decimal + 2) {
            s_x += '0';
        }
        return s_x;
    },

    // 判断一个对象是否数组
    isArray: function (obj) {
        return Object.prototype.toString.call(obj) === '[object Array]';
    },
    
    //数组去重
    arrayUnique : function(arr){
        var result = [], hash = {};
        for (var i = 0, elem; (elem = arr[i]) != null; i++) {
        if (!hash[elem]) {
            result.push(elem);
            hash[elem] = true;
        }
        }
        return result;
    }
};

module.exports = Ut;
