#!/bin/bash 
set -euo pipefail

STACK_NAME=dbergamin-personal-site
HOSTED_ZONE_ID=Z2VL2PCSZ169RU
DOMAIN_NAME=danielbergamin.net
REGION=eu-west-1
CERTIFICATE_ARN=arn:aws:acm:us-east-1:047394579322:certificate/510cb42d-296a-4247-bd36-8dc874736351

# Heavily inspired by https://gist.github.com/mdjnewman/b9d722188f4f9c6bb277a37619665e77
# Thanks to Matt Newman (https://github.com/mdjnewman)
echo "Checking if infra stack exists ..."

if ! aws cloudformation describe-stacks --region $REGION --stack-name $STACK_NAME ; then
	echo -e "\nStack does not exist, creating ..."
	aws cloudformation create-stack --stack-name $STACK_NAME \
                                	--template-body file://cloudformation/site-infra.yaml  \
                                	--capabilities CAPABILITY_IAM \
                                	--parameters ParameterKey=HostedZoneId,ParameterValue=$HOSTED_ZONE_ID \
                                             	ParameterKey=DomainName,ParameterValue=$DOMAIN_NAME \
                                             	ParameterKey=CertificateArn,ParameterValue=$CERTIFICATE_ARN \
                         	                 	ParameterKey=Nonce,ParameterValue=$RANDOM \
                                	--region $REGION
	echo "Waiting for stack to be created ..."
	aws cloudformation wait stack-create-complete \
	--region $REGION \
	--stack-name $STACK_NAME
else
	echo -e "\nStack exists, attempting update ..."
	  set +e
	  update_output=$( aws cloudformation update-stack \
	    --stack-name $STACK_NAME \
    	--template-body file://cloudformation/site-infra.yaml  \
    	--capabilities CAPABILITY_IAM \
    	--parameters ParameterKey=HostedZoneId,ParameterValue=$HOSTED_ZONE_ID \
  	               	ParameterKey=DomainName,ParameterValue=$DOMAIN_NAME \
                 	ParameterKey=CertificateArn,ParameterValue=$CERTIFICATE_ARN \
                 	ParameterKey=Nonce,ParameterValue=$RANDOM \
    	--region eu-west-1 2>&1)
	  status=$?
  	set -e
	echo "$update_output"

	if [ $status -ne 0 ] ; then

	# Don't fail for no-op update
	if [[ $update_output == *"ValidationError"* && $update_output == *"No updates"* ]] ; then
	  echo -e "\nFinished create/update - no updates to be performed"
	  exit 0
	else
	  exit $status
	fi

	fi

	echo "Waiting for stack update to complete ..."
	aws cloudformation wait stack-update-complete \
		--region $REGION \
		--stack-name $STACK_NAME
fi