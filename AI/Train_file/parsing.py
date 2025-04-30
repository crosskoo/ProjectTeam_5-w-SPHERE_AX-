import os
import json

path = "/workspace/team_5/Data/labels/Train/" #json2txt.ipynb 파일과 동일한 경로에 있기 때문에 다음과 같이 선언

file_lists = os.listdir(path) #path 경로 내 모든 파일명 리스트 형태로 불러오기
#print(file_lists)
#.json 확장자만 저장하기
json_file_lists = []
for file_name in sorted(file_lists):
    if file_name.split(".")[-1] == "json":
        json_file_lists.append(file_name)

for j, json_file in enumerate(json_file_lists):
  #print(j,  json_file) #00000005.json 한개에 대해서 json2txt 변환하기 위해 해당 인덱스에 00000005.json 파일 불러오기
  with open(os.path.join(path, json_file),"r") as file:
      json_data = json.load(file) #json 파일 내 데이터 읽어오기

  WIDTH = float(json_data['images'][0]['width'])
  HEIGHT = float(json_data['images'][0]['height'])

  new_file = open(os.path.join(path, json_data['images'][0]['file_name'].split(".")[0]+'.txt'),"w") #"w": 쓰기 형식, "r": 읽기 형식, "a": 이어쓰기 형식

  #json 데이터 내 정보 읽어오기
  for i, data in enumerate(json_data['annotations']):
      class_id = data['category_id']
      if class_id<0 or class_id>6:
        print(class_id)

      normalize_ctr_x = float(data['bbox'][0]) / WIDTH
      normalize_ctr_y = float(data['bbox'][1]) / HEIGHT
      normalize_width = float(data['bbox'][2])  / WIDTH
      normalize_height = float(data['bbox'][3]) / HEIGHT
      #텍스트 파일에 YOLO 학습용 데이터 포맷으로 정리
      #모든 값은 string 타입으로 저장해야함
      new_data = "{} {} {} {} {}\n".format(str(class_id), str(normalize_ctr_x), str(normalize_ctr_y), str(normalize_width), str(normalize_height))
      new_file.write(new_data)

  new_file.close()

################################################
path = "/workspace/team_5/Data/labels/Val/" #json2txt.ipynb 파일과 동일한 경로에 있기 때문에 다음과 같이 선언

file_lists = os.listdir(path) #path 경로 내 모든 파일명 리스트 형태로 불러오기
#print(file_lists)
#.json 확장자만 저장하기
json_file_lists = []
for file_name in sorted(file_lists):
    if file_name.split(".")[-1] == "json":
        json_file_lists.append(file_name)

for j, json_file in enumerate(json_file_lists):
  #print(j,  json_file) #00000005.json 한개에 대해서 json2txt 변환하기 위해 해당 인덱스에 00000005.json 파일 불러오기
  with open(os.path.join(path, json_file),"r") as file:
      json_data = json.load(file) #json 파일 내 데이터 읽어오기

  WIDTH = float(json_data['images'][0]['width'])
  HEIGHT = float(json_data['images'][0]['height'])

  new_file = open(os.path.join(path, json_data['images'][0]['file_name'].split(".")[0]+'.txt'),"w") #"w": 쓰기 형식, "r": 읽기 형식, "a": 이어쓰기 형식

  #json 데이터 내 정보 읽어오기
  for i, data in enumerate(json_data['annotations']):
      class_id = data['category_id']
      if class_id<0 or class_id>6:
        print(class_id)

      normalize_ctr_x = float(data['bbox'][0]) / WIDTH
      normalize_ctr_y = float(data['bbox'][1]) / HEIGHT
      normalize_width = float(data['bbox'][2])  / WIDTH
      normalize_height = float(data['bbox'][3]) / HEIGHT
      #텍스트 파일에 YOLO 학습용 데이터 포맷으로 정리
      #모든 값은 string 타입으로 저장해야함
      new_data = "{} {} {} {} {}\n".format(str(class_id), str(normalize_ctr_x), str(normalize_ctr_y), str(normalize_width), str(normalize_height))
      new_file.write(new_data)

  new_file.close()