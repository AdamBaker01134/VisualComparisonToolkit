#!/bin/bash

# Author: Michael van der Kamp

# One full script to process an entire batch images and prep them for
# timelapse delivery.
#
# Directory structure should be something like:
# img/nameOfPlot/full/*jpg
#
# Place this script into the directory 'img', then run it with:
#  ./processImages.sh nameOfPlot

#======================== Declarations ========================#

# Specify directory to work in. 
PLOT_DIR=''

# Specify source subdirectory for images.
FULL_DIR='full';

# Specify destination subdirectory for images.
HALF_DIR='half';
QTR_DIR='quarter';
THUMBS_DIR='thumbs';

# Description of three size stages.
FULL_DESC='full';
HALF_DESC='half';
QTR_DESC='quarter';

# Specify resizing geometry to work in stages of resizing by half.
GEOMETRY='50%';

# Specify destination files for filename list, brightness, and timestamps.
FRAME_LIST_FILE='frames.txt';
BRIGHTNESS_FILE='brightness.txt';
TIMESTAMP_FILE='timestamps.txt';

# Specify destination files for 'daylight' data.
SUMMER_FRAMES_FILE='summer-day-frames.txt'
SUMMER_TIMESTAMPS_FILE='summer-day-timestamps.txt'
SUMMER_INDICES_FILE='summer-day-indices.txt'

# Specify file to use for "ready file" of prepped image sets.
READY_FILE='plots.txt'

# Specify file to place image dimensions.
DIMENSIONS_FILE='dimensions.txt'

# Specify brightness threshold for selecting 'daylight' data.
THRESHOLD='5000';

# Specify frames per second for movie timestamps.
FPS='24';

# Specify timestamp format.
TS_FORMAT='pheno';

# Specify source file for JSON pheno timestamps.
TIMESTAMP_DATA='files_timestamps.json';

# Specify whether to print help.
HELP='no';

# Specify whether to delete generated data.
DELETE='no';

# Specify help message.
HELP_MSG="
Usage: ./processImages.sh [OPTION] PLOT_DIR
Process a batch of images for use in the timelapse platform.

PLOT_DIR must be present in the current working directory and contain a 
subdirectory 'full' (use option '-s' to specify a different directory) which 
itself *ONLY* contains the images you wish to use within the timelapse 
platform.

Directory structure should look like:
./PLOT_DIR/full/image.jpg

OPTIONS:

  -h, --help    Display this help and exit.
  --defaults    Display list of default values used, then exit.
  -g GEO        Use GEO instead of '50%' for image resizing.
                 - Must be a valid ImageMagick geometry.
                 - The same geometry will be used for both resizing steps.
  -t THRESH     Use THRESH as threshold for recognizing bright images.
                 - Default if unspecified is 5000.
  -s DIR        Use DIR instead of 'full' for image source subdirectory.
                 - DIR must exist and contain only full-sized timelapse
                    images.
  -d1 DIR DESC  Use DIR instead of 'half' for destination of images resized
                 during first phase, with appropriate short description DESC
  -d2 DIR DESC  Use DIR instead of 'quarter' for destination of images resized
                 during second phase, with appropriate short description DESC
  -f FILE       Use FILE instead of 'plots.txt' for file containing list of 
                 image sets that are ready to use.
  -p FILE       Use 'JSON' file for timestamps input. 
                 - The default. Check internal code for format.
  -m FPS        Generate movie timestamps from image filenames at FPS frames
                 per second.
  --clear       Delete all files previously created by this process, then exit.
                 - CAUTION: Any file or directory matching a filename used by
                    this process as a destination will be removed.
                    (Source files such as contents of 'full' left untouched.)
"

# Specify message displaying defaults.
DEFAULT_MSG="
Default values used:
 - Files and directories will go inside PLOT_DIR.
    - Image files will go in respective directories.
 - Files must not already exist.

    50%         Geometry used in resizing.
    5000        Threshold used for recognizing bright images.
                 - Higher values mean an image must be brighter.
                 - Lower values mean images can be darker.
    24          FPS used for movies.

    full        Source directory for full sized images.
                 - DESC: 'full'
                 - Must exist and contain only full-size timelapse images.
    half        Destination directory for half sized images.
                 - DESC: 'half'
                 - Must either not exist or be empty.
    quarter     Destination directory for quarter sized images.
                 - DESC: 'quarter'
                 - Must either not exist or be empty.
    thumbs      Destination directory for thumbnails.
    
    frames.txt      Destination file for image filenames list.
    brightness.txt  Destination file for list of image brightness values.
    timestamps.txt  Destination file for list of image timestamps.

    summer-day-frames.txt       Destination for filenames of bright images.
    summer-day-timestamps.txt   Destination for timestamps of bright images.
    summer-day-indices.txt      Destination for indices (in frames.txt) of
                                 bright images.
    
    plots.txt       File containing list of image sets that are ready to use.
                     - Will be stored in current working directory.
