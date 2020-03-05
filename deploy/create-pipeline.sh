#!/bin/bash 
set -euo pipefail

STACK_NAME=dbergamin-personal-site-deploy
REGION=eu-west-1
REPO_OWNER=dbergamin
REPO_NAME=dbergamin-personal-site
REPO_DEPLOY_BRANCH=master
WEBSITE_STACK_NAME=dbergamin-personal-site

# Heavily inspired by https://gist.github.com/mdjnewman/b9d722188f4f9c6bb277a37619665e77
# Thanks to Matt Newman (https://github.com/mdjnewman)
echo "Checking if deploy pipeline stack exists ..."

if ! aws cloudformation describe-stacks --region $REGION --stack-name $STACK_NAME ; then
	echo -e "\nStack does not exist, creating ..."
	aws cloudformation create-stack --stack-name $STACK_NAME \
                                	--template-body file://cloudformation/deploy-pipeline.yaml  \
                                	--capabilities CAPABILITY_IAM \
                                	--parameters ParameterKey=RepositoryOwner,ParameterValue=$REPO_OWNER \
                                             	ParameterKey=RepositoryName,ParameterValue=$REPO_NAME \
                                             	ParameterKey=RepositoryBranch,ParameterValue=$REPO_DEPLOY_BRANCH \
                                             	ParameterKey=StaticWebsiteStackName,ParameterValue=$WEBSITE_STACK_NAME \
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
    	--template-body file://cloudformation/deploy-pipeline.yaml  \
    	--capabilities CAPABILITY_IAM \
    	--parameters ParameterKey=RepositoryOwner,ParameterValue=$REPO_OWNER \
                 	ParameterKey=RepositoryName,ParameterValue=$REPO_NAME \
                 	ParameterKey=RepositoryBranch,ParameterValue=$REPO_DEPLOY_BRANCH \
                 	ParameterKey=StaticWebsiteStackName,ParameterValue=$WEBSITE_STACK_NAME \
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