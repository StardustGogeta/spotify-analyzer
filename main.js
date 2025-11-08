
var MS_THRESHOLD = 20000;
var FILTER_YEAR = 2025;

function submit()
{
    var files = document.getElementById("files").files;
    var songs = {};
    var counter = 0;

    files = Array.from(files).filter(file => file.name.endsWith(".json") && file.name.includes("Audio"));

    function fileCallback(index)
    {
        if (index == files.length)
        {
            var sorted = Object.values(songs).sort((a, b) => b["plays"] - a["plays"]);
            sorted.slice(0, 100).forEach((e, i) => {
                console.log([i + 1, e.name, e.album, e.plays]);
            });
        }
    }

    files.forEach(file => {
        var reader = new FileReader();
        reader.onload = function(evt)
        {
            var j = JSON.parse(evt.target.result);
            j.forEach(song => {
                if (song["ms_played"] > MS_THRESHOLD)
                {
                    if (FILTER_YEAR == 0 || song["ts"].startsWith(FILTER_YEAR.toString()))
                    {
                        var id = song["spotify_track_uri"];
                        var name = song["master_metadata_track_name"];
                        var album = song["master_metadata_album_album_name"];
                        if (songs[id]) {
                            songs[id]["plays"]++;
                        } else {
                            songs[id] = {
                                "name": name,
                                "album": album,
                                "plays": 1
                            };
                        }
                    }
                }
            });

            fileCallback(++counter);
        }
        reader.readAsText(file);
    });
}
