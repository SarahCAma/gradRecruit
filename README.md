My Django web application is a graduate recruitment web application with the brand name of 'gradRecruit'. 

## Distinctiveness and Complexity
The primary feature that makes my capstone project distinct and more complex from the previous projects is that there are 2 user models - the Graduate (Candidate) and the Employer. As such, I’ve had to design my web app with 2 separate users in mind and ensure that their user experience on the app never overlaps.

This app is designed to take both Candidate and Employer through the employment process from the very beginning of the job search/job vacancy upload to the end - the job offer. Candidates are able to sign up, add a CV to their profile, submit job applications, see whether they have been shortlisted for interview and ultimately, whether they have been successfully recruited for the job. Employers are able to sign up, create job vacancies, review and shortlist submitted applications, create interview sessions and notify successful candidates of their job offer.

## Design


### 1. Templates
In my code is a Django project called `lapstone` (should be capstone, but please ignore!) and it contains 2 apps. The `custom_user` app was installed so that email addresses can be used for user authentication instead of usernames. The `recruit` app contains my app files.

Within the `templates\recruit` folder, there are 13 html files. `layout.html` serves as the template for `about_contact.html`, `apply_vacancy.html`, `error.html`, `index.html`, `register_login.html`, `search.html` and `view_application.html`.

`base.html` serves as the template mostly for the pages that require the user to be logged in as either a Candidate or Employer: `create_vacancy.html`, `dashboard.html	`, `employer_portal.html` and `interview.html`.

Within the `static\recruit` folder, there are 7 js files and 1 css file. Each js file is named after it’s corresponding html file. 

### 2. Index

`index.html` is the homepage. Top left is the company logo which is hyperlinked to always bring the user back to the main page. Top right is the `About Us` and `Contact Us` links. 

`about_contact.html` is a generic page that contains standard dummy text about the company. There are 2 views so if ‘About Us’ is clicked on the homepage then the `about` view type will show. If ‘Contact Us’ is clicked then the `contact` view type will show. The associated view in `views.py` is `about_contact`.

In the middle of the homepage, an active job vacancies carousel is showing. At the bottom of the page, the user can select their user type to either register or login as a Candidate or Employer.

If the user clicks on the ‘Apply’ button on a job vacancy on the homepage, one of 4 things will happen:
- If the user is not authenticated (not logged in) an error message in the form of a Bootstrap Modal will pop up advising the user that they must either register or log in to their Candidate account to access that page.
- If the user is authenticated as a Candidate and has not already applied, they will be able to complete a Cover Letter and submit their job application along with the CV already on their profile. If the Candidate does not have a CV on their profile, they will not be permitted to submit an application until one is added.
- If the user is authenticated as a Candidate but has already applied to the vacancy, the `apply_vacancy` view in `views.py` will redirect the user to view their submitted job application via `view_application.html`. 
- If the user is authenticated as an Employer, an error message will pop up advising the user that the apply feature is disabled on Employer accounts. 

At the bottom of the page, depending on if the user selects that they are a Candidate or Employer, the `register_login` view will redirect the user to `register_login.html` and show the associated view type. 
Once logged in, whether Candidate or Employer, the user will be taken to their individual profile homepage. If Candidate, this will be `dashboard.html` and if an Employer, this will be `employer_portal.html`. The `register_candidate`, `login_candidate`, `register_employer` and `login_employer` views are responsible for this log in process.

Returning to the index homepage as a logged in user, below the active job vacancies carousel will be a search bar allowing the user to directly search for a job of their choice.

### 3. Candidate Portal

Once a Candidate is logged in, they will be redirected to their profile page -`dashboard.html` - where they will be able to upload or update their CV via the `UploadCVForm` handled by the `candidate_cv_upload` view. The navigation bar on the left has 3 options: `Profile`, `Applications` and `Log Out`. The `Applications` page will show the Candidate all their submitted applications and `Log Out` will log the user out via the `logout_user` view. 

The Candidate Portal operates as a single page application. Aside from CV upload and checking updates on submitted applications, it is expected that majority of the Candidate’s app activity will take place away from their profile page and on the homepage. 

### 4. Employer Portal

