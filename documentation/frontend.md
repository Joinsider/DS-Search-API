# Frontend Documentation

## Table of Contents
1. [Introduction](#introduction)
2. [Structure](#structure)
3. [Functions](#functions)

## Introduction
This document provides an overview of the frontend of the project. 
The frontend is responsible for providing the user interface similar to a file manager, like
`Synology Drive` or `Universal Search`.
The frontend is also written in Javascript


## Structure
The frontend is structured as follows:
- `public/`: Contains the static files like images, css, and javascript files.
- `views/`: Contains the ejs files for the different web pages.
  - `partials/`: Contains the partials used in the ejs files.
    - `header.ejs`: The header of the application.
    - `loading.ejs`: The loading spinner.
  - `index.ejs`: The main page of the application and displays the login page.
  - `error.ejs`: The error page.
  - `sharedFolders.ejs`: The page to view shared folders.
  - `folders.ejs`: The page to view sub-folders.
- `routes/`: Contains the route handlers for the different endpoints.

## Functions:
The frontend provides the following functions:
- Login:
  - `POST /login`: Logs in the user.
  - `GET /logout`: Logs out the user.
  - `GET /sharedFolders`: The page to view shared folders.
  - `GET /folders`: The page to view sub-folders.