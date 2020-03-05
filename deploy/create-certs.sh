#!/bin/bash 
STACK_NAME=dbergamin-personal-site
HOSTED_ZONE_ID=Z2VL2PCSZ169RU
DOMAIN_NAME=danielbergamin.net
REGION=eu-west-1
EMAIL_ADDRESS=daniel@bergam.in

# Get certifacte ready
# This code triggers on first run
# The else will run after certbot runs this script again as an auth hook 
DIR="$(cd "$(dirname "$0")" && pwd)/$(basename "$0")"
if [ -z "${CERTBOT_DOMAIN}" ]; then
	mkdir -p certs
	echo "Creating the cert"
  	certbot certonly \
	    --non-interactive \
	    --manual \
	    --manual-auth-hook "${DIR}" \
	    --manual-cleanup-hook "${DIR}" \
	    --preferred-challenge dns \
	    --config-dir "certs" \
	    --work-dir "certs" \
	    --logs-dir "certs" \
	    --email "$EMAIL_ADDRESS" \
	    --domain "$DOMAIN_NAME" \
	    --manual-public-ip-logging-ok \
	    --agree-tos	\
	    "$@"
else
  [[ ${CERTBOT_AUTH_OUTPUT} ]] && ACTION="DELETE" || ACTION="UPSERT"

  aws route53 wait resource-record-sets-changed --id "$(
    aws route53 change-resource-record-sets \
    --hosted-zone-id "${HOSTED_ZONE_ID}" \
    --query ChangeInfo.Id --output text \
    --change-batch "{
      \"Changes\": [{
        \"Action\": \"${ACTION}\",
        \"ResourceRecordSet\": {
          \"Name\": \"_acme-challenge.${CERTBOT_DOMAIN}.\",
          \"ResourceRecords\": [{\"Value\": \"\\\"${CERTBOT_VALIDATION}\\\"\"}],
          \"Type\": \"TXT\",
          \"TTL\": 30
        }
      }]
    }"
  )"

  echo 1
fi