"
  
#======================== Function Definitions ========================#

# Test that a directory exists.
#
# ARGS:
#   1 : Directory to test.
function ensureDirectoryExists {
    if [ ! -d "$1" ];
    then
        echo "ERROR: Data source directory '$1' doesn't exist.";
        exit 1;
    fi
}

# Test that a directory is empty.
#
# ARGS:
#   1 : Directory to test.
function ensureDirectoryIsEmpty {
    if [ ! -z "$(ls $1)" ];
    then
        echo "ERROR: Data destination directory '$1' is not empty.";
        exit 1;
    fi
}

# Test that directory is not empty.
#
# ARGS:
#   1 : Directory to test.
function ensureDirectoryIsNotEmpty {
    if [ -z "$(ls $1)" ];
    then
        echo "ERROR: Data source directory '$1' is empty.";
        exit 1;
    fi
}

# Test that a file exists.
#
# ARGS:
#   1 : File to test.
function ensureFileExists {
    if [ ! -e "$1" ];
    then
        echo "ERROR: Data source file '$1' doesn't exist.";
        exit 1;
    fi
}

# Test that a file does not exist.
#
# ARGS:
#   1 : File to test.
function ensureFileDoesNotExist {
    if [ -e "$1" ];
    then
        echo "ERROR: Data destination file '$1' already exists.";
        exit 1;
    fi
}

# Make sure the given value is an integer between 1 and 60, inclusive.
#
# ARGS:
#   1 : Value to test.
function ensureIntegerFPS {
    if echo "$1" | egrep -qv "^[0-9]+$"; 
    then
        echo "ERROR: $1 is not an integer.";
        exit 1;
    elif [ "$1" -lt 1 -o "$1" -gt 60 ];
    then
        echo "ERROR: $1 is not in the acceptable range 1 - 60.";
        exit 1;
    fi
}

# Generate the list of file names.
#
# ARGS:
#   1 : Name of directory of images.
#   2 : Name of destination file for list of filenames.
function getFileNames {
    ls "$1" | sort -n > "$2";
    echo "Generated list of file names in '$2'.";
}

# Check that the source directory is valid and contains images.
#
# ARGS:
#   1 : Name of source directory of images.
function checkSourceDirectory {
    ensureDirectoryExists "$1";
    ensureDirectoryIsNotEmpty "$1";
}

# Checks that the given directory exists and is empty.
# Creates the directory if it does exist, nor any file by the same name.
# Exits with an error if a non-directory file exists by the same name
#  or if the directory is not empty.
#
# ARGS:
#   1 : Name of destination directory for images.
#   2 : Description of size of images.
function checkDestinationDirectory {
    if [ ! -d "$1" ];
    then
        if [ -e "$1" ];
        then 
            echo "ERROR: '$1' is not a directory.";
            exit 1;
        fi
        # If we're here, we can resolve the issue by simply creating the directory.
        echo "Creating folder for $2 sized images at './$1'";
        mkdir "$1";
    else
        ensureDirectoryIsEmpty "$1";
    fi
}
    
# Resize a batch of images by the geometry specified earlier.
#
# ARGS:
#   1 : Name of source directory of images.
#   2 : Name of destination directory of images.
#   3 : Description of size of source images.
#   4 : Description of size of destination images.
function resizeImages {
    for FILE in $(ls "$1" | sort -n);
    do
    	convert "$1/$FILE" -resize $GEOMETRY "$2/$FILE";
    	echo -ne "\e[KResized $FILE by $GEOMETRY to $2\r";
    done;
    echo -e "\e[KFinished resizing from $3 to $4.";
}

