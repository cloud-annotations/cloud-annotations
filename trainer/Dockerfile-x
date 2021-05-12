FROM tensorflow/tensorflow:1.15.2-py3

RUN apt-get update \
    && apt-get -y install automake autotools-dev fuse g++ git libcurl4-openssl-dev libfuse-dev libssl-dev libxml2-dev make pkg-config \
    && apt-get -y install s3fs \
    && apt-get -y install python-scipy

RUN pip install \
    absl-py==0.7.1 \
    alabaster==0.7.12 \
    appdirs==1.4.3 \
    astor==0.7.1 \
    Babel==2.8.0 \
    certifi==2019.9.11 \
    chardet==3.0.4 \
    cloudpickle==1.2.2 \
    decorator==4.4.1 \
    docutils==0.16 \
    gast==0.2.2 \
    google-pasta==0.1.6 \
    # graphsurgeon==0.4.1 \
    grpcio==1.16.1 \
    h5py==2.9.0 \
    # hpo==0.3.1 \
    idna==2.9 \
    imagesize==1.2.0 \
    Jinja2==2.11.1 \
    joblib==0.14.1 \
    Keras==2.2.5 \
    Keras-Applications==1.0.8 \
    Keras-Preprocessing==1.1.0 \
    Markdown==3.1.1 \
    MarkupSafe==1.1.1 \
    # mkl-fft==1.0.15 \
    # mkl-random==1.1.0 \
    # mkl-service==2.3.0 \
    mock==4.0.1 \
    nose==1.3.7 \
    numpy==1.16.5 \
    numpydoc==0.9.2 \
    olefile==0.46 \
    packaging==20.1 \
    pandas==1.0.1 \
    Pillow==6.2.1 \
    ply==3.11 \
    protobuf==3.8.0 \
    psutil==5.5.0 \
    Pygments==2.5.2 \
    Pyomo==5.2 \
    pyparsing==2.4.6 \
    python-dateutil==2.8.1 \
    pytz==2019.3 \
    PyUtilib==5.7.3 \
    PyYAML==5.1.2 \
    # rbfopt==0.2 \
    requests==2.23.0 \
    scikit-learn==0.22.2.post1 \
    # scipy==1.3.1 \
    six==1.12.0 \
    sklearn==0.0 \
    snowballstemmer==2.0.0 \
    Sphinx==2.4.3 \
    sphinxcontrib-applehelp==1.0.2 \
    sphinxcontrib-devhelp==1.0.2 \
    sphinxcontrib-htmlhelp==1.0.3 \
    sphinxcontrib-jsmath==1.0.1 \
    sphinxcontrib-qthelp==1.0.3 \
    sphinxcontrib-serializinghtml==1.1.4 \
    # tensorboard==1.15.0 \
    # tensorflow==1.15.0 \
    # tensorflow-estimator==1.15.1 \
    # tensorflow-probability==0.8.0 \
    # tensorflow-serving-api==1.15.0 \
    # tensorrt==6.0.1.5 \
    termcolor==1.1.0 \
    # tflms==2.0.2 \
    # uff==0.6.5 \
    urllib3==1.25.8 \
    Werkzeug==0.15.4 \
    wrapt==1.11.2

ADD src /
ADD test /

RUN chmod +x start.sh
RUN chmod +x run.sh
RUN chmod +x cache.sh
RUN chmod +x convert.sh