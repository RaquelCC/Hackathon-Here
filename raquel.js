// import stories from './stories.json';
// let historiaA = stories.stories.a
// historiaA.chapters.ch1.content

const firebaseConfig = {
    apiKey: "AIzaSyCEHjwe1uf5vF3gN-uSbQFsIv0ekmK0l-Y",
    authDomain: "hackathon-here-3548e.firebaseapp.com",
    databaseURL: "https://hackathon-here-3548e.firebaseio.com",
    projectId: "hackathon-here-3548e",
    storageBucket: "hackathon-here-3548e.appspot.com",
    messagingSenderId: "526305126761",
    appId: "1:526305126761:web:80ac7b73aec5835b"
};
// Initialize Firebase
firebase.initializeApp(firebaseConfig);

const platform = new H.service.Platform({
    'app_id': 'aNF8XAILH0I6wrjlttyu',
    'app_code': 'x5U_rooRVBrH10t0UyX4Sw'
});

document.getElementById("r-root").innerHTML = `
<div id="r-nav-bar">HISTORIAS</div>
<div id="r-here-map"></div>
<div id="r-story"></div>
`

// Obtain the default map types from the platform object:
let defaultLayers = platform.createDefaultLayers();
let map;
let userLocMarker;
let marker;
// Instantiate (and display) a map object:
if (navigator.geolocation) {
    navigator.geolocation.getCurrentPosition(position => {
        currentPosition = {
            lat: position.coords.latitude,
            lng: position.coords.longitude
        }
        map = new H.Map(
            document.getElementById('r-here-map'),
            defaultLayers.normal.map,
            {
                zoom: 12.5,
                center: {
                    lat: position.coords.latitude,
                    lng: position.coords.longitude
                }
            });
        let events = new H.mapevents.MapEvents(map);
        // eslint-disable-next-line
        let behavior = new H.mapevents.Behavior(events);
        // eslint-disable-next-line
        let ui = new H.ui.UI.createDefault(map, defaultLayers)
        let icon = new H.map.Icon('img/Ellipse.png');
        userLocMarker = new H.map.Marker(currentPosition, { icon: icon });
        map.addObject(userLocMarker);

    }, error => {
        map = new H.Map(
            document.getElementById('r-here-map'),
            defaultLayers.normal.map,
            {
                zoom: 10,
                center: { lat: 52.5, lng: 13.4 }
            });

    })
} else {
    map = new H.Map(
        document.getElementById('r-here-map'),
        defaultLayers.normal.map,
        {
            zoom: 10,
            center: { lat: 52.5, lng: 13.4 }
        });
}


