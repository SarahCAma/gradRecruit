document.addEventListener('DOMContentLoaded', function(){

    document.querySelector('.apply-btn').addEventListener('click', (e) => {
        const jobId = e.target.dataset.jobId

        if(document.querySelector('#user-is-employer').innerHTML === "False"){
            console.log("user is a candidate");
            window.location.href = `/vacancy/${jobId}/apply/new_application`;
        } else {
            alert("The 'Apply' feature is disabled on Employer accounts.");
        }

    })











})