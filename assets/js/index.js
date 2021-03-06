const API_URL = "https://docs.google.com/spreadsheets/d/e/2PACX-1vSg-doiJ59mWF5UiJP-tCB6XCqahr9YaXe6eHiyWFyjylHtGRuy5yZrw1ZNWq3etbbyU8Gqz0i5gANp/pub?gid=0&single=true&output=csv"
let patientData;
function loadData(){
    progressBarVisible(true)

    fetch(API_URL).then((response)=>{
        return response.text()
    }).then((text)=>{
        patientData = ArraysToDict(CSVToArray(text));
        loadTable()
        loadStats();
    });
}

function loadTable(){
    progressBarVisible(false);

    for(let patient of patientData){
        $("#data-table tbody").append(`
        <tr ${(patient["Status"]=="Recovered") ? `style="background-color: #ebfffc"`:""} 
        ${(patient["Status"]=="Deceased") ? `style="background-color: #feecf0"`:""}
        onclick=javascript:patientModal(${patientData.indexOf(patient)})
        >
        <td>${patientData.indexOf(patient)+1}</td>
                      <td>${patient["Date Announced"]}</td>
                      <td class="is-hidden-mobile is-hidden-tablet-only">${patient["City"]}</td>
                      <td>${patient["District"]}</td>
                      <td class="is-hidden-mobile is-hidden-tablet-only">${patient["Age"]}</td>
                      <td class="is-hidden-mobile is-hidden-tablet-only">${patient["Gender"]}</td>
                      <td class="is-hidden-mobile is-hidden-tablet-only">${patient["Notes"]}</td>
                      <td class="is-hidden-mobile is-hidden-tablet-only">${formatSources(patient)}</td>
                      <td class="is-hidden-mobile is-hidden-tablet-only">${patient["Status"]}</td>
                      <td><a class="button is-small - is-rounded is-info" onclick="javascript:patientModal(${patientData.indexOf(patient)}>${patient["Status"]}">View Details</a></td>
                      
        </tr>
    `)
    }
    $("#data-table th")[1].click()
    $("#data-table th")[1].click()
}
function formatSources(patient){
    let links = patient["Sources"].split(",")
    let sources = []
    for(link of links){
         sources.push(`<a href="${link}">${links.indexOf(link)+1}</a>`)
    } 
    return sources.join(" ")
}
function loadStats(){
    $("#cases_total").html(patientData.length);
    $("#cases_active").html(patientData.filter((item)=>{return item["Status"]==="Hospitalized"}).length)
    $("#cases_deaths").html(patientData.filter((item)=>{return item["Status"]==="Deceased"}).length)
    $("#cases_recovered").html(patientData.filter((item)=>{return item["Status"]==="Recovered"}).length)

}

function patientModal(id){
    let patient = patientData[id];
    $("#modal-details-id").html(id+1);
    $("#modal-details-age").html(patient["Age"])
    $("#modal-details-gender").html(patient["Gender"])
    $("#modal-details-city").html(patient["City"])
    $("#modal-details-district").html(patient["District"])
    $("#modal-details-date-announced").html(patient["Date Announced"])

    $("#modal-details-date-change").html(patient["Date Status Change"])
    $("#modal-details-notes").html(patient["Notes"])
    $("#modal-details-sources").html(patient["Sources"].split(",").map((link)=>{
        return `<p class="subtitle"><a href="${link}" target="_blank">${link}</a></p>`
    }))

    $("#modal-details-current-status").html(`<span class="tag 
        ${(patient["Status"]==="Recovered") ? `is-primary`:""}
        ${(patient["Status"]==="Deceased")?`is-danger`:""}
        ${(patient["Status"]==="Hospitalized")?`is-info`:""}">
    ${patient["Status"]}</span>`)
    toggleModal("modal-patient")
}


$(document).ready(function(){
    loadData();
    $(".navbar-burger").click(function() {

        // Toggle the "is-active" class on both the "navbar-burger" and the "navbar-menu"
        $(".navbar-burger").toggleClass("is-active");
        $(".navbar-menu").toggleClass("is-active");
        
    });
    $(".dropdown-trigger").click(function(){
        $(".dropdown").toggleClass("is-active");
    })
    

    
})
 
function shareStatsImage(){
    $(".dropdown").toggleClass("is-active");
    $(".dropdown").toggle()
    html2canvas(document.querySelector("#stats")).then((canvas)=>{
        $(".dropdown").toggle()
        $("#modal-stats-image .modal-card-body").html(canvas);
        let imData = canvas.toDataURL("image/png").replace( 
            /^data:image\/png/, "data:application/octet-stream")
        $("#modal-stats-image footer a.is-success").attr("href",imData);    
        toggleModal("modal-stats-image")
    })
}

function shareStatsText(){
    $(".dropdown").toggleClass("is-active");
    toggleModal("modal-stats-text")

    let stats = getStatsText(patientData)    
    let districts = patientData.map((item)=>{return item["District"]}).filter((value,index,self)=>{return self.indexOf(value)===index});
    for(let district of districts){
        districtData = patientData.filter((item)=>{
            return item["District"]===district
        });
        stats += `\n\n${district}: \n${getStatsText(districtData)}`
    }
    stats+="\nSource: covidkashmir.org"
    $("#stats-textarea").text(stats)
}

function getStatsText(data){
    let total = data.length;
    let active = data.filter((item)=>{return item["Status"]==="Hospitalized"}).length;
    let deaths = data.filter((item)=>{return item["Status"]==="Deceased"}).length;
    let recovered = data.filter((item)=>{return item["Status"]==="Recovered"}).length
    return `Total: ${total}${(active)?`\nActive:${active}`:""}${(deaths)?`\nDeaths:${deaths}`:""}${(recovered)?`\nRecovered:${recovered}`:""}`
}
function copyStatsText(){
    $("#stats-textarea").select();
    document.execCommand('copy')
    $("#modal-stats-text footer a.is-success").html("Copied");    

}
