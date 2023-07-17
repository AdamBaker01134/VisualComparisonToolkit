import os
import math
import time
import argparse
import json
from PIL import Image, ImageOps, ImageFilter, ImageStat

parser = argparse.ArgumentParser()

parser.add_argument(
    "--input",
    type=str,
    required=True,
    help="Path to folder of images"
)

parser.add_argument(
    "--name",
    type=str,
    required=True,
    help="Name of the dataset"
)

parser.add_argument(
    "--noresize",
    action="store_true",
    help="disable resizing in processing steps"
)

parser.add_argument(
    "--brightness",
    type=int,
    default=100,
    help="Brightness threshold for images to be included/excluded"
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
    if (os.path.isdir("./temp") and os.path.isfile(img_path)):
        os.remove(img_path)
        os.rmdir("./temp")

    if (optimal_image_width > smallest_image_width):
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
        if os.path.isdir(src_dir + "/" + filename):
            # Recurse into the sub-directory
            sub_dir_largest_image, sub_dir_largest_image_size, sub_dir_smallest_image_width = find_optimizing_properties(
                src_dir + "/" + filename)
            if sub_dir_largest_image_size > largest_image_size:
                largest_image = sub_dir_largest_image
                largest_image_size = sub_dir_largest_image_size
            if sub_dir_smallest_image_width < smallest_image_width:
                smallest_image_width = sub_dir_smallest_image_width
        elif os.path.isfile(src_dir + "/" + filename) and filename != "Thumbs.db":
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
    Calculate the perceived brightness of an image using the method described here: http://alienryderflex.com/hsp.html
    """
    stat = ImageStat.Stat(im)
    r = stat.mean[0]
    g = stat.mean[1]
    b = stat.mean[2]
    return math.sqrt(0.241*(r**2) + 0.691*(g**2) + 0.068*(b**2))


def get_timestamps(src_dir):
    """
    Generate the timestamps from a given json file.
    If the json file does not exist in the src directory or its parent directory, just return empty list
    """
    dir = src_dir
    result = []
    if os.path.isfile(src_dir + "/files_timestamps.json"):
        dir = src_dir + "/files_timestamps.json"
    elif os.path.isfile(src_dir + "/../files_timestamps.json"):
        dir = src_dir + "/../files_timestamps.json"
    else:
        return result

    file_in = open(dir, "r")
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
    file_out = open(path, "w")
    for something in listy:
        file_out.write(str(something) + "\n")
    file_out.close()


def write_to_datasets_json(output_dir, name):
    """
    Write a processed dataset to datasets.json file.
    TODO: Add in sub-foldering.
    """
    data = {
        "name": name,
        "dir": "original",
        "visible": True,
        "filters": ["edges", "emboss", "grayscale", "black_and_white"],
    }

    if not os.path.isfile(output_dir + "/datasets.json"):
        with open(output_dir + "/datasets.json", "w") as f:
            json.dump([data], f, indent=4)
            f.close()
    else:
        with open(output_dir + "/datasets.json", "r+") as f:
            file_data = json.load(f)
            file_data = [data for data in file_data if data["name"] != name]
            file_data.append(data)
            f.seek(0)
            json.dump(file_data, f, indent=4)


def process_images(src_dir, output_dir, options):
    """
    Process the images within the source directory and output them into an output directory recursively.
    Processing steps:
    - resize
    - compress
    - filters:
        - find edges
        - emboss
        - grayscale
        - black_and_white
    """

    print("Image Processing Started for " + src_dir)

    # Create target image directories if they don't already exist
    if not os.path.isdir(output_dir + "/original"):
        os.mkdir(output_dir + "/original")
    if not os.path.isdir(output_dir + "/edges"):
        os.mkdir(output_dir + "/edges")
    if not os.path.isdir(output_dir + "/emboss"):
        os.mkdir(output_dir + "/emboss")
    if not os.path.isdir(output_dir + "/grayscale"):
        os.mkdir(output_dir + "/grayscale")
    if not os.path.isdir(output_dir + "/black_and_white"):
        os.mkdir(output_dir + "/black_and_white")
    processed = 0
    raw_timestamps = get_timestamps(src_dir)
    frames = []
    timestamps = []
    files = os.listdir(src_dir)
    for filename in files:
        if os.path.isdir(src_dir + "/" + filename):
            process_images(src_dir + "/" + filename,
                           output_dir + "/" + filename, options)
        elif os.path.isfile(src_dir + "/" + filename) and filename != "Thumbs.db":
            print("Progress: " + str(processed) + "/" + str(len(files)), end="\r")
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
                        width_ratio = (options["width"]/float(im.size[0]))
                        height = int((float(im.size[1]) * float(width_ratio)))
                        im_resized = im.resize(
                            (options["width"], height), Image.Resampling.LANCZOS)
                        im.close()
                        im = im_resized

                    # Save orignal (or resized) image in the "original" directory
                    im.save(output_dir + "/original/" +
                            img_name, optimize=True)

                    # Edge filter
                    im_edge = im.filter(ImageFilter.FIND_EDGES)
                    im_edge.save(output_dir + "/edges/" +
                                 img_name, optimize=True)

                    # Emboss filter
                    im_emboss = im.filter(ImageFilter.EMBOSS)
                    im_emboss.save(output_dir + "/emboss/" +
                                   img_name, optimize=True)

                    # Grayscale filter
                    im_grayscale = im.convert("L")
                    im_grayscale.save(
                        output_dir + "/grayscale/" + img_name, optimize=True)

                    # Black and White filter
                    im_black_and_white = im.convert("1")
                    im_black_and_white.save(
                        output_dir + "/black_and_white/" + img_name, optimize=True)

                    im_edge.close()
                    im_grayscale.close()

                im.close()
            except OSError:
                print("Error while processing " + filename + ". Ignorning file and continuing...")
            processed += 1

    write_list_to_txt(output_dir + "/frames.txt", frames)
    write_list_to_txt(output_dir + "/timestamps.txt", timestamps)
    print("Processing Done for " + src_dir)


if __name__ == "__main__":
    args = parser.parse_args()
    dataset_name = args.name
    src_dir = args.input
    output_dir = "./" + dataset_name
    if (not os.path.isdir(output_dir)):
        os.makedirs(output_dir)
    sub_dirs = os.listdir(src_dir)
    options = {
        "resize": False,
        "brightness_threshold": args.brightness,
    }
    if not args.noresize:
        options["resize"] = True
        options["width"] = find_optimal_image_width(src_dir, 60000)

    process_images(src_dir, output_dir, options)
    write_to_datasets_json("./", dataset_name)
    print("Image Processing complete.")
