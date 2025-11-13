
var MS_THRESHOLD = 20000;
var FILTER_YEAR = 0;

function displayData(songs, total_ms)
{
    var sorted = Object.values(songs).sort((a, b) => b["plays"] - a["plays"]);
    sorted = sorted.slice(0, 20);

    sorted.forEach((e, i) => {
        console.log([i + 1, e.title, e.album, e.plays]);
    });
    console.log("ms_played", total_ms);
    
    const width = 1000;
    const height = 700;
    var margin = {top: 20, right: 20, bottom: 80, left: 200};

    var topPlays = Plot.plot({
        title: "Top Songs by Number of Plays",
        marginLeft: margin.left,
        marginTop: margin.top,
        marginBottom: margin.bottom,
        marginRight: margin.right,
        width: width,
        height: height,
        x: {
            axis: "bottom",
            label: "Times Played",
            grid: true
        },
        marks: [
            Plot.axisY({lineWidth: 20, label: "Song Title"}),
            Plot.ruleX([0]),
            Plot.barX(sorted, {
                x: "plays",
                y: "title",
                sort: {y: "x", reverse: true},
                fill: "steelblue",
            }),
            Plot.tip(sorted, Plot.pointerY({
                x: "plays",
                y: "title",
                title: d => `${d.title} - ${d.artist}\n(${d.album})\n${d.plays} times played`,
                sort: {y: "x", reverse: true},
                lineWidth: 50,
            })),
        ],
    })

    var container = document.querySelector("#container");
    container.innerHTML = "";
    container.append(topPlays);
}


function submit()
{
    var files = document.getElementById("files").files;
    var songs = {};
    var counter = 0;
    var total_ms = 0;

    files = Array.from(files).filter(file => file.name.endsWith(".json") && file.name.includes("Audio"));

    function fileCallback(index)
    {
        if (index == files.length)
        {
            displayData(songs, total_ms);
        }
    }

    var filterYear = document.querySelector("#filter-year").value;
    console.log("Filtering to year " + filterYear);

    files.forEach(file => {
        var reader = new FileReader();
        reader.onload = function(evt)
        {
            var j = JSON.parse(evt.target.result);
            j.forEach(song => {
                if (filterYear == 0 || song["ts"].startsWith(filterYear.toString()))
                {
                    total_ms += song["ms_played"];
                    if (song["ms_played"] > MS_THRESHOLD)
                    {
                        var id = song["spotify_track_uri"];
                        var title = song["master_metadata_track_name"];
                        var album = song["master_metadata_album_album_name"];
                        var artist = song["master_metadata_album_artist_name"];
                        if (songs[id]) {
                            songs[id]["plays"]++;
                        } else {
                            songs[id] = {
                                "title": title,
                                "album": album,
                                "artist": artist,
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