// filtrar historias que esten cerca del usuario
function getMeAStory(indice) {
    let userLocation;
    let stories;
    function getStories() {
        return new Promise((res, rej) => {
            firebase.database().ref("stories").on("value", snap => {
                stories = Object.values(snap.val())
                res(Object.values(snap.val()))
            })
        })

    }


    getStories()
        .then(data => {
            return new Promise((res, rej) => {
                navigator.geolocation.getCurrentPosition(position => {
                    userLocation = {
                        lat: position.coords.latitude,
                        lng: position.coords.longitude,
                    }
                    console.log("Ubicacion del usuario: " + position.coords.latitude + "," + position.coords.longitude)
                    res([data, { lat: position.coords.latitude, lng: position.coords.longitude }])
                })

            }, error => {
                rej(error)
            })
        })
        .then(data => {
            console.log(data)
            console.log(userLocation)
            let mapped = data[0].map(story => {
                return fetch("https://route.api.here.com/routing/7.2/calculateroute.json?app_id=aNF8XAILH0I6wrjlttyu&app_code=x5U_rooRVBrH10t0UyX4Sw&waypoint0=geo!" + data[1].lat + "," + data[1].lng + "&waypoint1=geo!" + story.startCoordinates.lat + "," + story.startCoordinates.lng + "&mode=fastest;pedestrian;traffic:disabled")
                    .then(data => data.json())
                    .then(data => {
                        return data.response.route[0].summary
                    })
            })
            return Promise.all(mapped)
        })
        .then(data => {
            console.log(data)
            let distancedStories = []
            for (let i = 0; i < data.length; i++) {
                distancedStories.push({
                    ...stories[i],
                    distance: data[i].distance,
                    time: parseInt(data[i].baseTime / 60),
                })
            }
            return distancedStories
        })
        .then(data => {
            console.log(data)
            let filtered = data.filter(story => {
                return story/*.distance <= 2000*/
            })
            return filtered.sort((a, b) => {
                return a.distance - b.distance
            })
        })
        .then(data => {
            console.log(data)
            let icon = new H.map.Icon('img/marker.png');
            if(marker) {
                map.removeObject(marker)
            }
            marker = new H.map.Marker({ lat: data[indice].startCoordinates.lat, lng: data[indice].startCoordinates.lng }, { icon: icon });
            map.addObject(marker);
            document.getElementById("r-story").innerHTML = `
            <div id="r-button">A ${data[indice].time} min de tí</div>
            <img id="r-story-img" src=${data[indice].img}>
            <div id="r-title">${data[indice].title.toUpperCase()}</div>
            <img id="r-right-arrow" src="./img/arrowright.png">
            <img id="r-left-arrow" src="./img/arrowleft.png">
            <div id="r-info">
            <div id="r-address"><img id="r-location-minimarker" src="./img/minimarker2.png">DIRECCIÓN</div>
            <div id="r-genre">${data[indice].genre}</div>
            <div id="r-duration"><img src="./img/clock2.png" id="r-location-minimarker">${data[indice].duration}</div>
            <div id="r-summary">${data[indice].summary}</div>
            <div id="m-hablar">audio</div>
            </div>
            `
            document.getElementById('m-hablar').addEventListener('click', () => {
                decir(data[indice].summary);
                console.log('entre');
               });
               
               function decir(texto) {
                speechSynthesis.speak(new SpeechSynthesisUtterance(texto));
               }

            document.getElementById("r-right-arrow").addEventListener("click", () => {
                if (data.length === indice + 1) {
                    return;
                } else {
                    // map.removeObject(marker)
                    getMeAStory(indice + 1)
                }
            })

            document.getElementById("r-left-arrow").addEventListener("click", () => {
                if (indice === 0) {
                    return;
                } else {
                    // map.removeObject(marker)
                    getMeAStory(indice - 1)
                }
            })

            document.getElementById("r-story-img").addEventListener("click", () => {
                console.log("story img")
                startStory(data[indice])
            })
        })
        .catch(error => {
            console.log(error)
            alert('Para que esta aplicación funcione correctamente necesitamos acceso a tu gelocalización')
        })
}


function startStory(story) {

    let marker;
    function getLocation() {
        return new Promise((res, rej) => {
            navigator.geolocation.getCurrentPosition(position => {
                console.log("Ubicacion del usuario: " + position.coords.latitude + "," + position.coords.longitude)
                res({ lat: position.coords.latitude, lng: position.coords.longitude })
            })

        }, error => {
            rej(error)
        })
    }

    getLocation()
    .then(data => {
        console.log(data)
        if (map.getObjects().indexOf(userLocMarker) !== -1) {
            map.removeObject(userLocMarker);
        }
        let icon = new H.map.Icon('img/Ellipse.png');
        marker = new H.map.Marker(data, { icon: icon });
        map.setCenter(data);
        map.addObject(marker)
        document.getElementById("r-here-map").setAttribute("style", "height: 412px;");
        map.getViewPort().resize();
        document.getElementById("r-story").innerHTML = `
        <img id="r-return" src="./img/arrowleft.png">
        <div id="r-title-gradient"><p id="r-title-center">${story.title.toUpperCase()}</p></div>
        <div id="r-starting-container">
        <div id="r-address2"><img id="r-location-minimarker" src="./img/minimarker2.png">DIRECCIÓN</div>
        <div id="r-info-container"><img id="r-infomarker1" src="./img/infomarker.png">Para comenzar la historia debes llegar al punto de partida</div>
        <img id="r-start-button" src="./img/BotonComenzar.png">
        </div>
        `;

        document.getElementById("r-return").addEventListener("click", () => {
            document.getElementById("r-here-map").setAttribute("style", "height: 200px;");
            map.getViewPort().resize();
            getMeAStory(0);
        })

        document.getElementById("r-start-button").addEventListener("click", () => {
            getLocation()
            .then(data => {
                fetch("https://route.api.here.com/routing/7.2/calculateroute.json?app_id=aNF8XAILH0I6wrjlttyu&app_code=x5U_rooRVBrH10t0UyX4Sw&waypoint0=geo!" + data.lat + "," + data.lng + "&waypoint1=geo!" + story.startCoordinates.lat + "," + story.startCoordinates.lng + "&mode=fastest;pedestrian;traffic:disabled")
                .then(data => data.json())
                .then(data => {
                    if (data.response.route[0].summary.distance < 100) {
                        console.log("a: "+data.response.route[0].summary.distance+"mts de distancia, usuario puede comenzar la historia")
                    }
                })
            })
        })
    })
    .catch(error => {
        console.log(error)
    })
}


getMeAStory(0);

