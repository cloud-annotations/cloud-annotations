source .env

BUCKET=$1
STEPS=$2

docker build -t trainer .
docker run -a stdin -a stdout -a stderr -i -t --privileged trainer $S3_ID $S3_KEY $BUCKET $STEPS