# Generate thumbnails.
#
# ARGS:
#   1 : Name of source directory for images.
#   2 : Name of destination directory for image thumbnails.
function generateThumbnails {
    for FILE in $(ls "$1" | sort -n);
    do
        convert "$1/$FILE" -resize "64x36" "$2/$FILE";
        echo -ne "\e[KGenerated thumbnail at $2/$FILE\r";
    done;
    echo -e "\e[KFinished generating thumbnails in $2.";
}

# Calculate the brightness of the images.
#
# ARGS:
#   1 : Name of source directory of images.
#   2 : Destination file for brightness values.
function calculateBrightness {
    # Calculate the brightness.
    for FILE in $(ls "$1" | sort -n); 
    do 
        B_VAL="$(convert "${1}/${FILE}" -colorspace Gray -format "%[mean]" info:)";
        echo -ne "\e[KCalculated brightness of $FILE :: $B_VAL\r"
        echo "$B_VAL" >> "$2";
    done;
    echo -e "\e[KFinished calculating brightness."
}

# Log the dimensions of an image.
#
# NOTE: Assumes all images in the given directory have the same
#       dimensions.
#
# ARGS:
#   1 : Directory of same-sized images to find dimensions of.
#   2 : Destination file for image dimensions.
function logDimensions {
    DIMS=$(identify "$1"/$(ls "$1" | head -1) | cut -d ' ' -f 3);
    echo "$DIMS" >> "$2";
    echo "Identified dimensions of images in $1: $DIMS";
}

# Generate timestamps from movie frames.
# NOTE: Will need to change for application to actual plots.
#   - Tuned to work with raw frame numbers right now.
#
# ARGS:
#   1 : Source file with list of numerically chronological file names.
#   2 : Destination file for timestamps.
#   3 : Frames per second to use in generating timestamps.
function generateMovieTimestamps {
    JUMP=$((( 100 / $3 )));
    for FILE in $(cat "$1");
    do
        NUM=$(cut -d . -f 1 < <(echo $FILE))
        SECS=$((( NUM / $3 )));
        MILL=$((( NUM % $3 )));
        MILL=$((( MILL * $JUMP )));
        HOURS=$((( SECS / 3600 )));
        SECS=$((( SECS % 3600 )));
        MINS=$((( SECS / 60 )));
        SECS=$((( SECS % 60 )));

        TS=$(printf "%02d:%02d:%02d.%02d" $HOURS $MINS $SECS $MILL)
        echo -ne "\e[KGenerated timestamp for '$FILE' :: $TS\r"
        echo $TS >> "$2";
    done;
    echo -e "\e[KFinished generating timestamps.";
}

# Take the json format text file of timestamps and convert into a list
# of human readable strings, correspending by line number to filename list.
#
# NOTE: Current timestamps don't seem to have UTC information encoded,
#        which is why I don't use dateutil.parser.
#
# ARGS:
#   1 : Name of json file containg timestamp data.
#   2 : Name of output file for list of human readable timestamps.
function generatePhenoTimestamps {
    TEMP_FILE=$(mktemp); # generate a temporary file.
    tr ',}' '\n' < "$1" | \
        tr -d '" ' | \
        sort | \
        cut -d : -f 2- | \
        cut -d + -f 1 > "$TEMP_FILE";
    python -c '
import time;
import datetime;
import sys;

fin = open(sys.argv[1], "r");
fout = open(sys.argv[2], "w");

dates = fin.readlines();
i = 1;

for ts in dates:
    dt = ts.rstrip(); # Strip trailing whitespace.
    dt = time.strptime(dt, "%Y-%m-%dT%H:%M:%S"); # Generate a time struct.
    dt = time.mktime(dt); # Concert time to epoch.
    dt -= 21600; # subtract 6 hours.
    dt = time.localtime(dt); # Convert back into local time.
    fout.write(time.asctime(dt) + "\n"); # Write human readable time.
    print "Generated timestamp ", str(i).rstrip(), ": ", time.asctime(dt), "\r",;
    i = i + 1;

fin.close();
fout.close();
' "$TEMP_FILE" "$2";
    rm "$TEMP_FILE";
    echo -e "\e[KFinished generating timestamps.";
}


