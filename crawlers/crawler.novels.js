/**
 * 爬虫青帝文学网小说.
 * http://m.qingdiba.com/
 * 2016年11月18日10:26:46
 */
var http     = require('http');
var cheerio  = require('cheerio');
var async    = require('async');
var schedule = require("node-schedule");
var request  = require('request');
var ut       = require('../utiles/crawler.common.js')

console.log('爬取小说开始!')
schedule.scheduleJob("*/10 * * * * *", function(){
console.log('66666');
  get_novel_data();
});


function get_novel_data(){
  var prefix_url = `http://m.qingdiba.com`;
  //强推小说-数据存放
  var host_novels = [];
  //玄幻奇幻-数据存放
  var fantasy_novels = [];
  //武侠仙侠-数据存放
  var swordsman_novels = [];
  //都市言情-数据存放
  var romantic_novels = [];
  //历史军事-数据存放
  var history_novels = [];

  var task = [];
  task.push(function(callback){
    var url = `http://m.qingdiba.com/`;
    ut.getHTML(url, function(err, html){
      if(err) return callback(err);
      if(!html) return callback('抓取首页失败!');
      var $ = cheerio.load(html);
      //强推小说
      var host_lists = $(".hot_sale").toArray();
      host_lists.forEach(function(host_list, index){
        var host_object = {};
        var host_url = prefix_url + $(host_list).find('a').attr('href');
        host_object.host_url = host_url;

        var host_title = $($(host_list).find('a').find('p')[0]).text();
        host_object.host_title = host_title;

        var host_author = $($(host_list).find('a').find('p')[1]).text();
        host_object.host_author = host_author;

        var host_review =  $($(host_list).find('a').find('p')[2]).text();
        host_object.host_review = host_review.replace(/\r\n/,'');
        host_novels.push(host_object);
      })

      //玄幻奇幻,武侠仙侠,都市言情,历史军事
      var all_lists = $(".index_sort1").toArray();
      //玄幻奇幻
      var fantasy_lists = [];
      //武侠仙侠
      var swordsman_lists = [];
      //都市言情
      var romantic_lists = [];
      //历史军事
      var history_lists = [];
      all_lists.forEach(function(all_list, index){
        var a_list = $(all_list).find('li').toArray();
        if(index == 0){   //玄幻奇幻
          fantasy_lists = a_list;
        }else if(index == 1){ //武侠仙侠
          swordsman_lists = a_list;
        }else if(index == 2){ //都市言情
          romantic_lists = a_list;
        }else if(index == 3){ //历史军事
          history_lists = a_list;
        }
      })

      fantasy_lists.forEach(function(fantasy_list, index){
        if(index%2==0){
          var fantasy_object = {};
          var fantasy_url = prefix_url + $(fantasy_list).find('a').attr('href');
          fantasy_object.fantasy_url = fantasy_url;

          var fantasy_title = $($(fantasy_list).find('a').find('.title')[0]).text();
          fantasy_object.fantasy_title = fantasy_title;

          var fantasy_sort = $($(fantasy_list).find('a').find('.sort')[0]).text();
          fantasy_object.fantasy_sort = fantasy_sort;
          fantasy_novels.push(fantasy_object);
        }
      })

      swordsman_lists.forEach(function(swordsman_list, index){
        if(index%2==0){
          var swordsman_object = {};
          var swordsman_url = prefix_url + $(swordsman_list).find('a').attr('href');
          swordsman_object.swordsman_url = swordsman_url;

          var swordsman_title = $($(swordsman_list).find('a').find('.title')[0]).text();
          swordsman_object.swordsman_title = swordsman_title;

          var swordsman_sort = $($(swordsman_list).find('a').find('.sort')[0]).text();
          swordsman_object.swordsman_sort = swordsman_sort;
          swordsman_novels.push(swordsman_object);
        }
      })

      romantic_lists.forEach(function(romantic_list, index){
        if(index%2==0){
          var romantic_object = {};
          var romantic_url = prefix_url + $(romantic_list).find('a').attr('href');
          romantic_object.romantic_url = romantic_url;

          var romantic_title = $($(romantic_list).find('a').find('.title')[0]).text();
          romantic_object.romantic_title = romantic_title;

          var romantic_sort = $($(romantic_list).find('a').find('.sort')[0]).text();
          romantic_object.romantic_sort = romantic_sort;
          romantic_novels.push(romantic_object);
        }
      })

      history_lists.forEach(function(history_list, index){
        if(index%2==0){
          var history_object = {};
          var history_url = prefix_url + $(history_list).find('a').attr('href');
          history_object.history_url = history_url;

          var history_title = $($(history_list).find('a').find('.title')[0]).text();
          history_object.history_title = history_title;

          var history_sort = $($(history_list).find('a').find('.sort')[0]).text();
          history_object.history_sort = history_sort;
          history_novels.push(history_object);
        }
      })
      // console.log("host_novels",host_novels);
      // console.log("fantasy_novels",fantasy_novels);
      // console.log("swordsman_novels",swordsman_novels);
      // console.log("romantic_novels",romantic_novels);
      // console.log("history_novels",history_novels);
      callback(null);
    })
  })
  async.waterfall(task, function(err, result){
    if(err) return console.log(err);
    console.log('全部抓取成功');
  })
}


function request_html(url, callback){

  var options = {
    url: url,
    headers: {
      'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/54.0.2840.87 Safari/537.36'
    }
  };
  request(options, function(error, response, body) {
    if(error) return callback(error, null);
    if(response.statusCode != 200) return callback("statusCode"+response.statusCode, null);
    callback(null, body);
  });
}

function request_json(url, callback){

  var options = {
    url: url,
    json:true,
    method : 'GET',
    headers: {
      'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/54.0.2840.87 Safari/537.36',
      'X-Requested-With':'XMLHttpRequest'
    }
  };
  request(options, function(error, response, body) {
    if(error) return callback(error, null);
    if(response.statusCode != 200) return callback("statusCode"+response.statusCode, null);
    //console.log(response)
    callback(null, body);
  });
}