Overview
--------
This directory helps to build and deploy the Jekyll site.

Simply run `create-infra.sh` to create:
- Cloudfront/S3/R53 infrastructure for the static site
- A codedeploy pipeline that releases to it from a GitHub repository

Many thanks to jenseickmeyer for the Cloudformation templates ((https://github.com/jenseickmeyer/cloudformation-templates).