# Generate files that contain only the data for non-dark frames (day frames).
#
# ARGS:
#   1 : File with list of image filenames.
#   2 : File with list of timestamps.
#   3 : File with list of image brightness values.
#       NOTE: Assumed that values in above files match line-by-line.
#   4 : Destination file for list of daylight image filenames.
#   5 : Destination file for list of daylight timestamps.
#   6 : Destination file for list of daylight indices.
#   7 : Number, value of brightness threshold to use.
function selectBrightFrames {
    python -c '
import sys;

frames = open(sys.argv[1], "r");
timestamps = open(sys.argv[2], "r");
brightness = open(sys.argv[3], "r");
day_fr = open(sys.argv[4], "w");
day_ts = open(sys.argv[5], "w");
day_ix = open(sys.argv[6], "w");
threshold = float(sys.argv[7]);
i = 0;

while (True):
    f = frames.readline().rstrip();
    t = timestamps.readline().rstrip();
    b = brightness.readline();
    if (b == "" or t == "" or f == ""):
        break;
    if (float(b) > threshold):
        day_fr.write(f + "\n");
        day_ts.write(t + "\n");
        day_ix.write(str(i) + "\n");
        print "Bright frame: ", f, " :: ", str(b).rstrip(), "\r",
    i = i + 1;

frames.close();
timestamps.close();
brightness.close();
day_fr.close();
day_ts.close();
day_ix.close();
' "$1" "$2" "$3" "$4" "$5" "$6" "$7"
    echo -e "\e[KFinished selecting bright frames."
}

# Add this plot to a local list of files which tracks image sets that
# are ready for use in the timelapse platform.
#
# NOTE: To be called last, once execution has properly completed.
#
# ARGS:
#   1 : Name of the plot to add to the list (should be PLOT_DIR).
#   2 : Name of the local file containing list of ready image sets.
function addPlotToReadyList {
    if ! cat "$2" | grep --quiet "$1";
    then
        echo "$1" >> "$2";
        sort "$2" -o "$2";
        echo "Added $1 to the list of prepped image sets."
    fi
}

# Check if a directory exists. If it does, delete it and its contents.
function deleteDirectory {
    if [ -d "$1" ];
    then
        echo "Deleting $1 and all contents.";
        rm -r "$1";
    fi
}

# Check if a file exists. If it does, delete it.
function deleteFile {
    if [ -e "$1" ];
    then
        echo "Deleting $1.";
        rm "$1";
    fi
}

# Delete all files that might have been generated by this process.
function deleteGeneratedData {
    deleteDirectory "${QTR_DIR}";
    deleteDirectory "${HALF_DIR}";
    deleteDirectory "${THUMBS_DIR}";
    deleteFile "${FRAME_LIST_FILE}";
    deleteFile "${BRIGHTNESS_FILE}";
    deleteFile "${TIMESTAMP_FILE}";
    deleteFile "${SUMMER_INDICES_FILE}";
    deleteFile "${SUMMER_TIMESTAMPS_FILE}";
    deleteFile "${SUMMER_FRAMES_FILE}";
    deleteFile "${DIMENSIONS_FILE}";
    sed -i "/${PLOT_DIR}/d" "${READY_FILE}";
    echo "Removing ${PLOT_DIR} from list of prepared image sets.";
}

#======================== Execution ========================#

