# Notebooks

## Overview
This folder contains Jupyter notebooks that were used to build out the API endpoints
for the Marites application.

- The `notebooks` folder contains all the API function logic
- The `prototypes` folder contains notebooks that were used for experimentation and reference

## Get started

### Prequisites

- Jupyter Notebook
- Python3 and Pip
- Set up AWS CLI and credentials locally
- Created the overall infrastructure using the `marites-cdk` stack

### Instructions

1. Install all dependencies using `pip install -r requirements.txt`
2. Create a `.env` file within the notebooks directory which contains the following content

```
BEARER_TOKEN= # twitter API bearer token
DATA_ACCESS_ROLE= # comprehend data access ARN

TG_HOST= # tigergraph host url
TG_PASSWORD= # tigergraph user password
```

3. Run notebooks `jupyter notebook .`