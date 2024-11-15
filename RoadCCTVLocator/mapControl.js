var map;
// x: 경도(Long), y: 위도(Lat)
// 카카오는 위도-경도

function createMap() {
    var mapContainer = document.getElementById('map');
    var mapOption = {
        center: new daum.maps.LatLng(37.5665, 126.9784), // 위도(Lat), 경도(Long)
        level: 7
    }

    map = new daum.maps.Map(mapContainer, mapOption);
    var zoomControl = new daum.maps.ZoomControl();
    map.addControl(zoomControl, daum.maps.ControlPosition.RIGHT);

    daum.maps.event.addListener(map, 'dragend', function() {
		updateMap(true); // 지도의 중심이 이동될 때 맵 업데이트
	});
}

async function updateMap(isDrag) {
    var latitude, longitude, km;
    if(isDrag) {
        const mapCenter = map.getCenter();
        latitude = mapCenter.getLat();
        longitude = mapCenter.getLng();
        km = document.getElementById('km').value;
    }
    else {
        latitude = parseFloat(document.getElementById('latitude').value);
        longitude = parseFloat(document.getElementById('longitude').value);
        km = document.getElementById('km').value;
    }
    const requestSize = document.getElementById('requestSize').value;

    if (isNaN(latitude) || isNaN(longitude) || isNaN(km)
        || !latitude || !longitude || !km) {
        alert("Please enter valid latitude, longitude, and (n)km!");
        return;
    }
    else if(requestSize <= 0 || requestSize > 1000) {
        alert("Please enter valid maximum number of CCTV requests!");
        return;
    }

    const centerPosition = new daum.maps.LatLng(latitude, longitude);
    map.setCenter(centerPosition); // 맵 위치 이동

    const boundingBox = calculateBoundingBox(latitude, longitude, km);
    drawRectangle(boundingBox); // 맵에 사각형 그리기

    const datas = await getData(boundingBox, requestSize); // CCTV 데이터 가져오기
    const cctvs = datas.response.result.featureCollection.features;
    console.log(cctvs);
    drawMarker(cctvs);
}

var rectangle;
function drawRectangle(bounds) {
    // 기존 사각형이 존재하면 제거
    if (rectangle) {
        rectangle.setMap(null);
    }

    // LatLngBounds 객체로 bounds 설정
    const latLngBounds = new daum.maps.LatLngBounds(
        new daum.maps.LatLng(bounds.minLat, bounds.minLng),
        new daum.maps.LatLng(bounds.maxLat, bounds.maxLng)
    );

    // 새로운 사각형 생성
    rectangle = new daum.maps.Rectangle({
        bounds: latLngBounds,
        strokeWeight: 3,
        strokeColor: '#FF0000',
        strokeOpacity: 0.5,
        strokeStyle: 'solid',
        fillColor: '#FFAAAA',
        fillOpacity: 0.3
    });

    rectangle.setMap(map); // 지도에 사각형 표시
}

var markers = [];
function drawMarker(cctvs) {
    const image = "images/marker.png";
    const imageSize = new daum.maps.Size(28, 30);
    const imageOption = {offset: new daum.maps.Point(14, 30)};
    const markerImage = new daum.maps.MarkerImage(image, imageSize, imageOption);

    var cctvCount = 0;
    cctvs.forEach(cctv => {
        var cctvPosition = {
            latitude: cctv.geometry.coordinates[1],
            longitude: cctv.geometry.coordinates[0]
        }

        const markerPosition = new daum.maps.LatLng(cctvPosition.latitude, cctvPosition.longitude);
        const marker = new daum.maps.Marker({
            position: markerPosition,
            image: markerImage,
            clickable: true,
            zIndex: ++cctvCount
        })

        marker.setMap(map);
        markers.push(marker);

        daum.maps.event.addListener(marker, 'click', function() {
            const currentOpacity = marker.getOpacity();
            if (currentOpacity === 1) {
                marker.setOpacity(0.25);  // 클릭 시 반투명으로 만들기
            } else {
                marker.setOpacity(1);  // 원래 상태로 되돌리기
            }
        });
        daum.maps.event.addListener(map, 'dragend', function() {
            marker.setMap(null); // 지도의 중심이 이동될 때 마커 제거
        });
    });
}