Once an Employer is logged in, they will be redirected to their profile page - `employer_portal.html` - where they will be able to create vacancies, close vacancies, review applications, shortlist applications, select candidates for interview and select a new postholder for the job. 
The navigation bar on the left has 4 options: `All Vacancies`, `Create Vacancy`, `Interviews` and `Log Out`. 
The `All Vacancies` tab will show a page listing all the Employer’s vacancies, active vacancies listed at the top and closed listed at the bottom.

In the Active Vacancies section, each active vacancy will have a `Review Applications` and `Close Vacancy` button. In the Close Vacancies section, each closed vacancy will have a `Review Applications` button which is handled by the `reviewApplicationsView` and `checkVacancyStatus` js functions.

The `Create Vacancy` tab will take the Employer to `create_vacancy.html` via the `new_vacancy` view. This page presents the `CreateVacancyForm` where the form is partly validated at the database level and partly validated using JavaScript. Once an Employer successfully submits this form, the new vacancy will be added to their list of Active Vacancies and displayed on the index homepage for Candidates to begin applying.

The `Interviews` tab will take the Employer to `interview.html` via an Event Listener in `employer_portal.js`. There are 4 different views on this page: `create`, `view`, `all` and `post`. On clicking the `Interview` tab, the `all` view will show. 

> ### Vacancy stages
>
> Aside from a vacancy being `active` or `closed`, objects of the Vacancy model also have stages. Any newly created vacancy or recently closed vacancy will be stage `1`. This stage value does not have a name. Once an Employer has reviewed applications for a vacancy and shortlisted the applications, the vacancy will become stage `2`, `Applications shortlisted`. When an Employer successfully submits the `CreateInterviewForm`, the vacancy stage will graduate to stage `3`, `Interviewing`. The Vacancy model method `post_interview` is responsible for increasing a vacancy stage to stage `4`, `Post-Interview` once the date scheduled for the vacancy interview has passed. Post-interview, the Employer will be expected to submit a dynamic form selecting one successful candidate, the postholder. On submission of that form, the vacancy stage will move to the highest stage – stage `5`, `Vacancy filled`. 
> 
>Vacancy stage `0`, `Obsolete` is for vacancies that have been closed for over a week or the deadline passed over a week ago and received no applications. The `post_interview` model method will automatically move these vacancies from stage `1` to `0` to prevent these ‘dead’ vacancies from taking up space on the Employer’s portal. 



> ### Reviewing applications at different vacancy stages
>
> The `Review Applications` button, when a vacancy is at stage 1, will take the Employer to the `review-applications-view`. 
>
> If the vacancy is active then the Employer will be able to view candidate’s CVs and cover letters but the shortlisting form and submit button will be disabled whilst the close vacancy button is displayed. Employers can choose to close an active vacancy ahead of the deadline by clicking the close vacancy button displayed by an ‘x’. If upon clicking the `Review Applications` button, the vacancy was at stage 1 but already closed, the Employer will similarly be able to view candidate’s CVs and cover letters but the shortlisting form and submit button will now be enabled. The close vacancy button will not be displayed.
>
> The `Review Applications` button when a vacancy is at stage 2, will take the Employer to the `shortlisting-outcome-view`. This page will display 2 cards where the Employer can review the CVs and cover letters of the shortlisted applicants in the top card and also review the CVs and cover letters of the rejected applicants in the bottom card. The Employer will also see a calendar icon towards the top right of the screen. This calendar icon has an Event Listener so when clicked, the Employer will be redirected to `interview.html` and the `create-interview-view` will be displayed.
>
> The `Review Applications` button when a vacancy is at stage 3, will take the Employer to `interview.html` and display the `view-interview-view`. On this page, the Employer will see the date that the interview is due to be held and the time slots for each of the candidate’s interviews.
>
> The `Review Applications` button when a vacancy is at stage 4, will take the Employer to `interview.html` and display the `post-interview-view`. On this page, the Employer will see a dynamic form displayed via the `displayInterviewee` js function. The Employer will be prompted to select one successful candidate and this candidate will become the new postholder.
>
> The `Review Applications` button when a vacancy is at stage 5, will take the Employer to `interview.html` and display the `post-interview-view`. On this page, the Employer will see the candidate that they have chosen to become the new postholder.

## Features to implement

Given more time, some additional features I would like to implement into this app would be the ability for a Candidate to withdraw an application and the ability for an Employer to add interview notes to a Candidate’s application that can be referred to before a postholder is selected.

## Requirements.txt


`pip install django-use-email-as-username`

`pip install requests`
