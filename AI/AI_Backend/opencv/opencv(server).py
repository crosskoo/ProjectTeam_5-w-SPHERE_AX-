import cv2
import os
import base64
from ultralytics import YOLO
from datetime import datetime
import socketio
import time

# --- Socket.IO 연결 설정 ---
BACKEND_URL = 'http://localhost:10111'  
sio = socketio.Client()

# 연결 이벤트 핸들러 추가
@sio.event
def connect():
    print('서버에 연결되었습니다!')
    print(f'세션 ID: {sio.sid}')

@sio.event
def connect_error(data):
    print(f'연결 오류 발생: {data}')

@sio.event
def disconnect():
    print('서버와의 연결이 종료되었습니다')

@sio.on('detection_processed')
def on_detection_processed(data):
    print(f'서버로부터 응답 수신: {data}')

# --- 이미지 인코딩 함수 ---
def encode_image(frame, mode='data_url'):
    _, buffer = cv2.imencode('.jpg', frame)
    b64 = base64.b64encode(buffer).decode('utf-8')
    if mode == 'data_url':
        # Data URL 형식
        return f"data:image/jpeg;base64,{b64}"
    elif mode == 'base64':
        # Base64 문자열만
        return b64
    else:
        raise ValueError("mode는 'data_url' 또는 'base64'만 허용합니다.")

# Socket.IO 연결 - socket_test.py 방식으로 수정
connection_url = f"{BACKEND_URL}?client=ai-server"
print(f'서버 {BACKEND_URL}에 연결 시도 중...')
try:
    sio.connect(
        connection_url,
        transports=['websocket']
    )
    
    # 연결 실패 시 프로그램 종료
    if not sio.connected:
        print("서버 연결에 실패했습니다.")
        exit(1)
    
except Exception as e:
    print(f"서버 연결 중 오류 발생: {e}")
    exit(1)

print("서버에 성공적으로 연결되었습니다. YOLO 모델 로드 및 비디오 처리를 시작합니다.")

# --- YOLO 및 영상 처리 ---
input_path = "video/fire.mp4"
model = YOLO("model/fourth.pt")
base, ext = os.path.splitext(input_path)
output_path = f"{base}_output{ext}"

cap = cv2.VideoCapture(input_path)
fourcc = cv2.VideoWriter_fourcc(*'mp4v')
fps = cap.get(cv2.CAP_PROP_FPS)
width = int(cap.get(cv2.CAP_PROP_FRAME_WIDTH))
height = int(cap.get(cv2.CAP_PROP_FRAME_HEIGHT))
out = cv2.VideoWriter(output_path, fourcc, fps, (width, height))

class_names = model.names
frame_count = 0

# ----- 프레임 스킵 설정 -----
FRAME_SKIP = 5  # 매 5 프레임마다 한 번씩 처리 (조정 가능)
EVENT_COOLDOWN = 3.0  # 동일 클래스에 대한 이벤트 간 최소 시간 간격(초)
last_event_time = {}  # 클래스별 마지막 이벤트 전송 시간

while cap.isOpened():
    ret, frame = cap.read()
    if not ret:
        break

    # 프레임 스킵 - 설정된 프레임 수마다 한 번씩만 처리
    if frame_count % FRAME_SKIP != 0:
        frame_count += 1
        continue

    results = model.track(frame, persist=True, conf=0.5)
    boxes = results[0].boxes

    for box in boxes:
        x1, y1, x2, y2 = map(int, box.xyxy[0].cpu().numpy())
        cls = int(box.cls[0].cpu().numpy())
        conf = float(box.conf[0].cpu().numpy())
        label = f"{class_names[cls]}: {conf:.2f}"
        class_name = class_names[cls]

        # 현재 시간 확인
        current_time = time.time()
        
        # 동일 클래스에 대해 최소 간격 확인 (이벤트 중복 방지)
        if class_name in last_event_time and \
           (current_time - last_event_time[class_name]) < EVENT_COOLDOWN:
            continue  # 쿨다운 시간이 지나지 않았으면 이벤트 전송 건너뛰기
        
        # 이벤트 전송 시간 기록
        last_event_time[class_name] = current_time

        cv2.rectangle(frame, (x1, y1), (x2, y2), (0, 255, 0), 2)
        cv2.putText(frame, label, (x1, y1 - 10),
                    cv2.FONT_HERSHEY_SIMPLEX, 0.6, (0, 255, 0), 2)

        # --- 이미지 데이터 전송 형식 선택 ---
        mode = 'base64'      # Base64 문자열만 전송
        img_data = encode_image(frame, mode=mode)

        # --- 감지 이벤트 데이터 ---
        event_data = {
            "streamUrl": "rtsp://210.99.70.120:1935/live/cctv005.stream",  # 실제 운영환경에서는 RTSP 주소 사용
            "timestamp": datetime.utcnow().isoformat() + 'Z',
            "confidence": conf,
            "bounding_box": {
                "x": x1,
                "y": y1,
                "width": x2 - x1,
                "height": y2 - y1
            },
            "imageData": img_data,
            "metadata": {
                "class": class_name,
                "frame_id": frame_count
            }
        }

        # --- Socket.IO로 이벤트 전송 ---
        if sio.connected:
            sio.emit('detection_event', event_data)
            print(f"이벤트 전송됨: {class_name}, 신뢰도: {conf:.2f}")
        else:
            print("소켓 연결이 끊김, 재연결 시도...")
            try:
                sio.connect(connection_url, transports=['websocket'])
            except Exception as e:
                print(f"재연결 실패: {e}")

    out.write(frame)
    frame_count += 1

print("비디오 처리 완료. 자원 정리 중...")
cap.release()
out.release()

# 소켓 연결 정리
if sio.connected:
    print("소켓 연결 종료 중...")
    sio.disconnect()

print("프로그램 종료")