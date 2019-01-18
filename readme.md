# Grammarly Cinema Test Task

## Links

| Resource                | URL                                          |
| ----------------------- | -------------------------------------------- |
| Source Control          | https://github.com/ashenwolf/demo-cinema.git |
| Demo Deployment (dokku) | https://grammarly-cinema.binky.okami.tech    |

## Installation

Install MeteorJS: https://www.meteor.com/install

Clone repository:

    $ git clone https://github.org/ashenwolf/test-cinema

Enter app folder:

    $ cd test-cinema

Restore dependencies:

    $ meteor npm install

Start meteor app:

    $ meteor

## Running Tests

    $ npm run test

## Dokku Deployment

Assuming ssh keys are already installed and Dokku itself is set up.

Log in to server hosting Dokku:

    $ ssh dokku.server.name

Install Dokku MongoDB plugin:

    $ sudo dokku plugin:install https://github.com/dokku/dokku-mongo.git mongo

Create DB container for application:

    $ dokku mongo:create test-cinema-db

Create application:

    $ dokku apps:create test-cinema

Link mongo database container to app container:

    $ dokku mongo:link test-cinema-db test-cinema

Set up Meteor Buildpack for app:

    $ dokku config:set test-cinema BUILDPACK_URL=https://github.com/AdmitHub/meteor-buildpack-horse.git

Set the root URL:

    $ dokku config:set test-cinema ROOT_URL=http://test-cinema.dokku.server.name

Log off the remove Dokku host and send the codebase to Dokku server:

    $ git remote add dokku dokku@dokku.server.name:test-cinema
    $ git push dokku master

The app should be deployed now and accessible via http://test-cinema.dokku.server.name

## AWS Deployment

TODO
