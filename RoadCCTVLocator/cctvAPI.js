window.onload = init;
function init() {
    var searchButton = document.getElementById('search-btn');
    searchButton.addEventListener('click', function() {
        // 클릭 시 모든 마커 제거
        markers.forEach(marker => {
            marker.setMap(null);
        });
        markers = [];

        isInit = false;
        updateMap(false)
    });

    createMap();
}

const proxy = "{여기에 Proxy Server URL을 입력하세요.}";
const apiKey = "{여기에 API 키를 입력하세요.}";
const baseUrl = "https://api.vworld.kr/req/data"
async function getData(bounds, requestSize) {
    // x: 경도(Long), y: 위도(Lat)
    // BOX(minx, miny, maxx, maxy) = (경도, 위도, 경도, 위도)
    const geomFilter = `BOX(${bounds.minLng}, ${bounds.minLat}, ${bounds.maxLng}, ${bounds.maxLat})`;
    const parameters = "service=data&request=GetFeature&data=LT_P_UTISCCTV" +
    `&key=${apiKey}&format=json&size=${requestSize}&geomFilter=${geomFilter}`;
    const url = `${proxy}${baseUrl}?${parameters}`;

    try {
        const response = await fetch(url);  // 데이터 요청
        const data = await response.json(); // JSON 형태로 변환
        return data;
    } catch (error) {
        console.error("Error fetching data:", error);
        return null;
    }
}
