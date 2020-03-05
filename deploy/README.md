Overview
--------
This directory helps to build and deploy the Jekyll site.


Provisioning the infra
----------------------
1. Set variables at the top of the file, and then run `create-certs.sh` to get a LetsEncrypt certificate generated if you don't have one.
2. Upload the certificate to ACM (I've just done this manually)
3. Set the variables (including the ARN of your certificate that you have just uploded), then run `create-infra.sh` to create the Cloudfront/S3/R53 infrastructure for the static site.
4. Now we need to put some content in the site bucket!
 a. Add your github acces token to the SSM Parameter Store as a String parameter called '/github/personal_access_token'. You can generate that from https://github.com/settings/tokens.
 b. Tweak the vars and run `create-pipeline.sh` to set up a codedeploy pipeline that releases to our bucket from your nominated GitHub repository.

Many thanks to jenseickmeyer for the Cloudformation templates (https://github.com/jenseickmeyer/cloudformation-templates).