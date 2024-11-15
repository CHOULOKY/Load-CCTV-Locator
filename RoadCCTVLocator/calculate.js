function calculateBoundingBox(latitude, longitude, distanceKm) {
    // 위도 변화량 (1도 위도는 약 111km)
    const latChange = distanceKm / 111;
    // 경도 변화량 (위도에 따른 조정)
    const lngChange = distanceKm / (111 * Math.cos(latitude * Math.PI / 180));

    // console.log("LatChange: ", latChange, " LngChange: ", lngChange);
    if (isNaN(latChange) || isNaN(lngChange)) {
        console.error("Invalid latitude or longitude values, or distance");
        return null;
    }

    return {
        minLat: latitude - latChange,
        minLng: longitude - lngChange,
        maxLat: latitude + latChange,
        maxLng: longitude + lngChange
    };
}
