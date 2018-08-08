            $(function(){
                
                var imgW = $('.shop-box .shop-item img').width();
                $('.shop-box .shop-item img').height(imgW + 'px');
                // 上下拉
                mui('body').on('tap','a',function(){document.location.href=this.href;});
                mui.init({
                    pullRefresh : {
                        container:'#pullrefresh',//待刷新区域标识，querySelector能定位的css选择器均可，比如：id、.class等
						// down : {
						// 	auto: false,
						// 	callback :pullfreshDown
						// },	
                        up : {
                            auto:false,
                            contentrefresh : "正在加载...",
                            contentnomore:'没有更多数据了',
                            callback :pullfreshUp 
                        }
                    }
                });


                // function pullfreshDown(){//下拉刷新
                //  console.log('down');
                //  console.log('up');
                    
                //  var data = {
                //  };
                //  downList();
                //  ajaxQuery('','post','json',data,downList);
                // };

                var ins = 2;
                function pullfreshUp(){//上拉加载
                    
                    var data = {
                        index:ins++,
                        size:36,
                    };

                    ajaxQuery('/guesslike/getgoods.html','post','json',data,upList);
                };
                
                // function downList(res){
                //  console.log('goolist');
                //  setTimeout(() => {
                //      mui("#pullrefresh").pullRefresh().endPulldownToRefresh(false);
                //  }, 1000);
                //  // if(res.msg.goods.length >0){
                //  //  mui("#pullrefresh").pullRefresh().endPullupToRefresh(false);
                //  // }else{
                //  //  mui("#pullrefresh").pullRefresh().endPullupToRefresh(true);
                //  // }
                // };
 
                function upList(res){

                    if(!res) {

                        mui("#pullrefresh").pullRefresh().endPullupToRefresh(true);
                        return false;
                    }
                    var html = '';
                    for(var i = 0; i < res.length; i++){

                        var itemHtml = '<a href="" class="shop-item" sku_id="'+ res[i].sku_id +'">'
                                 + '<img src="'+ res[i].logo_oss +'" alt="">'
                                 + '<p class="item-desc">'+ res[i].sku_name +'</p><p class="discount-tag">';

                                 if(res[i].promo_list){
                                    for(var p = 0; p < res[i].promo_list.length; p++) {
                                        if(p < 2){
                                            var promoList = res[i].promo_list[p];
                                            var disHtml = '<span class="discount-icon">'+ promoList.type_text +' </span>'
                                            itemHtml = itemHtml + disHtml;                                            
                                        }
                                    }
                                 }

                                 itemHtml = itemHtml + '</p><p class="item-price">￥<b>'+ res[i].act_price +'</b>';
                                 if(res[i].coin){
                                    itemHtml = itemHtml + '<span class="icon-star">+ '+ res[i].coin +' </span>';
                                 }

                                 itemHtml = itemHtml + '</p></a>'
                            html = html + itemHtml;
                    }
                    $('.shop-box').append(html);
                    mui("#pullrefresh").pullRefresh().endPullupToRefresh(false);

                    $('.shop-box .shop-item img').height(imgW + 'px');
                };
                
                //横向滚动
                $('.scroll-box').each(function(index,ele){
                    var slideItem = $(ele).find('.slide-item');
                    var slideBox = slideItem.closest('.slide-box');
                    var slideItemLen = slideItem.length;
                    slideBox.width(slideItemLen * slideItem.width() + 8*(slideItemLen));
                });
                
                mui('.scroll-box').scroll({
                    scrollY: false, //是否竖向滚动
                    scrollX: true, //是否横向滚动
                    deceleration:0.0006, //阻尼系数,系数越小滑动越灵敏
                    bounce: true //是否启用回弹
                });
                
                //回到顶部
                mui('.go-top').on('tap','img',function(){
                    mui('.mui-scroll-wrapper').scroll().scrollTo(0,0,1000);
                });

                //轮播图
                var mySwiper = new Swiper('.swiper-container', {
                    autoplay: 5000,//可选选项，自动滑动
                    pagination : '.swiper-pagination',
                    width : window.innerWidth,
                    loop : true,
                    autoplayDisableOnInteraction : false
                });
            });

            //ajax请求列表
            function ajaxQuery(url,type,dataType,data,successFn){
                $.ajax({
                    url: url,
                    type: type,
                    // contentType: "application/x-www-form-urlencoded",
                    dataType: dataType,
                    data: data,
                    success: function (res) {
                        successFn(res);
                    }
                })
            }

            //获取地址栏参数
            function GetQueryString(name) {
                var reg = new RegExp("(^|&)" + name + "=([^&]*)(&|$)");
                var r = window.location.search.substr(1).match(reg);
                if (r != null)return unescape(r[2]);
                return null;
            };

            //倒计时
            var timer = setInterval(function () {
                var endData = $('.count-down-txt .day').attr('data-date');
                shengyu(endData);
            }, 1000);
        
            function shengyu(endData) {
                if (!endData) {
                    return;
                }
                var data = new Date();
                var timeHtml = "";
                var year = endData.substr(0, 4);
                var month = endData.substr(5, 2);
                var day = endData.substr(8, 2);
                var time = endData.substr(11, 2);
                var second = endData.substr(14, 2);
                var branch = endData.substr(17, 2);
                var dateFinal = new Date(year, month - 1, day, time, second, branch);
                var dateSub = dateFinal - data;
                if (dateSub <= 0) {
                    location.reload();
                    return;
                }
                var day = hour = minute = second = hourBase = minuteBase = secondBase = 0;
                dayBase = 24 * 60 * 60 * 1000; //计算天数的基数，单位毫秒。1天等于24*60*60*1000毫秒
                hourBase = 60 * 60 * 1000; //计算小时的基数，单位毫秒。1小时等于60*60*1000毫秒
                minuteBase = 60 * 1000; //计算分钟的基数，单位毫秒。1分钟等于60*1000毫秒
                secondBase = 1000; //计算秒钟的基数，单位毫秒。1秒钟等于1000毫秒
                day = Math.floor(dateSub / dayBase); //计算天数，并取下限值。如 5.9天 = 5天
                hour = Math.floor(dateSub % dayBase / hourBase); //计算小时，并取下限值。如 20.59小时 = 20小时
                minute = Math.floor(dateSub % dayBase % hourBase / minuteBase); //计算分钟，并取下限值。如 20.59分钟 = 20分钟
                second = Math.floor(dateSub % dayBase % hourBase % minuteBase / secondBase); //计算秒钟，并取下限值。如 20.59秒 = 20秒
                // 当天数小于等于0时，就不用显示
                if (day <= 0) {
                    $('.count-down-txt .day').hide();
                } 
                $('.count-down-txt .day b').text(toDouble(day,'day'));
                $('.count-down-txt .h').text(toDouble(hour));
                $('.count-down-txt .m').text(toDouble(minute))
                $('.count-down-txt .s').text(toDouble(second))

                return timeHtml;
            };
        
            function toDouble(num,tag) {
                if (num < 10 && tag != 'day') {
                    return  '0' + num;
                } else {
                    return '' + num;
                }
            }
