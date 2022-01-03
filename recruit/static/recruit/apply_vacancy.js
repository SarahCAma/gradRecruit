document.addEventListener('DOMContentLoaded', function(){
    const candidateName = document.querySelector('#candidate-name').innerHTML;
    const candidateId = document.querySelector('#candidate-id').innerHTML;
    const vacancy = document.querySelector('#vacancy').innerHTML;
    const vacancyId = document.querySelector('#job-id').innerHTML.split(' ')[1];

    console.log(vacancyId)
    // checkIfApplicant(candidateId, vacancyId);

    try{
        document.querySelector('#id_cover_letter').value = 
    `I have just viewed your job vacancy for '${vacancy}' (Job Ref:${vacancyId}) on gradRecruit and I would like to be considered for this position.

Please find a copy of my CV attached.

${candidateName}
    `
    } catch(err){
        console.log(err);
    }

    



})

// NOT SURE WE NEED THIS FN BELOW!!

// function checkIfApplicant(candidateId, vacancyId){
//     $.ajax({
//         type: 'GET',
//         url: `/vacancy/${vacancyId}/apply/already_applicant`,
//         data: {
//             candidateId: candidateId,
//         },
//         success: function(json) {
//             console.log('checkpoint1');
//             if(json["exists"]){
//                 try {
//                     const views = document.querySelectorAll('.views');
        
//                     for (const view of views){
//                         view.style.display = 'none';
//                     }
        
//                     throw 'Already Applicant view must be block!'
        
//                 } catch(err){
//                     console.log(err)
//                     document.querySelector('#already-applicant-view').style.display = 'block';
//                 }
//             } else {
//                 console.log("This candidate is not already an applicant");
//                 return
//             }
//         }
//     })
// }