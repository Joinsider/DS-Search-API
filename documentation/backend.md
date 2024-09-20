# Backend Documentation

## Table of Contents
1. [Introduction](#introduction)
2. [Structure](#structure)
3. [Endpoints](#endpoints)
4. [Web Pages](#web-pages)


## Introduction
This document provides an overview of the backend of the project.
The Backend is responsible for handling the connection to the Synology NAS
and the communication with the frontend. It uses express.js to provide 
a RESTful API. The backend is needed as a middleware between the frontend
and the Synology NAS, as the Synology NAS does not support CORS.

The backend is written in Javascript and uses the following libraries:
- express.js
- dotenv
- node-fetch
- morgan
- ejs
- cookie-parser

## Structure
The backend is structured as follows:
- `app.js`: The main file of the backend. It sets up the express app and
  the routes.
- `routes/`: Contains the route handlers for the different endpoints.
- `services/`: Contains the services that handle the communication with the
  Synology NAS.

## API-Endpoints:
The backend provides the following endpoints:
- Folders:
  - `GET /api/folders`: Returns a list of all folders on the Synology NAS.
  - `GET /api/folders/:id`: Returns the details of a specific folder.
- Files:
  - `GET /api/files/:id`: Returns the files in a specific folder.
  - `GET /api/file/:id`: Returns the details of a specific file.
- Download:
  - `GET /api/download/:id`: Downloads a specific file.
  - `POST /api/upload`: Uploads a file to a specific folder.

All the endpoints are stored in the `routes/` folder

## Web Pages:
The backend also provides the following web pages:
- `GET /`: The main page of the application.
- `GET /login`: The login page.
- `GET /logout`: Logs out the user.
- `GET /sharedFolders`: The page to view shared folders.
- `GET /folders`: The page to view sub-folders.


## Implemented Synology API Endpoints
Not all Synology API endpoints are implemented in the backend. The following
endpoints are implemented:
- Auth:
  - Login
  - Logout
  - SID as a cookie is returned to the user after login.
- `SYNO.FileStation.List`: List all files and folders in a specific folder.
- 
