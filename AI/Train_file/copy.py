import shutil
import os

data_base = 'content/workspace/team_5/Data'
selected_base = os.path.join(data_base, 'selected')
train_img_list = open('content/workspace/team_5/train.txt','r')
val_img_list = open('content/workspace/team_5/val.txt','r')
missing_img_cnt = 0


for img_path in train_img_list:
    img_name = os.path.splitext(os.path.basename(img_path))[0] + '.jpg'
    label_name = os.path.splitext(img_name)[0] + '.txt'

    src_img = os.path.join(data_base, 'images/Train', img_name)
    src_label = os.path.join(data_base, 'labels/Train', label_name)

    dst_img_dir = os.path.join(selected_base, 'images/Train')
    dst_label_dir = os.path.join(selected_base, 'labels/Train')

    os.makedirs(dst_img_dir, exist_ok=True)
    os.makedirs(dst_label_dir, exist_ok=True)

    dst_img = os.path.join(dst_img_dir, img_name)
    dst_label = os.path.join(dst_label_dir, label_name)

    if os.path.exists(src_img):
        shutil.copy2(src_img, dst_img)
    else:
        #print(f"[Train] 이미지 파일 없음: {src_img}")
        #print(img_name)
        missing_img_cnt += 1
    
    if os.path.exists(src_label):
        #print(label_name)
        shutil.copy2(src_label, dst_label)
    else:
        print(f"[Train] 라벨 파일 없음: {src_label}")

for img_path in val_img_list:
    img_name = os.path.splitext(os.path.basename(img_path))[0] + '.jpg'
    label_name = os.path.splitext(img_name)[0] + '.txt'

    src_img = os.path.join(data_base, 'images/Val', img_name)
    src_label = os.path.join(data_base, 'labels/Val', label_name)

    dst_img_dir = os.path.join(selected_base, 'images/Val')
    dst_label_dir = os.path.join(selected_base, 'labels/Val')

    os.makedirs(dst_img_dir, exist_ok=True)
    os.makedirs(dst_label_dir, exist_ok=True)

    dst_img = os.path.join(dst_img_dir, img_name)
    dst_label = os.path.join(dst_label_dir, label_name)

    if os.path.exists(src_img):
        shutil.copy2(src_img, dst_img)
    else:
        #print(f"[Val] 이미지 파일 없음: {src_img}")
        missing_img_cnt += 1
    
    if os.path.exists(src_label):
        shutil.copy2(src_label, dst_label)
    else:
        print(f"[Val] 라벨 파일 없음: {src_label}")

print(f"missing images: {missing_img_cnt}")
print("done")
