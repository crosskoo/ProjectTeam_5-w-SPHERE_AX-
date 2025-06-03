import cv2
import os
import time
from ultralytics import YOLO

rtsp_url = "rtsp://127.0.0.1:8554/fire"
model_path = "model/4.pt"
output_video_path = "rtsp_fire_detection_all_frames_periodic_analysis.mp4"
FRAMES_TO_ANALYZE_IN_CYCLE = 5
CYCLE_LENGTH = 30

if not os.path.exists(model_path):
    print(f"오류: 모델 파일을 찾을 수 없습니다 - {model_path}")
    exit(1)

model = YOLO(model_path)
class_names = model.names

def open_capture():
    cap = cv2.VideoCapture(rtsp_url)
    if not cap.isOpened():
        print(f"경고: RTSP 스트림에 연결할 수 없습니다: {rtsp_url}")
        return None
    return cap

cap = open_capture()
if cap is None:
    print("RTSP 스트림 연결 실패. 5초 후 재시도합니다.")
    time.sleep(5)
    cap = open_capture()
    if cap is None:
        print("재시도 실패. 프로그램을 종료합니다.")
        exit(1)

frame_width = int(cap.get(cv2.CAP_PROP_FRAME_WIDTH))
frame_height = int(cap.get(cv2.CAP_PROP_FRAME_HEIGHT))
fps_from_stream = cap.get(cv2.CAP_PROP_FPS)
fps_to_use = fps_from_stream if fps_from_stream > 0 else 30.0
fourcc = cv2.VideoWriter_fourcc(*'mp4v')
out = cv2.VideoWriter(output_video_path, fourcc, fps_to_use, (frame_width, frame_height))
if not out.isOpened():
    print(f"오류: 비디오 파일({output_video_path})을 열거나 쓸 수 없습니다.")
    cap.release()
    exit(1)

total_frames_read_and_saved = 0
frames_actually_analyzed = 0

print("스트림 수신 및 처리 시작")

while True:
    ret, frame = cap.read()
    if ret:
        total_frames_read_and_saved += 1
        frame_to_write = frame

        if (total_frames_read_and_saved - 1) % CYCLE_LENGTH < FRAMES_TO_ANALYZE_IN_CYCLE:
            results = model.track(frame, persist=True, conf=0.5)
            frames_actually_analyzed += 1
            if results and hasattr(results[0], 'boxes') and results[0].boxes is not None and len(results[0].boxes) > 0:
                frame_to_write = results[0].plot()
        out.write(frame_to_write)
        continue

    # 프레임 수신 실패: 5초 동안 재시도
    print("프레임 수신 실패. 5초 동안 재연결 시도 중...")
    cap.release()
    start_wait = time.time()
    reconnected = False
    while time.time() - start_wait < 5:
        cap = open_capture()
        if cap is not None:
            ret, frame = cap.read()
            if ret:
                print("스트림 재연결 성공. 프레임 처리를 재개합니다.")
                reconnected = True
                break
            else:
                cap.release()
        time.sleep(0.5)
    if not reconnected:
        print("5초 동안 스트림이 복구되지 않아 종료합니다.")
        break

cap.release()
out.release()
print(f"\nRTSP 스트림 처리 및 비디오 저장 완료.")
print(f"총 읽고 저장한 프레임: {total_frames_read_and_saved}")
print(f"실제로 객체 탐지를 수행한 프레임 수: {frames_actually_analyzed}")
print(f"결과 비디오가 다음 경로에 저장되었습니다: {output_video_path}")




