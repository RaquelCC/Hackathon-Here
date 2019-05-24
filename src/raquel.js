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
<div id="r-nav-bar">SANTIAGOAVENTURA</div>
<div id="r-here-map"></div>
<div id="r-story"></div>
`
let map;
let userLocMarker;
let marker;
// // Obtain the default map types from the platform object:
// let defaultLayers = platform.createDefaultLayers();
// let map;
// let userLocMarker;
// let marker;
// // Instantiate (and display) a map object:
// if (navigator.geolocation) {
//     navigator.geolocation.getCurrentPosition(position => {
//         currentPosition = {
//             lat: position.coords.latitude,
//             lng: position.coords.longitude
//         }
//         map = new H.Map(
//             document.getElementById('r-here-map'),
//             defaultLayers.normal.map,
//             {
//                 zoom: 12.5,
//                 center: {
//                     lat: position.coords.latitude,
//                     lng: position.coords.longitude
//                 }
//             });
//         let events = new H.mapevents.MapEvents(map);
//         // eslint-disable-next-line
//         let behavior = new H.mapevents.Behavior(events);
//         // eslint-disable-next-line
//         let ui = new H.ui.UI.createDefault(map, defaultLayers)
//         let icon = new H.map.Icon('img/Ellipse.png');
//         userLocMarker = new H.map.Marker(currentPosition, { icon: icon });
//         map.addObject(userLocMarker);

//     }, error => {
//         map = new H.Map(
//             document.getElementById('r-here-map'),
//             defaultLayers.normal.map,
//             {
//                 zoom: 10,
//                 center: { lat: 52.5, lng: 13.4 }
//             });

//     })
// } else {
//     map = new H.Map(
//         document.getElementById('r-here-map'),
//         defaultLayers.normal.map,
//         {
//             zoom: 10,
//             center: { lat: 52.5, lng: 13.4 }
//         });
// }

// function que lee texto
function decir(texto) {
    console.log("audio")
    window.speechSynthesis.speak(new SpeechSynthesisUtterance(texto));
}


// filtrar historias que esten cerca del usuario
function getMeAStory(indice, first = false) {
    document.getElementById("r-story").innerHTML = ""
    document.getElementById("r-here-map").style.display = "block";
    document.getElementById("r-nav-bar").style.display = "block";

    console.log(first)
    if (first === true) {


        // Obtain the default map types from the platform object:
        let defaultLayers = platform.createDefaultLayers();

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
    }
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
            let inclusive = data[indice].inclusive ? '<div id="r-inclusive"><img class="r-location-minimarker" src="./img/inclusive.png">Accesible</div>' : '';
            // console.log(inclusive)
            let icon = new H.map.Icon('img/newmarker.png');
            console.log(marker)
            console.log(map.getObjects())
            if (marker && !first) {
                map.removeObject(marker)
            }
            //probando funcion ruta
            // console.log(userLocMarker.b)
            var routingParameters = {
                // The routing mode:
                'mode': 'fastest;car',
                // The start point of the route:
                'waypoint0': 'geo!'+userLocMarker.b.lat+','+userLocMarker.b.lng,
                // The end point of the route:
                'waypoint1': 'geo!'+data[indice].startCoordinates.lat+','+data[indice].startCoordinates.lng,
                // To retrieve the shape of the route we choose the route
                // representation mode 'display'
                'representation': 'display'
              };
              
              // Define a callback function to process the routing response:
              var onResult = function(result) {
                var route,
                  routeShape,
                  startPoint,
                  endPoint,
                  linestring;
                if(result.response.route) {
                // Pick the first route from the response:
                route = result.response.route[0];
                // Pick the route's shape:
                routeShape = route.shape;
              
                // Create a linestring to use as a point source for the route line
                linestring = new H.geo.LineString();
              
                // Push all the points in the shape into the linestring:
                routeShape.forEach(function(point) {
                  var parts = point.split(',');
                  linestring.pushLatLngAlt(parts[0], parts[1]);
                });
              
                // Retrieve the mapped positions of the requested waypoints:
                startPoint = route.waypoint[0].mappedPosition;
                endPoint = route.waypoint[1].mappedPosition;
              
                // Create a polyline to display the route:
                var routeLine = new H.map.Polyline(linestring, {
                  style: { strokeColor: '#3AA2EE', lineWidth: 6 }
                });
              
                // Create a marker for the start point:
                var startMarker = new H.map.Marker({
                  lat: startPoint.latitude,
                  lng: startPoint.longitude
                });
              
                // Create a marker for the end point:
                var endMarker = new H.map.Marker({
                  lat: endPoint.latitude,
                  lng: endPoint.longitude
                });
              
                // Add the route polyline and the two markers to the map:
                map.addObjects([routeLine/*, startMarker, endMarker*/]);
              
                // Set the map's viewport to make the whole route visible:
                // map.setViewBounds(routeLine.getBounds());
                }
              };
              
              // Get an instance of the routing service:
              var router = platform.getRoutingService();
              
              // Call calculateRoute() with the routing parameters,
              // the callback and an error callback function (called if a
              // communication error occurs):
              router.calculateRoute(routingParameters, onResult,
                function(error) {
                  alert(error.message);
                });
              

            //final probando funcion ruta
            marker = new H.map.Marker({ lat: data[indice].startCoordinates.lat, lng: data[indice].startCoordinates.lng }, { icon: icon });
            map.addObject(marker);
            document.getElementById("r-story").innerHTML = `
            <div id="r-initial-info">Elige una historia y comienza a caminar</div>
            <div id="r-button"><img src="./img/clockwhite.png" id="r-button-icon">A ${data[indice].time} min de tí</div>
            <img id="r-story-img" src=${data[indice].img}>
            <div id="r-title">"${data[indice].title.toUpperCase()}"</div>
            <img id="r-right-arrow" src="./img/arrow-right2.png">
            <img id="r-left-arrow" src="./img/arrow-left2.png">
            <div id="r-info">
            <div id="r-address"><img class="r-location-minimarker" src="./img/minimarker2.png">${data[indice].address ? data[indice].address : "DIRECCIÓN"}</div>
            <div id="r-genre">${data[indice].genre}</div>
            <div id="r-duration"><img src="./img/clock2.png" class="r-location-minimarker">${data[indice].duration}</div>
            ${inclusive}
            <div id="m-hablar"><img src="./img/speaker.png" id="r-speaker"></div>

            <div id="r-summary">${data[indice].summary}</div>
            
            <div class="maxwidth"><img id="first" src="./img/BotonComenzar.png"></div>
            </div>
            `
            document.getElementById('r-speaker').addEventListener('click', () => {
                console.log(data[indice].summary)
                decir(data[indice].summary);
                console.log('entre');
            });
            // speechSynthesis.pause()
            // speechSynthesis.resume()


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
        <img id="r-return" src="./img/x.png">
        <div class="r-title-gradient"><p id="r-title-center">${story.title.toUpperCase()}</p></div>
        <div id="r-starting-container">
        <div id="r-info-container"><img id="r-infomarker1" src="./img/infomarker.png">Dirígete al punto de partida para comenzar la historia<p id="r-margin-cero">Cuando llegues presiona comentar</p></div>
        <img id="r-start-button" src="./img/BotonComenzar.png">
        </div>
        `;

            document.getElementById("r-start-button").addEventListener("click", () => {
                showChapter(story, story.chapters.ch1)
            })

            document.getElementById("r-return").addEventListener("click", () => {
                document.getElementById("r-here-map").setAttribute("style", "height: 0px;");
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
                                    console.log("a: " + data.response.route[0].summary.distance + "mts de distancia, usuario puede comenzar la historia")
                                }
                            })
                    })
            })
        })
        .catch(error => {
            console.log(error)
        })
}


