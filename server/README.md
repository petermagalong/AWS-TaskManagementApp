# Task Management API

This service is set up to run locally with Express and deploy to AWS with AWS SAM, Lambda, API Gateway, and DynamoDB.

## Architecture

- API Gateway forwards HTTP requests to a Lambda function.
- Lambda runs the Express app from `src/app.js` through `src/lambda.js`.
- DynamoDB stores tasks in the table created by `template.yaml`.

## Prerequisites

Install these tools before deploying:

- Node.js 20+
- AWS CLI
- AWS SAM CLI

Configure AWS credentials for the target account:

```powershell
aws configure
```

## Connect AWS Account For SAM

AWS SAM uses the same credentials configured for the AWS CLI. It does not have a separate login step.

Check that the required tools are installed:

```powershell
aws --version
sam --version
```

If `sam --version` fails, install AWS SAM CLI first before continuing.

### Option 1: IAM Access Keys

Configure your AWS account with access keys:

```powershell
aws configure
```

You will be prompted for:

- AWS Access Key ID
- AWS Secret Access Key
- Default region name
- Default output format

Verify which account is active:

```powershell
aws sts get-caller-identity
```

### Option 2: Named AWS Profile

If you use multiple AWS accounts, create and deploy with a named profile:

```powershell
aws configure --profile myaws
aws sts get-caller-identity --profile myaws
sam deploy --guided --profile myaws
```

### Option 3: AWS SSO

If your organization uses AWS SSO:

```powershell
aws configure sso
aws sso login --profile myaws
aws sts get-caller-identity --profile myaws
sam deploy --guided --profile myaws
```

### Option 4: Environment Variables

You can also provide credentials through PowerShell environment variables:

```powershell
$env:AWS_ACCESS_KEY_ID="your-access-key"
$env:AWS_SECRET_ACCESS_KEY="your-secret-key"
$env:AWS_REGION="ap-southeast-1"
sam deploy --guided
```

Best practice is to run `aws sts get-caller-identity` before `sam deploy` so you know exactly which AWS account SAM will use.

## Local Setup

From the `server` folder:

```powershell
npm install
npm run start
```

Local API base URL:

```text
http://localhost:3000/api
```

Health check:

```powershell
curl http://localhost:3000/health
```

## Deploy To AWS

From the workspace root (`TaskManagementApp`):

```powershell
sam build
sam deploy --guided
```

Or from the `server` folder with the explicit template path:

```powershell
npm install
sam build --template-file template.yaml
sam deploy --guided --template-file template.yaml
```

Recommended answers during `sam deploy --guided`:

- Stack Name: `task-management-api`
- AWS Region: your target region, for example `ap-southeast-1`
- Confirm changes before deploy: `Y`
- Allow SAM CLI IAM role creation: `Y`
- Disable rollback: `N`
- Save arguments to configuration file: `Y`

Important: the stack name must not contain spaces. Valid examples are `task-management-api` or `PeterTaskDemo587b81fbCompanionStack`. Invalid examples are names like `Peter Task Demo-587b81fb-CompanionStack` because CloudFormation stack names only allow letters, numbers, and hyphens, and they must start with a letter.

After the first guided deploy, you can redeploy with:

```powershell
sam build
sam deploy
```

This project also includes a default `samconfig.toml` with a safe stack name. If you want a different name, update the `stack_name` value in that file and keep the same CloudFormation naming rules.

If you run SAM from the wrong folder, you may see an error like `Template file not found`. Use the root-level `template.yaml` from `TaskManagementApp`, or point SAM to `server/template.yaml` explicitly.

## AWS Resources Created

The SAM template creates:

- API Gateway REST API
- Lambda function for the Express app
- DynamoDB table with `id` as the partition key

The DynamoDB table name is injected into the Lambda function through the `TASKS_TABLE` environment variable.

## API Paths

After deployment, the output includes an API URL like:

```text
https://abc123.execute-api.ap-southeast-1.amazonaws.com/prod/
```

Use these routes:

- `GET /health`
- `POST /api/tasks`
- `GET /api/tasks`
- `GET /api/tasks/{id}`
- `PUT /api/tasks/{id}`
- `DELETE /api/tasks/{id}`

## Example API Calls

You can also import the Postman collection from `server/postman/TaskManagementApp.postman_collection.json`.

In Postman:

- Set `baseUrl` to `http://localhost:3000` for local testing
- Set `baseUrl` to your deployed API root such as `https://abc123.execute-api.ap-southeast-1.amazonaws.com/prod`
- After creating a task, copy its `id` into the `taskId` variable for the GET by ID, PUT, and DELETE requests

Set your deployed base URL:

```powershell
$API_URL = "https://abc123.execute-api.ap-southeast-1.amazonaws.com/prod"
```

Create a task:

```powershell
curl -X POST "$API_URL/api/tasks" `
  -H "Content-Type: application/json" `
  -d '{"title":"Finish AWS deployment","description":"Deploy task app to Lambda","status":"pending"}'
```

List all tasks:

```powershell
curl "$API_URL/api/tasks"
```

Get one task by ID:

```powershell
curl "$API_URL/api/tasks/<task-id>"
```

Update a task:

```powershell
curl -X PUT "$API_URL/api/tasks/<task-id>" `
  -H "Content-Type: application/json" `
  -d '{"title":"Finish AWS deployment","status":"done"}'
```

Delete a task:

```powershell
curl -X DELETE "$API_URL/api/tasks/<task-id>"
```

Health check:

```powershell
curl "$API_URL/health"
```

## Notes

- The app uses the Lambda runtime region from `AWS_REGION` when deployed.
- If you change infrastructure in `template.yaml`, run `sam build` before deploying again.
- If you want local Lambda-style testing, you can also use `sam local start-api` after `sam build`.
