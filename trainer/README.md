Build the docker image:
```
docker build -t trainer .
```

Run with number of steps:
```
docker build -t trainer . && docker run -a stdin -a stdout -a stderr -i -t --privileged trainer 10
```

```
zip -r trainer.zip src
cacli train thumbs-up-down-v2 --steps 500 --script trainer.zip --frameworkv 1.15
```

coremltools==3.3
tfcoreml==1.1
tensorflowjs==1.4.0
```
python -m convert.convert --tfjs --coreml --tflite \
  --tfjs-path=../model_web \
  --mlmodel-path=../model_ios \
  --tflite-path=../model_android \
  --saved-model-path=../model
```