// html:
//         <div class="upload-img">
//             <p class="tit-b">上传图片</p>
//             <ul class="uploaded-img">

//             </ul>
//             <div class="file-upload">
//                 <input type="file" name="imagefile" id="" class="img-choose" accept="image/*">
//                 <p class="img-txt">1/3</p>
//             </div>
//         </div>


// css:
// .upload-img {
//     display: none;
//     background: #fff;
//     padding: .625rem;
//     font-size: 0;
//     margin-bottom: .625rem;
//   }
//   .upload-img .tit-b {
//     border: none;
//   }
//    .upload-img .uploaded-img {
//     display: inline-block;
//   }
//    .upload-img .uploaded-img li {
//     position: relative;
//     display: inline-block;
//     width: 5rem;
//     height: 5rem;
//     margin-top: 1.25rem;
//     margin-right: 1.875rem;
//     border: 1px dashed #BFBFBF;
//     background-position: center;
//     background-size: 100%;
//   }
//    .upload-img .uploaded-img li .close:before {
//     position: absolute;
//     top: -0.375rem;
//     right: -0.375rem;
//   }
//    .upload-img .file-upload {
//     position: relative;
//     display: inline-block;
//     width: 5rem;
//     height: 5rem;
//     border: 1px dashed #BFBFBF;
//     border-radius: 3px;
//     /* margin-right: 1.875rem; */
//     margin-top: 1.25rem;
//     background: url(/public/img/orders/sale/carma.png) no-repeat center 30%;
//     background-size: 36%;
//     vertical-align: top;
//   }
//   .upload-img .file-upload input {
//     opacity: 0;
//     width: 100%;
//     height: 100%;
//   }
//  .upload-img .file-upload .img-txt {
//     position: absolute;
//     bottom: .75rem;
//     left: 35%;
//     color: #BFBFBF;
//     font-size: .75rem;
//     letter-spacing: .1875rem;
//   }

// var formdata = getFormData();
// formdata.append('data', JSON.stringify(data));
// function ajaxQueryImg(type,url,data,successFunc,that){
//     $.ajax({
//         type: type,
//         url: url,
//         data: data,
//         contentType: false,
//         processData:false,
//         success: function(data){
//             successFunc(data,that);
//         },
//         error:function(err){
//             alert('请求失败');
//         }
//     });
// };

// ajax提交图片及相关数据
// $('.z-submit').on('click','p',function(){

// 	var order_id = $(this).attr('order_id');
// 	var cause_id = $('.reason-button.active').attr('value');
// 	var reason = $('.text-holder').val();

// 	var formdata = getFormData();
// 	formdata.append('order_id', order_id);
// 	formdata.append('after_sale_a_reason', cause_id);
//     formdata.append('other_reason', reason);
    
// 	for (var i = 0; i < pictureArr.length; i++) {
// 		var picture =  pictureArr[i];
// 		formdata.append('picture_file[]', picture);
// 	}
	
// 	$.ajax({
// 		url: '/orders/cancelordered',
// 		type:"POST",
// 		data:formdata,
// 		// dataType: 'json',
// 		processData:false,
//         contentType:false,
// 		success:function(res){
// 			console.log(res);
//             // something code ……
// 		}
// 	});
// });

var pictureArr = [];
var ins = 0;

//删除图片
$('.upload-img').on('click','li .close',function(event){
    var e = event || window.event;
    var targetPrs = $(e.target).closest('li');
    var targetPrsIndex = targetPrs.index();
    targetPrs.remove();

    //改变图片上传张数文本
    var imgLiLen = $('.uploaded-img li').length;
    $('.img-txt span').text(imgLiLen + 1);
    if(imgLiLen <= 2){//显示上传控件
        $('input[type="file"]').parents('.file-upload').show();
    }

    pictureArr.splice(targetPrsIndex, 1);//移除pictureArr对应索引的值

});

//    用于压缩图片的canvas
var canvas = document.createElement("canvas");
var ctx = canvas.getContext('2d');

//    瓦片canvas
var tCanvas = document.createElement("canvas");
var tctx = tCanvas.getContext("2d");
var maxsize = 100 * 1024;

