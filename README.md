# JSON CMS API

The JSON CMS API is designed to help with web application content management.

## Required Dependencies

JSON CMS API has two software dependencies:

### 1. [NodeJS 17.8.0](https://nodejs.org/en/download/)

### 2. [MongoDB 5.0.6](https://www.mongodb.com/download-center/community)

## Required Configuration

Before running the API and getting started there are a few steps that
must be completed.

**_NOTE:_** _These steps assume you are using a Linux operating system, the
equivalent Windows commands will have to be researched on your own._

**_You must complete all steps to start the API_**

### 1. Configure db.ts

Create a new database configuration file using the following path / template, found below:

**json-cms-api/src/config/db.ts**

```
export const DB_HOST = 'YOUR DATABASE HOSTNAME GOES HERE';
export const DB_PORT = 'YOUR DATABASE PORT GOES HERE';
export const DB_NAME = 'YOUR DATABASE NAME GOES HERE';
export const DB_OPTIONS = {
  user: 'YOUR DB USERNAME',
  pass: 'YOUR DB PASSWORD',
  authSource: 'YOUR DB AUTHENTICATION SOURCE',
};
```

### 2. Configure auth.ts

This API utilizes JSON web tokens for authentication. This requires that a secret password be provided via config file.
Since private data is not supposed to be stored in a repo, you will have to create your own file.

Create a new auth configuration file using the following path / template, found below:

**json-cms-api/src/config/auth.ts**

```
export const SALT_ROUNDS = 10;
export const SECRET = 'YOUR SECRET AND SECURE PASSWORD GOES HERE';
```

**_NOTE:_** The `SALT_ROUNDS` can be any _number_ your choose.

### 3. Install Node Modules

Run the following command from the _root of the cloned repository_ to
install node modules required for the API.

```
npm install
```

### 4. Configure HTTPS (OPTIONAL)

This step may be completed by providing a CA signed certificate, assuming
you have the .pem files, or by generating a self-signed certificate
as shown below:

```
mkdir -p json-cms-api/config/ssl
cd json-cms-api/config/ssl
openssl req -x509 -nodes -newkey rsa:2048 -keyout key.pem -out cert.pem -days 365
```

_You will be asked questions when generating the self-signed certificate, answer the prompts until the process completes_

## Start Up

**_After all Install Dependencies and Required Configuration steps have been completed, use the following command
to start the API._**

```
npm run start:dev
```

or

```
npm run start:prod
```

## Test Suite

Everest comes with a complete unit test suite that can be ran using the following steps:

1. In one terminal start the JSON CMS API.

2. In another terminal instance run the following command from the root of the cloned repository
   to execute the full test suite:

```
npm run test
```

## Design

The JSON CMS API was designed with two uses in mind:

1. Provide Layouts of Components.
2. Provide Fragments of JSON to be used for things such as global configs.

The following are the different resources utilized in the API and how they are connected.

### Blueprints

A Blueprint is a resource that defines how the content of a Component will be structured. It is an essential
resource that allows you to define a reusable JSON structure.

**Blueprint Structure:**
Property | Type
---------|--------------
id | ObjectId
name | String
fields | FieldObject[]

**_FieldObjects are an expected JSON structure that must be used for the Blueprint `fields` array value._**

**FieldObject Structure:**
Property | Type | Required
---------|---------------|---------
type | ValidType | yes
name | String | yes
isRequired | Boolean | no
isInteger | Boolean | no
regex | String | no
min | Number | no
max | Number | no
arrayOf | FieldObject | yes for type ARRAY
fields | FieldObject[] | yes for type OBJECT

**ValidTypes:**

- STRING
- NUMBER
- BOOLEAN
- DATE
- ARRAY
- OBJECT

### Components

A Component is a resource that contains the content that will be consumed by a component on a frontend application. The content is
structured according to the Blueprint that is associated with the Component.

**Component Structure:**
Property | Type
---------|--------------
id | ObjectId
name | String
blueprint | BlueprintId
content | JSON Object

### Layouts

A Layout represents a single page in an application and contains an ordered list of components and their content.

**Layout Structure:**
Property | Type
---------|--------------
id | ObjectId
name | String
components | Array of Component References

### Fragments

Fragments are intended to be used like global configurations. They contain a unique name and JSON content which can be consumed by an application.
**_The content structure is entirely user-defined and does not follow a Blueprint._**

**Fragment Structure:**
Property | Type
---------|--------------
id | ObjectId
name | String
content | JSON Object