//getMeAStory(0);

function showChapter(story, chapter) {
    window.scrollTo(0, 0)
    document.getElementById("r-here-map").style.display = "none";
    let nextCoices = "";
    if (chapter.nextChapter) {
        Object.values(chapter.nextChapter).forEach(choice => {
            nextCoices += `
        <div class="a-button" next="${choice.chapter}">${choice.description}</div>
        `
        })
    } else {
        nextCoices = `
        <div id="r-center"><p id="r-p-center">FIN</p></div>
        <div class="a-button" id="r-finish">FINALIZAR</div>`
    }
    if (chapter.numero === 1) {
        document.getElementById("r-story").innerHTML = `
    <img id="a-cap-img" src=${story.img}>
    <div class="r-title-gradient" id="r-subir"><div class="center-p">"${story.title.toUpperCase()}"</div></div>
    <div id="a-info">
    <div id="r-warning">ADVERTENCIA</div>
    <div id="a-content"><p class="center-p2">En la siguiente historia tomarás el papel del personaje principal.</p><p class="center-p2"> Las referencias a lugares, como por ejemplo “tu hogar”, son ubicaciones que se relacionan al personaje.</p></div>
    <div class="a-button" id="r-entendido">ENTENDIDO</div>
    </div>
    `
        document.getElementById("r-entendido").addEventListener("click", () => {


            document.getElementById("r-story").innerHTML = `
                    <img id="a-cap-img" src=${story.img}>
                    <div class="r-title-gradient" id="r-subir"><div class="center-p">"${story.title.toUpperCase()}"</div></div>
                        <div id="a-info">
                        <div class="a-circulo">${chapter.numero}</div>
                        <div id="a-title-cap"> ${chapter.title} </div>
                        <img id="a-play" src=${"./img/speaker.png"}>
                        <hr>
                        <div id="a-content">${chapter.content}</div>
                        <div id="r-question">${chapter.question ? chapter.question : ""}</div>
                        ${nextCoices}
                        <img id="r-return" src="./img/x.png">
                    </div>
                `
            if (document.getElementById("r-finish")) {
                document.getElementById("r-finish").addEventListener("click", () => {
                    document.getElementById("r-root").innerHTML = `
                    <img id="prize" src="./img/premio.png">
                    `
                    document.getElementById("prize").addEventListener("click", () => {
                        document.getElementById("r-root").innerHTML = `
                        <div id="r-nav-bar">SANTIAGOAVENTURA</div>
                        <div id="r-here-map"></div>
                        <div id="r-story"></div>
                        `
                        getMeAStory(0, true)
                    })

                })
            }

            document.getElementById('a-play').addEventListener('click', () => {
                // console.log(data[indice].summary)
                decir(chapter.content);
                console.log('entre');
            });

            document.getElementById("r-return").addEventListener("click", () => {
                document.getElementById("r-here-map").setAttribute("style", "height: 0px;");
                map.getViewPort().resize();
                getMeAStory(0);
            })
            if (chapter.nextChapter) {
                let opciones = document.getElementsByClassName("a-button");
                for (let i = 0; i < opciones.length; i++) {
                    let next = opciones[i].getAttribute("next");
                    // console.log(next)
                    console.log(story.chapters[next])
                    opciones[i].addEventListener("click", () => {
                        showChapter(story, story.chapters[next])
                    })
                }
            }

        })
    } else {
        document.getElementById("r-story").innerHTML = `
    <img id="a-cap-img" src=${story.img}>
    <div class="r-title-gradient" id="r-subir"><div class="center-p">"${story.title.toUpperCase()}"</div></div>
        <div id="a-info">
        <div class="a-circulo">${chapter.numero}</div>
        <div id="a-title-cap"> ${chapter.title} </div>
        <img id="a-play" src=${"./img/speaker.png"}>
        <hr>
        <div id="a-content">${chapter.content}</div>
        <div id="r-question">${chapter.question ? chapter.question : ""}</div>
        ${nextCoices}
        <img id="r-return" src="./img/x.png">
    </div>
`
        if (document.getElementById("r-finish")) {
            document.getElementById("r-finish").addEventListener("click", () => {
                document.getElementById("r-root").innerHTML = `
    <img id="prize" src="./img/premio.png">
    `
                document.getElementById("prize").addEventListener("click", () => {
                    document.getElementById("r-root").innerHTML = `
        <div id="r-nav-bar">SANTIAGOAVENTURA</div>
        <div id="r-here-map"></div>
        <div id="r-story"></div>
        `
                    getMeAStory(0, true)
                })

            })
        }

        document.getElementById('a-play').addEventListener('click', () => {
            // console.log(data[indice].summary)
            decir(chapter.content);
            console.log('entre');
        });

        document.getElementById("r-return").addEventListener("click", () => {
            document.getElementById("r-here-map").setAttribute("style", "height: 0px;");
            map.getViewPort().resize();
            getMeAStory(0);
        })
        if (chapter.nextChapter) {
            let opciones = document.getElementsByClassName("a-button");
            for (let i = 0; i < opciones.length; i++) {
                let next = opciones[i].getAttribute("next");
                // console.log(next)
                console.log(story.chapters[next])
                opciones[i].addEventListener("click", () => {
                    showChapter(story, story.chapters[next])
                })
            }
        }
    }



}


function initialPage() {
    document.getElementById("r-here-map").style.display = "none";
    document.getElementById("r-nav-bar").style.display = "none";
    document.getElementById("r-story").innerHTML = `
    <div id="r-toclick">
    <img id="r-initial-logo" src="./img/Logo.png">
    <div id="r-initial-name">SANTIAGOVENTURA</div>
    <img id="r-initial-bottom-img" src="./img/siluetaciudad.png">
    </div>
    `

    document.getElementById("r-toclick").addEventListener("click", () => {
        // getMeAStory(0, true);
        document.getElementById("r-story").innerHTML = `
        <img id="r-login" src="./img/Inicio2.png">
        `

        document.getElementById("r-login").addEventListener("click", () => {
            getMeAStory(0, true);
        })
    })
}

initialPage();