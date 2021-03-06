const cheerio = require('cheerio');
const request = require('request');

async function youtube(query, page) {
    return new Promise((resolve, reject) => {
        // Specify YouTube search url
        let url = `https://www.youtube.com/results?q=${encodeURIComponent(query)}${page ? `&page=${page}` : ''}`;

        // Access YouTube search
        request(url, (error, response, html) => {
            // Check for errors
            if (!error && response.statusCode === 200) {
                const $ = cheerio.load(html);
                            
                let json = { result: null };
    
                $vid = $(".yt-lockup-dismissable").first()
                    // Get video details
                let $metainfo = $vid.find(".yt-lockup-meta-info li");
                let $thumbnail = $vid.find(".yt-thumb img");
                if (!$vid.parent().data("context-item-id")) {
                    return resolve({'error': 'song not found'})
                }
                let video = {
                    "id": $vid.parent().data("context-item-id"),
                    "title": $vid.find(".yt-lockup-title").children().first().text(),
                    "url": `https://www.youtube.com${$vid.find(".yt-lockup-title").children().first().attr("href")}`,
                    "duration": $vid.find(".video-time").text().trim() || "Playlist",
                    "snippet": $vid.find(".yt-lockup-description").text(),
                    "upload_date": $metainfo.first().text(),
                    "thumbnail_src": $thumbnail.data("thumb") || $thumbnail.attr("src"),
                    "views": $metainfo.last().text()
                }

                // Send results
                json.result = video;
                return resolve(json);
            }
            resolve({ error: error });
        });
    });
}

module.exports.youtube = youtube;