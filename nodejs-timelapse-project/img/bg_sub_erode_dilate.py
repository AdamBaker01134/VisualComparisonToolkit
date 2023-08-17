import cv2 as cv
import os
import numpy as np

INPUT_DIR = "./pitching-fastball-slider/luis_ortiz/fastball/original/"
OUTPUT_DIR = "./pitching-fastball-slider/luis_ortiz/fastball/foreground/"

backSub = cv.createBackgroundSubtractorMOG2()

capture = cv.VideoCapture(cv.samples.findFileOrKeep(INPUT_DIR + "%03d.jpg"))

if not capture.isOpened():
    print("Unable to open")
    exit(0)

paused = False
count = 1

while True:
    keyboard = cv.waitKey(30)
    if keyboard == 'q' or keyboard == 27:
        break
    if keyboard == 32:
        paused = not paused
    if paused:
        continue
    ret, frame = capture.read()
    if frame is None:
        break

    fgMask = backSub.apply(frame)

    kernel = np.ones((3,3), np.uint8)

    fgMask = cv.erode(fgMask, kernel, iterations=1)
    fgMask = cv.dilate(fgMask, kernel, iterations=5)

    fgMask[np.abs(fgMask) < 250] = 0

    cv.imshow('Frame', frame)
    cv.imshow('FG Mask', fgMask)

    # if not os.path.isdir(OUTPUT_DIR):
    #     os.mkdir(OUTPUT_DIR)
    # cv.imwrite(OUTPUT_DIR + str(count).zfill(3) + ".png", fgMask)
    count += 1