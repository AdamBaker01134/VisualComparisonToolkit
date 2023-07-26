"""
Image processing script to configure a directory of images into a file structure usable
in the video comparison system.
"""

import os
import math
import time
import argparse
import json
from PIL import Image, ImageOps, ImageFilter, ImageStat

IGNORED_FILES = [
    "Thumbs.db",
    "files_timestamps.json",
    ".AppleDouble",
]

parser = argparse.ArgumentParser()

parser.add_argument(
    "--root",
    type=str,
    required=False,
    default="../../../greenskeye/20230522",
    help="Path to root directory of images"
)

parser.add_argument(
    "--name",
    type=str,
    required=True,
    help="Name of the dataset"
)

parser.add_argument(
    "--size",
    type=int,
    required=False,
    default=0,
    help="Specified width parameter to avoid searching for optimal width",
)

parser.add_argument(
    "--noresize",
    action="store_true",
    help="Disable resizing in processing steps"
)

parser.add_argument(
    "--max",
    type=int,
    required=False,
    default=-1,
    help="Specified max number of images to process per directory"
)

parser.add_argument(
    "--start",
    type=int,
    required=False,
    default=0,
    help="Specified start index for each directory of images"
)

parser.add_argument(
    "--step",
    type=int,
    required=False,
    default=1,
    help="Step size to move through the dataset (essentially frame rate)"
)

parser.add_argument(
    "--brightness",
    type=int,
    default=100,
    help="Brightness threshold for images to be included/excluded"
)

parser.add_argument(
    "--delete",
    action="store_true",
    help="Delete named dataset and its entry in the datasets.json file"
)


