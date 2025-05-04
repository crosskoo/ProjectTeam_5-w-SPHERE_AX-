from glob import glob
import random
import os

train_labels = glob('/workspace/team_5/Data/labels/Train/*.txt')
val_labels = glob('/workspace/team_5/Data/labels/Val/*.txt')

train_sample = random.sample(train_labels, max(1, int(len(train_labels) * 0.1)))
val_sample = random.sample(val_labels, max(1, int(len(val_labels) * 0.1)))

train_img_list = [f'/workspace/team_5/Data/images/Train/{os.path.splitext(os.path.basename(f))[0]}.jpg' for f in train_sample]
val_img_list = [f'/workspace/team_5/Data/images/Val/{os.path.splitext(os.path.basename(f))[0]}.jpg' for f in val_sample]

with open('/workspace/team_5/train.txt', 'w') as f:
    f.write('\n'.join(train_img_list) + '\n')

with open('/workspace/team_5/val.txt', 'w') as f:
    f.write('\n'.join(val_img_list) + '\n')
