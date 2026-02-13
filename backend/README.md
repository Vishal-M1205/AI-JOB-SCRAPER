# AI Job Scraper Backend

This backend provides an API to search for jobs using the JSearch API and a resume.

## Setup

1.  Install dependencies: `npm install`
2.  Create a `.env` file in the `backend` directory.
3.  Add the following to your `.env` file:
    ```
    PORT=3000
    JAPI=YOUR_RAPIDAPI_KEY
    GEMINI_API_KEY=YOUR_GEMINI_API_KEY
    ```
    Replace `YOUR_RAPIDAPI_KEY` with your actual key from RapidAPI Hub for the JSearch API.
    Replace `YOUR_GEMINI_API_KEY` with your actual key from Google AI Studio.

## Running the server

`npm start` or `nodemon server.js`

## API Endpoints

### Job Search

-   **GET /api/jobs/search**

    Searches for jobs with the given parameters.

    **Query Parameters:**

    -   `query` (required): The job role to search for (e.g., "developer").
    -   `city` (required): The city to search in (e.g., "delhi").
    -   `page` (optional, default: 1): The page number of results.
    -   `num_pages` (optional, default: 1): The number of pages to return.
    -   `country` (optional, default: "in"): The country code.
    -   `employment_types` (optional, default: "FULLTIME"): The type of employment.
    -   `job_requirements` (optional, default: "under_3_years_experience"): The job experience requirements.

    **Example:**

    `/api/jobs/search?query=developer&city=delhi&page=1&num_pages=1`

### Resume Job Scan

-   **POST /api/jobs/scan**

    Upload a resume and get a list of suitable jobs.

    **Request Body:**

    -   `resume` (required): The resume file.
    -   `city` (required): The city to search for jobs in.

    **Example:**

    Send a POST request to `/api/jobs/scan` with a form-data body containing the `resume` file and the `city`.
