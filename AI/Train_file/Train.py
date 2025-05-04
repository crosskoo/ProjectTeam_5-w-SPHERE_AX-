import yaml
import ultralytics
from ultralytics import YOLO

with open('/workspace/team_5/Data/data.yaml', 'r') as f:
  data = yaml.safe_load(f)
#print(data)
#print(len(data['names']))

#ultralytics.checks()
model = YOLO("yolo11n.pt")

#option
'''
train_option = {
    'data': '/workspace/team_5/Data/data.yaml',
    'epochs': 10,
    'patience': 5,
    'batch': 32,
    'imgsz': 640,
    'optimizer': 'SGD',   
    'weight_decay': 0.001,
    'degrees': 5.0,
    'translate': 0.1,
    'scale': 0.5,
    'shear': 0.0,
    'perspective': 0.0,
    'flipud': 0.0,
    'fliplr': 0.5,
    'hsv_h': 0.01,
    'hsv_s': 0.3,
    'hsv_v': 0.3
}
'''

#first train 
#results = model.train(data='/workspace/team_5/Data/data.yaml', epochs=10, patience=10, batch=32,imgsz=640)

#second train
#results = model.train(data='/workspace/team_5/Data/data.yaml', epochs=10, patience=5, batch=64,imgsz=640, optimizer='AdamW')

#third_train
#results = model.train(**train_option)

#fourth train 
results = model.train(data='/workspace/team_5/Data/sample_data.yaml', epochs=50, patience=10, batch=32,imgsz=640)

#results = model.predict(source='/workspace/team_5/Data/labels/Test_Images/',save=True)
