# Node.js 및 MongoDB 초기셋팅

## Ubuntu(22.04) 에서 Docker 사용


### 설치 단계


1. **Docker와 Docker Compose 설정하기**
   ```
   chmod +x docker-setup.sh
   ./docker-setup.sh
   ```
   이 스크립트는 Ubuntu 시스템에 Docker와 Docker Compose를 설치
   
2. **컨테이너 빌드 및 시작하기**
   ```
   docker-compose up -d
   ```

3. **컨테이너 실행 확인하기**
   ```
   docker ps
   ```

4. **애플리케이션 접속하기**
   - Node.js 는 다음 주소에서 사용 가능: `http://localhost:10111`
   - MongoDB 는 다음 주소에서 접근 가능: `mongodb://localhost:27017`

### 개발

- 로그 보기: `docker-compose logs -f`
- 컨테이너 중지하기: `docker-compose down`
- 재시작하기: `docker-compose restart`

## 프로젝트 구조 (업데이트 예정)

```
.
├── app
│   ├── controllers
│   ├── models
│   └── routes
├── config
│   ├── env
│   └── passport
└── ...
```

## 환경 변수

- `NODE_ENV`: 기본값은 `production`
- `PORT`: 기본값은 `10111`
- `MONGODB_URI`: MongoDB 연결 문자열