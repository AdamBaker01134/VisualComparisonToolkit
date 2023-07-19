import os
import argparse
from functools import cmp_to_key

parser = argparse.ArgumentParser()

parser.add_argument(
    "--path",
    type=str,
    required=False,
    default="./timestamps.txt",
    help="Path to timestamp text file"
)

def compare(timestamp1, timestamp2):
    months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"]
    split1 = timestamp1.split(" ")
    split2 = timestamp2.split(" ")

    if "" in split1:
        split1.pop(split1.index(""))
    if "" in split2:
        split2.pop(split2.index(""))
    
    weekday1, month1, day1, time1, year1 = split1
    weekday2, month2, day2, time2, year2 = split2

    if year1 != year2:
        if year1 < year2:
            return -1
        else:
            return 1
    if month1 != month2:
        try:
            index1 = months.index(month1)
            index2 = months.index(month2)
            if index1 < index2:
                return -1
            else:
                return 1
        except ValueError as e:
            return 1
    if day1 != day2:
        if int(day1) < int(day2):
            return -1
        else:
            return 1
    if time1 != time2:
        if time1 < time2:
            return -1
        else:
            return 1

if __name__ == "__main__":
    args = parser.parse_args()
    file_path = args.path
    result = []
    with open(file_path, "r", encoding="utf-8") as file_read:
        lines = file_read.readlines()
        for line in lines:
            result.append(line.strip())
        file_read.close()
    result.sort(key=cmp_to_key(compare))
    with open(file_path, "w", encoding="utf-8") as file_write:
        for timestamp in result:
            file_write.write(timestamp + "\n")
        file_write.close()