$('.img-choose').unbind('change').change(function(){

    //改变图片上传张数文本
    var imgLiLen = $('.uploaded-img li').length;
    $('.img-txt span').text(imgLiLen + 2);
    if(imgLiLen >= 2){//隐藏上传控件
        $('input[type="file"]').parents('.file-upload').hide();
        // $('input[type="file"]').attr('disabled',true);
    }

    if(!this.files.length) return;

    var files = Array.prototype.slice.call(this.files);

    files.forEach(function(file, i){
        if (!/\/(?:jpeg|png|gif)/i.test(file.type)) return;
        var reader = new FileReader();
        var li = document.createElement("li");
        var size = file.size / 1024 > 1024 ? (~~(10 * file.size / 1024 / 1024)) / 10 + "MB" : ~~(file.size / 1024) + "KB";
        li.innerHTML = '<span class="close"></span><div class="progress"><span></span></div><div class="size">' + size + '</div>';
        $(".uploaded-img").append($(li));

        reader.onload = function(){
            var result = this.result;
            var img = new Image();
            img.src = result;     
            $(li).css("background-image", "url(" + result + ")");      
            
            //如果图片大小小于100kb，则直接上传
            if (result.length <= maxsize) {
                img = null;
                pictureArr.push(fileData(result, file.type, $(li)));
                return;
            }
            //      图片加载完毕之后进行压缩，然后上传
            if (img.complete) {
                callback();
                } else {
                img.onload = callback;
            }
            function callback() {

                var data = compress(img);
                pictureArr.push(fileData(data, file.type, $(li)));
                img = null;
            }


        };
        reader.readAsDataURL(file);
    });
});

//使用canvas对大图片进行压缩
function compress(img) {
    var initSize = img.src.length;
    var width = img.width;
    var height = img.height;
    //如果图片大于四百万像素，计算压缩比并将大小压至400万以下
    var ratio;
    if ((ratio = width * height / 4000000) > 1) {
        ratio = Math.sqrt(ratio);
        width /= ratio;
        height /= ratio;
    } else {
        ratio = 1;
    }
    canvas.width = width;
    canvas.height = height;
//        铺底色
    ctx.fillStyle = "#fff";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    //如果图片像素大于100万则使用瓦片绘制
    var count;
    if ((count = width * height / 1000000) > 1) {
        count = ~~(Math.sqrt(count) + 1); //计算要分成多少块瓦片
//            计算每块瓦片的宽和高
        var nw = ~~(width / count);
        var nh = ~~(height / count);
        tCanvas.width = nw;
        tCanvas.height = nh;
        for (var i = 0; i < count; i++) {
            for (var j = 0; j < count; j++) {
            tctx.drawImage(img, i * nw * ratio, j * nh * ratio, nw * ratio, nh * ratio, 0, 0, nw, nh);
            ctx.drawImage(tCanvas, i * nw, j * nh, nw, nh);
            }
        }
    } else {
        ctx.drawImage(img, 0, 0, width, height);
    }
    //进行最小压缩
    var ndata = canvas.toDataURL('image/jpeg', 0.1);
    console.log('压缩前：' + initSize);
    console.log('压缩后：' + ndata.length);
    console.log('压缩率：' + ~~(100 * (initSize - ndata.length) / initSize) + "%");
    tCanvas.width = tCanvas.height = canvas.width = canvas.height = 0;
    return ndata;
};

//图片上传，将base64的图片转成二进制对象，塞进formdata上传
function fileData (basestr, type, $li){
    var text = window.atob(basestr.split(",")[1]);
    var buffer = new Uint8Array(text.length);

    for (var i = 0; i < text.length; i++) {
        buffer[i] = text.charCodeAt(i);
    }
    var blob = getBlob([buffer], type);
    return blob;
};

// function upload(basestr, type, $li) {
//     var text = window.atob(basestr.split(",")[1]);
//     var buffer = new Uint8Array(text.length);
//     // var pecent = 0, loop = null;

