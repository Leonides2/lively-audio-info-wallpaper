

const headerTitle = document.getElementById("audio-title");
const headerArtist = document.getElementById("audio-artist");
const thumbnailImage = document.getElementById("thumbnail");


const canvas = document.querySelector('#canvas');
let ctx = canvas.getContext("2d");

let max_height, startPos, vizWidth, midY;
let glob = { bloom: false, bloomRadius: 10 };
let backgroundColor = "rgb(0, 0, 0)";
let linesColor = "rgb(255, 255, 255)";
let square = true;


function setSize() {
    canvas.width = window.innerWidth * 0.1;
    canvas.height = 75;
    max_height = canvas.height;
    startPos = 0;
    vizWidth = canvas.width;
    midY = canvas.height ;

    gradient = ctx.createLinearGradient(0, midY, 0, max_height);
    gradient.addColorStop(0, backgroundColor);
    gradient.addColorStop(1, linesColor);

}


async function livelyCurrentTrack(data) {
    let obj = JSON.parse(data);

    const Title = obj.Title;
    const Artist = obj.Artist;
    const AlbumArtist = obj.AlbumArtist;
    const Thumbnail = obj.Thumbnail;

    if (obj != null) {
        headerTitle.innerText = `Now playing: ♫ ${Title}`;

        if (Artist) {
            headerArtist.innerText = Artist;

            if (AlbumArtist) headerArtist.innerText += " | " + AlbumArtist
        }
        if (!Artist) {
            if (AlbumArtist ) headerArtist.innerText = AlbumArtist;
            else headerArtist.innerText = "Not found artist name"
        }

        if (Thumbnail) {
            try {
                // Construye el data URI
                const dataUri = `data:image/png;base64,${Thumbnail}`;

                thumbnailImage.setAttribute("style", "display: block");
                // Establece la imagen en el elemento <img>
                thumbnailImage.setAttribute("src", dataUri);

            } catch (err) {
               console.error(err.message);
            }
        } else{
            thumbnailImage.setAttribute("style", "display: none");
        }

    }
    else {
        headerTitle.innerText = "No playing audio"
        headerArtist.innerText = "Waiting for audio..."
    }
}

function livelyPropertyListener(name, val)
{
    switch(name) {
        case "videoSelect":
            document.getElementById("video").src = val;
            break;
        case "backgroundColor":
            document.body.style.setProperty("--background-color", hexToRgb(val));
            break;
        case "blurIntensity":
            document.body.style.setProperty("--blur-intensity", val + "px");
            break;
        case "backgroundOpacity":
            document.body.style.setProperty("--background-opacity", val);
            break;
    }
}



function livelyWallpaperPlaybackChanged(data) {
    var obj = JSON.parse(data);
    isPaused = obj.IsPaused;

    if (isPaused) {
        headerTitle.innerText = "No playing audio"
        headerArtist.innerText = ""
        thumbnailImage.setAttribute("style", "display: none");
    }
}


function livelyAudioListener(audioArray) {
    maxVal = 1;
    for (var x of audioArray) {
        if (x > maxVal) maxVal = x;
    }

    const offSet = vizWidth / audioArray.length;
    const arrMid = audioArray.length / 2;
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    ctx.beginPath();
    ctx.lineJoin = "round";
    ctx.moveTo(startPos - offSet * 3, midY);
    ctx.lineTo(startPos, midY);
    let posInLine = -1;
    for (var x = 0; x < audioArray.length; x++) {
        posInLine++;
        ctx.lineTo(
            startPos + offSet * posInLine,
            midY - (audioArray[x] / maxVal) * max_height
        );
        if (square)
            ctx.lineTo(
                startPos + offSet * (posInLine + 1),
                midY - (audioArray[x] / maxVal) * max_height
            );
    }
    ctx.lineTo(startPos + offSet * (posInLine + (square ? 1 : 0)), midY);
    ctx.lineTo(startPos + offSet * (posInLine + (square ? 4 : 3)), midY);

    ctx.fillStyle = gradient;
    ctx.fill();
    renderLine(linesColor);
}

function renderLine(color) {
    ctx.lineWidth = 2;
    ctx.strokeStyle = color;
    if (glob.bloom) {
        ctx.shadowBlur = glob.bloomRadius;
        ctx.shadowColor = color;
    }
    ctx.stroke();
}

function hexToRgb(hex) {
    var result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result ? 
        `${parseInt(result[1], 16)}, ${parseInt(result[2], 16)}, ${parseInt(result[3], 16)}` 
        : null;
}

setSize();
