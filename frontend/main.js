import Plyr from './plyr.js';

let setYtSource;

var handleAutoplayUI = function () {
    
    const defaultMaxSeconds = parseInt($('.seconds-to-autoplay').val()) || 15;
    let state = {
        defaultMaxSeconds: defaultMaxSeconds,
        playing: false,
        maxSeconds: defaultMaxSeconds,
        interval: -1
    }

    const player = new Plyr('#player', {
        /* options */
    });

    setYtSource = function(element) {
        if ($(element).is('.current')) {
            return;
        }
        let ytid = $(element).data('ytid');
        $('.current').removeClass('current');
        $(element).addClass('current');
        player.source = {
            type: 'video',
            sources: [
                {
                    src: ytid,
                    provider: 'youtube',
                },
            ],
        };
    }

    function startInterval() {
        clearInterval(state.interval)
        let secondsSoFar = 0;
        state.interval = setInterval(function(){
            if (!state.playing) {
                return;
            }
            secondsSoFar++
            if (secondsSoFar >= state.maxSeconds) {
                if ($('.current').next().length) {
                    setYtSource($('.current').next())
                }
                secondsSoFar = 0;
            }
        }, 1000)
    }

    let onChangeCheckbox = function() {
        if ($('#seconds-or-full').val() === 'full') {
            $('.hide-on-full').hide();
            clearInterval(state.interval);
        } else {
            $('.hide-on-full').show();
            startInterval();
        }
    }

    let autoPlayChange = function(){
        if ($('#autoplay').is(':checked')) {
            // init
            onChangeCheckbox()
        } else {
            clearInterval(state.interval);
        }
    }

    $( "#playlist" ).on( "click", "li", function() {
        if ($(this).data('ytid')) {
            setYtSource(this)
        }
    });
    
    $('.seconds-to-autoplay').on('input change keyup paste', function () {
        if (this.min) this.value = Math.max(parseInt(this.min), parseInt(this.value) || 0);
        if (this.max) this.value = Math.min(parseInt(this.max), parseInt(this.value) || 0);
        state.maxSeconds = parseInt(this.value)
    });

    player.on('playing', event => {
        state.playing = true;
        autoPlayChange();
        player.autoplay = $('#autoplay').is(':checked');
    });

    player.on('ended', event => {
        if ($('#autoplay').is(':checked') && $("#playlist .current").next().length) {
            $('.plyr-next').trigger('click');
        }
    })

    player.on('seeking', event => {
        $('#autoplay').prop('checked', false).trigger('change')
    });

    $(document).on('click','.plyr-next', function(){
        var $next = $("#playlist .current")
            .next()
            .trigger("click");
    })

    player.on('ready', event => {
        if ($('.plyr-next').length === 0) {
            let nextSongBtn = '<button type="button" class="plyr-next plyr__controls__item plyr__control"><i class="fa fa-step-forward fa-lg"></i></button>';
            $('.plyr__controls__item').first().after(nextSongBtn);
        }
    });
    
    player.on('pause', event => {
        state.playing = false;
    })

    player.on('end', event => {
        
    })

    $('#autoplay').on('change', autoPlayChange);
    $('#seconds-or-full').on('change', onChangeCheckbox);
    autoPlayChange()
    
}

$(handleAutoplayUI)

var getData = function() {
    let $search = $('#search');
    let $playlist = $('#playlist');
    
    $search.closest('form').on('submit', function(event){
        const domain = document.location.host === 'localhost' ? '//localhost:5000' : '//akinbeat.com/api/';
        $('.step-1').addClass('loading');
        $.get(domain, {artist: $search.val()}, function(data) {
            $('.step-1').removeClass('loading');
            if (data === 'ARTIST_NOT_FOUND') {
                alert("Artist not found :( check spelling or try another!")
                return;s
            }
            let htmlArray = data.filter(video => video.id).map(video => 
                `<li data-ytid="${video.id}">${HTMLescape(video.title)}<span class="duration">${video.duration}</span></li>`
            );
            console.log(data);
            $playlist.find('li').not(':first').remove()
            $playlist.append(htmlArray.join(''));
            setYtSource($('#playlist li[data-ytid]').first());
            $('.step-2').removeClass('hidden').get(0).scrollIntoView({ behavior: 'smooth' });
        })
        .fail(function() {
            $('.step-1').removeClass('loading');
            alert( "Oops something went wrong :(" );
        })
        event.preventDefault();
    })
}

$(getData)

function HTMLescape(html){
    return document.createElement('div')
        .appendChild(document.createTextNode(html))
        .parentNode
        .innerHTML
}