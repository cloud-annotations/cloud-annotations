package mockwml

var JsonData = []byte(`
	{
		"resources": [
			{
				"metadata": {
					"guid": "model-1g47xe42",
					"url": "/v3/models/model-1g47xe42",
					"created_at": "2019-03-27T00:11:19.433Z",
					"modified_at": "2019-03-27T00:11:19.433Z"
				},
				"entity": {
					"model_definition": {
						"framework": { "name": "tensorflow", "version": "1.12" },
						"name": "pepsi-coke-mountain-dew",
						"definition_href": "https://us-south.ml.cloud.ibm.com/v3/ml_assets/training_definitions/bdcdee9d-79cf-40bb-a81a-92891998e91b",
						"execution": {
							"command": "eval \"$(find . -name \"start.sh\" -maxdepth 2 -print -quit)\" 500",
							"compute_configuration": { "name": "k80" }
						}
					},
					"training_data_reference": {
						"type": "s3",
						"connection": {
							"endpoint_url": "https://s3-api.us-geo.objectstorage.service.networklayer.com",
							"access_key_id": "fake",
							"secret_access_key": "fake"
						},
						"location": { "bucket": "pepsi-coke-mountain-dew" }
					},
					"training_results_reference": {
						"type": "s3",
						"connection": {
							"endpoint_url": "https://s3-api.us-geo.objectstorage.service.networklayer.com",
							"access_key_id": "fake",
							"secret_access_key": "fake"
						},
						"location": {
							"bucket": "soda-output-dir",
							"model_location": "training-ezakgkemg"
						}
					},
					"status": {
						"state": "error",
						"finished_at": "2019-03-27T00:14:36.386Z",
						"submitted_at": "2019-03-27T00:11:29.351Z",
						"running_at": "2019-03-27T00:12:33.781Z",
						"error": {
							"trace": "",
							"errors": [
								{
									"code": "dl_job_failed (C201)",
									"message": "Learner process crashed (C201) with exit code (1), please check the job logs for more information",
									"more_info": "http://watson-ml-api.mybluemix.net/"
								}
							]
						},
						"message": "training-ezakgkemg: 1",
						"metrics": [],
						"current_at": "2019-03-27T00:15:41.174Z",
						"error_cause": "user"
					}
				}
			},
			{
				"metadata": {
					"guid": "model-47kjaqxp",
					"url": "/v3/models/model-47kjaqxp",
					"created_at": "2019-03-26T15:14:50.505Z",
					"modified_at": "2019-03-26T15:14:50.505Z"
				},
				"entity": {
					"model_definition": {
						"framework": { "name": "tensorflow", "version": "1.12" },
						"name": "pepsi-coke-mountain-dew",
						"definition_href": "https://us-south.ml.cloud.ibm.com/v3/ml_assets/training_definitions/84abffb6-5cd3-4e70-aaa5-0dd67a9be18c",
						"execution": {
							"command": "python3 -m wml.train_command --num-train-steps=500",
							"compute_configuration": { "name": "k80" }
						}
					},
					"training_data_reference": {
						"type": "s3",
						"connection": {
							"endpoint_url": "https://s3-api.us-geo.objectstorage.service.networklayer.com",
							"access_key_id": "fake",
							"secret_access_key": "fake"
						},
						"location": { "bucket": "pepsi-coke-mountain-dew" }
					},
					"training_results_reference": {
						"type": "s3",
						"connection": {
							"endpoint_url": "https://s3-api.us-geo.objectstorage.service.networklayer.com",
							"access_key_id": "fake",
							"secret_access_key": "fake"
						},
						"location": {
							"bucket": "soda-output-dir",
							"model_location": "training-0KdKzR6mg"
						}
					},
					"status": {
						"state": "error",
						"finished_at": "2019-03-26T15:18:05.475Z",
						"submitted_at": "2019-03-26T15:14:54.919Z",
						"running_at": "2019-03-26T15:15:37.071Z",
						"error": {
							"trace": "",
							"errors": [
								{
									"code": "dl_job_failed (C201)",
									"message": "Learner process crashed (C201) with exit code (1), please check the job logs for more information",
									"more_info": "http://watson-ml-api.mybluemix.net/"
								}
							]
						},
						"message": "training-0KdKzR6mg: 1",
						"metrics": [],
						"current_at": "2019-03-26T15:19:04.581Z",
						"error_cause": "user"
					}
				}
			},
			{
				"metadata": {
					"guid": "model-4bef4k60",
					"url": "/v3/models/model-4bef4k60",
					"created_at": "2019-03-26T17:06:14.211Z",
					"modified_at": "2019-03-26T17:06:14.211Z"
				},
				"entity": {
					"model_definition": {
						"framework": { "name": "tensorflow", "version": "1.12" },
						"name": "pepsi-coke-mountain-dew",
						"definition_href": "https://us-south.ml.cloud.ibm.com/v3/ml_assets/training_definitions/e29ed237-4324-4740-b85d-c9a1e3eae2f1",
						"execution": {
							"command": "eval \"$(find . -name \"start.sh\" -maxdepth 2 -print -quit)\"",
							"compute_configuration": { "name": "k80" }
						}
					},
					"training_data_reference": {
						"type": "s3",
						"connection": {
							"endpoint_url": "https://s3-api.us-geo.objectstorage.service.networklayer.com",
							"access_key_id": "fake",
							"secret_access_key": "fake"
						},
						"location": { "bucket": "pepsi-coke-mountain-dew" }
					},
					"training_results_reference": {
						"type": "s3",
						"connection": {
							"endpoint_url": "https://s3-api.us-geo.objectstorage.service.networklayer.com",
							"access_key_id": "fake",
							"secret_access_key": "fake"
						},
						"location": {
							"bucket": "soda-output-dir",
							"model_location": "training-mTIyIR6mg"
						}
					},
					"status": {
						"state": "completed",
						"finished_at": "2019-03-26T17:09:33.184Z",
						"submitted_at": "2019-03-26T17:06:16.158Z",
						"running_at": "2019-03-26T17:06:53.995Z",
						"message": "training-mTIyIR6mg: ",
						"metrics": [],
						"current_at": "2019-03-26T17:10:25.439Z"
					}
				}
			},
			{
				"metadata": {
					"guid": "model-4ra8chg1",
					"url": "/v3/models/model-4ra8chg1",
					"created_at": "2019-03-27T00:32:56.929Z",
					"modified_at": "2019-03-27T00:32:56.929Z"
				},
				"entity": {
					"model_definition": {
						"framework": { "name": "tensorflow", "version": "1.12" },
						"name": "pepsi-coke-mountain-dew",
						"definition_href": "https://us-south.ml.cloud.ibm.com/v3/ml_assets/training_definitions/905766c2-7c04-43b8-b728-659afd56c9fb",
						"execution": {
							"command": "cd \"$(dirname \"$(find . -name \"start.sh\" -maxdepth 2 -print -quit | head -1)\")\" && ./start.sh 500",
							"compute_configuration": { "name": "k80" }
						}
					},
					"training_data_reference": {
						"type": "s3",
						"connection": {
							"endpoint_url": "https://s3-api.us-geo.objectstorage.service.networklayer.com",
							"access_key_id": "fake",
							"secret_access_key": "fake"
						},
						"location": { "bucket": "pepsi-coke-mountain-dew" }
					},
					"training_results_reference": {
						"type": "s3",
						"connection": {
							"endpoint_url": "https://s3-api.us-geo.objectstorage.service.networklayer.com",
							"access_key_id": "fake",
							"secret_access_key": "fake"
						},
						"location": {
							"bucket": "soda-output-dir",
							"model_location": "training-AzVDkzemg"
						}
					},
					"status": {
						"state": "error",
						"finished_at": "2019-03-27T00:35:36.406Z",
						"submitted_at": "2019-03-27T00:32:58.476Z",
						"running_at": "2019-03-27T00:33:35.415Z",
						"error": {
							"trace": "",
							"errors": [
								{
									"code": "dl_job_failed (C201)",
									"message": "Learner process crashed (C201) with exit code (1), please check the job logs for more information",
									"more_info": "http://watson-ml-api.mybluemix.net/"
								}
							]
						},
						"message": "training-AzVDkzemg: 1",
						"metrics": [],
						"current_at": "2019-03-27T00:36:05.570Z",
						"error_cause": "user"
					}
				}
			},
			{
				"metadata": {
					"guid": "model-8lxxw3ql",
					"url": "/v3/models/model-8lxxw3ql",
					"created_at": "2019-03-27T16:12:47.248Z",
					"modified_at": "2019-03-27T16:12:47.248Z"
				},
				"entity": {
					"model_definition": {
						"framework": { "name": "tensorflow", "version": "1.12" },
						"name": "pepsi-coke-mountain-dew",
						"definition_href": "https://us-south.ml.cloud.ibm.com/v3/ml_assets/training_definitions/aedc061c-f2f5-4504-bf1d-952ac2a71065",
						"execution": {
							"command": "cd \"$(dirname \"$(find . -name \"start.sh\" -maxdepth 2 | head -1)\")\" && ./start.sh 500",
							"compute_configuration": { "name": "k80" }
						}
					},
					"training_data_reference": {
						"type": "s3",
						"connection": {
							"endpoint_url": "https://s3-api.us-geo.objectstorage.service.networklayer.com",
							"access_key_id": "fake",
							"secret_access_key": "fake"
						},
						"location": { "bucket": "pepsi-coke-mountain-dew" }
					},
					"training_results_reference": {
						"type": "s3",
						"connection": {
							"endpoint_url": "https://s3-api.us-geo.objectstorage.service.networklayer.com",
							"access_key_id": "fake",
							"secret_access_key": "fake"
						},
						"location": {
							"bucket": "soda-output-dir",
							"model_location": "training-OpIism6mR"
						}
					},
					"status": {
						"state": "canceled",
						"finished_at": "2019-03-27T16:38:27.774Z",
						"submitted_at": "2019-03-27T16:12:53.826Z",
						"running_at": "2019-03-27T16:13:35.761Z",
						"message": "training-OpIism6mR: ",
						"metrics": [],
						"current_at": "2019-03-27T16:39:04.408Z"
					}
				}
			},
			{
				"metadata": {
					"guid": "model-bljy039c",
					"url": "/v3/models/model-bljy039c",
					"created_at": "2019-03-26T17:08:44.980Z",
					"modified_at": "2019-03-26T17:08:44.980Z"
				},
				"entity": {
					"model_definition": {
						"framework": { "name": "tensorflow", "version": "1.12" },
						"name": "pepsi-coke-mountain-dew",
						"definition_href": "https://us-south.ml.cloud.ibm.com/v3/ml_assets/training_definitions/a274251b-c4c7-415e-a6b2-df31dd5b3a97",
						"execution": {
							"command": "eval \"$(find . -name \"start.sh\" -maxdepth 2 -print -quit)\"",
							"compute_configuration": { "name": "k80" }
						}
					},
					"training_data_reference": {
						"type": "s3",
						"connection": {
							"endpoint_url": "https://s3-api.us-geo.objectstorage.service.networklayer.com",
							"access_key_id": "fake",
							"secret_access_key": "fake"
						},
						"location": { "bucket": "pepsi-coke-mountain-dew" }
					},
					"training_results_reference": {
						"type": "s3",
						"connection": {
							"endpoint_url": "https://s3-api.us-geo.objectstorage.service.networklayer.com",
							"access_key_id": "fake",
							"secret_access_key": "fake"
						},
						"location": {
							"bucket": "soda-output-dir",
							"model_location": "training-PAluSR6ig"
						}
					},
					"status": {
						"state": "running",
						"finished_at": "2019-03-26T17:11:34.674Z",
						"submitted_at": "2019-03-26T17:08:45.917Z",
						"running_at": "2019-03-26T17:09:28.577Z",
						"message": "training-PAluSR6ig: ",
						"metrics": [],
						"current_at": "2019-03-26T17:11:52.380Z"
					}
				}
			},
			{
				"metadata": {
					"guid": "model-ejosqfmq",
					"url": "/v3/models/model-ejosqfmq",
					"created_at": "2019-03-27T00:17:17.902Z",
					"modified_at": "2019-03-27T00:17:17.902Z"
				},
				"entity": {
					"model_definition": {
						"framework": { "name": "tensorflow", "version": "1.12" },
						"name": "pepsi-coke-mountain-dew",
						"definition_href": "https://us-south.ml.cloud.ibm.com/v3/ml_assets/training_definitions/87010f6f-c36c-4888-a468-c586af6d0baf",
						"execution": {
							"command": "eval \"$(find . -name \"start.sh\" -maxdepth 2 -print -quit)\" 500",
							"compute_configuration": { "name": "k80" }
						}
					},
					"training_data_reference": {
						"type": "s3",
						"connection": {
							"endpoint_url": "https://s3-api.us-geo.objectstorage.service.networklayer.com",
							"access_key_id": "fake",
							"secret_access_key": "fake"
						},
						"location": { "bucket": "pepsi-coke-mountain-dew" }
					},
					"training_results_reference": {
						"type": "s3",
						"connection": {
							"endpoint_url": "https://s3-api.us-geo.objectstorage.service.networklayer.com",
							"access_key_id": "fake",
							"secret_access_key": "fake"
						},
						"location": {
							"bucket": "soda-output-dir",
							"model_location": "training-qZJcRk6mR"
						}
					},
					"status": {
						"state": "error",
						"finished_at": "2019-03-27T00:20:05.711Z",
						"submitted_at": "2019-03-27T00:17:24.389Z",
						"running_at": "2019-03-27T00:18:02.796Z",
						"error": {
							"trace": "",
							"errors": [
								{
									"code": "dl_job_failed (C201)",
									"message": "Learner process crashed (C201) with exit code (1), please check the job logs for more information",
									"more_info": "http://watson-ml-api.mybluemix.net/"
								}
							]
						},
						"message": "training-qZJcRk6mR: 1",
						"metrics": [],
						"current_at": "2019-03-27T00:20:31.877Z",
						"error_cause": "user"
					}
				}
			},
			{
				"metadata": {
					"guid": "model-f1mof20b",
					"url": "/v3/models/model-f1mof20b",
					"created_at": "2019-03-26T15:08:47.303Z",
					"modified_at": "2019-03-26T15:08:47.303Z"
				},
				"entity": {
					"model_definition": {
						"framework": { "name": "tensorflow", "version": "1.12" },
						"name": "pepsi-coke-mountain-dew",
						"definition_href": "https://us-south.ml.cloud.ibm.com/v3/ml_assets/training_definitions/66b1d46b-d50c-482a-83e9-0ffb643f391e",
						"execution": {
							"command": "python3 -m wml.train_command --num-train-steps=500",
							"compute_configuration": { "name": "k80" }
						}
					},
					"training_data_reference": {
						"type": "s3",
						"connection": {
							"endpoint_url": "https://s3-api.us-geo.objectstorage.service.networklayer.com",
							"access_key_id": "fake",
							"secret_access_key": "fake"
						},
						"location": { "bucket": "pepsi-coke-mountain-dew" }
					},
					"training_results_reference": {
						"type": "s3",
						"connection": {
							"endpoint_url": "https://s3-api.us-geo.objectstorage.service.networklayer.com",
							"access_key_id": "fake",
							"secret_access_key": "fake"
						},
						"location": {
							"bucket": "soda-output-dir",
							"model_location": "training-UPnRkReiR"
						}
					},
					"status": {
						"state": "error",
						"finished_at": "2019-03-26T15:11:06.578Z",
						"submitted_at": "2019-03-26T15:08:51.273Z",
						"running_at": "2019-03-26T15:09:03.364Z",
						"error": {
							"trace": "",
							"errors": [
								{
									"code": "dl_job_failed (C201)",
									"message": "Learner process crashed (C201) with exit code (1), please check the job logs for more information",
									"more_info": "http://watson-ml-api.mybluemix.net/"
								}
							]
						},
						"message": "training-UPnRkReiR: 1",
						"metrics": [],
						"current_at": "2019-03-26T15:11:58.124Z",
						"error_cause": "user"
					}
				}
			},
			{
				"metadata": {
					"guid": "model-f2b4dfxe",
					"url": "/v3/models/model-f2b4dfxe",
					"created_at": "2019-03-26T15:27:09.109Z",
					"modified_at": "2019-03-26T15:27:09.109Z"
				},
				"entity": {
					"model_definition": {
						"framework": { "name": "tensorflow", "version": "1.12" },
						"name": "pepsi-coke-mountain-dew",
						"definition_href": "https://us-south.ml.cloud.ibm.com/v3/ml_assets/training_definitions/8171c2d8-4e53-4987-9b29-ae6614c1ba23",
						"execution": {
							"command": "./start.sh",
							"compute_configuration": { "name": "k80" }
						}
					},
					"training_data_reference": {
						"type": "s3",
						"connection": {
							"endpoint_url": "https://s3-api.us-geo.objectstorage.service.networklayer.com",
							"access_key_id": "fake",
							"secret_access_key": "fake"
						},
						"location": { "bucket": "pepsi-coke-mountain-dew" }
					},
					"training_results_reference": {
						"type": "s3",
						"connection": {
							"endpoint_url": "https://s3-api.us-geo.objectstorage.service.networklayer.com",
							"access_key_id": "fake",
							"secret_access_key": "fake"
						},
						"location": {
							"bucket": "soda-output-dir",
							"model_location": "training-p0rkiRemR"
						}
					},
					"status": {
						"state": "error",
						"finished_at": "2019-03-26T15:30:06.975Z",
						"submitted_at": "2019-03-26T15:27:14.725Z",
						"running_at": "2019-03-26T15:27:57.170Z",
						"error": {
							"trace": "",
							"errors": [
								{
									"code": "dl_job_failed (C201)",
									"message": "Learner process crashed (C201) with exit code (127), please check the job logs for more information",
									"more_info": "http://watson-ml-api.mybluemix.net/"
								}
							]
						},
						"message": "training-p0rkiRemR: 127",
						"metrics": [],
						"current_at": "2019-03-26T15:30:21.507Z",
						"error_cause": "user"
					}
				}
			},
			{
				"metadata": {
					"guid": "model-iaa0w3y9",
					"url": "/v3/models/model-iaa0w3y9",
					"created_at": "2019-03-21T21:53:35.234Z",
					"modified_at": "2019-03-21T21:53:35.234Z"
				},
				"entity": {
					"model_definition": {
						"framework": { "name": "tensorflow", "version": "1.12" },
						"name": "pepsi-coke-mountain-dew",
						"definition_href": "https://us-south.ml.cloud.ibm.com/v3/ml_assets/training_definitions/1bab507b-8b1c-424e-80da-cecc817b7f86",
						"execution": {
							"command": "python3 -m wml.train_command --num-train-steps=500",
							"compute_configuration": { "name": "k80" }
						}
					},
					"training_data_reference": {
						"type": "s3",
						"connection": {
							"endpoint_url": "https://s3-api.us-geo.objectstorage.service.networklayer.com",
							"access_key_id": "fake",
							"secret_access_key": "fake"
						},
						"location": { "bucket": "pepsi-coke-mountain-dew" }
					},
					"training_results_reference": {
						"type": "s3",
						"connection": {
							"endpoint_url": "https://s3-api.us-geo.objectstorage.service.networklayer.com",
							"access_key_id": "fake",
							"secret_access_key": "fake"
						},
						"location": {
							"bucket": "soda-output-dir",
							"model_location": "training-vbw7ra3iR"
						}
					},
					"status": {
						"state": "completed",
						"finished_at": "2019-03-21T22:15:33.870Z",
						"submitted_at": "2019-03-21T21:53:37.871Z",
						"running_at": "2019-03-21T21:54:35.068Z",
						"message": "training-vbw7ra3iR: ",
						"metrics": [],
						"current_at": "2019-03-21T22:15:50.299Z"
					}
				}
			},
			{
				"metadata": {
					"guid": "model-jm9yh723",
					"url": "/v3/models/model-jm9yh723",
					"created_at": "2019-03-21T19:50:38.524Z",
					"modified_at": "2019-03-21T19:50:38.524Z"
				},
				"entity": {
					"model_definition": {
						"framework": { "name": "tensorflow", "version": "1.12" },
						"name": "pepsi-coke-mountain-dew",
						"definition_href": "https://us-south.ml.cloud.ibm.com/v3/ml_assets/training_definitions/138cff70-db6f-4092-b115-dacd84487203",
						"execution": {
							"command": "python3 -m wml.train_command --num-train-steps=500",
							"compute_configuration": { "name": "k80" }
						}
					},
					"training_data_reference": {
						"type": "s3",
						"connection": {
							"endpoint_url": "https://s3-api.us-geo.objectstorage.service.networklayer.com",
							"access_key_id": "fake",
							"secret_access_key": "fake"
						},
						"location": { "bucket": "pepsi-coke-mountain-dew" }
					},
					"training_results_reference": {
						"type": "s3",
						"connection": {
							"endpoint_url": "https://s3-api.us-geo.objectstorage.service.networklayer.com",
							"access_key_id": "fake",
							"secret_access_key": "fake"
						},
						"location": {
							"bucket": "soda-output-dir",
							"model_location": "training-FsLGYaqig"
						}
					},
					"status": {
						"state": "completed",
						"finished_at": "2019-03-21T20:18:04.165Z",
						"submitted_at": "2019-03-21T19:50:41.989Z",
						"running_at": "2019-03-21T19:57:21.065Z",
						"message": "training-FsLGYaqig: ",
						"metrics": [],
						"current_at": "2019-03-21T20:18:53.101Z"
					}
				}
			},
			{
				"metadata": {
					"guid": "model-km04dnrc",
					"url": "/v3/models/model-km04dnrc",
					"created_at": "2019-03-21T20:15:00.264Z",
					"modified_at": "2019-03-21T20:15:00.264Z"
				},
				"entity": {
					"model_definition": {
						"framework": { "name": "tensorflow", "version": "1.12" },
						"name": "pepsi-coke-mountain-dew",
						"definition_href": "https://us-south.ml.cloud.ibm.com/v3/ml_assets/training_definitions/643f4954-de6c-42f1-8bc3-121dd4bb033e",
						"execution": {
							"command": "python3 -m wml.train_command --num-train-steps=500",
							"compute_configuration": { "name": "k80" }
						}
					},
					"training_data_reference": {
						"type": "s3",
						"connection": {
							"endpoint_url": "https://s3-api.us-geo.objectstorage.service.networklayer.com",
							"access_key_id": "fake",
							"secret_access_key": "fake"
						},
						"location": { "bucket": "pepsi-coke-mountain-dew" }
					},
					"training_results_reference": {
						"type": "s3",
						"connection": {
							"endpoint_url": "https://s3-api.us-geo.objectstorage.service.networklayer.com",
							"access_key_id": "fake",
							"secret_access_key": "fake"
						},
						"location": {
							"bucket": "soda-output-dir",
							"model_location": "training-9Dv1EaqmR"
						}
					},
					"status": {
						"state": "completed",
						"finished_at": "2019-03-21T20:37:33.759Z",
						"submitted_at": "2019-03-21T20:15:04.263Z",
						"running_at": "2019-03-21T20:15:41.066Z",
						"message": "training-9Dv1EaqmR: ",
						"metrics": [],
						"current_at": "2019-03-21T20:38:17.791Z"
					}
				}
			},
			{
				"metadata": {
					"guid": "model-kqnx7lwf",
					"url": "/v3/models/model-kqnx7lwf",
					"created_at": "2019-03-21T21:54:04.931Z",
					"modified_at": "2019-03-21T21:54:04.931Z"
				},
				"entity": {
					"model_definition": {
						"framework": { "name": "tensorflow", "version": "1.12" },
						"name": "pepsi-coke-mountain-dew",
						"definition_href": "https://us-south.ml.cloud.ibm.com/v3/ml_assets/training_definitions/897b6ba2-dcb9-4d73-bf99-a55f36ec9709",
						"execution": {
							"command": "python3 -m wml.train_command --num-train-steps=500",
							"compute_configuration": { "name": "k80" }
						}
					},
					"training_data_reference": {
						"type": "s3",
						"connection": {
							"endpoint_url": "https://s3-api.us-geo.objectstorage.service.networklayer.com",
							"access_key_id": "fake",
							"secret_access_key": "fake"
						},
						"location": { "bucket": "pepsi-coke-mountain-dew" }
					},
					"training_results_reference": {
						"type": "s3",
						"connection": {
							"endpoint_url": "https://s3-api.us-geo.objectstorage.service.networklayer.com",
							"access_key_id": "fake",
							"secret_access_key": "fake"
						},
						"location": {
							"bucket": "soda-output-dir",
							"model_location": "training-w8E49-qmg"
						}
					},
					"status": {
						"state": "completed",
						"finished_at": "2019-03-21T22:12:04.414Z",
						"submitted_at": "2019-03-21T21:54:07.864Z",
						"running_at": "2019-03-21T21:55:04.124Z",
						"message": "training-w8E49-qmg: ",
						"metrics": [],
						"current_at": "2019-03-21T22:12:11.815Z"
					}
				}
			},
			{
				"metadata": {
					"guid": "model-l98nzed0",
					"url": "/v3/models/model-l98nzed0",
					"created_at": "2019-03-26T15:33:41.078Z",
					"modified_at": "2019-03-26T15:33:41.078Z"
				},
				"entity": {
					"model_definition": {
						"framework": { "name": "tensorflow", "version": "1.12" },
						"name": "pepsi-coke-mountain-dew",
						"definition_href": "https://us-south.ml.cloud.ibm.com/v3/ml_assets/training_definitions/5572e574-4d05-4e51-9e2b-e3863d9e2bc0",
						"execution": {
							"command": "./start.sh",
							"compute_configuration": { "name": "k80" }
						}
					},
					"training_data_reference": {
						"type": "s3",
						"connection": {
							"endpoint_url": "https://s3-api.us-geo.objectstorage.service.networklayer.com",
							"access_key_id": "fake",
							"secret_access_key": "fake"
						},
						"location": { "bucket": "pepsi-coke-mountain-dew" }
					},
					"training_results_reference": {
						"type": "s3",
						"connection": {
							"endpoint_url": "https://s3-api.us-geo.objectstorage.service.networklayer.com",
							"access_key_id": "fake",
							"secret_access_key": "fake"
						},
						"location": {
							"bucket": "soda-output-dir",
							"model_location": "training-Bo8tmgeig"
						}
					},
					"status": {
						"state": "completed",
						"finished_at": "2019-03-26T15:35:34.165Z",
						"submitted_at": "2019-03-26T15:33:42.714Z",
						"running_at": "2019-03-26T15:34:19.179Z",
						"message": "training-Bo8tmgeig: ",
						"metrics": [],
						"current_at": "2019-03-26T15:35:47.783Z"
					}
				}
			},
			{
				"metadata": {
					"guid": "model-m4hwks29",
					"url": "/v3/models/model-m4hwks29",
					"created_at": "2019-03-27T00:37:19.448Z",
					"modified_at": "2019-03-27T00:37:19.448Z"
				},
				"entity": {
					"model_definition": {
						"framework": { "name": "tensorflow", "version": "1.12" },
						"name": "pepsi-coke-mountain-dew",
						"definition_href": "https://us-south.ml.cloud.ibm.com/v3/ml_assets/training_definitions/3e4e4b58-cec2-46fb-9c21-e2835e985686",
						"execution": {
							"command": "cd \"$(dirname \"$(find . -name \"start.sh\" -maxdepth 2 | head -1)\")\" && ./start.sh 500",
							"compute_configuration": { "name": "k80" }
						}
					},
					"training_data_reference": {
						"type": "s3",
						"connection": {
							"endpoint_url": "https://s3-api.us-geo.objectstorage.service.networklayer.com",
							"access_key_id": "fake",
							"secret_access_key": "fake"
						},
						"location": { "bucket": "pepsi-coke-mountain-dew" }
					},
					"training_results_reference": {
						"type": "s3",
						"connection": {
							"endpoint_url": "https://s3-api.us-geo.objectstorage.service.networklayer.com",
							"access_key_id": "fake",
							"secret_access_key": "fake"
						},
						"location": {
							"bucket": "soda-output-dir",
							"model_location": "training-SxSJkzeig"
						}
					},
					"status": {
						"state": "error",
						"finished_at": "2019-03-27T00:42:37.485Z",
						"submitted_at": "2019-03-27T00:37:21.737Z",
						"running_at": "2019-03-27T00:38:03.776Z",
						"error": {
							"trace": "",
							"errors": [
								{
									"code": "dl_job_failed (C201)",
									"message": "Learner process crashed (C201) with exit code (1), please check the job logs for more information",
									"more_info": "http://watson-ml-api.mybluemix.net/"
								}
							]
						},
						"message": "training-SxSJkzeig: 1",
						"metrics": [],
						"current_at": "2019-03-27T00:43:34.243Z",
						"error_cause": "user"
					}
				}
			},
			{
				"metadata": {
					"guid": "model-mn3m8qri",
					"url": "/v3/models/model-mn3m8qri",
					"created_at": "2019-03-27T00:30:35.759Z",
					"modified_at": "2019-03-27T00:30:35.759Z"
				},
				"entity": {
					"model_definition": {
						"framework": { "name": "tensorflow", "version": "1.12" },
						"name": "pepsi-coke-mountain-dew",
						"definition_href": "https://us-south.ml.cloud.ibm.com/v3/ml_assets/training_definitions/fdba036c-d68e-456d-816f-8b7ea89846ea",
						"execution": {
							"command": "cd \"$(dirname \"$(find . -name \"start.sh\" -maxdepth 2 -print -quit | head -1)\")\" && start.sh 500",
							"compute_configuration": { "name": "k80" }
						}
					},
					"training_data_reference": {
						"type": "s3",
						"connection": {
							"endpoint_url": "https://s3-api.us-geo.objectstorage.service.networklayer.com",
							"access_key_id": "fake",
							"secret_access_key": "fake"
						},
						"location": { "bucket": "pepsi-coke-mountain-dew" }
					},
					"training_results_reference": {
						"type": "s3",
						"connection": {
							"endpoint_url": "https://s3-api.us-geo.objectstorage.service.networklayer.com",
							"access_key_id": "fake",
							"secret_access_key": "fake"
						},
						"location": {
							"bucket": "soda-output-dir",
							"model_location": "training-SDrGkz6ig"
						}
					},
					"status": {
						"state": "error",
						"finished_at": "2019-03-27T00:33:36.180Z",
						"submitted_at": "2019-03-27T00:30:44.471Z",
						"running_at": "2019-03-27T00:31:57.155Z",
						"error": {
							"trace": "",
							"errors": [
								{
									"code": "dl_job_failed (C201)",
									"message": "Learner process crashed (C201) with exit code (127), please check the job logs for more information",
									"more_info": "http://watson-ml-api.mybluemix.net/"
								}
							]
						},
						"message": "training-SDrGkz6ig: 127",
						"metrics": [],
						"current_at": "2019-03-27T00:33:51.492Z",
						"error_cause": "user"
					}
				}
			},
			{
				"metadata": {
					"guid": "model-npqc584l",
					"url": "/v3/models/model-npqc584l",
					"created_at": "2019-03-21T22:08:52.022Z",
					"modified_at": "2019-03-21T22:08:52.022Z"
				},
				"entity": {
					"model_definition": {
						"framework": { "name": "tensorflow", "version": "1.12" },
						"name": "pepsi-coke-mountain-dew",
						"definition_href": "https://us-south.ml.cloud.ibm.com/v3/ml_assets/training_definitions/92f310a6-cdd6-41f5-b865-15783fa7776b",
						"execution": {
							"command": "python3 -m wml.train_command --num-train-steps=500",
							"compute_configuration": { "name": "k80" }
						}
					},
					"training_data_reference": {
						"type": "s3",
						"connection": {
							"endpoint_url": "https://s3-api.us-geo.objectstorage.service.networklayer.com",
							"access_key_id": "fake",
							"secret_access_key": "fake"
						},
						"location": { "bucket": "pepsi-coke-mountain-dew" }
					},
					"training_results_reference": {
						"type": "s3",
						"connection": {
							"endpoint_url": "https://s3-api.us-geo.objectstorage.service.networklayer.com",
							"access_key_id": "fake",
							"secret_access_key": "fake"
						},
						"location": {
							"bucket": "soda-output-dir",
							"model_location": "training-CXUkC-3mg"
						}
					},
					"status": {
						"state": "completed",
						"finished_at": "2019-03-21T22:30:02.975Z",
						"submitted_at": "2019-03-21T22:08:54.202Z",
						"running_at": "2019-03-21T22:09:35.968Z",
						"message": "training-CXUkC-3mg: ",
						"metrics": [],
						"current_at": "2019-03-21T22:31:06.254Z"
					}
				}
			},
			{
				"metadata": {
					"guid": "model-nsmzfrhg",
					"url": "/v3/models/model-nsmzfrhg",
					"created_at": "2019-03-27T00:52:16.502Z",
					"modified_at": "2019-03-27T00:52:16.502Z"
				},
				"entity": {
					"model_definition": {
						"framework": { "name": "tensorflow", "version": "1.12" },
						"name": "pepsi-coke-mountain-dew",
						"definition_href": "https://us-south.ml.cloud.ibm.com/v3/ml_assets/training_definitions/21bd540c-5b0a-4394-963f-f83bda866c99",
						"execution": {
							"command": "cd \"$(dirname \"$(find . -name \"start.sh\" -maxdepth 2 | head -1)\")\" && ./start.sh 500",
							"compute_configuration": { "name": "k80" }
						}
					},
					"training_data_reference": {
						"type": "s3",
						"connection": {
							"endpoint_url": "https://s3-api.us-geo.objectstorage.service.networklayer.com",
							"access_key_id": "fake",
							"secret_access_key": "fake"
						},
						"location": { "bucket": "pepsi-coke-mountain-dew" }
					},
					"training_results_reference": {
						"type": "s3",
						"connection": {
							"endpoint_url": "https://s3-api.us-geo.objectstorage.service.networklayer.com",
							"access_key_id": "fake",
							"secret_access_key": "fake"
						},
						"location": {
							"bucket": "soda-output-dir",
							"model_location": "training-K_x5mkeig"
						}
					},
					"status": {
						"state": "completed",
						"finished_at": "2019-03-27T01:15:29.722Z",
						"submitted_at": "2019-03-27T00:52:27.541Z",
						"running_at": "2019-03-27T00:53:34.918Z",
						"message": "training-K_x5mkeig: ",
						"metrics": [],
						"current_at": "2019-03-27T01:15:32.516Z"
					}
				}
			},
			{
				"metadata": {
					"guid": "model-o2jx05j2",
					"url": "/v3/models/model-o2jx05j2",
					"created_at": "2019-03-19T14:15:39.605Z",
					"modified_at": "2019-03-19T14:15:39.605Z"
				},
				"entity": {
					"model_definition": {
						"framework": { "name": "tensorflow", "version": "1.12" },
						"name": "pepsi-coke-mountain-dew",
						"definition_href": "https://us-south.ml.cloud.ibm.com/v3/ml_assets/training_definitions/41855c46-093e-4d1c-b729-1c4df7bf0e82",
						"execution": {
							"command": "python3 -m wml.train_command --num-train-steps=500",
							"compute_configuration": { "name": "k80" }
						}
					},
					"training_data_reference": {
						"type": "s3",
						"connection": {
							"endpoint_url": "https://s3-api.us-geo.objectstorage.service.networklayer.com",
							"access_key_id": "fake",
							"secret_access_key": "fake"
						},
						"location": { "bucket": "pepsi-coke-mountain-dew" }
					},
					"training_results_reference": {
						"type": "s3",
						"connection": {
							"endpoint_url": "https://s3-api.us-geo.objectstorage.service.networklayer.com",
							"access_key_id": "fake",
							"secret_access_key": "fake"
						},
						"location": {
							"bucket": "soda-output-dir",
							"model_location": "training-LWrnjp3iR"
						}
					},
					"status": {
						"state": "completed",
						"finished_at": "2019-03-19T14:34:14.968Z",
						"submitted_at": "2019-03-19T14:15:43.730Z",
						"running_at": "2019-03-19T14:16:04.707Z",
						"message": "training-LWrnjp3iR: ",
						"metrics": [],
						"current_at": "2019-03-19T14:34:50.740Z"
					}
				}
			},
			{
				"metadata": {
					"guid": "model-pcaawjqp",
					"url": "/v3/models/model-pcaawjqp",
					"created_at": "2019-03-27T20:45:59.297Z",
					"modified_at": "2019-03-27T20:45:59.297Z"
				},
				"entity": {
					"model_definition": {
						"framework": { "name": "tensorflow", "version": "1.12" },
						"name": "pepsi-coke-mountain-dew",
						"definition_href": "https://us-south.ml.cloud.ibm.com/v3/ml_assets/training_definitions/8b849f07-a98d-41da-99e2-71f9517488ab",
						"execution": {
							"command": "cd \"$(dirname \"$(find . -name \"start.sh\" -maxdepth 2 | head -1)\")\" && ./start.sh 500",
							"compute_configuration": { "name": "k80" }
						}
					},
					"training_data_reference": {
						"type": "s3",
						"connection": {
							"endpoint_url": "https://s3-api.us-geo.objectstorage.service.networklayer.com",
							"access_key_id": "fake",
							"secret_access_key": "fake"
						},
						"location": { "bucket": "pepsi-coke-mountain-dew" }
					},
					"training_results_reference": {
						"type": "s3",
						"connection": {
							"endpoint_url": "https://s3-api.us-geo.objectstorage.service.networklayer.com",
							"access_key_id": "fake",
							"secret_access_key": "fake"
						},
						"location": {
							"bucket": "soda-output-dir",
							"model_location": "training-sPdEVW6iR"
						}
					},
					"status": {
						"state": "completed",
						"finished_at": "2019-03-27T21:07:20.584Z",
						"submitted_at": "2019-03-27T20:46:02.544Z",
						"running_at": "2019-03-27T20:46:40.274Z",
						"message": "training-sPdEVW6iR: ",
						"metrics": [],
						"current_at": "2019-03-27T21:08:07.611Z"
					}
				}
			},
			{
				"metadata": {
					"guid": "model-qssg1zxq",
					"url": "/v3/models/model-qssg1zxq",
					"created_at": "2019-03-26T15:05:01.282Z",
					"modified_at": "2019-03-26T15:05:01.282Z"
				},
				"entity": {
					"model_definition": {
						"framework": { "name": "tensorflow", "version": "1.12" },
						"name": "pepsi-coke-mountain-dew",
						"definition_href": "https://us-south.ml.cloud.ibm.com/v3/ml_assets/training_definitions/632b384c-33fa-427f-8a2f-5d2450d2ebac",
						"execution": {
							"command": "python3 -m wml.train_command --num-train-steps=500",
							"compute_configuration": { "name": "k80" }
						}
					},
					"training_data_reference": {
						"type": "s3",
						"connection": {
							"endpoint_url": "https://s3-api.us-geo.objectstorage.service.networklayer.com",
							"access_key_id": "fake",
							"secret_access_key": "fake"
						},
						"location": { "bucket": "pepsi-coke-mountain-dew" }
					},
					"training_results_reference": {
						"type": "s3",
						"connection": {
							"endpoint_url": "https://s3-api.us-geo.objectstorage.service.networklayer.com",
							"access_key_id": "fake",
							"secret_access_key": "fake"
						},
						"location": {
							"bucket": "soda-output-dir",
							"model_location": "training-EmDwRR6iR"
						}
					},
					"status": {
						"state": "error",
						"finished_at": "2019-03-26T15:07:36.873Z",
						"submitted_at": "2019-03-26T15:05:05.669Z",
						"running_at": "2019-03-26T15:05:47.765Z",
						"error": {
							"trace": "",
							"errors": [
								{
									"code": "dl_job_failed (C201)",
									"message": "Learner process crashed (C201) with exit code (1), please check the job logs for more information",
									"more_info": "http://watson-ml-api.mybluemix.net/"
								}
							]
						},
						"message": "training-EmDwRR6iR: 1",
						"metrics": [],
						"current_at": "2019-03-26T15:08:15.372Z",
						"error_cause": "user"
					}
				}
			},
			{
				"metadata": {
					"guid": "model-qwmk4y9e",
					"url": "/v3/models/model-qwmk4y9e",
					"created_at": "2019-03-29T15:40:19.622Z",
					"modified_at": "2019-03-29T15:40:19.622Z"
				},
				"entity": {
					"model_definition": {
						"framework": { "name": "tensorflow", "version": "1.12" },
						"name": "pepsi-coke-mountain-dew",
						"definition_href": "https://us-south.ml.cloud.ibm.com/v3/ml_assets/training_definitions/7e1a7922-d2c1-4aa2-bc85-174694b8e7f5",
						"execution": {
							"command": "cd \"$(dirname \"$(find . -name \"start.sh\" -maxdepth 2 | head -1)\")\" && ./start.sh 50",
							"compute_configuration": { "name": "k80" }
						}
					},
					"training_data_reference": {
						"type": "s3",
						"connection": {
							"endpoint_url": "https://s3-api.us-geo.objectstorage.service.networklayer.com",
							"access_key_id": "fake",
							"secret_access_key": "fake"
						},
						"location": { "bucket": "pepsi-coke-mountain-dew" }
					},
					"training_results_reference": {
						"type": "s3",
						"connection": {
							"endpoint_url": "https://s3-api.us-geo.objectstorage.service.networklayer.com",
							"access_key_id": "fake",
							"secret_access_key": "fake"
						},
						"location": {
							"bucket": "soda-output-dir",
							"model_location": "training-v7WglI6iR"
						}
					},
					"status": {
						"state": "completed",
						"finished_at": "2019-03-29T15:51:03.471Z",
						"submitted_at": "2019-03-29T15:40:23.480Z",
						"running_at": "2019-03-29T15:41:34.471Z",
						"message": "training-v7WglI6iR: ",
						"metrics": [],
						"current_at": "2019-03-29T15:51:37.294Z"
					}
				}
			},
			{
				"metadata": {
					"guid": "model-ym6g8kzo",
					"url": "/v3/models/model-ym6g8kzo",
					"created_at": "2019-03-26T15:20:42.928Z",
					"modified_at": "2019-03-26T15:20:42.928Z"
				},
				"entity": {
					"model_definition": {
						"framework": { "name": "tensorflow", "version": "1.12" },
						"name": "pepsi-coke-mountain-dew",
						"definition_href": "https://us-south.ml.cloud.ibm.com/v3/ml_assets/training_definitions/b58ad652-a1bc-4197-8757-6c96ab1e6bbf",
						"execution": {
							"command": "python3 -m wml.train_command --num-train-steps=500",
							"compute_configuration": { "name": "k80" }
						}
					},
					"training_data_reference": {
						"type": "s3",
						"connection": {
							"endpoint_url": "https://s3-api.us-geo.objectstorage.service.networklayer.com",
							"access_key_id": "fake",
							"secret_access_key": "fake"
						},
						"location": { "bucket": "pepsi-coke-mountain-dew" }
					},
					"training_results_reference": {
						"type": "s3",
						"connection": {
							"endpoint_url": "https://s3-api.us-geo.objectstorage.service.networklayer.com",
							"access_key_id": "fake",
							"secret_access_key": "fake"
						},
						"location": {
							"bucket": "soda-output-dir",
							"model_location": "training-HPREzR6ig"
						}
					},
					"status": {
						"state": "error",
						"finished_at": "2019-03-26T15:23:06.124Z",
						"submitted_at": "2019-03-26T15:20:44.972Z",
						"running_at": "2019-03-26T15:21:27.409Z",
						"error": {
							"trace": "",
							"errors": [
								{
									"code": "dl_job_failed (C201)",
									"message": "Learner process crashed (C201) with exit code (1), please check the job logs for more information",
									"more_info": "http://watson-ml-api.mybluemix.net/"
								}
							]
						},
						"message": "training-HPREzR6ig: 1",
						"metrics": [],
						"current_at": "2019-03-26T15:23:51.954Z",
						"error_cause": "user"
					}
				}
			},
			{
				"metadata": {
					"guid": "model-zsjh2ffs",
					"url": "/v3/models/model-zsjh2ffs",
					"created_at": "2019-03-27T15:54:00.956Z",
					"modified_at": "2019-03-27T15:54:00.956Z"
				},
				"entity": {
					"model_definition": {
						"framework": { "name": "tensorflow", "version": "1.12" },
						"name": "pepsi-coke-mountain-dew",
						"definition_href": "https://us-south.ml.cloud.ibm.com/v3/ml_assets/training_definitions/78ad8c88-20b7-4b26-8f2f-961b20c23200",
						"execution": {
							"command": "cd \"$(dirname \"$(find . -name \"start.sh\" -maxdepth 2 | head -1)\")\" && ./start.sh 500",
							"compute_configuration": { "name": "k80" }
						}
					},
					"training_data_reference": {
						"type": "s3",
						"connection": {
							"endpoint_url": "https://s3-api.us-geo.objectstorage.service.networklayer.com",
							"access_key_id": "fake",
							"secret_access_key": "fake"
						},
						"location": { "bucket": "pepsi-coke-mountain-dew" }
					},
					"training_results_reference": {
						"type": "s3",
						"connection": {
							"endpoint_url": "https://s3-api.us-geo.objectstorage.service.networklayer.com",
							"access_key_id": "fake",
							"secret_access_key": "fake"
						},
						"location": {
							"bucket": "soda-output-dir",
							"model_location": "training-N386Liemg"
						}
					},
					"status": {
						"state": "error",
						"finished_at": "2019-03-27T15:57:40.190Z",
						"submitted_at": "2019-03-27T15:54:15.585Z",
						"running_at": "2019-03-27T15:55:29.181Z",
						"error": {
							"trace": "",
							"errors": [
								{
									"code": "dl_job_failed (C201)",
									"message": "Learner process crashed (C201) with exit code (127), please check the job logs for more information",
									"more_info": "http://watson-ml-api.mybluemix.net/"
								}
							]
						},
						"message": "training-N386Liemg: 127",
						"metrics": [],
						"current_at": "2019-03-27T15:58:26.802Z",
						"error_cause": "user"
					}
				}
			}
		]
	}`)
