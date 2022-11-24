#!/bin/bash

WORK_DIR='../'

for FILE in $(ls "$WORK_DIR"*js);
do
    OUT_FILE="$(basename -s .js $FILE).headers";
    if [ -e "$OUT_FILE" ];
        then rm "$OUT_FILE";
    fi;

    egrep '(^function|\.prototype\.)' "$FILE" | grep -v '\<throw\>' >> "$OUT_FILE";
    sort "$OUT_FILE" -o "$OUT_FILE";

    if [ -s "$OUT_FILE" ];
        then echo "Headers from $FILE written to $OUT_FILE";
    else
        rm "$OUT_FILE";
    fi;
done;