# First process command line arguments.
if [ $# -lt 1 ]; #No arguments, print help.
then
    HELP='yes';
fi

while [[ $# -gt 0 ]];
do
    case "$1" in
        -h|--help)
            HELP='yes';
            ;;
        --defaults)
            printf "%s\n" "$DEFAULT_MSG";
            exit 0;
            ;;
        -g)
            GEOMETRY="$2";
            shift;
            ;;
        -t)
            THRESHOLD="$2";
            shift;
            ;;
        -s)
            FULL_DIR="$2";
            shift;
            ;;
        -d1)
            HALF_DIR="$2";
            shift;
            HALF_DESC="$2";
            shift;
            ;;
        -d2)
            QTR_DIR="$2";
            shift;
            QTR_DESC="$2";
            shift;
            ;;
        -f)
            READY_FILE="$2";
            shift;
            ;;
        -p)
            TS_FORMAT='pheno';
            TIMESTAMP_DATA="$2";
            shift;
            ;;
        -m)
            TS_FORMAT='mov';
            FPS="$2";
            shift;
            ;;
        --clear)
            DELETE='yes';
            ;;
        *)
            if [ $# -eq 1 ];
            then
                PLOT_DIR=$(basename "$1");
                checkSourceDirectory "${PLOT_DIR}";
            else
                echo "Unrecognized option: $1";
                exit 1;
            fi
            ;;
    esac
    shift
done

# If help was called for, print help and exit.
if [ $HELP = 'yes' ];
then
    printf "%s\n" "$HELP_MSG"
    exit 0;
fi

# Now make sure filesystem is ready.
checkSourceDirectory "${PLOT_DIR}";
FULL_DIR="${PLOT_DIR}"/"${FULL_DIR}";
HALF_DIR="${PLOT_DIR}"/"${HALF_DIR}";
QTR_DIR="${PLOT_DIR}"/"${QTR_DIR}";
THUMBS_DIR="${PLOT_DIR}"/"${THUMBS_DIR}";
FRAME_LIST_FILE="${PLOT_DIR}"/"${FRAME_LIST_FILE}";
BRIGHTNESS_FILE="${PLOT_DIR}"/"${BRIGHTNESS_FILE}";
TIMESTAMP_FILE="${PLOT_DIR}"/"${TIMESTAMP_FILE}";
SUMMER_INDICES_FILE="${PLOT_DIR}"/"${SUMMER_INDICES_FILE}";
SUMMER_FRAMES_FILE="${PLOT_DIR}"/"${SUMMER_FRAMES_FILE}";
SUMMER_TIMESTAMPS_FILE="${PLOT_DIR}"/"${SUMMER_TIMESTAMPS_FILE}";
TIMESTAMP_DATA="${PLOT_DIR}"/"${TIMESTAMP_DATA}";
DIMENSIONS_FILE="${PLOT_DIR}"/"${DIMENSIONS_FILE}";

# Delete data if requested.
if [ $DELETE = 'yes' ];
then
    deleteGeneratedData;
    exit 0;
fi

checkSourceDirectory "${FULL_DIR}";
checkDestinationDirectory "${HALF_DIR}" "${HALF_DESC}";
checkDestinationDirectory "${QTR_DIR}" "${QTR_DESC}";
checkDestinationDirectory "${THUMBS_DIR}" "thumbnail";
ensureFileDoesNotExist "${FRAME_LIST_FILE}";
ensureFileDoesNotExist "${BRIGHTNESS_FILE}";
ensureFileDoesNotExist "${TIMESTAMP_FILE}";
ensureFileDoesNotExist "${SUMMER_INDICES_FILE}";
ensureFileDoesNotExist "${SUMMER_FRAMES_FILE}";
ensureFileDoesNotExist "${SUMMER_TIMESTAMPS_FILE}";
ensureFileDoesNotExist "${DIMENSIONS_FILE}";
case "$TS_FORMAT" in
    pheno)
        ensureFileExists "${TIMESTAMP_DATA}";
        ;;
    mov)
        ensureIntegerFPS "${FPS}";
        ;;
esac

# Execute processes.
getFileNames "${FULL_DIR}" "${FRAME_LIST_FILE}";
case "$TS_FORMAT" in
    pheno)
        generatePhenoTimestamps "${TIMESTAMP_DATA}" "${TIMESTAMP_FILE}";
        ;;
    mov)
        generateMovieTimestamps "${FRAME_LIST_FILE}" "${TIMESTAMP_FILE}" "${FPS}"
        ;;
esac
logDimensions "${FULL_DIR}" "${DIMENSIONS_FILE}";
resizeImages "${FULL_DIR}" "${HALF_DIR}" "${FULL_DESC}" "${HALF_DESC}";
logDimensions "${HALF_DIR}" "${DIMENSIONS_FILE}";
resizeImages "${HALF_DIR}" "${QTR_DIR}" "${HALF_DESC}" "${QTR_DESC}";
logDimensions "${QTR_DIR}" "${DIMENSIONS_FILE}";
generateThumbnails "${QTR_DIR}" "${THUMBS_DIR}";
calculateBrightness "${QTR_DIR}" "${BRIGHTNESS_FILE}";
selectBrightFrames "${FRAME_LIST_FILE}" "${TIMESTAMP_FILE}" "${BRIGHTNESS_FILE}" \
    "${SUMMER_FRAMES_FILE}" "${SUMMER_TIMESTAMPS_FILE}" \
    "${SUMMER_INDICES_FILE}" "${THRESHOLD}";
addPlotToReadyList "${PLOT_DIR}" "${READY_FILE}";

echo -e "Process complete.\nImages and associated data ready for delivery.";

exit 0;