def find_optimal_image_width(src_dir, max_img_size):
    """
    Find the optimal image width for images within the source directory to
    be smaller than the max image size.
    """
    if (not os.path.isdir("./temp")):
        os.mkdir("./temp")
    else:
        raise FileExistsError(
            "Temp folder cannot exist within the root directory prior to running this script")

    print("Finding optimal image width for " + src_dir + "...", end="\r")

    largest_image, largest_image_size, smallest_image_width = find_optimizing_properties(
        src_dir)
    img_path = "./temp/" + os.path.basename(largest_image)
    im = Image.open(largest_image)
    im.save(img_path, optimize=True)
    im.close()
    found = False
    optimal_image_width = largest_image_size
    while not found:
        if os.path.getsize(img_path) < max_img_size:
            found = True
        else:
            im = Image.open(img_path)
            resized_image = im.resize(
                (im.width // 2, im.height // 2), Image.Resampling.LANCZOS)
            optimal_image_width = resized_image.width
            resized_image.save(img_path)
            im.close()
            resized_image.close()
    if os.path.isdir("./temp") and os.path.isfile(img_path):
        os.remove(img_path)
        os.rmdir("./temp")

    if optimal_image_width > smallest_image_width:
        optimal_image_width = smallest_image_width

    print("Optimal image width is " +
          str(optimal_image_width) + " for " + src_dir)
    return optimal_image_width


def find_optimizing_properties(src_dir):
    """
    Find the name and size of the largest image within the current directory and its sub-directories
    and the smallest image width.
    Search the current directory and its sub-directories for the following attributes:
    - largest image file name
    - largest image file size
    - smallest image file width
    """
    files = os.listdir(src_dir)
    largest_image = ""
    largest_image_size = 0
    smallest_image_width = 1000000000
    for filename in files:
        if filename in IGNORED_FILES:
            continue
        if os.path.isdir(src_dir + "/" + filename):
            # Recurse into the sub-directory
            sub_dir_largest_image, sub_dir_largest_image_size, sub_dir_smallest_image_width = find_optimizing_properties(src_dir + "/" + filename)
            if sub_dir_largest_image_size > largest_image_size:
                largest_image = sub_dir_largest_image
                largest_image_size = sub_dir_largest_image_size
            if sub_dir_smallest_image_width < smallest_image_width:
                smallest_image_width = sub_dir_smallest_image_width
        elif os.path.isfile(src_dir + "/" + filename):
            img_size = os.path.getsize(src_dir + "/" + filename)
            if img_size > largest_image_size:
                largest_image = src_dir + "/" + filename
                largest_image_size = img_size
            im = Image.open(src_dir + "/" + filename)
            img_width = im.width
            if img_width < smallest_image_width:
                smallest_image_width = img_width
            im.close()
    return (largest_image, largest_image_size, smallest_image_width)


def brightness(im):
    """
    Calculate the perceived brightness of an image using the method described here:
    http://alienryderflex.com/hsp.html
    """
    stat = ImageStat.Stat(im)
    if len(stat.mean) < 3:
        return 100
    r = stat.mean[0]
    g = stat.mean[1]
    b = stat.mean[2]
    return math.sqrt(0.241*(r**2) + 0.691*(g**2) + 0.068*(b**2))


def get_timestamps(src_dir):
    """
    Generate the timestamps from a given json file.
    If the json file does not exist in the src directory or its parent directory,
    just return empty list.
    """
    dir = src_dir
    result = []
    if os.path.isfile(src_dir + "/files_timestamps.json"):
        dir = src_dir + "/files_timestamps.json"
    elif os.path.isfile(src_dir + "/../files_timestamps.json"):
        dir = src_dir + "/../files_timestamps.json" # sometimes this is required
    else:
        return result

    with open(dir, "r", encoding="utf-8") as file_in:
        dates = file_in.readlines()
        for timestamp in dates:
            date = timestamp.rstrip()
            date = time.strptime(date, "%Y-%m-%dT%H:%M:%S")
            date = time.mktime(date)  # convert time to epoch
            date -= 21600  # subtract 6 hours
            date = time.localtime(date)
            result.append(time.asctime(date))
        file_in.close()
        return result


def write_list_to_txt(path, listy):
    """
    Write a list of things to a text file at a given path.
    """
    with open(path, "w", encoding="utf-8") as file_out:
        for something in listy:
            file_out.write(str(something) + "\n")
        file_out.close()


def write_dataset_to_json(path_to_json, data):
    """
    Write a processed dataset to datasets.json file.
    """

    if not os.path.isfile(path_to_json):
        with open(path_to_json, "w", encoding="utf-8") as f:
            json.dump([data], f, indent=4)
            f.close()
    else:
        with open(path_to_json, "r+", encoding="utf-8") as f:
            file_data = json.load(f)
            file_data = [item for item in file_data if item["dir"] != data["dir"]]
            file_data.append(data)
            f.seek(0)
            json.dump(file_data, f, indent=4)
            f.close()


def remove_dataset_from_json(path_to_json, name):
    """
    Remove a processed dataset from datasets.json file.
    Throw an exception if the dataset does not exist in the JSON file or if the JSON file does
    not exist.
    """
    if not os.path.isfile(path_to_json):
        raise FileNotFoundError("datasets.json file not found")

    with open(path_to_json, "r", encoding="utf-8") as f:
        file_data = json.load(f)
        # filtered_data = [data for data in file_data if data["name"] != name]
        filtered_data = [ data for data in file_data if os.path.basename(data["dir"]) != name]
        f.close()
        if len(file_data) == len(filtered_data):
            raise RuntimeError("Dataset with name " + name + " does not exist in datasets.json")

    with open(path_to_json, "w", encoding="utf-8") as f:
        f.seek(0)
        json.dump(filtered_data, f, indent=4)
        f.close()


def process_images(src_dir, output_dir, options):
    """
    Process the images within the source directory and output them into an output directory
    recursively.
    Processing steps:
    - resize
    - compress
    - filters:
        - find edges
        - emboss
        - grayscale
    """

    print("Image Processing Started for " + src_dir)

    data = {
        "dir": output_dir[1:],
        "containsImages": False,
        "visible": True,
        "sub": [],
    }

    processed = 0
    raw_timestamps = get_timestamps(src_dir)
    frames = []
    timestamps = []
    files = os.listdir(src_dir)
    total_files = len(files)
    max_images = options["max_images"]
    if max_images < 0 or max_images > total_files:
        max_images = total_files
    start_index = options["start_index"]
    if start_index + max_images >= total_files:
        start_index = total_files - max_images
    for filename in files:
        if filename in IGNORED_FILES:
            processed += 1
            continue
        if os.path.isdir(src_dir + "/" + filename):
            sub_data = process_images(src_dir + "/" + filename, output_dir + "/" + filename, options)
            data["sub"].append(sub_data)
        elif os.path.isfile(src_dir + "/" + filename):
            print("Progress: " + str(processed) + "/" + str(total_files), end="\r")
            if processed % options["step"] != 0 or processed < start_index or processed >= max_images * options["step"] + start_index:
                processed += 1
                continue
            # Create target image directories if they don't already exist
            if "filters" not in data:
                if not os.path.isdir(output_dir + "/original"):
                    os.makedirs(output_dir + "/original")
                if not os.path.isdir(output_dir + "/edges"):
                    os.makedirs(output_dir + "/edges")
                if not os.path.isdir(output_dir + "/emboss"):
                    os.makedirs(output_dir + "/emboss")
                if not os.path.isdir(output_dir + "/grayscale"):
                    os.makedirs(output_dir + "/grayscale")
                data["containsImages"] = True
                data["filters"] = [
                    "edges",
                    "emboss",
                    "grayscale",
                ]
            try:
                img_path = src_dir + "/" + filename
                img_name = os.path.basename(img_path)
                im = Image.open(img_path)
                im = ImageOps.exif_transpose(im)

                if brightness(im) > options["brightness_threshold"]:
                    frames.append(img_name)
                    if processed < len(raw_timestamps):
                        timestamps.append(raw_timestamps[processed])
                    if options["resize"] is True:
                        # Resizing image
                        width_ratio = options["width"]/float(im.size[0])
                        height = int((float(im.size[1]) * float(width_ratio)))
                        im_resized = im.resize(
                            (options["width"], height), Image.Resampling.LANCZOS)
                        im.close()
                        im = im_resized

                    # Save orignal (or resized) image in the "original" directory
                    im.save(output_dir + "/original/" + img_name, optimize=True)

                    # Edge filter
                    im_edge = im.filter(ImageFilter.FIND_EDGES)
                    im_edge.save(output_dir + "/edges/" + img_name, optimize=True)

                    # Emboss filter
                    im_emboss = im.filter(ImageFilter.EMBOSS)
                    im_emboss.save(output_dir + "/emboss/" + img_name, optimize=True)

                    # Grayscale filter
                    im_grayscale = im.convert("L")
                    im_grayscale.save(output_dir + "/grayscale/" + img_name, optimize=True)

                    im_edge.close()
                    im_emboss.close()
                    im_grayscale.close()
                    processed += 1

                im.close()
            except OSError:
                print("Error while processing " + filename + ". Ignorning file and continuing...")

    if data["containsImages"]:
        frames.sort()
        write_list_to_txt(output_dir + "/frames.txt", frames)
        write_list_to_txt(output_dir + "/timestamps.txt", timestamps)
    print("Processing Done for " + src_dir)
    return data


def delete_directory(dir):
    """
    Recursively delete a directory and its contents.
    """
    if not os.path.isdir(dir):
        raise FileNotFoundError("Path to directory was incorrect.")
    files = os.listdir(dir)
    for filename in files:
        file_path = dir + "/" + filename
        if os.path.isdir(file_path):
            delete_directory(file_path)
        else:
            os.remove(file_path)
    os.rmdir(dir)

if __name__ == "__main__":
    args = parser.parse_args()
    src_dir = args.root
    dataset_name = args.name
    output_dir = "./" + dataset_name
    if args.delete:
        try:
            delete_directory(output_dir)
            remove_dataset_from_json("./datasets.json", dataset_name)
        except FileNotFoundError as e:
            print("File Not Found Error: " + str(e))
            exit(1)
        except RuntimeError as e:
            print("Runtime Error: " + str(e))
            exit(1)
        print("Successfully removed " + dataset_name + " dataset!")
        exit(0)

    if not os.path.isdir(output_dir):
        os.makedirs(output_dir)
    sub_dirs = os.listdir(src_dir)
    options = {
        "resize": False,
        "brightness_threshold": args.brightness,
        "start_index": args.start,
        "max_images": args.max,
        "step": args.step,
    }
    if args.size > 0:
        options["resize"] = True
        options["width"] = args.size
    elif not args.noresize:
        options["resize"] = True
        options["width"] = find_optimal_image_width(src_dir, 60000)

    dataDict = process_images(src_dir, output_dir, options)
    write_dataset_to_json("./datasets.json", dataDict)
    print("Image Processing complete.")
