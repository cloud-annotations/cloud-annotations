#     375
# @x1 782
# @x2 1564

IMAGE_SMALL=docs-assets/generated_images
IMAGE_1X=docs-assets/generated_images@1x
IMAGE_2X=docs-assets/generated_images@2x

rm -rf $IMAGE_SMALL
rm -rf $IMAGE_1X
rm -rf $IMAGE_2X

mkdir $IMAGE_SMALL
mkdir $IMAGE_1X
mkdir $IMAGE_2X

# If 0.25 ≤ SF < 1	Cubic with B=0, C=2.6−1.6×SF, blur=1.05.
# If ? ≤ SF < 0.25	Step 1: Use box filter (as defined above in Bilinear) to scale to 4×DSTN.
# Step 2: Cubic with B=0, C=2.2, blur=1.05.

# C = 2.6 − (1.6 * SF)
# C = 2.2

# all images should be: 3104px
# 1564 -> SF = 0.50386598 -> 2.6 − (1.6 * 0.50386598) = 1.793814432
# 782  -> SF = 0.25193299 -> 2.6 − (1.6 * 0.25193299) = 2.196907216
# 375  -> SF = 0.12081186 -> 2.2                      = 2.2

echo "Generating small..."

mogrify -path $IMAGE_SMALL \
  -filter box -resize 400% \
  -filter cubic -define filter:b=0 -define filter:c=2.2 -define filter:blur=1.05 \
  -resize 375 \
  docs-assets/_images/*.png

echo "Generating @1x..."

mogrify -path $IMAGE_1X \
  -filter cubic -define filter:b=0 -define filter:c=2.196907216 -define filter:blur=1.05 \
  -resize 782 \
  docs-assets/_images/*.png

echo "Generating @2x..."

mogrify -path $IMAGE_2X \
  -filter cubic -define filter:b=0 -define filter:c=1.793814432 -define filter:blur=1.05 \
  -resize 1564 \
  docs-assets/_images/*.png


