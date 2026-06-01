PROJECT=rhtp

COGNITO_IDENTITY_POOL_ID=op://mdct_devs/rhtp_secrets/COGNITO_IDENTITY_POOL_ID
COGNITO_USER_POOL_CLIENT_ID=op://mdct_devs/rhtp_secrets/COGNITO_USER_POOL_CLIENT_ID
COGNITO_USER_POOL_CLIENT_DOMAIN=op://mdct_devs/rhtp_secrets/COGNITO_USER_POOL_CLIENT_DOMAIN
COGNITO_USER_POOL_ID=op://mdct_devs/rhtp_secrets/COGNITO_USER_POOL_ID
LD_LOCAL_FLAGS='{"local": false, "flags": { "devTools": false}}'
LD_SDK_KEY=op://mdct_devs/rhtp_secrets/LD_SDK_KEY_DEV
REACT_APP_LD_SDK_CLIENT=op://mdct_devs/rhtp_secrets/REACT_APP_LD_SDK_CLIENT

# e2e test credentials and data
TEST_ADMIN_USER_EMAIL=op://mdct_devs/rhtp_secrets/TEST_ADMIN_USER_EMAIL
TEST_ADMIN_USER_PASSWORD=op://mdct_devs/rhtp_secrets/TEST_ADMIN_USER_PASSWORD # pragma: allowlist secret
TEST_STATE_USER_EMAIL=op://mdct_devs/rhtp_secrets/TEST_STATE_USER_EMAIL
TEST_STATE_USER_PASSWORD=op://mdct_devs/rhtp_secrets/TEST_STATE_USER_PASSWORD # pragma: allowlist secret
TEST_STATE=op://mdct_devs/rhtp_secrets/TEST_STATE
TEST_STATE_NAME=op://mdct_devs/rhtp_secrets/TEST_STATE_NAME