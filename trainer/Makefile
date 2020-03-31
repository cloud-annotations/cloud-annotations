include .env

CLASSIFCATION_BUCKET=coffee-donut-v2
LOCALIZATION_BUCKET=thumbs-up-down-v2
STEPS=10


all: build run


################################################################################
# Setup
################################################################################
.PHONY: install
install: pip_install setup_classification setup_object_detection


.PHONY: pip_install
pip_install:
	pip install flake8 black


.PHONY: setup_classification
setup_classification:
	svn export -r 308 https://github.com/tensorflow/hub/trunk/examples/image_retraining src/classification
	echo > src/classification/__init__.py


.PHONY: setup_object_detection
setup_object_detection:
	svn export -r 11689 https://github.com/tensorflow/models/trunk/research/object_detection src/object_detection
	svn export -r 11689 https://github.com/tensorflow/models/trunk/research/slim src/object_detection/slim
	cd src && protoc object_detection/protos/*.proto --python_out=. && cd ..


################################################################################
# Use
################################################################################
.PHONY: build
build:
	docker build -t trainer .


.PHONY: run
run: run_classification run_object_detection


.PHONY: classification
classification: build run_classification


.PHONY: object_detection
object_detection: build run_object_detection


.PHONY: run_classification
run_classification:
	# Don't echo S3 keys.
	@docker run -a stdin -a stdout -a stderr -i -t --privileged trainer ./run.sh $(S3_ID) $(S3_KEY) $(CLASSIFCATION_BUCKET) $(STEPS)


.PHONY: run_object_detection
run_object_detection:
	@docker run -a stdin -a stdout -a stderr -i -t --privileged trainer ./run.sh $(S3_ID) $(S3_KEY) $(LOCALIZATION_BUCKET) $(STEPS)


################################################################################
# Test
################################################################################
.PHONY: test
test: format lint


.PHONY: format
format:
	python -m black src --exclude "/(src/classification|src/object_detection)/"


.PHONY: lint
lint:
	python -m flake8 src


.PHONY: test_classification
test_classification: build
	rm -rf tmp
	@docker run -v `pwd`/tmp:/result_dir -a stdin -a stdout -a stderr -i -t --privileged trainer ./cache.sh $(S3_ID) $(S3_KEY) $(CLASSIFCATION_BUCKET) $(STEPS)
	./test/ensure_models_exist.sh `pwd`/tmp


.PHONY: test_object_detection
test_object_detection: build
	rm -rf tmp
	@docker run -v `pwd`/tmp:/result_dir -a stdin -a stdout -a stderr -i -t --privileged trainer ./cache.sh $(S3_ID) $(S3_KEY) $(LOCALIZATION_BUCKET) $(STEPS)
	./test/ensure_models_exist.sh `pwd`/tmp

################################################################################
# Convert
################################################################################
.PHONY: convert	
convert: build _convert_classification _convert_object_detection


.PHONY: convert_classification
convert_classification: build _convert_classification


.PHONY: convert_object_detection
convert_object_detection: build _convert_object_detection


.PHONY: _convert_classification
_convert_classification:
	@docker run -v `pwd`/test_cache/classifcation:/result_dir/model -a stdin -a stdout -a stderr -i -t --privileged trainer ./convert.sh classification


.PHONY: _convert_object_detection
_convert_object_detection:
	@docker run -v `pwd`/test_cache/object_detection:/result_dir/model -a stdin -a stdout -a stderr -i -t --privileged trainer ./convert.sh localization


################################################################################
# Cache
################################################################################
.PHONY: cache
cache: clean_cache build cache_classification cache_object_detection


.PHONY: clean_cache
clean_cache:
	rm -rf test_cache


.PHONY: cache_classification
cache_classification:
	@docker run -v `pwd`/test_cache/classifcation:/result_dir/model -a stdin -a stdout -a stderr -i -t --privileged trainer ./cache.sh $(S3_ID) $(S3_KEY) $(CLASSIFCATION_BUCKET) $(STEPS)


.PHONY: cache_object_detection
cache_object_detection:
	@docker run -v `pwd`/test_cache/object_detection:/result_dir/model -a stdin -a stdout -a stderr -i -t --privileged trainer ./cache.sh $(S3_ID) $(S3_KEY) $(LOCALIZATION_BUCKET) $(STEPS)
