<template>
  <div class="container">
    <div class="sidebar">
      <h2>화재 이벤트</h2>
      <div class="event">3월 17일 - 서울시 강남구 화재 발생</div>
      <div class="event">3월 16일 - 부산시 해운대구 연기 감지</div>
      <div class="event">3월 15일 - 강원도 속초시 산불 경보</div>
    </div>

    <div class="main">
      <div class="header">
        <div>자동산불감지시스템</div>
        <div class="right">asdf1234님 로그아웃</div>
      </div>
      <div class="main-content">
        <div class="left-content">
          <div class="cctv">📹 CCTV 영상</div>
          <div class="weather">
            <div class="weather-item">온도: 25°C</div>
            <div class="weather-item">풍속: 5m/s</div>
            <div class="weather-item">습도: 40%</div>
            <div class="weather-item">화재 위험도: 높음</div>
            <div class="weather-item">자외선 지수: 7</div>
            <div class="weather-item">미세먼지: 보통</div>
          </div>
        </div>
        <div class="map">🗺️ 2D 지도</div>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'FireMonitoringSystem',
}
</script>

<style scoped>
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
  font-family: Arial, sans-serif;
}

.container {
  display: flex;
  height: 100vh;
}

.sidebar {
  margin: 32px;
  width: 384px;
  background: #2c3e50;
  color: white;
  margin: 16px;
  overflow-y: auto;
  border-radius: 16px;
}

.sidebar h2 {
  margin-bottom: 10px;
  font-size: 18px;
}

.event {
  padding: 10px;
  margin-bottom: 10px;
  background: #34495e;
  border-radius: 5px;
}

.main {
  flex: 1;
  display: flex;
  flex-direction: column;
  margin-right: 16px;
}

.main-content {
  flex: 1;
  display: flex;
  justify-content: flex-start;
  margin-bottom: 16px;
}

.header {
  display: flex;
  justify-content: space-between;
  height: 84px;
  color: white;
  align-items: center;
}

.left-content {
  display: flex;
  flex-direction: column;
}

.cctv {
  display: flex;
  width: 928px;
  height: 522px;
  margin-bottom: 16px;
  align-items: center;
  justify-content: center;
  font-size: 18px;
  font-weight: bold;
  border-radius: 5px;
  background: #ecf0f1;
  aspect-ratio: 16 / 9;
}

.map {
  display: flex;
  flex: 1;
  align-items: center;
  justify-content: center;
  margin-left: 16px;
  font-size: 18px;
  font-weight: bold;
  border-radius: 5px;
  background: #bdc3c7;
}

.weather {
  display: grid;
  flex-grow: 1;
  grid-template-columns: repeat(3, 1fr);
  grid-template-rows: repeat(2, 1fr);
  gap: 10px;
  background: #3498db;
  color: white;
  padding: 10px;
  border-radius: 5px;
  max-width: 100%;
  box-sizing: border-box;
  overflow: hidden;
}
.weather-item {
  background: rgba(255, 255, 255, 0.2);
  padding: 10px;
  text-align: center;
  font-weight: bold;
  border-radius: 5px;
}
</style>
