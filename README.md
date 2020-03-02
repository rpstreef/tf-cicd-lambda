# Terraform AWS CI/CD module for AWS Lambda compute

## About:

This repo sets up an AWS CodePipeline CI/CD for your AWS Lambda/Lambda-layer code. It does so by using a [Gulp](https://gulpjs.com/) script that runs AWS CLI commands.

The Terraform Lambda and Lambda-layer ``resources`` should not be checking code versions to make sure there are no re-deployments done when you run Terraform ``apply``.

## How to use:

Supply the github details, recommended to not set the Github OAuth token in your ``tfvars`` file but instead enter it at the command line. 
The S3 backed state storage is AES encrypted, so your Github OAuth token should be safe there.

``lambda_function_names`` variable expects a comma separated list of all your lambda function names.

```terraform
module "cicd" {
  source = "github.com/rpstreef/tf-cicd-lambda"

  resource_tag_name = var.resource_tag_name
  namespace         = var.namespace
  region            = var.region

  github_token        = var.github_token
  github_owner        = var.github_owner
  github_repo         = var.github_repo
  poll_source_changes = var.poll_source_changes

  lambda_layer_name     = aws_lambda_layer_version._.layer_name
  lambda_function_names = "${module.identity.lambda_name},${module.user.lambda_names}"
}
```

## Changelog

### v1.0
 - Initial release