
var MS_THRESHOLD = 20000;
var FILTER_YEAR = 0;

function truncateLabel(text, maxLength) {
  text.each(function() {
    let gameName = d3.select(this).text();
    if (gameName.length > maxLength) {
      gameName = gameName.slice(0, maxLength) + '...';
    }
    d3.select(this).text(gameName);
  });
}

function displayData(songs, total_ms)
{
    var sorted = Object.values(songs).sort((a, b) => b["plays"] - a["plays"]);
    sorted = sorted.slice(0, 20);

    sorted.forEach((e, i) => {
        console.log([i + 1, e.name, e.album, e.plays]);
    });
    console.log("ms_played", total_ms);
    
    const width = 1000;
    const height = 700;
    var margin = {top: 20, right: 20, bottom: 80, left: 200};
    const x = d3.scaleLinear()
        .domain([0, d3.max(sorted, d => d.plays)])
        .range([0, width]);

    const y = d3.scaleBand()
        .domain(sorted.map(s => s.name))
        .range([0, height])
        .padding(0.1);

    // Create the SVG container.
    const svg = d3.select("#container")
        .append("svg")
            .attr("width", width + margin.left + margin.right)
            .attr("height", height + margin.top + margin.bottom)
        .append("g")
            .attr("transform",
                "translate(" + margin.left + "," + margin.top + ")");

    // Bars
    svg.append("g")
        .attr("fill", "steelblue")
        .selectAll()
        .data(sorted)
        .join("rect")
        .attr("x", (d) => x(0))
        .attr("y", (d) => y(d.name))
        .attr("width", (d) => x(0) + x(d.plays))
        .attr("height", y.bandwidth());

    // x-axis
    svg.append("g")
        .attr("transform", "translate(0," + height + ")")
        .call(d3.axisBottom(x))
    .selectAll("text")
        .attr("transform", "translate(-10,0)rotate(-45)")
        .style("text-anchor", "end");

    // y-axis
    svg.append("g")
        .call(d3.axisLeft(y))
    .selectAll(".tick text")
        .call(truncateLabel, 25);
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

    files.forEach(file => {
        var reader = new FileReader();
        reader.onload = function(evt)
        {
            var j = JSON.parse(evt.target.result);
            j.forEach(song => {
                if (FILTER_YEAR == 0 || song["ts"].startsWith(FILTER_YEAR.toString()))
                {
                    total_ms += song["ms_played"];
                    if (song["ms_played"] > MS_THRESHOLD)
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
