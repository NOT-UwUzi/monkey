while read -r line; do
echo $line
mkair -p $line
done < folders.txt