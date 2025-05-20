from glob import glob
import random
import os
from collections import defaultdict

random.seed(55)

train = glob('/workspace/team_5/Data/labels/Train/*.txt')
train_real = [f for f in train if "PositiveSynthetic" not in os.path.basename(f) and "PositiveSyntheticDB" not in os.path.basename(f)]
train_synth = [f for f in train if "PositiveSynthetic" in os.path.basename(f) or "PositiveSyntheticDB" in os.path.basename(f)]
region_files = defaultdict(list)
for f in train_real:
    filename = os.path.basename(f)
    parts = filename.split('_')
    region = parts[2]
    region_files[region].append(f)
train_real_sample = []
for region, files in region_files.items():
    sampled = random.sample(files, min(len(files), 5000))
    train_real_sample.extend(sampled)
train_synth_sample = random.sample(train_synth, len(train_real_sample) // 4)
train_sample = train_real_sample + train_synth_sample
train_img_list = [
    f'/workspace/team_5/Data/images/Train/{os.path.splitext(os.path.basename(f))[0]}.jpg'
    for f in train_sample
]

val = glob('/workspace/team_5/Data/labels/Val/*.txt')
val_real = [f for f in val if "PositiveSynthetic" not in os.path.basename(f) and "PositiveSyntheticDB" not in os.path.basename(f)]
region_files_val = defaultdict(list)
for f in val_real:
    filename = os.path.basename(f)
    parts = filename.split('_')
    region = parts[2]
    region_files_val[region].append(f)
val_sample = []
for region, files in region_files_val.items():
    sampled = random.sample(files, min(len(files), 5000))
    val_sample.extend(sampled)
val_img_list = [
    f'/workspace/team_5/Data/images/Val/{os.path.splitext(os.path.basename(f))[0]}.jpg'
    for f in val_sample
]

os.makedirs('/workspace/team_5', exist_ok=True)
with open('/workspace/team_5/train.txt', 'w') as f:
    f.write('\n'.join(train_img_list) + '\n')
with open('/workspace/team_5/val.txt', 'w') as f:
    f.write('\n'.join(val_img_list) + '\n')
