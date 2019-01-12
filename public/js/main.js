var Base64={_keyStr:"ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=",encode:function(e){var t="";var n,r,i,s,o,u,a;var f=0;e=Base64._utf8_encode(e);while(f<e.length){n=e.charCodeAt(f++);r=e.charCodeAt(f++);i=e.charCodeAt(f++);s=n>>2;o=(n&3)<<4|r>>4;u=(r&15)<<2|i>>6;a=i&63;if(isNaN(r)){u=a=64}else if(isNaN(i)){a=64}t=t+this._keyStr.charAt(s)+this._keyStr.charAt(o)+this._keyStr.charAt(u)+this._keyStr.charAt(a)}return t},decode:function(e){var t="";var n,r,i;var s,o,u,a;var f=0;e=e.replace(/[^A-Za-z0-9\+\/\=]/g,"");while(f<e.length){s=this._keyStr.indexOf(e.charAt(f++));o=this._keyStr.indexOf(e.charAt(f++));u=this._keyStr.indexOf(e.charAt(f++));a=this._keyStr.indexOf(e.charAt(f++));n=s<<2|o>>4;r=(o&15)<<4|u>>2;i=(u&3)<<6|a;t=t+String.fromCharCode(n);if(u!=64){t=t+String.fromCharCode(r)}if(a!=64){t=t+String.fromCharCode(i)}}t=Base64._utf8_decode(t);return t},_utf8_encode:function(e){e=e.replace(/\r\n/g,"\n");var t="";for(var n=0;n<e.length;n++){var r=e.charCodeAt(n);if(r<128){t+=String.fromCharCode(r)}else if(r>127&&r<2048){t+=String.fromCharCode(r>>6|192);t+=String.fromCharCode(r&63|128)}else{t+=String.fromCharCode(r>>12|224);t+=String.fromCharCode(r>>6&63|128);t+=String.fromCharCode(r&63|128)}}return t},_utf8_decode:function(e){var t="";var n=0;var r=c1=c2=0;while(n<e.length){r=e.charCodeAt(n);if(r<128){t+=String.fromCharCode(r);n++}else if(r>191&&r<224){c2=e.charCodeAt(n+1);t+=String.fromCharCode((r&31)<<6|c2&63);n+=2}else{c2=e.charCodeAt(n+1);c3=e.charCodeAt(n+2);t+=String.fromCharCode((r&15)<<12|(c2&63)<<6|c3&63);n+=3}}return t}};

var $body = $(document);
$body.bind('scroll', function() {
    // "Disable" the horizontal scroll.
    if ($body.scrollLeft() !== 0) {
        $body.scrollLeft(0);
    }
});

$('.modal-trigger').leanModal();
$('select').material_select();

$('#form-bookmarklet').submit(function() {
    var $bookmarkletFormat = $('#bookmarklet-format');
    var format = $bookmarkletFormat.val();
    var formatName = $bookmarkletFormat.find('option:selected').text();
    var email = $('#bookmarklet-email').val().trim();
    var bookmarkletFunctionString = 'var ficsaveStoryUrl=encodeURI(window.location.href);' +
        'var ficsaveFormat="' + format + '";';
    if (email == '') {
        bookmarkletFunctionString += 'var ficsaveUrl="http://ficsave.xyz/?url="+ficsaveStoryUrl+"&format="+ficsaveFormat+"&download=yes";';
    } else {
        email = Base64.encode(email);
        bookmarkletFunctionString += 'var ficsaveEmail="' + email + '";';
        bookmarkletFunctionString += 'var ficsaveUrl="http://ficsave.xyz/?url="+ficsaveStoryUrl+"&format="+ficsaveFormat+"&em="+ficsaveEmail+"&download=yes";';
    }
    bookmarkletFunctionString += 'window.open(ficsaveUrl, "_blank");';
    var bookmarkletString = 'javascript:' + encodeURI('(function(){'+bookmarkletFunctionString+'})()');
    var $bookmarkletLink = $('#bookmarklet-link');
    $bookmarkletLink.html('<a href="'+bookmarkletString+'" onclick="return false;">Download as '+formatName+' | FicSave</a>');
    $bookmarkletLink.fadeIn();
    return false;
});

$('#bookmarklet-link').click(function() {
    alert("You need to bookmark this link!");
    return false;
});

$('#download-submit').click(function() {
    if ($('#url').val().trim() == '') {
        Materialize.toast("URL cannot be empty!", 5000, 'rounded');
    } else {
        if ($(this).text() != 'Loading...') {
            $(this).text('Loading...');
            $('#download').submit();
        }
    }
    return false;
});

if (startDownload) {
    $(document).ready(function() {
        $('#download').submit();
    });
}

$('#download').submit(function() {
    var $downloadButton = $('#download').find('button');
    $.post(downloadUrl, $(this).serialize())
    .done(function(data) {
        $downloadButton.text('Download');
        if (!data.success) {
            Materialize.toast(data.message, 5000, 'rounded');
        }
    })
    .error(function() {
        Materialize.toast("A server error has occurred. Please try again later.", 5000, 'rounded');
    });
    $('#url').val('');
    return false;
});

var downloadsVM = new Vue({
    el: '#downloads',
    data: {
        downloads: []
    },
    ready: function() {
        this.$watch('downloads', function() {
            for (var downloadKey in this.downloads) {
                var download = this.downloads[downloadKey];
                if (download.status == 4) {
                    location.href = '/download/' + download.id;
                }
            }
        });
    }
});
var socket = new WebSocketEx(socketAddress, 8080);
socket.onopen(function() {
    console.log('Connected to server!');
    socket.emit('heartbeat', $('#session-id').val());
});
socket.onretry(function() {
    console.log('Lost connection to websocket server, attempting to reconnect...');
});
socket.subscribe('update', function(data) {
    downloadsVM.downloads = data;
});
