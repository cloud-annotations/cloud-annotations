FROM tensorflow/tensorflow:2.1.2

# tzdata package install is interactive, force it to not be
ARG DEBIAN_FRONTEND=noninteractive

# Install apt dependencies
RUN apt-get update && apt-get install -y \
    git \
    gpg-agent \
    python3-cairocffi \
    protobuf-compiler \
    python3-pil \
    python3-lxml \
    python3-tk \
    wget \
    automake \
    autotools-dev \
    fuse \
    g++ \
    libcurl4-openssl-dev \
    libfuse-dev \
    libssl-dev \
    libxml2-dev \
    make \
    pkg-config \
    s3fs \
    python-scipy \
    # cv2
    # ImportError: libGL.so.1: cannot open shared object file: No such file or directory
    libgl1-mesa-glx \
    ffmpeg \
    libsm6 \
    libxext6
    # 

# Add new user to avoid running as root
# RUN useradd -ms /bin/bash iris
# USER iris
WORKDIR /home/iris

# COPY --chown=iris src /home/iris/trainer
# COPY --chown=iris test /home/iris/trainer

RUN git clone https://github.com/cloud-annotations/models.git /home/iris/models

WORKDIR /home/iris/models/research
RUN protoc object_detection/protos/*.proto --python_out=.


RUN cp object_detection/packages/tf2/setup.py ./
ENV PATH="/home/iris/.local/bin:${PATH}"

RUN python -m pip install -U pip
RUN python -m pip install .

RUN python -m pip install -U tensorflowjs

COPY src /home/iris/trainer
COPY test /home/iris/trainer

ENV TF_CPP_MIN_LOG_LEVEL 3

WORKDIR /home/iris/trainer