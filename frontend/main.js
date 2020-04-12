import Plyr from './plyr.js';

let setYoutube = () => {
    player.source = {
        type: 'video',
        sources: [
            {
                src: 'bTqVqk7FSmY',
                provider: 'youtube',
            },
        ],
    };
}

$(function(){


    let playing = false;
    const player = new Plyr('#player', {
        /* options */
    });

    let setYtSource = function(element) {
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

    let interval;
    const defaultMaxSeconds = parseInt($('.seconds-to-autoplay').val()) || 15;
    let maxSeconds = defaultMaxSeconds;

    function startInterval() {
        clearInterval(interval)
        let secondsSoFar = 0;
        interval = setInterval(function(){
            if (!playing) {
                return;
            }
            secondsSoFar++
            if (secondsSoFar >= maxSeconds) {
                if ($('.current').next().length) {
                    setYtSource($('.current').next())
                }
                secondsSoFar = 0;
            }
        }, 1000)
    }

    $( "#playlist" ).on( "click", "li", function() {
        if ($(this).data('ytid')) {
            setYtSource(this)
        }
    });
    
    $('.seconds-to-autoplay').on('input change keyup paste', function () {
        if (this.min) this.value = Math.max(parseInt(this.min), parseInt(this.value) || 0);
        if (this.max) this.value = Math.min(parseInt(this.max), parseInt(this.value) || 0);
        maxSeconds = parseInt(this.value)
    });

    let onChangeCheckbox = function() {
        if ($('#seconds-or-full').val() === 'full') {
            $('.seconds-to-autoplay').attr('disabled', 'disabled').hide();
            clearInterval(interval);
        } else {
            $('.seconds-to-autoplay').removeAttr('disabled').show();
            startInterval();
        }
    }

    player.on('playing', event => {
        playing = true;
        autoPlayChange();
        player.autoplay = $('#autoplay').is(':checked');
    });
    player.on('seeking', event => {
        $('#autoplay').prop('checked', false).trigger('change')
    });

    player.on('pause', event => {
        playing = false;
    })

    let autoPlayChange = function(){
        
        if ($('#autoplay').is(':checked')) {
            // init
            onChangeCheckbox()
        } else {
            clearInterval(interval);
        }
    }

    player.once('ready', event => {
        $(document.body).removeClass('player-opacity-0');
        setYtSource($('#playlist li[data-ytid]').first());
    });
    
    $('#autoplay').on('change', autoPlayChange).trigger('change');
    $('#seconds-or-full').on('change', onChangeCheckbox);
    
})
