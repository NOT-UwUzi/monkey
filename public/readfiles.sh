while read -r line; do
echo $line
touch $line
done < files.txt