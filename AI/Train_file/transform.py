import os
import json

path = "/workspace/team_5/Data/labels/Train/"
file_lists = os.listdir(path)
json_file_lists = []

for file_name in sorted(file_lists):
    if file_name.split(".")[-1] == "json":
        json_file_lists.append(file_name)

for j, json_file in enumerate(json_file_lists):
    with open(os.path.join(path, json_file), "r") as file:
        json_data = json.load(file)

    WIDTH = float(json_data['images'][0]['width'])
    HEIGHT = float(json_data['images'][0]['height'])

    new_file = open(os.path.join(path, json_data['images'][0]['file_name'].split(".")[0] + '.txt'), "w")

    for i, data in enumerate(json_data['annotations']):
        class_id = data['category_id'] - 1

        if class_id < 0 or class_id > 5:
            print(class_id)

        x_left_top = WIDTH
        y_left_top = HEIGHT
        x_right_bottom = 0.0
        y_right_bottom = 0.0

        for _, seg_list in enumerate(data['segmentation']):
            for j, seg in enumerate(seg_list):
                if j % 2 == 0:
                    x_left_top = float(seg) if float(seg) < x_left_top else x_left_top
                    x_right_bottom = float(seg) if float(seg) > x_right_bottom else x_right_bottom
                else:
                    y_left_top = float(seg) if float(seg) < y_left_top else y_left_top
                    y_right_bottom = float(seg) if float(seg) > y_right_bottom else y_right_bottom

        width = x_right_bottom - x_left_top
        height = y_right_bottom - y_left_top
        normalize_width = abs(width) / WIDTH
        normalize_height = abs(height) / HEIGHT
        ctr_x = x_left_top + width / 2
        normalize_ctr_x = ctr_x / WIDTH
        ctr_y = y_left_top + height / 2
        normalize_ctr_y = ctr_y / HEIGHT

        new_data = "{} {} {} {} {}\n".format(
            str(class_id),
            str(normalize_ctr_x),
            str(normalize_ctr_y),
            str(normalize_width),
            str(normalize_height)
        )
        new_file.write(new_data)

    new_file.close()

path = "/workspace/team_5/Data/labels/Val/"
file_lists = os.listdir(path)
json_file_lists = []

for file_name in sorted(file_lists):
    if file_name.split(".")[-1] == "json":
        json_file_lists.append(file_name)

for j, json_file in enumerate(json_file_lists):
    with open(os.path.join(path, json_file), "r") as file:
        json_data = json.load(file)

    WIDTH = float(json_data['images'][0]['width'])
    HEIGHT = float(json_data['images'][0]['height'])

    new_file = open(os.path.join(path, json_data['images'][0]['file_name'].split(".")[0] + '.txt'), "w")

    for i, data in enumerate(json_data['annotations']):
        class_id = data['category_id'] - 1

        if class_id < 0 or class_id > 5:
            print(class_id)

        x_left_top = WIDTH
        y_left_top = HEIGHT
        x_right_bottom = 0.0
        y_right_bottom = 0.0

        for _, seg_list in enumerate(data['segmentation']):
            for j, seg in enumerate(seg_list):
                if j % 2 == 0:
                    x_left_top = float(seg) if float(seg) < x_left_top else x_left_top
                    x_right_bottom = float(seg) if float(seg) > x_right_bottom else x_right_bottom
                else:
                    y_left_top = float(seg) if float(seg) < y_left_top else y_left_top
                    y_right_bottom = float(seg) if float(seg) > y_right_bottom else y_right_bottom

        width = x_right_bottom - x_left_top
        height = y_right_bottom - y_left_top
        normalize_width = abs(width) / WIDTH
        normalize_height = abs(height) / HEIGHT
        ctr_x = x_left_top + width / 2
        normalize_ctr_x = ctr_x / WIDTH
        ctr_y = y_left_top + height / 2
        normalize_ctr_y = ctr_y / HEIGHT

        new_data = "{} {} {} {} {}\n".format(
            str(class_id),
            str(normalize_ctr_x),
            str(normalize_ctr_y),
            str(normalize_width),
            str(normalize_height)
        )
        new_file.write(new_data)

    new_file.close()