//     for (var i = 0; i < text.length; i++) {
//         buffer[i] = text.charCodeAt(i);
//     }
//     var blob = getBlob([buffer], type);
//     // var xhr = new XMLHttpRequest();
//     var formdata = getFormData();
//     formdata.append('imagefile', blob);
//     return formdata;

    //直接ajax上传
    // xhr.open('post', '');
    // xhr.onreadystatechange = function() {

    //     if (xhr.readyState == 4 && xhr.status == 200) {
    //         console.log(xhr.responseText);
    //         var jsonData = JSON.parse(xhr.responseText);
    //         var imagedata = jsonData[0] || {};
    //         var text = imagedata.path ? '上传成功' : '上传失败';
    //         console.log(text + '：' + imagedata.path);
    //         clearInterval(loop);
    //         //当收到该消息时上传完毕
    //         $li.find(".progress span").animate({'width': "100%"}, pecent < 95 ? 200 : 0, function() {
    //         $(this).html(text);
    //         });
    //         if (!imagedata.path) return;
    //         $(".pic-list").append('<a href="' + imagedata.path + '">' + imagedata.name + '（' + imagedata.size + '）<img src="' + imagedata.path + '" /></a>');
    //     }
    // };
    // //数据发送进度，前50%展示该进度
    // xhr.upload.addEventListener('progress', function(e) {
    //     if (loop) return;
    //         pecent = ~~(100 * e.loaded / e.total) / 2;
    //         $li.find(".progress span").css('width', pecent + "%");
    //     if (pecent == 50) {
    //         mockProgress();
    //     }
    // }, false);


    // //数据后50%用模拟进度
    // function mockProgress() {
    //     if (loop) return;
    //     loop = setInterval(function() {
    //         pecent++;
    //         $li.find(".progress span").css('width', pecent + "%");
    //         if (pecent == 99) {
    //         clearInterval(loop);
    //         }
    //     }, 100)
    // }
    // xhr.send(formdata);
// };
/**
* 获取blob对象的兼容性写法
* @param buffer
* @param format
* @returns {*}
*/
function getBlob(buffer, format) {
    try {
        return new Blob(buffer, {type: format});
    } catch (e) {
        var bb = new (window.BlobBuilder || window.WebKitBlobBuilder || window.MSBlobBuilder);
        buffer.forEach(function(buf) {
            bb.append(buf);
        });
        return bb.getBlob(format);
    }
}
/**
* 获取formdata
*/
function getFormData() {
    var isNeedShim = ~navigator.userAgent.indexOf('Android')
        && ~navigator.vendor.indexOf('Google')
        && !~navigator.userAgent.indexOf('Chrome')
        && navigator.userAgent.match(/AppleWebKit\/(\d+)/).pop() <= 534;
    return isNeedShim ? new FormDataShim() : new FormData();
}
/**
* formdata 补丁, 给不支持formdata上传blob的android机打补丁
* @constructor
*/
function FormDataShim() {
    // console.warn('using formdata shim');
    var o = this,
        parts = [],
        boundary = Array(21).join('-') + (+new Date() * (1e16 * Math.random())).toString(36),
        oldSend = XMLHttpRequest.prototype.send;

    this.append = function(name, value, filename) {
        parts.push('--' + boundary + '\r\nContent-Disposition: form-data; name="' + name + '"');
        
        if (value instanceof Blob) {
            parts.push('; filename="' + (filename || 'blob') + '"\r\nContent-Type: ' + value.type + '\r\n\r\n');
            parts.push(value);
        }
        else {
            parts.push('\r\n\r\n' + value);
        }

        parts.push('\r\n');
    };
    // Override XHR send()
    XMLHttpRequest.prototype.send = function(val) {
        var fr,
            data,
            oXHR = this;
        if (val === o) {
            // Append the final boundary string
            parts.push('--' + boundary + '--\r\n');
            // Create the blob
            data = getBlob(parts);
            // Set up and read the blob into an array to be sent
            fr = new FileReader();
            fr.onload = function() {
            oldSend.call(oXHR, fr.result);
            };
            fr.onerror = function(err) {
            throw err;
            };
            fr.readAsArrayBuffer(data);
            // Set the multipart content type and boudary
            this.setRequestHeader('Content-Type', 'multipart/form-data; boundary=' + boundary);
            XMLHttpRequest.prototype.send = oldSend;
        }
        else {
            oldSend.call(this, val);
        }
    };
};    
