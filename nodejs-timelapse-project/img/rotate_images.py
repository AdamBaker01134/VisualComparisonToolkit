from PIL import Image
import argparse
import os

ACCEPTED_FILETYPES = [
    "jpeg",
    "jpg",
    "png",
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
    "--rotation",
    type=int,
    required=True,
    help="Desired rotation in degrees"
)

def rotate_images(src_dir, rotation):
    """
    Rotate all images by a specified amount, including images in lower directories.
    """
    print("Rotation Started for " + src_dir)
    rotated = 0
    files = os.listdir(src_dir)
    total_files = len(files)
    for filename in files:
        print("Progress: " + str(rotated) + "/" + str(total_files), end="\r")
        if os.path.isdir(src_dir + "/" + filename):
            rotate_images(src_dir + "/" + filename, rotation)
        elif os.path.isfile(src_dir + "/" + filename):
            if filename.split(".")[-1] not in ACCEPTED_FILETYPES:
                continue
            im = Image.open(src_dir + "/" + filename)
            rotated_im = im.rotate(float(rotation), Image.NEAREST)
            rotated += 1
            rotated_im.save(src_dir + "/" + filename, optimize=True)
            im.close()
    print("Rotation Done for " + src_dir)


if __name__ == "__main__":
    args = parser.parse_args()
    if args.rotation % 90 != 0:
        raise ValueError("Rotation must be a multiple of 90 degrees")
    rotate_images(args.root, args.rotation)