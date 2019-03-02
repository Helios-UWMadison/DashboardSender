# Overview
These are collections of scripts which automate dashboard data population and sending via email.
The renewable energy student organization at the University of Wisconson-Madison, Helios, 
makes use of these scripts.

## Deployment
The contents of the 'master' branch are automatically deployed upon new commits
onto an AWS Lambda function using AWS CodeDeploy. A build is created and tested for each
commit using AWS CodeBuild.

However, it is the responsibility of the developers to do the following before committing:
* Write clean, loosely coupled unit tests
* Test code locally
* Issue a pull-request for code to be merged into master
